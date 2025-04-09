import { ZustandThemeToggle } from "@/components/ZustandThemeToggle";

export default function ZustandDemo() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Zustand State Management Demo</h1>
      
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Theme State Management</h2>
          <p className="mb-6">
            This example uses Zustand to manage theme state, persisting it to localStorage.
            The theme selection will be preserved even after page refresh.
          </p>
          
          <ZustandThemeToggle />
        </div>
        
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="text-xl font-medium mb-2">Key Features of Zustand</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Simple and lightweight state management</li>
            <li>No boilerplate code required (compared to Redux)</li>
            <li>Built-in middleware support (persist, subscribe, devtools)</li>
            <li>TypeScript support out of the box</li>
            <li>Can be used with React hooks or outside of React</li>
            <li>Easy to understand and debug</li>
          </ul>
        </div>
      </div>
    </div>
  );
}