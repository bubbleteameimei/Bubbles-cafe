import { useTheme } from '@/lib/theme-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sun, Moon, Sparkles, AlertCircle, InfoIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ThemeDemoSection() {
  const { theme } = useTheme();
  
  return (
    <div className="p-6 space-y-8 max-w-3xl mx-auto my-8 rounded-lg border border-border bg-card/40 backdrop-blur-sm transition-all duration-300">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Theme Demo Section</h2>
        <p className="text-muted-foreground">
          Currently using <span className="font-semibold text-primary">{theme === 'dark' ? 'Dark' : 'Light'}</span> theme
        </p>
        <div className="flex justify-center mt-4">
          {theme === 'dark' ? (
            <Badge variant="default" className="bg-background text-foreground px-3 py-1">
              <Moon className="h-3.5 w-3.5 mr-1.5" />
              Dark Mode
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-background text-foreground px-3 py-1">
              <Sun className="h-3.5 w-3.5 mr-1.5" />
              Light Mode
            </Badge>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <CardTitle>Card Component</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is how card components look in {theme === 'dark' ? 'dark' : 'light'} mode.</p>
            <div className="mt-4 flex space-x-2">
              <Button size="sm" variant="default">Primary</Button>
              <Button size="sm" variant="secondary">Secondary</Button>
              <Button size="sm" variant="ghost">Ghost</Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-xs text-muted-foreground">Last updated: Today</p>
            <Button variant="outline" size="sm">Details</Button>
          </CardFooter>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Username</label>
              <Input placeholder="Enter your username" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Password</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <Button className="w-full">Submit</Button>
          </CardContent>
        </Card>
        
        <Alert className="transition-all duration-300">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            This is how alerts appear in {theme === 'dark' ? 'dark' : 'light'} mode.
          </AlertDescription>
        </Alert>
        
        <Alert variant="destructive" className="transition-all duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Error alerts are equally visible in both themes.
          </AlertDescription>
        </Alert>
      </div>
      
      <div className="flex justify-center space-x-4 pt-4">
        <Badge variant="outline" className="transition-all duration-300">Badge One</Badge>
        <Badge variant="secondary" className="transition-all duration-300">Badge Two</Badge>
        <Badge className="transition-all duration-300">
          <Sparkles className="h-3 w-3 mr-1" />
          Badge with Icon
        </Badge>
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>Toggle the theme using the theme switcher in the navbar to see the changes.</p>
      </div>
    </div>
  );
}