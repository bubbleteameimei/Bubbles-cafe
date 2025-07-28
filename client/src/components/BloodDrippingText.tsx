import { useEffect, useRef } from 'react';

interface BloodDrippingTextProps {
  text: string;
  className?: string;
}

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  lifetime: number;
  gravity: number;
  delay: number;
  delayLeft: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 0.2;
    this.vy = 0;
    this.width = Math.random() * 1 + 0.5;
    this.height = this.width * 4;
    this.color = `rgba(139, 0, 0, ${Math.random() * 0.3 + 0.7})`;
    this.lifetime = Math.random() * 60 + 60;
    this.gravity = 0.05;
    this.delay = Math.random() * 30;
    this.delayLeft = this.delay;
  }

  update() {
    if (this.delayLeft > 0) {
      this.delayLeft--;
    } else {
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
    }
    this.lifetime--;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.lifetime > 0) {
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }
}

class ParticleSystem {
  particles: Particle[];
  dripPoints: Array<{ x: number; y: number }>;

  constructor() {
    this.particles = [];
    this.dripPoints = [];
  }

  setDripPoints(points: Array<{ x: number; y: number }>) {
    this.dripPoints = points;
  }

  addParticle() {
    if (this.dripPoints.length > 0) {
      const point = this.dripPoints[Math.floor(Math.random() * this.dripPoints.length)];
      this.particles.push(new Particle(point.x, point.y));
    }
  }

  update() {
    this.particles = this.particles.filter(p => p.lifetime > 0);
    this.particles.forEach(p => p.update());
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.particles.forEach(p => p.draw(ctx));
  }
}

export default function BloodDrippingText({ text, className }: BloodDrippingTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<number>();
  const particleSystemRef = useRef<ParticleSystem>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const textElement = textRef.current;
    if (!canvas || !textElement) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get the text element's position and size
    const updateCanvasSize = () => {
      const rect = textElement.getBoundingClientRect();
      
      canvas.width = rect.width;
      canvas.height = window.innerHeight - rect.top; // Extend to bottom of viewport
      canvas.style.left = `0px`;
      canvas.style.top = `${rect.height}px`; // Start from bottom of text
    };

    updateCanvasSize();

    // Create a hidden canvas to analyze text pixels
    const textCanvas = document.createElement('canvas');
    textCanvas.width = canvas.width;
    textCanvas.height = 200; // Enough height for the text
    const textCtx = textCanvas.getContext('2d');
    
    if (!textCtx) return;

    // Match the font style from the actual text element
    const computedStyle = window.getComputedStyle(textElement);
    const fontSize = Math.min(100, parseInt(computedStyle.fontSize) || 100); // Scale down for analysis
    textCtx.font = `${computedStyle.fontWeight} ${fontSize}px ${computedStyle.fontFamily}`;
    textCtx.fillStyle = '#c8102e';
    textCtx.textAlign = 'center';
    textCtx.fillText(text, textCanvas.width / 2, fontSize + 20);

    // Find drip points from the bottom edge of the text
    const imageData = textCtx.getImageData(0, 0, textCanvas.width, textCanvas.height);
    const dripPoints: Array<{ x: number; y: number }> = [];
    
    for (let x = 0; x < textCanvas.width; x++) {
      for (let y = textCanvas.height - 1; y >= 0; y--) {
        const index = (y * textCanvas.width + x) * 4 + 3; // Alpha channel
        if (imageData.data[index] > 0) {
          // Scale the x position to match the actual canvas width
          const scaledX = (x / textCanvas.width) * canvas.width;
          dripPoints.push({ x: scaledX, y: 0 });
          break;
        }
      }
    }

    // Initialize particle system
    const particleSystem = new ParticleSystem();
    particleSystem.setDripPoints(dripPoints);
    particleSystemRef.current = particleSystem;

    let lastTime = 0;
    let particleTimer = 0;

    const animate = (timeStamp: number) => {
      const deltaTime = timeStamp - lastTime;
      lastTime = timeStamp;

      particleTimer += deltaTime;
      if (particleTimer > 300) { // Add particle every 300ms
        particleSystem.addParticle();
        particleTimer = 0;
      }

      // Clear canvas with slight fade for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particleSystem.update();
      particleSystem.draw(ctx);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    // Handle window resize
    const handleResize = () => {
      updateCanvasSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [text]);

  return (
    <div className="relative inline-block">
      <span ref={textRef} className={className}>
        {text}
      </span>
      <canvas
        ref={canvasRef}
        className="absolute pointer-events-none z-10"
        style={{
          left: 0,
          top: '100%',
        }}
      />
    </div>
  );
}