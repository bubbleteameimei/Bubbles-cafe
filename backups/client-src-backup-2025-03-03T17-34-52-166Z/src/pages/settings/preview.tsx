import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PreviewSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Live Preview</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Settings Preview</CardTitle>
          <CardDescription>Preview how your content will look with current settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 border rounded-md">
              <h2 className="text-xl font-bold mb-4">Sample Story Preview</h2>
              <p className="mb-4">
                The old house stood at the end of the street, its windows like dark eyes staring into the night. 
                The wind whispered through the trees, carrying secrets of the past...
              </p>
              <p>
                Sarah hesitated at the gate, her hand trembling slightly as she reached for the rusted latch. 
                The stories she'd heard about this place...
              </p>
            </div>

            <div className="p-4 border rounded-md bg-muted">
              <h3 className="font-semibold mb-2">Comment Preview</h3>
              <p className="text-sm">This is how comments and user interactions will appear.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
