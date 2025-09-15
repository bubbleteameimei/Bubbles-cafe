import React, { useState } from 'react';
import { PixelArtDemo, PixelArtGenerator } from '../components/background';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { motion } from 'framer-motion';

const PixelArtPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('demo');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="text-center mb-8">
        <motion.h1 
          className="text-4xl font-bold mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Pixel Art Backgrounds
        </motion.h1>
        <motion.p 
          className="text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Create and use pixel art backgrounds for your horror stories
        </motion.p>
      </div>

      <Tabs defaultValue="demo" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-center mb-6">
          <TabsList>
            <TabsTrigger value="demo">Demo Backgrounds</TabsTrigger>
            <TabsTrigger value="generator">Custom Generator</TabsTrigger>
            <TabsTrigger value="implementation">Implementation Guide</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="demo" className="mt-6">
          <PixelArtDemo />
        </TabsContent>

        <TabsContent value="generator" className="mt-6">
          <PixelArtGenerator />
        </TabsContent>

        <TabsContent value="implementation" className="mt-6">
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Implementation Guide</h2>
            
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold mb-2">Basic Implementation</h3>
                <p className="mb-4">To use pixel art backgrounds in your application:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Import the <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">PixelArtBackground</code> component</li>
                  <li>Use it in your component tree, configuring the pattern, size, and other properties</li>
                  <li>Add your content as children of the component</li>
                </ol>
                
                <div className="bg-gray-100 dark:bg-gray-900 p-4 mt-4 rounded-md overflow-x-auto">
                  <pre className="text-sm">
                    {`// Basic example
import { PixelArtBackground } from '../components/background';

const YourComponent = () => {
  return (
    <div style={{ height: '400px', position: 'relative' }}>
      <PixelArtBackground 
        pattern="haunted" 
        pixelSize={12}
      >
        <div className="text-white p-8 bg-black/50 rounded-lg">
          <h2>Your Content Here</h2>
          <p>This will appear on top of the background</p>
        </div>
      </PixelArtBackground>
    </div>
  );
};`}
                  </pre>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">Available Patterns</h3>
                <p>The component includes these built-in patterns:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>haunted</strong> - A spooky mansion silhouette</li>
                  <li><strong>forest</strong> - A dark forest landscape</li>
                  <li><strong>graveyard</strong> - A cemetery with tombstones</li> 
                  <li><strong>cave</strong> - A dark cave or dungeon</li>
                  <li><strong>blood</strong> - A blood splatter pattern</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">Custom Patterns & Palettes</h3>
                <p className="mb-4">You can create your own patterns using the generator tab and add them to the component:</p>
                
                <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto">
                  <pre className="text-sm">
                    {`// Adding a custom pattern to PixelArtBackground.tsx
const patterns = {
  // existing patterns...
  
  yourPattern: \`
    ....AAAA............
    ...ABBBBAA..........
    ..ABBCCBBAA.........
    .ABCCDDCCBAA........
    // rest of your pattern...
  \`,
};

const defaultPalettes = {
  // existing palettes...
  
  yourPattern: ['#color1', '#color2', '#color3', '#color4'],
};`}
                  </pre>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">Component Props</h3>
                <p>PixelArtBackground accepts the following props:</p>
                
                <table className="min-w-full mt-4 border-collapse">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-gray-700">
                      <th className="py-2 px-4 text-left border dark:border-gray-600">Prop</th>
                      <th className="py-2 px-4 text-left border dark:border-gray-600">Type</th>
                      <th className="py-2 px-4 text-left border dark:border-gray-600">Default</th>
                      <th className="py-2 px-4 text-left border dark:border-gray-600">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b dark:border-gray-700">
                      <td className="py-2 px-4 border dark:border-gray-600">pattern</td>
                      <td className="py-2 px-4 border dark:border-gray-600">string</td>
                      <td className="py-2 px-4 border dark:border-gray-600">'haunted'</td>
                      <td className="py-2 px-4 border dark:border-gray-600">The pattern key to use</td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="py-2 px-4 border dark:border-gray-600">pixelSize</td>
                      <td className="py-2 px-4 border dark:border-gray-600">number</td>
                      <td className="py-2 px-4 border dark:border-gray-600">24</td>
                      <td className="py-2 px-4 border dark:border-gray-600">Size of each pixel in pixels</td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="py-2 px-4 border dark:border-gray-600">width</td>
                      <td className="py-2 px-4 border dark:border-gray-600">number</td>
                      <td className="py-2 px-4 border dark:border-gray-600">480</td>
                      <td className="py-2 px-4 border dark:border-gray-600">Width for pattern calculations</td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="py-2 px-4 border dark:border-gray-600">height</td>
                      <td className="py-2 px-4 border dark:border-gray-600">number</td>
                      <td className="py-2 px-4 border dark:border-gray-600">480</td>
                      <td className="py-2 px-4 border dark:border-gray-600">Height for pattern calculations</td>
                    </tr>
                    <tr className="border-b dark:border-gray-700">
                      <td className="py-2 px-4 border dark:border-gray-600">palette</td>
                      <td className="py-2 px-4 border dark:border-gray-600">string[]</td>
                      <td className="py-2 px-4 border dark:border-gray-600">default palette</td>
                      <td className="py-2 px-4 border dark:border-gray-600">Array of color strings to override default</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border dark:border-gray-600">className</td>
                      <td className="py-2 px-4 border dark:border-gray-600">string</td>
                      <td className="py-2 px-4 border dark:border-gray-600">''</td>
                      <td className="py-2 px-4 border dark:border-gray-600">Additional CSS classes</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">Best Practices</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Use a containing element with a fixed height or position relative.</li>
                  <li>Add a semi-transparent overlay for text content to ensure readability.</li>
                  <li>Adjust pixelSize based on the device: smaller pixels for mobile, larger for desktop.</li>
                  <li>Consider the performance impact when using many patterns on a single page.</li>
                  <li>For full-page backgrounds, use a smaller pixelSize (8-12px) for better performance.</li>
                </ul>
              </section>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default PixelArtPage;