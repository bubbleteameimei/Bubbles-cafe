import React, { useState, useEffect } from 'react';
import { Download, Copy, Trash, Plus } from 'lucide-react';

// Define the color cell interface
interface ColorCell {
  color: string;
  char: string;
}

const PixelArtGenerator: React.FC = () => {
  // Grid dimensions
  const [width, setWidth] = useState<number>(20);
  const [height, setHeight] = useState<number>(16);
  
  // Color palette - we'll use an array of objects with color and character
  const [palette, setPalette] = useState<ColorCell[]>([
    { color: '#0f0f1b', char: 'A' },
    { color: '#2b2b3b', char: 'B' },
    { color: '#4b4b6b', char: 'C' },
    { color: '#8b8bad', char: 'D' },
  ]);
  
  // Current selected color
  const [selectedColor, setSelectedColor] = useState<ColorCell>(palette[0]);
  
  // The grid state
  const [grid, setGrid] = useState<string[][]>([]);
  
  // Custom color input
  const [customColor, setCustomColor] = useState<string>('#000000');
  
  // Initialize the grid
  useEffect(() => {
    resetGrid();
  }, [width, height]);
  
  // Reset the grid to empty (transparent) cells
  const resetGrid = () => {
    const newGrid = Array(height).fill(null).map(() => 
      Array(width).fill('.')
    );
    setGrid(newGrid);
  };
  
  // Handle cell click in the grid
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    const newGrid = [...grid];
    newGrid[rowIndex][colIndex] = newGrid[rowIndex][colIndex] === selectedColor.char 
      ? '.' // If already selected, make it transparent
      : selectedColor.char;
    setGrid(newGrid);
  };
  
  // Add a new color to the palette
  const addColor = () => {
    if (palette.length >= 26) {
      alert('Maximum 26 colors allowed (A-Z)');
      return;
    }
    
    // Get the next available character code
    const nextChar = String.fromCharCode('A'.charCodeAt(0) + palette.length);
    
    setPalette([...palette, { color: customColor, char: nextChar }]);
    setSelectedColor({ color: customColor, char: nextChar });
  };
  
  // Remove a color from the palette
  const removeColor = (indexToRemove: number) => {
    if (palette.length <= 1) {
      alert('Cannot remove last color');
      return;
    }
    
    // Get the character to remove
    const charToRemove = palette[indexToRemove].char;
    
    // Update grid to replace all instances of this color with transparent
    const updatedGrid = grid.map(row => 
      row.map(cell => cell === charToRemove ? '.' : cell)
    );
    
    // Remove the color from the palette
    const newPalette = palette.filter((_, i) => i !== indexToRemove);
    
    // Update state
    setPalette(newPalette);
    setGrid(updatedGrid);
    setSelectedColor(newPalette[0]);
  };
  
  // Generate the pattern string
  const generatePatternString = () => {
    return `
${grid.map(row => '    ' + row.join('')).join('\n')}
  `;
  };
  
  // Generate the palette string
  const generatePaletteString = () => {
    return `[${palette.map(p => `'${p.color}'`).join(', ')}]`;
  };
  
  // Copy the pattern to clipboard
  const copyPatternToClipboard = () => {
    const patternString = generatePatternString();
    navigator.clipboard.writeText(patternString);
    alert('Pattern copied to clipboard!');
  };
  
  // Copy the palette to clipboard
  const copyPaletteToClipboard = () => {
    const paletteString = generatePaletteString();
    navigator.clipboard.writeText(paletteString);
    alert('Palette copied to clipboard!');
  };
  
  // Generate a preview SVG
  const generatePreviewSVG = () => {
    // Convert grid to a flat array of cells
    const cells: { x: number; y: number; color: string }[] = [];
    
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell !== '.') { // Skip transparent cells
          const colorObj = palette.find(p => p.char === cell);
          if (colorObj) {
            cells.push({
              x: colIndex,
              y: rowIndex,
              color: colorObj.color
            });
          }
        }
      });
    });
    
    return (
      <svg width={width * 20} height={height * 20} viewBox={`0 0 ${width} ${height}`}>
        {cells.map((cell, i) => (
          <rect
            key={`preview-${i}`}
            x={cell.x}
            y={cell.y}
            width={1}
            height={1}
            fill={cell.color}
          />
        ))}
      </svg>
    );
  };
  
  // Download SVG as file
  const downloadSVG = () => {
    const svgData = document.getElementById('preview-svg')?.outerHTML;
    if (!svgData) return;
    
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pixel-art-pattern.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Export full component data
  const exportComponent = () => {
    const exportData = {
      pattern: generatePatternString(),
      palette: palette.map(p => p.color),
    };
    
    const jsonData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pixel-art-component-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Pixel Art Pattern Generator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Tools and controls */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Tools</h2>
          
          {/* Grid dimensions */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Grid Size</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Width: {width}</label>
                <input
                  type="range"
                  min="5"
                  max="32"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Height: {height}</label>
                <input
                  type="range"
                  min="5"
                  max="32"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          {/* Color palette */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Color Palette</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {palette.map((color, index) => (
                <div 
                  key={index}
                  className={`flex items-center p-2 rounded cursor-pointer ${selectedColor.char === color.char ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setSelectedColor(color)}
                >
                  <div 
                    style={{ backgroundColor: color.color }} 
                    className="w-8 h-8 rounded mr-2"
                  ></div>
                  <div className="flex-grow">
                    <div className="text-xs">{color.color}</div>
                    <div className="text-xs font-mono">Char: {color.char}</div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeColor(index);
                    }}
                    className="text-red-500 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Add new color */}
            <div className="flex items-center">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-10 h-10 p-1 rounded mr-2"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="flex-grow p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <button
                onClick={addColor}
                className="ml-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                title="Add Color"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
          
          {/* Actions */}
          <div className="space-y-3">
            <button 
              onClick={resetGrid}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
            >
              Reset Grid
            </button>
            <button 
              onClick={copyPatternToClipboard}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center justify-center"
            >
              <Copy size={16} className="mr-2" /> Copy Pattern
            </button>
            <button 
              onClick={copyPaletteToClipboard}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded flex items-center justify-center"
            >
              <Copy size={16} className="mr-2" /> Copy Palette
            </button>
            <button 
              onClick={downloadSVG}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded flex items-center justify-center"
            >
              <Download size={16} className="mr-2" /> Download SVG
            </button>
            <button 
              onClick={exportComponent}
              className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded flex items-center justify-center"
            >
              <Download size={16} className="mr-2" /> Export Component Data
            </button>
          </div>
        </div>
        
        {/* Middle column: Grid Editor */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Pattern Editor</h2>
          <div className="mb-4 flex items-center">
            <div 
              style={{ backgroundColor: selectedColor.color }} 
              className="w-6 h-6 rounded mr-2"
            ></div>
            <div>Selected: {selectedColor.color} (Char: {selectedColor.char})</div>
          </div>
          
          <div className="overflow-auto max-h-[500px] border rounded p-1 bg-gray-200 dark:bg-gray-900">
            <div 
              style={{ 
                display: 'grid',
                gridTemplateColumns: `repeat(${width}, 1fr)`,
                gap: '1px',
              }}
            >
              {grid.map((row, rowIndex) => 
                row.map((cell, colIndex) => {
                  const cellColor = cell === '.' ? 'transparent' : palette.find(p => p.char === cell)?.color || 'transparent';
                  
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      style={{ 
                        backgroundColor: cellColor,
                        aspectRatio: '1/1',
                      }}
                      className={`cursor-pointer border border-gray-300 dark:border-gray-700 ${cellColor === 'transparent' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    ></div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        
        {/* Right column: Preview and Output */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Preview & Output</h2>
          
          {/* SVG Preview */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">SVG Preview</h3>
            <div className="bg-white dark:bg-gray-900 border rounded p-3 flex justify-center">
              <div id="preview-svg">
                {generatePreviewSVG()}
              </div>
            </div>
          </div>
          
          {/* Generated Pattern */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Pattern String</h3>
            <div className="bg-gray-700 text-white p-3 rounded font-mono text-sm overflow-auto max-h-[150px]">
              <pre>{generatePatternString()}</pre>
            </div>
          </div>
          
          {/* Generated Palette */}
          <div>
            <h3 className="font-medium mb-2">Palette Array</h3>
            <div className="bg-gray-700 text-white p-3 rounded font-mono text-sm overflow-auto max-h-[100px]">
              <pre>{generatePaletteString()}</pre>
            </div>
          </div>
        </div>
      </div>
      
      {/* Usage Instructions */}
      <div className="mt-8 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">How to Use</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Use the grid editor to create your pixel art pattern by clicking cells.</li>
          <li>Add colors to your palette as needed.</li>
          <li>Copy the pattern string and palette array.</li>
          <li>Add these to a new pattern object in the <code className="px-1 py-0.5 bg-gray-700 text-white rounded">patterns</code> and <code className="px-1 py-0.5 bg-gray-700 text-white rounded">defaultPalettes</code> objects in the <code className="px-1 py-0.5 bg-gray-700 text-white rounded">PixelArtBackground.tsx</code> component.</li>
          <li>Use your custom pattern with <code className="px-1 py-0.5 bg-gray-700 text-white rounded">&lt;PixelArtBackground pattern="your-pattern-name" /&gt;</code></li>
        </ol>
      </div>
    </div>
  );
};

export default PixelArtGenerator;