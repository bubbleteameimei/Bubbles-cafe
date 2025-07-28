import { useEffect, useRef } from 'react';

interface BloodDrippingTextProps {
  text: string;
  className?: string;
}

type BloodMode = 'thin' | 'thick';

class BloodParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  lifetime: number;
  maxLifetime: number;
  gravity: number;
  delay: number;
  delayLeft: number;
  mode: BloodMode;
  viscosity: number;
  opacity: number;

  constructor(x: number, y: number, mode: BloodMode = 'thin') {
    this.x = x;
    this.y = y;
    this.mode = mode;
    
    if (mode === 'thick') {
      // Thick, gooey blood drops
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = 0;
      this.width = Math.random() * 3 + 2; // Much thicker (2-5px)
      this.height = this.width * 6; // More elongated for gooey effect
      this.gravity = 0.08; // Slower fall for thick liquid
      this.viscosity = 0.98; // High viscosity for gooey movement
      this.delay = Math.random() * 40;
      this.maxLifetime = Math.random() * 120 + 180;
    } else {
      // Thin, flowing blood
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = 0;
      this.width = Math.random() * 2 + 1; // Medium thickness (1-3px)
      this.height = this.width * 8; // Very elongated for flowing effect
      this.gravity = 0.12; // Faster fall for thin liquid
      this.viscosity = 0.995; // Lower viscosity for flowing
      this.delay = Math.random() * 20;
      this.maxLifetime = Math.random() * 80 + 100;
    }
    
    this.lifetime = this.maxLifetime;
    this.delayLeft = this.delay;
    this.opacity = Math.random() * 0.4 + 0.6; // 0.6-1.0 opacity
    this.color = `rgba(139, 0, 0, ${this.opacity})`;
  }

  update() {
    if (this.delayLeft > 0) {
      this.delayLeft--;
      return;
    }

    // Physics simulation with viscosity
    this.vy += this.gravity;
    this.vx *= this.viscosity; // Apply viscosity to horizontal movement
    this.vy *= 0.999; // Slight air resistance
    
    this.x += this.vx;
    this.y += this.vy;
    
    // Fade out as lifetime decreases
    const fadeRatio = this.lifetime / this.maxLifetime;
    this.opacity = (Math.random() * 0.4 + 0.6) * fadeRatio;
    this.color = `rgba(139, 0, 0, ${this.opacity})`;
    
    this.lifetime--;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.lifetime > 0 && this.delayLeft <= 0) {
      // Create gooey liquid effect with gradient
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.width
      );
      gradient.addColorStop(0, `rgba(139, 0, 0, ${this.opacity})`);
      gradient.addColorStop(0.7, `rgba(100, 0, 0, ${this.opacity * 0.8})`);
      gradient.addColorStop(1, `rgba(60, 0, 0, ${this.opacity * 0.4})`);
      
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add slight glow effect for realism
      ctx.shadowColor = 'rgba(139, 0, 0, 0.3)';
      ctx.shadowBlur = 2;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}

class BloodSystem {
  particles: BloodParticle[];
  dripPoints: Array<{ x: number; y: number }>;
  currentMode: BloodMode;
  modeTimer: number;
  letterPixels: Map<string, Array<{ x: number; y: number }>>;

  constructor() {
    this.particles = [];
    this.dripPoints = [];
    this.currentMode = 'thin';
    this.modeTimer = 0;
    this.letterPixels = new Map();
  }

  setDripPoints(points: Array<{ x: number; y: number }>) {
    this.dripPoints = points;
  }

  setLetterPixels(letterMap: Map<string, Array<{ x: number; y: number }>>) {
    this.letterPixels = letterMap;
  }

  addParticle() {
    if (this.dripPoints.length > 0) {
      // Select from bottom edge points for dripping effect
      const bottomPoints = this.dripPoints.filter(point => {
        // Check if this point is near the bottom of any letter
        for (const [, pixels] of this.letterPixels) {
          const maxY = Math.max(...pixels.map(p => p.y));
          if (Math.abs(point.y - maxY) < 5) {
            return true;
          }
        }
        return false;
      });
      
      const points = bottomPoints.length > 0 ? bottomPoints : this.dripPoints;
      const point = points[Math.floor(Math.random() * points.length)];
      this.particles.push(new BloodParticle(point.x, point.y, this.currentMode));
    }
  }

  toggleMode() {
    this.currentMode = this.currentMode === 'thin' ? 'thick' : 'thin';
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
  const bloodSystemRef = useRef<BloodSystem>();

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

    // Find bottom edge points specifically for dripping
    const bottomEdgePoints: Array<{ x: number; y: number }> = [];
    for (let x = 0; x < textCanvas.width; x++) {
      for (let y = textCanvas.height - 1; y >= 0; y--) {
        const index = (y * textCanvas.width + x) * 4 + 3;
        if (imageData.data[index] > 0) {
          const scaledX = (x / textCanvas.width) * canvas.width;
          const scaledY = (y / textCanvas.height) * (fontSize + 40);
          bottomEdgePoints.push({ x: scaledX, y: scaledY });
          break; // Found bottom-most pixel for this x coordinate
        }
      }
    }

    // Initialize enhanced blood system
    const bloodSystem = new BloodSystem();
    bloodSystem.setDripPoints(bottomEdgePoints.length > 0 ? bottomEdgePoints : dripPoints);
    bloodSystemRef.current = bloodSystem;

    let lastTime = 0;
    let particleTimer = 0;
    let modeTimer = 0;

    const animate = (timeStamp: number) => {
      const deltaTime = timeStamp - lastTime;
      lastTime = timeStamp;

      // Toggle between blood modes every 8 seconds for variety
      modeTimer += deltaTime;
      if (modeTimer > 8000) {
        bloodSystem.toggleMode();
        modeTimer = 0;
      }

      particleTimer += deltaTime;
      // Adjust frequency based on mode for realistic effect
      const frequency = bloodSystem.currentMode === 'thick' ? 400 : 250;
      if (particleTimer > frequency) {
        // Add multiple particles for better bleeding density
        const particleCount = bloodSystem.currentMode === 'thick' ? 2 : 3;
        for (let i = 0; i < particleCount; i++) {
          bloodSystem.addParticle();
        }
        particleTimer = 0;
      }

      // Use subtle trail effect for gooey realism
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw blood particles
      bloodSystem.update();
      bloodSystem.draw(ctx);

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