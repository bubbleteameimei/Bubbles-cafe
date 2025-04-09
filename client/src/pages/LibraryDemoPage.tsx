import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Import all implementations
import { AnalyticsDashboard } from '../lib/implementations/ChartImplementation';
import { ReadingList } from '../lib/implementations/DragDropImplementation';
import { AccessibilityFeatures } from '../lib/implementations/SpeechImplementation';
import { ContentModerationPage } from '../lib/implementations/ContentModerationImplementation';
import { ReadingListManager } from '../lib/implementations/ImmerImplementation';
import { TypeAnimationDemo } from '../lib/implementations/TypeAnimationImplementation';

const LibraryDemoPage = () => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  
  // Demo components map
  const demos = {
    'charts': {
      title: 'Data Visualization with Chart.js',
      description: 'Interactive charts and data visualization using chart.js and react-chartjs-2',
      component: <AnalyticsDashboard />
    },
    'drag-drop': {
      title: 'Drag & Drop with react-beautiful-dnd',
      description: 'Responsive and accessible drag and drop interfaces',
      component: <ReadingList />
    },
    'speech': {
      title: 'Voice & Speech with react-speech-kit',
      description: 'Text-to-speech and speech recognition features for enhanced accessibility',
      component: <AccessibilityFeatures />
    },
    'moderation': {
      title: 'Content Moderation',
      description: 'Profanity filtering and content moderation using bad-words and leo-profanity',
      component: <ContentModerationPage />
    },
    'state': {
      title: 'Advanced State Management with Immer',
      description: 'Simplified immutable state updates with a mutable API using immer',
      component: <ReadingListManager />
    },
    'animation': {
      title: 'Type Animation Effects',
      description: 'Create engaging typing animation effects with react-type-animation',
      component: <TypeAnimationDemo />
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Library Implementation Showcase</h1>
        <p className="text-lg text-muted-foreground">
          This page demonstrates the implementation of various libraries to enhance your application.
          Each example shows how to safely integrate and use these dependencies.
        </p>
      </div>
      
      {activeDemo ? (
        <div className="space-y-6">
          <Button
            variant="outline"
            onClick={() => setActiveDemo(null)}
            className="mb-4"
          >
            ← Back to all demos
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle>{demos[activeDemo as keyof typeof demos].title}</CardTitle>
              <CardDescription>{demos[activeDemo as keyof typeof demos].description}</CardDescription>
            </CardHeader>
            <CardContent>
              {demos[activeDemo as keyof typeof demos].component}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(demos).map(([key, demo]) => (
            <Card key={key} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{demo.title}</CardTitle>
                <CardDescription>{demo.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setActiveDemo(key)}>
                  View Demo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryDemoPage;