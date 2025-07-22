import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import "../pages/auth.css"; // Import auth.css to get the "Remember me" toggle styles

export default function ToggleComparisonPage() {
  const [standardToggle1, setStandardToggle1] = useState(false);
  const [standardToggle2, setStandardToggle2] = useState(true);
  const [rememberMeToggle1, setRememberMeToggle1] = useState(false);
  const [rememberMeToggle2, setRememberMeToggle2] = useState(true);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Toggle Switch Comparison</h1>
      
      <div className="grid gap-6 max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Toggle Switch Standardization</CardTitle>
            <CardDescription>
              Comparing standard toggle switch with "Remember me" toggle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-6">
              <h3 className="text-lg font-semibold">Unchecked State</h3>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="standard-toggle-1">New Standardized Toggle</Label>
                    <p className="text-sm text-muted-foreground">
                      Using the updated Switch component
                    </p>
                  </div>
                  <Switch
                    id="standard-toggle-1"
                    checked={standardToggle1}
                    onCheckedChange={setStandardToggle1}
                    aria-label="Toggle standardized switch"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="remember-toggle-1">Remember Me Toggle (Reference)</Label>
                    <p className="text-sm text-muted-foreground">
                      The toggle from the login form
                    </p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="remember-toggle-1"
                      className="peer sr-only"
                      checked={rememberMeToggle1}
                      onChange={(e) => setRememberMeToggle1(e.target.checked)}
                    />
                    <span className="toggle-bg"></span>
                  </label>
                </div>
              </div>

              <h3 className="text-lg font-semibold pt-4">Checked State</h3>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="standard-toggle-2">New Standardized Toggle</Label>
                    <p className="text-sm text-muted-foreground">
                      Using the updated Switch component
                    </p>
                  </div>
                  <Switch
                    id="standard-toggle-2"
                    checked={standardToggle2}
                    onCheckedChange={setStandardToggle2}
                    aria-label="Toggle standardized switch"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="remember-toggle-2">Remember Me Toggle (Reference)</Label>
                    <p className="text-sm text-muted-foreground">
                      The toggle from the login form
                    </p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="remember-toggle-2"
                      className="peer sr-only"
                      checked={rememberMeToggle2}
                      onChange={(e) => setRememberMeToggle2(e.target.checked)}
                    />
                    <span className="toggle-bg"></span>
                  </label>
                </div>
              </div>

              <h3 className="text-lg font-semibold pt-4">Disabled States</h3>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="standard-toggle-disabled-1">Disabled Unchecked</Label>
                    <p className="text-sm text-muted-foreground">
                      Standardized toggle in disabled unchecked state
                    </p>
                  </div>
                  <Switch
                    id="standard-toggle-disabled-1"
                    checked={false}
                    disabled
                    aria-label="Disabled toggle switch"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="standard-toggle-disabled-2">Disabled Checked</Label>
                    <p className="text-sm text-muted-foreground">
                      Standardized toggle in disabled checked state
                    </p>
                  </div>
                  <Switch
                    id="standard-toggle-disabled-2"
                    checked={true}
                    disabled
                    aria-label="Disabled toggle switch"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}