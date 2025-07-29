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
  baseColor: string;
  lifetime: number;
  gravity: number;
  trail: Array<{ x: number; y: number; alpha: number }>;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = Math.random() * 0.1; // Slight initial downward speed for natural start
    this.width = Math.random() * 3 + 2; // Reduced to 2-5px
    this.height = this.width * 3; // 6-15px tall
    this.baseColor = `rgba(139, 0, 0, ${0.7 + Math.random() * 0.2})`; // Consistent opacity
    this.lifetime = Math.random() * 120 + 120;
    this.gravity = 0.15;
    this.trail = [];
  }

  update() {
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.trail.push({ x: this.x, y: this.y, alpha: 0.8 });
    if (this.trail.length > 15) this.trail.shift(); // Shorter trail for realism
    this.lifetime--;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.lifetime > 0) {
      // Draw trail with smooth gradient
      for (let i = this.trail.length - 1; i >= 0; i--) {
        const segment = this.trail[i];
        const alpha = segment.alpha * (i / this.trail.length);
        ctx.beginPath();
        ctx.ellipse(segment.x, segment.y, this.width / 2 * (i / this.trail.length) * 0.8, this.height / 2 * (i / this.trail.length) * 0.8, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 0, 0, ${alpha})`;
        ctx.fill();
      }
      
      // Draw main particle
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
      const gradient = ctx.createLinearGradient(this.x - this.width / 2, this.y - this.height / 2, this.x + this.width / 2, this.y + this.height / 2);
      gradient.addColorStop(0, this.baseColor);
      gradient.addColorStop(1, `rgba(139, 0, 0, 0.3)`);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Subtle glossy highlight
      const highlightX = this.x - this.width / 6;
      const highlightY = this.y - this.height / 6;
      ctx.beginPath();
      ctx.ellipse(highlightX, highlightY, this.width / 6, this.height / 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 50, 50, 0.3)';
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

  update(canvasHeight: number) {
    // Update particles and remove expired ones or those that fall off screen
    this.particles.forEach((particle, index) => {
      particle.update();
      if (particle.y > canvasHeight || particle.lifetime <= 0) {
        this.particles.splice(index, 1);
      }
    });
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.particles.forEach(p => p.draw(ctx));
  }
}

export default function BloodDrippingText({ text, className }: BloodDrippingTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<number>();


  useEffect(() => {
    const canvas = canvasRef.current;
    const textElement = textRef.current;
    if (!canvas || !textElement) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get text position and size precisely
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();

    // Create text canvas for pixel analysis - exact HTML code approach
    const textCanvas = document.createElement('canvas');
    textCanvas.width = canvas.width;
    textCanvas.height = canvas.height;
    const textCtx = textCanvas.getContext('2d');
    
    if (!textCtx) return;

    // Get text position for proper positioning
    const textRect = textElement.getBoundingClientRect();
    
    // Match font exactly from the actual element
    const computedStyle = window.getComputedStyle(textElement);
    const fontWeight = computedStyle.fontWeight;
    const fontSize = parseInt(computedStyle.fontSize) || 100;
    const fontFamily = computedStyle.fontFamily;
    
    // Use exact HTML code logic for text rendering
    textCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    textCtx.fillStyle = '#c8102e';
    textCtx.textAlign = 'center';
    
    // Position text exactly where it appears on screen using screen coordinates
    const textX = textRect.left + textRect.width / 2;
    const textY = textRect.top + textRect.height * 0.75; // Adjust vertical position for better baseline
    textCtx.fillText(text, textX, textY);

    // Find drip points using exact HTML approach - scan all text pixels
    const imageData = textCtx.getImageData(0, 0, textCanvas.width, textCanvas.height);
    const data = imageData.data;
    const dripPoints: Array<{ x: number; y: number }> = [];
    
    // Scan all pixels to find text pixels for drip points
    for (let y = 0; y < textCanvas.height; y++) {
      for (let x = 0; x < textCanvas.width; x++) {
        const index = (y * textCanvas.width + x) * 4 + 3; // Alpha channel
        if (data[index] > 0) {
          dripPoints.push({ x, y });
        }
      }
    }

    const particleSystem = new ParticleSystem();
    particleSystem.setDripPoints(dripPoints);

    let lastTime = 0;
    let particleTimer = 0;

    const animate = (timeStamp: number) => {
      const deltaTime = timeStamp - lastTime;
      lastTime = timeStamp;

      particleTimer += deltaTime;
      if (particleTimer > 100) { // More frequent generation for natural bleed
        // Add new particles more frequently with probability control
        for (let i = 0; i < 5; i++) { // Increased to 5 for denser, natural bleed
          if (Math.random() < 0.7) { // 70% chance per particle
            particleSystem.addParticle();
          }
        }
        particleTimer = 0;
      }

      // Clear canvas with transparency to preserve background
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particleSystem.update(canvas.height);
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
  }, [text, className]);

  return (
    <>
      <span ref={textRef} className={className}>
        {text}
      </span>
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}