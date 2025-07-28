import { useEffect, useRef } from 'react';

interface BloodDrippingTextProps {
  text: string;
  className?: string;
}

type BloodMode = 'short' | 'long';

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
  mode: BloodMode;

  constructor(x: number, y: number, mode: BloodMode = 'short') {
    this.x = x;
    this.y = y;
    this.mode = mode;
    
    if (mode === 'long') {
      // Long blood system - former system
      this.vx = (Math.random() - 0.5) * 0.2;
      this.vy = 0;
      this.width = Math.random() * 1 + 0.5;
      this.height = this.width * 4;
      this.color = `rgba(139, 0, 0, ${Math.random() * 0.3 + 0.7})`;
      this.lifetime = Math.random() * 60 + 60;
      this.gravity = 0.05;
      this.delay = Math.random() * 30;
    } else {
      // Short blood system - current system
      this.vx = (Math.random() - 0.5) * 0.2;
      this.vy = Math.random() * 0.3 + 0.1;
      this.width = Math.random() * 0.6 + 0.2;
      this.height = this.width * 8;
      this.color = `rgba(139, 0, 0, ${Math.random() * 0.3 + 0.7})`;
      this.lifetime = Math.random() * 180 + 240;
      this.gravity = 0.12;
      this.delay = Math.random() * 15;
    }
    
    this.delayLeft = this.delay;
  }

  update() {
    if (this.delayLeft > 0) {
      this.delayLeft--;
    } else {
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
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
  currentMode: BloodMode;
  modeTimer: number;

  constructor() {
    this.particles = [];
    this.dripPoints = [];
    this.currentMode = 'short';
    this.modeTimer = 0;
  }

  setDripPoints(points: Array<{ x: number; y: number }>) {
    this.dripPoints = points;
  }

  addParticle() {
    if (this.dripPoints.length > 0) {
      const point = this.dripPoints[Math.floor(Math.random() * this.dripPoints.length)];
      this.particles.push(new Particle(point.x, point.y, this.currentMode));
    }
  }

  toggleMode() {
    this.currentMode = this.currentMode === 'short' ? 'long' : 'short';
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
      canvas.height = window.innerHeight - rect.bottom; // From bottom of text to viewport bottom
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${window.innerHeight - rect.bottom}px`;
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
    
    // Collect all pixels where the text is present - sampling every few pixels for performance
    for (let y = 0; y < textCanvas.height; y += 2) {
      for (let x = 0; x < textCanvas.width; x += 3) {
        const index = (y * textCanvas.width + x) * 4 + 3; // Alpha channel
        if (imageData.data[index] > 0) {
          // Scale positions to match the actual canvas coordinates (relative to canvas origin)
          const scaledX = (x / textCanvas.width) * canvas.width;
          const scaledY = (y / textCanvas.height) * (fontSize + 40); // Relative to text height in canvas
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
    let modeTimer = 0;

    const animate = (timeStamp: number) => {
      const deltaTime = timeStamp - lastTime;
      lastTime = timeStamp;

      // Toggle between blood modes every 10 seconds
      modeTimer += deltaTime;
      if (modeTimer > 10000) { // 10 seconds
        particleSystem.toggleMode();
        modeTimer = 0;
      }

      particleTimer += deltaTime;
      const frequency = particleSystem.currentMode === 'long' ? 300 : 200;
      if (particleTimer > frequency) {
        // Add particles based on mode
        const particleCount = particleSystem.currentMode === 'long' ? 1 : 2;
        for (let i = 0; i < particleCount; i++) {
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
          top: '100%', // Start from bottom of text
          zIndex: 10, // Above the text so blood is visible
        }}
      />
    </div>
  );
}