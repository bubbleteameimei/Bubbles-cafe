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
  trail: Array<{ x: number; y: number; alpha: number }>;
  startY: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.startY = y;
    this.vx = (Math.random() - 0.5) * 0.1; // Reduced horizontal drift
    this.vy = 0;
    this.width = Math.random() * 1.5 + 0.5; // Smaller size: 0.5-2px
    this.height = this.width * 3;
    this.color = `rgba(139, 0, 0, ${Math.random() * 0.2 + 0.8})`;
    this.lifetime = Math.random() * 80 + 100; // Longer lifetime for limited range
    this.gravity = 0.03; // Reduced gravity
    this.delay = Math.random() * 30;
    this.delayLeft = this.delay;
    this.trail = [];
  }

  update() {
    if (this.delayLeft > 0) {
      this.delayLeft--;
    } else {
      // Limit drop distance to prevent drops going too far
      const maxDropDistance = 200; // Maximum pixels to drop
      if (this.y - this.startY < maxDropDistance) {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        
        // Add to trail
        this.trail.push({ x: this.x, y: this.y, alpha: 1.0 });
        
        // Limit trail length
        if (this.trail.length > 8) {
          this.trail.shift();
        }
        
        // Fade trail
        this.trail.forEach((point, index) => {
          point.alpha = (index + 1) / this.trail.length * 0.6;
        });
      } else {
        // Stop the particle if it has traveled too far
        this.lifetime = 0;
      }
    }
    this.lifetime--;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.lifetime > 0) {
      // Draw trail first
      this.trail.forEach((point, index) => {
        if (index > 0) {
          const prevPoint = this.trail[index - 1];
          ctx.beginPath();
          ctx.moveTo(prevPoint.x, prevPoint.y);
          ctx.lineTo(point.x, point.y);
          ctx.strokeStyle = `rgba(139, 0, 0, ${point.alpha * 0.4})`;
          ctx.lineWidth = this.width * 0.5;
          ctx.stroke();
        }
      });
      
      // Draw main droplet
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

    // Find drip points using exact HTML code logic - bottom-to-top scanning
    // Limit scanning area to just around the text to prevent stray drops
    const scanStartX = Math.max(0, textRect.left - 10);
    const scanEndX = Math.min(textCanvas.width, textRect.right + 10);
    const scanStartY = Math.max(0, textRect.top - 10);
    const scanEndY = Math.min(textCanvas.height, textRect.bottom + 10);
    
    const imageData = textCtx.getImageData(scanStartX, scanStartY, scanEndX - scanStartX, scanEndY - scanStartY);
    const dripPoints: Array<{ x: number; y: number }> = [];
    
    // Follow HTML code exactly - scan each column from bottom to top within text bounds
    for (let x = 0; x < scanEndX - scanStartX; x += 3) { // Sample every 3rd pixel for performance
      for (let y = scanEndY - scanStartY - 1; y >= 0; y--) {
        const index = (y * (scanEndX - scanStartX) + x) * 4 + 3; // Alpha channel
        if (imageData.data[index] > 128) { // Higher threshold for better detection
          dripPoints.push({ 
            x: scanStartX + x, 
            y: scanStartY + y 
          });
          break; // Found the bottom-most pixel for this column - exact HTML logic
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
      if (particleTimer > 500) { // Slower particle generation
        particleSystem.addParticle();
        particleTimer = 0;
      }

      // Clean canvas completely - no residual effects
      ctx.clearRect(0, 0, canvas.width, canvas.height);

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