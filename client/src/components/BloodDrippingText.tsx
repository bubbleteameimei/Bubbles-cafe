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
    this.vx = (Math.random() - 0.5) * 0.2; // Small horizontal movement
    this.vy = Math.random() * 0.3 + 0.1; // Start with small downward velocity
    this.width = Math.random() * 0.6 + 0.2; // Very thin drops (0.2-0.8px)
    this.height = this.width * 8; // Very elongated
    this.color = `rgba(139, 0, 0, ${Math.random() * 0.3 + 0.7})`; // Dark blood
    this.lifetime = Math.random() * 180 + 240; // Longer lifetime
    this.gravity = 0.12; // Moderate gravity
    this.delay = Math.random() * 15; // Short delay
    this.delayLeft = this.delay;
  }

  update() {
    if (this.delayLeft > 0) {
      this.delayLeft--;
    } else {
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      // Add slight damping to horizontal movement
      this.vx *= 0.999;
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
      canvas.height = window.innerHeight; // Full viewport height for bleeding effect
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${window.innerHeight}px`;
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

    // Find all drip points from within the text shape - collect pixels where text is present
    const imageData = textCtx.getImageData(0, 0, textCanvas.width, textCanvas.height);
    const dripPoints: Array<{ x: number; y: number }> = [];
    
    // Get text position for proper offset
    const textRect = textElement.getBoundingClientRect();
    const textTop = textRect.top;
    
    // Collect all pixels where the text is present - sampling every few pixels for performance
    for (let y = 0; y < textCanvas.height; y += 2) {
      for (let x = 0; x < textCanvas.width; x += 3) {
        const index = (y * textCanvas.width + x) * 4 + 3; // Alpha channel
        if (imageData.data[index] > 0) {
          // Scale positions to match the actual canvas and use absolute position
          const scaledX = (x / textCanvas.width) * canvas.width;
          const scaledY = textTop + (y / textCanvas.height) * textRect.height;
          dripPoints.push({ x: scaledX, y: scaledY });
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
      if (particleTimer > 200) { // Add particles more frequently
        // Add multiple particles for better bleeding effect
        for (let i = 0; i < 2; i++) {
          particleSystem.addParticle();
        }
        particleTimer = 0;
      }

      // Clear canvas completely - no trails
      ctx.clearRect(0, 0, canvas.width, canvas.height);

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
        className="absolute pointer-events-none"
        style={{
          left: 0,
          top: 0,
          zIndex: 10, // Above the text so blood is visible
        }}
      />
    </div>
  );
}