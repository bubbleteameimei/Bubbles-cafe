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
            <CardTitle>Switch Examples</CardTitle>
            <CardDescription>
              All toggles now match the "Remember me" toggle from the login form
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="switch-1">Toggle 1 (Unchecked)</Label>
                  <p className="text-sm text-muted-foreground">
                    Standard toggle switch in unchecked state
                  </p>
                </div>
                <Switch
                  id="switch-1"
                  checked={toggle1}
                  onCheckedChange={setToggle1}
                  aria-label="Toggle switch"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="switch-2">Toggle 2 (Checked)</Label>
                  <p className="text-sm text-muted-foreground">
                    Standard toggle switch in checked state
                  </p>
                </div>
                <Switch
                  id="switch-2"
                  checked={toggle2}
                  onCheckedChange={setToggle2}
                  aria-label="Toggle switch checked"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="switch-3">Toggle 3 (Unchecked)</Label>
                  <p className="text-sm text-muted-foreground">
                    Standard toggle switch - matches "Remember me" toggle
                  </p>
                </div>
                <Switch
                  id="switch-3"
                  checked={toggle3}
                  onCheckedChange={setToggle3}
                  aria-label="Toggle switch"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="switch-4">Toggle 4 (Checked)</Label>
                  <p className="text-sm text-muted-foreground">
                    Standard toggle switch in checked state
                  </p>
                </div>
                <Switch
                  id="switch-4"
                  checked={toggle4}
                  onCheckedChange={setToggle4}
                  aria-label="Toggle switch checked"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="switch-5">Toggle 5 (Unchecked)</Label>
                  <p className="text-sm text-muted-foreground">
                    Standard toggle switch in unchecked state
                  </p>
                </div>
                <Switch
                  id="switch-5"
                  checked={toggle5}
                  onCheckedChange={setToggle5}
                  aria-label="Toggle switch"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="switch-6">Toggle 6 (Checked)</Label>
                  <p className="text-sm text-muted-foreground">
                    Standard toggle switch in checked state
                  </p>
                </div>
                <Switch
                  id="switch-6"
                  checked={toggle6}
                  onCheckedChange={setToggle6}
                  aria-label="Toggle switch checked"
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