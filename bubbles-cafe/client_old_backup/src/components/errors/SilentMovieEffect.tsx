import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/components/theme-provider';

interface SilentMovieEffectProps {
  children: React.ReactNode;
}

// Create a CSS file for the silent movie effect
const silentMovieStyles = `
  @keyframes flicker {
    0%, 100% { opacity: 1; }
    31% { opacity: 1; }
    32% { opacity: 0.8; }
    33% { opacity: 1; }
    42% { opacity: 1; }
    43% { opacity: 0.9; }
    44% { opacity: 1; }
    98% { opacity: 1; }
    99% { opacity: 0.5; }
  }
  
  @keyframes textDistortion {
    0% { transform: translateX(0); }
    25% { transform: translateX(0.5px); }
    50% { transform: translateX(-0.5px); }
    75% { transform: translateX(0.5px); }
    100% { transform: translateX(0); }
  }
  
  @keyframes glitch {
    0% {
      clip-path: inset(40% 0 61% 0);
      transform: translate(-2px, 2px);
    }
    20% {
      clip-path: inset(92% 0 1% 0);
      transform: translate(1px, 3px);
    }
    40% {
      clip-path: inset(43% 0 1% 0);
      transform: translate(3px, 1px);
    }
    60% {
      clip-path: inset(25% 0 58% 0);
      transform: translate(-5px, -2px);
    }
    80% {
      clip-path: inset(54% 0 7% 0);
      transform: translate(4px, -4px);
    }
    100% {
      clip-path: inset(58% 0 43% 0);
      transform: translate(-2px, 2px);
    }
  }

  @keyframes textShuffle {
    0%, 100% { content: attr(data-text); }
    33% { content: attr(data-glitch1); }
    66% { content: attr(data-glitch2); }
  }

  .glitch-container {
    position: relative;
    display: inline-block;
    overflow: hidden;
  }

  .glitch-text {
    position: relative;
    display: inline-block;
  }

  .glitch-text:before,
  .glitch-text:after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.8;
  }

  .glitch-text:before {
    color: #900000;
    animation: glitch 1.5s infinite linear alternate-reverse;
    z-index: -1;
  }

  .glitch-text:after {
    color: #500000;
    animation: glitch 2s infinite linear alternate-reverse;
    z-index: -2;
  }
  
  /* Light mode alternate colors */
  .silent-movie-container-light .glitch-text:before {
    color: #ff0000;
  }
  
  .silent-movie-container-light .glitch-text:after {
    color: #aa0000;
  }
  
  .text-shuffle {
    position: relative;
    display: inline-block;
    visibility: hidden;
  }
  
  .text-shuffle:before {
    content: attr(data-text);
    position: absolute;
    left: 0;
    visibility: visible;
    animation: textShuffle 7s infinite steps(1);
  }
  
  .silent-movie-text {
    animation: textDistortion 0.05s infinite, flicker 4s infinite;
    font-family: 'Courier New', monospace;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  
  .silent-movie-container {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    width: 100%;
    height: 100%;
    text-align: center;
  }

  .silent-movie-container-light {
    background: linear-gradient(to right, rgb(225, 225, 225) 0%, rgb(230, 230, 230) 32%, rgb(235, 235, 235) 100%);
    color: #000;
  }

  .silent-movie-container-dark {
    background: linear-gradient(to right, rgb(10, 10, 10) 0%, rgb(12, 12, 12) 32%, rgb(15, 15, 15) 100%);
    color: #fff;
  }

  .vignette {
    position: absolute;
    width: 100%;
    height: 100%;
    box-shadow: inset 0px 0px 200px 100px black;
    mix-blend-mode: multiply;
    pointer-events: none;
    animation: vignette-anim 5s infinite;
  }

  .vignette-light {
    opacity: 0.5;
  }

  .vignette-dark {
    opacity: 0.9;
  }

  .noise {
    z-index: 100;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0.15;
  }

  .line {
    position: absolute;
    height: 100%;
    width: 1px;
    opacity: 0.1;
  }

  .line-light {
    background-color: #000;
  }

  .line-dark {
    background-color: #fff;
  }

  .title-container {
    position: relative;
    z-index: 10;
    text-align: center;
    margin: 0 auto;
    padding: 2rem;
  }

  .dot {
    width: 3px;
    height: 2px;
    position: absolute;
    opacity: 0.3;
  }

  .dot-light {
    background-color: black;
  }

  .dot-dark {
    background-color: white;
  }
  
  .text-card {
    background-color: rgba(0, 0, 0, 0.7);
    display: inline-block;
    margin: 0.5rem;
    padding: 0.5rem 1.5rem;
    border-radius: 0.25rem;
  }
  
  .text-card-light {
    background-color: rgba(255, 255, 255, 0.7);
    color: black;
  }
  
  .text-card-dark {
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
  }
  
  .film-border {
    position: absolute;
    inset: 1rem;
    border: 8px solid;
    border-radius: 4px;
    z-index: 1;
    opacity: 0.5;
  }
  
  .film-border-light {
    border-color: rgba(0, 0, 0, 0.2);
  }
  
  .film-border-dark {
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .film-grain {
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.05;
    pointer-events: none;
    z-index: 5;
  }

  @keyframes vignette-anim {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

export function SilentMovieEffect({ children }: SilentMovieEffectProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const noiseCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Add the vertical line effect
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create random vertical lines
    const container = containerRef.current;
    const lines: HTMLDivElement[] = [];
    
    for (let i = 0; i < 20; i++) {
      const line = document.createElement('div');
      line.classList.add('line');
      line.classList.add(isDarkMode ? 'line-dark' : 'line-light');
      line.style.left = `${Math.random() * 100}%`;
      container.appendChild(line);
      lines.push(line);
    }
    
    // Create random dots (dust particles)
    for (let i = 0; i < 100; i++) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      dot.classList.add(isDarkMode ? 'dot-dark' : 'dot-light');
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.top = `${Math.random() * 100}%`;
      container.appendChild(dot);
    }
    
    return () => {
      lines.forEach(line => line.remove());
      const dots = container.querySelectorAll('.dot');
      dots.forEach(dot => dot.remove());
    };
  }, [isDarkMode]);
  
  // Create noise canvas effect
  useEffect(() => {
    const canvas = noiseCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    // Function to generate noise
    const generateNoise = () => {
      const imgData = ctx.createImageData(canvas.width, canvas.height);
      const buffer32 = new Uint32Array(imgData.data.buffer);
      
      const color = isDarkMode 
        ? 0xffffffff  // White for dark mode
        : 0xff000000; // Black for light mode
      
      for (let i = 0; i < buffer32.length; i++) {
        if (Math.random() < 0.05) {
          buffer32[i] = color;
        }
      }
      
      ctx.putImageData(imgData, 0, 0);
    };
    
    // Animation loop
    let animationId: number;
    const loop = () => {
      generateNoise();
      animationId = requestAnimationFrame(loop);
    };
    
    loop();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [isDarkMode]);
  
  return (
    <>
      <style>{silentMovieStyles}</style>
      <div 
        ref={containerRef}
        className={`silent-movie-container ${isDarkMode ? 'silent-movie-container-dark' : 'silent-movie-container-light'}`}
      >
        <div className={`film-border ${isDarkMode ? 'film-border-dark' : 'film-border-light'}`}></div>
        <div className="film-grain"></div>
        <div className="title-container">
          {children}
        </div>
        <canvas ref={noiseCanvasRef} className="noise"></canvas>
        <div className={`vignette ${isDarkMode ? 'vignette-dark' : 'vignette-light'}`}></div>
      </div>
    </>
  );
}

export default SilentMovieEffect;