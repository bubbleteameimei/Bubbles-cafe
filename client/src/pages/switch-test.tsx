import React, { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SwitchTestPage() {
  const [toggle1, setToggle1] = useState(false);
  const [toggle2, setToggle2] = useState(true);
  const [toggle3, setToggle3] = useState(false);
  const [toggle4, setToggle4] = useState(true);
  const [toggle5, setToggle5] = useState(false);
  const [toggle6, setToggle6] = useState(true);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Toggle Switch Test Page</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Switch Sizes</CardTitle>
            <CardDescription>
              Showing all available switch sizes with both checked and unchecked states
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="switch-sm">Small Switch (Unchecked)</Label>
                  <p className="text-sm text-muted-foreground">
                    Small size toggle switch (sm)
                  </p>
                </div>
                <Switch
                  id="switch-sm"
                  checked={toggle1}
                  onCheckedChange={setToggle1}
                  size="sm"
                  aria-label="Toggle small switch"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="switch-sm-checked">Small Switch (Checked)</Label>
                  <p className="text-sm text-muted-foreground">
                    Small size toggle switch (sm) in checked state
                  </p>
                </div>
                <Switch
                  id="switch-sm-checked"
                  checked={toggle2}
                  onCheckedChange={setToggle2}
                  size="sm"
                  aria-label="Toggle small switch checked"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="switch-md">Medium Switch (Unchecked)</Label>
                  <p className="text-sm text-muted-foreground">
                    Medium size toggle switch (md) - default size
                  </p>
                </div>
                <Switch
                  id="switch-md"
                  checked={toggle3}
                  onCheckedChange={setToggle3}
                  size="md"
                  aria-label="Toggle medium switch"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="switch-md-checked">Medium Switch (Checked)</Label>
                  <p className="text-sm text-muted-foreground">
                    Medium size toggle switch (md) in checked state
                  </p>
                </div>
                <Switch
                  id="switch-md-checked"
                  checked={toggle4}
                  onCheckedChange={setToggle4}
                  size="md"
                  aria-label="Toggle medium switch checked"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="switch-lg">Large Switch (Unchecked)</Label>
                  <p className="text-sm text-muted-foreground">
                    Large size toggle switch (lg)
                  </p>
                </div>
                <Switch
                  id="switch-lg"
                  checked={toggle5}
                  onCheckedChange={setToggle5}
                  size="lg"
                  aria-label="Toggle large switch"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="switch-lg-checked">Large Switch (Checked)</Label>
                  <p className="text-sm text-muted-foreground">
                    Large size toggle switch (lg) in checked state
                  </p>
                </div>
                <Switch
                  id="switch-lg-checked"
                  checked={toggle6}
                  onCheckedChange={setToggle6}
                  size="lg"
                  aria-label="Toggle large switch checked"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Disabled State</CardTitle>
            <CardDescription>
              Showing disabled switches in both checked and unchecked states
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="switch-disabled-unchecked">Disabled Switch (Unchecked)</Label>
                  <p className="text-sm text-muted-foreground">
                    Disabled toggle switch in unchecked state
                  </p>
                </div>
                <Switch
                  id="switch-disabled-unchecked"
                  checked={false}
                  disabled
                  size="md"
                  aria-label="Disabled toggle switch unchecked"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="switch-disabled-checked">Disabled Switch (Checked)</Label>
                  <p className="text-sm text-muted-foreground">
                    Disabled toggle switch in checked state
                  </p>
                </div>
                <Switch
                  id="switch-disabled-checked"
                  checked={true}
                  disabled
                  size="md"
                  aria-label="Disabled toggle switch checked"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}