import React, { useEffect, useRef, useState } from 'react';

// Define the props interface
export interface PixelArtBackgroundProps {
  width?: number;
  height?: number;
  pixelSize?: number;
  palette?: string[];
  pattern?: string;
  className?: string;
  children?: React.ReactNode;
}

// Define available patterns
const patterns = {
  haunted: `
    ........AAAAAAAA........
    .......AABBBBBBAA.......
    ......AABBBBBBBBAA......
    .....AABBBBBBBBBBAA.....
    ....AABBBBBBBBBBBBAA....
    ...AABBBBBBBBBBBBBBAA...
    ..AABBBBBBBBBBBBBBBBAA..
    .AABBBBBBBBBBBBBBBBBBAA.
    AABBBBBBBBBBBBBBBBBBBBAA
    AABBBBBBBBBBBBBBBBBBBBAA
    .ABBBCCCCCBBBBBCCCCCBBA.
    ..ABCCCCCCCBBBCCCCCCCBA..
    ...ABCCCCCCBBBCCCCCCBA...
    ....ACCCCCCBBBCCCCCCA....
    .....ACCCCCBBBCCCCCA.....
    ......ACCCCBBBCCCCA......
    ......ACCCCBBBCCCCA......
    ......ACCCCBBBCCCCA......
    ......ACCCCBBBCCCCA......
    .....AABBBBBBBBBBBAA.....
    ....AAAABBBBBBBBBAAAA....
    ...AAADAAABBBBBAAADAAA...
    ..AAADDAAAABBBAAAADDAAA..
    .AAADDDDDAAAAAAAADDDDDAAA.
  `,
  forest: `
    ...........................
    ......A...................
    .....AAA..................
    ....AAAAA.......A.........
    ...AAAAAAA.....AAA........
    ..AAAAAAAAA...AAAAA.......
    .AAAAAAAAAAA.AAAAAAA......
    AAAAAAAAAAAAAAAAAAAAAA....
    .AAAAAA...AAAAAAAAAAAAA...
    ..AAA.......AAAAAAAAAAAA..
    ..A...........AAAAAAAAAA..
    .............BBAAAAAAA....
    ...........BBBBBBAAA......
    .........BBBBBBBBBB.......
    .......BBBBBBBBBBBBBBB....
    ....BBBBBBBBBBBBBBBBBBBBB.
    ........CCCCCCC...........
    ........CCCCCCC...........
    ........CCCCCCC...........
    ........CCCCCCC...........
    ........CCCCCCC...........
    ........CCCCCCC...........
    ........CCCCCCC...........
  `,
  graveyard: `
    ............................
    .....CCC....CCC....CCC.....
    ....CCCCC..CCCCC..CCCCC....
    ....CCCCC..CCCCC..CCCCC....
    ....CCCCC..CCCCC..CCCCC....
    .....CCC....CCC....CCC.....
    .....BBB....BBB....BBB.....
    .....BBB....BBB....BBB.....
    ........................AAAA
    .......................BAAAA
    ......................BBAAAA
    .....................BBBAAAA
    ....................BBBBAAAA
    ...................BBBBBAAAA
    ..................BBBBBBAAAA
    .................BBBBBBBAAAA
    ................BBBBBBBBAAAA
    ...............BBBBBBBBBAAAA
    ..............BBBBBBBBBBAAAA
    .............BBBBBBBBBBBAAAA
    ............BBBBBBBBBBBBAAAA
    ...........BBBBBBBBBBBBBAAAA
    ..........BBBBBBBBBBBBBBAAAA
    .........BBBBBBBBBBBBBBBAAAA
  `,
  cave: `
    ..AAAAAAAAAAAAAAAAAAAA..
    .AAAAAAAAAAAAAAAAAAAAAA.
    AAAABBBBBBBBBBBBBBBBAAAA
    AAABBBBBBBBBBBBBBBBBBAAAA
    AABBBCCCCCCCCCCCCCBBBBAAA
    ABBBCCCCCCCCCCCCCCCCBBBAA
    ABBCCCCDDDDDDDDDCCCCBBBA
    ABBCCCDDDDDDDDDDDCCCBBBA
    ABBCCCDDDDDDDDDDDDCCCBBBA
    ABBCCCDDDDDDDDDDDDCCCBBBA
    ABBCCCDDDDDDDDDDDDCCCBBBA
    ABBCCCDDDDDDDDDDDDCCCBBBA
    ABBCCCDDDDDDDDDDDDCCCBBBA
    ABBCCCDDDDDDDDDDDDCCCBBBA
    ABBCCCDDDDDDDDDDDDCCCBBBA
    ABBCCCDDDDDDDDDDDDCCCBBBA
    ABBBCCCDDDDDDDDDDDCCBBBAA
    AABBCCCCDDDDDDDDDCCCBBAAA
    .AABBCCCCCCCCCCCCCCBBAA.
    ..AABBBCCCCCCCCCCCBBAAA..
    ...AAABBBBBBBBBBBBBAAA...
    ....AAAAAAAAAAAAAAAAA....
  `,
  blood: `
    .............AAA.............
    ............AAAAA............
    ...........ABAAAAA...........
    ..........ABBAAAAA...........
    .........ABBBBAAAAA..........
    ........ABBBBBAAAAA..........
    .......ABBCBBBAAAAAA.........
    ......ABBCCBBBAAAAAAAA.......
    .....ABBCCCBBBAAAAAAAAA......
    ....ABBCCCCCBBBAAAAAAAAAA....
    ...ABBCCCCCCCBBBAAAAAAAAAAA..
    ..ABBCCCCCCCCCBBBAAAAAABAAAA.
    .ABBCCCCCCCCCCCBBBAAAABBBAAAA
    ABBCCCCCCCCCCCCCBBBAAABBBBBAAA
    BBCCCCCCCCCCCCCCBBBABBBBBBBAA.
    .CCCCCCCCCCCCCCBBBBBBBBBBBA...
    ..CCCCCCCCCCCCCBBBBBBBBBA.....
    ...CCCCCCCCCCCCBBBBBBBAA......
    ....CCCCCCCCCCCBBBBAAAA.......
    .....CCCCCCCCCCBAAAAAA........
    ......CCCCCCCCCAAAAA..........
    .......CCCCCCBAAA..............
    ........CCCBAA.................
    .........AAA...................
  `,
};

// Define default palettes
const defaultPalettes = {
  haunted: ['#1a1a1a', '#3d3d3d', '#6e6e6e', '#9e9e9e'],
  forest: ['#2d4f1e', '#1a2e29', '#5c3c1d'],
  graveyard: ['#444444', '#666666', '#999999'],
  cave: ['#252525', '#3d3d3d', '#5a5a5a', '#7a7a7a'],
  blood: ['#8b0000', '#a30000', '#cf0000'],
};

// Helper function to parse pattern
const parsePattern = (patternStr: string): string[][] => {
  // Remove any leading/trailing whitespace
  const lines = patternStr.trim().split('\n');
  
  // Convert to 2D array of characters
  const pattern = lines.map(line => line.trim().split(''));
  
  return pattern;
};

const PixelArtBackground: React.FC<PixelArtBackgroundProps> = ({
  width = 480,
  height = 480,
  pixelSize = 24,
  palette,
  pattern = 'haunted',
  className = '',
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Get the pattern string
  const patternString = patterns[pattern as keyof typeof patterns] || patterns.haunted;
  const patternArray = parsePattern(patternString);
  
  // Get the palette
  const activePalette = palette || defaultPalettes[pattern as keyof typeof defaultPalettes] || defaultPalettes.haunted;
  
  // Draw the pattern on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw pattern
    patternArray.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === '.') return; // Skip empty/transparent cells
        
        // Get the color index (A=0, B=1, C=2, etc.)
        const colorIndex = cell.charCodeAt(0) - 'A'.charCodeAt(0);
        
        if (colorIndex >= 0 && colorIndex < activePalette.length) {
          const color = activePalette[colorIndex];
          
          // Calculate position
          const x = (colIndex * width / row.length);
          const y = (rowIndex * height / patternArray.length);
          
          // Calculate size
          const cellWidth = width / row.length;
          const cellHeight = height / patternArray.length;
          
          // Draw the cell
          ctx.fillStyle = color;
          ctx.fillRect(x, y, cellWidth, cellHeight);
        }
      });
    });
  }, [patternArray, activePalette, width, height]);
  
  // Update container size on resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    // Initial size
    updateSize();
    
    // Add resize listener
    window.addEventListener('resize', updateSize);
    
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
        style={{
          imageRendering: 'pixelated', // For crisp pixel art
        }}
      />
      {children && (
        <div className="relative z-10 h-full">
          {children}
        </div>
      )}
    </div>
  );
};

export default PixelArtBackground;