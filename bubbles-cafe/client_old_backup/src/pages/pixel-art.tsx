import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid, Download, Trash2, Save } from 'lucide-react';
import { PageHeader } from '../components/page-header';
import { PageContainer } from '../components/page-container';
import { useToast } from '@/hooks/use-toast';

const colors = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#008000', '#800000', '#008080', '#808000', '#FFC0CB',
  '#A52A2A', '#808080', '#C0C0C0', '#FFD700', '#4B0082'
];

export default function PixelArtPage() {
  const [gridSize, setGridSize] = useState(16);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [isErasing, setIsErasing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [pixelSize, setPixelSize] = useState(20);
  const [currentTab, setCurrentTab] = useState('draw');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [savedArtworks, setSavedArtworks] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Initialize the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const canvasSize = gridSize * pixelSize;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, gridSize, pixelSize);
    }
  }, [gridSize, pixelSize, showGrid]);
  
  // Draw the grid lines
  const drawGrid = (ctx: CanvasRenderingContext2D, size: number, pixelSize: number) => {
    ctx.strokeStyle = '#DDDDDD';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= size; i++) {
      const pos = i * pixelSize;
      
      // Draw vertical line
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, size * pixelSize);
      ctx.stroke();
      
      // Draw horizontal line
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(size * pixelSize, pos);
      ctx.stroke();
    }
  };
  
  // Handle drawing on the canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);
    
    drawPixel(x, y);
  };
  
  // Draw a single pixel on the canvas
  const drawPixel = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set fill color based on mode (draw or erase)
    ctx.fillStyle = isErasing ? '#FFFFFF' : selectedColor;
    
    // Fill the pixel
    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    
    // Redraw grid lines if enabled
    if (showGrid) {
      const canvasSize = gridSize * pixelSize;
      drawGridAroundPixel(ctx, x, y);
    }
  };
  
  // Redraw grid lines around a specific pixel
  const drawGridAroundPixel = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.strokeStyle = '#DDDDDD';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    ctx.beginPath();
    ctx.moveTo(x * pixelSize, 0);
    ctx.lineTo(x * pixelSize, gridSize * pixelSize);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo((x + 1) * pixelSize, 0);
    ctx.lineTo((x + 1) * pixelSize, gridSize * pixelSize);
    ctx.stroke();
    
    // Draw horizontal lines
    ctx.beginPath();
    ctx.moveTo(0, y * pixelSize);
    ctx.lineTo(gridSize * pixelSize, y * pixelSize);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, (y + 1) * pixelSize);
    ctx.lineTo(gridSize * pixelSize, (y + 1) * pixelSize);
    ctx.stroke();
  };
  
  // Handle mouse move for continuous drawing
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);
    
    drawPixel(x, y);
  };
  
  // Clear the canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const canvasSize = gridSize * pixelSize;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    // Redraw grid if enabled
    if (showGrid) {
      drawGrid(ctx, gridSize, pixelSize);
    }
    
    toast({
      title: "Canvas Cleared",
      description: "Your pixel art canvas has been cleared."
    });
  };
  
  // Download the canvas as an image
  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create a new canvas without grid lines
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return;
    
    // Copy the original canvas
    exportCtx.drawImage(canvas, 0, 0);
    
    // If grid is shown, remove the grid lines by redrawing each pixel
    if (showGrid) {
      const imgData = exportCtx.getImageData(0, 0, canvas.width, canvas.height);
      exportCtx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          // Get the color from the center of each pixel to avoid grid lines
          const centerX = x * pixelSize + Math.floor(pixelSize / 2);
          const centerY = y * pixelSize + Math.floor(pixelSize / 2);
          
          const index = (centerY * canvas.width + centerX) * 4;
          const color = `rgb(${imgData.data[index]}, ${imgData.data[index + 1]}, ${imgData.data[index + 2]})`;
          
          exportCtx.fillStyle = color;
          exportCtx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }
    
    // Convert canvas to data URL and create download
    const dataUrl = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `pixel-art-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = dataUrl;
    link.click();
    
    toast({
      title: "Download Started",
      description: "Your pixel art has been downloaded as a PNG image."
    });
  };
  
  // Save current artwork
  const saveArtwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    setSavedArtworks(prev => [...prev, dataUrl]);
    
    toast({
      title: "Artwork Saved",
      description: "Your pixel art has been saved to your gallery."
    });
  };
  
  // Load saved artwork
  const loadArtwork = (dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Redraw grid if enabled
      if (showGrid) {
        drawGrid(ctx, gridSize, pixelSize);
      }
      
      toast({
        title: "Artwork Loaded",
        description: "Your saved pixel art has been loaded to the canvas."
      });
    };
    img.src = dataUrl;
  };
  
  // Delete saved artwork
  const deleteArtwork = (index: number) => {
    setSavedArtworks(prev => prev.filter((_, i) => i !== index));
    
    toast({
      title: "Artwork Deleted",
      description: "The selected artwork has been removed from your gallery."
    });
  };
  
  return (
    <PageContainer>
      <PageHeader
        title="Pixel Art Creator"
        description="Create and share your own pixel art masterpieces"
      />
      
      <div className="flex flex-col space-y-6">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="draw">Draw</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>
          
          <TabsContent value="draw" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-1 lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Canvas</CardTitle>
                    <CardDescription>Click or drag to draw pixel art</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div className="border border-border rounded-md overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        onClick={handleCanvasClick}
                        onMouseDown={() => setIsDrawing(true)}
                        onMouseUp={() => setIsDrawing(false)}
                        onMouseLeave={() => setIsDrawing(false)}
                        onMouseMove={handleMouseMove}
                        style={{
                          cursor: isErasing ? 'crosshair' : 'pointer',
                          backgroundColor: '#FFFFFF',
                          imageRendering: 'pixelated',
                          touchAction: 'none'
                        }}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap justify-between gap-2">
                    <Button onClick={clearCanvas} variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                    <div className="flex gap-2">
                      <Button onClick={saveArtwork} variant="outline">
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button onClick={downloadImage}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Tools</CardTitle>
                    <CardDescription>Customize your pixel art creation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Colors</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {colors.map(color => (
                          <button
                            key={color}
                            className={`h-8 w-full rounded-md border ${selectedColor === color ? 'ring-2 ring-primary ring-offset-2' : 'hover:scale-110'} transition-transform`}
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              setSelectedColor(color);
                              setIsErasing(false);
                            }}
                            aria-label={`Color ${color}`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="erase-mode">Eraser Tool</Label>
                        <Switch
                          id="erase-mode"
                          checked={isErasing}
                          onCheckedChange={setIsErasing}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-grid">Show Grid</Label>
                        <Switch
                          id="show-grid"
                          checked={showGrid}
                          onCheckedChange={setShowGrid}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="grid-size">Grid Size: {gridSize}x{gridSize}</Label>
                        </div>
                        <Slider
                          id="grid-size"
                          min={8}
                          max={32}
                          step={4}
                          value={[gridSize]}
                          onValueChange={values => setGridSize(values[0])}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="pixel-size">Pixel Size: {pixelSize}px</Label>
                        </div>
                        <Slider
                          id="pixel-size"
                          min={10}
                          max={30}
                          step={5}
                          value={[pixelSize]}
                          onValueChange={values => setPixelSize(values[0])}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="gallery" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Gallery</CardTitle>
                <CardDescription>
                  {savedArtworks.length === 0 
                    ? "You haven't saved any pixel art yet."
                    : `You have ${savedArtworks.length} saved artwork${savedArtworks.length !== 1 ? 's' : ''}.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedArtworks.length === 0 ? (
                  <div className="text-center py-8">
                    <Grid className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-medium">No saved artwork</p>
                    <p className="text-sm text-muted-foreground">
                      Create and save some pixel art to see it here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {savedArtworks.map((artwork, index) => (
                      <div key={index} className="group relative">
                        <div className="aspect-square rounded-md overflow-hidden border">
                          <img
                            src={artwork}
                            alt={`Saved artwork ${index + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity rounded-md">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => loadArtwork(artwork)}
                          >
                            Load
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteArtwork(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}