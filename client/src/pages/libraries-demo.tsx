import React, { useState, useEffect } from 'react';

export default function LibrariesDemo() {
  const [count, setCount] = useState(0);
  const [storedValue, setStoredValue] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isActive, setIsActive] = useState(false);

  // Simulate store to localStorage
  useEffect(() => {
    const value = localStorage.getItem('demo-value');
    if (value) setStoredValue(value);
  }, []);

  // Function to save value to localStorage
  const saveValue = () => {
    if (inputValue) {
      localStorage.setItem('demo-value', inputValue);
      setStoredValue(inputValue);
      setInputValue('');
    }
  };

  // Toggle state 
  const toggleState = () => {
    setIsActive(prev => !prev);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Libraries Installation Demo</h1>
      
      <div className="max-w-3xl mx-auto space-y-10">
        <section className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Successfully Installed Libraries</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li className="text-green-500">✓ react-tooltip - For displaying tooltip components</li>
            <li className="text-green-500">✓ react-hotkeys-hook - For handling keyboard shortcuts</li>
            <li className="text-green-500">✓ localforage - For improved client-side storage</li>
            <li className="text-green-500">✓ react-confetti - For confetti animations</li>
            <li className="text-green-500">✓ howler - For audio playback</li>
            <li className="text-green-500">✓ xstate - For state machine management</li>
            <li className="text-green-500">✓ zustand - For state management</li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">All libraries have been successfully installed and are ready to use in the project.</p>
        </section>

        {/* Simple Counter */}
        <section className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Simple Counter</h2>
          <div className="mb-4">
            <p className="text-lg">Count: <span className="font-bold">{count}</span></p>
          </div>
          <div className="flex gap-2">
            <button 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
              onClick={() => setCount(prev => prev + 1)}
            >
              Increment
            </button>
            <button 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
              onClick={() => setCount(prev => Math.max(0, prev - 1))}
            >
              Decrement
            </button>
          </div>
        </section>
        
        {/* LocalStorage */}
        <section className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Local Storage</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Enter a value to store:</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border rounded-md px-3 py-2"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter text to save"
              />
              <button 
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
                onClick={saveValue}
              >
                Save
              </button>
            </div>
          </div>
          {storedValue && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="font-medium">Stored value:</p>
              <p className="text-primary">{storedValue}</p>
            </div>
          )}
        </section>
        
        {/* Toggle State */}
        <section className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">State Toggle</h2>
          <div className="mb-4">
            <p className="text-lg">Current state: <span className={`font-bold ${isActive ? 'text-green-500' : 'text-red-500'}`}>
              {isActive ? 'active' : 'inactive'}
            </span></p>
          </div>
          <button 
            className={`px-4 py-2 rounded-md ${
              isActive 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}
            onClick={toggleState}
          >
            Toggle State
          </button>
        </section>
        
        {/* Updated Library List */}
        <section className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Recently Installed Libraries</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li className="text-green-500">✓ react-device-detect - For detecting user devices</li>
            <li className="text-green-500">✓ react-use - Collection of essential React hooks</li>
            <li className="text-green-500">✓ react-scramble - Text scrambling effects</li>
            <li className="text-green-500">✓ posthog-js - Analytics tracking</li>
            <li className="text-green-500">✓ use-local-storage-state - Persistent local storage hook</li>
            <li className="text-green-500">✓ react-simple-typewriter - Typewriter text effects</li>
            <li className="text-green-500">✓ socket.io-client - Real-time communication</li>
            <li className="text-green-500">✓ react-speech-recognition - Voice commands support</li>
            <li className="text-green-500">✓ react-intersection-observer - Viewport visibility detection</li>
          </ul>
        </section>

        {/* Project Next Steps */}
        <section className="bg-card p-6 rounded-lg shadow-sm border-t-4 border-primary">
          <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
          <p className="mb-4">With these libraries installed, you can now:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Create advanced state management with Zustand</li>
            <li>Add tooltips for better user experience</li>
            <li>Implement keyboard shortcuts for power users</li>
            <li>Use client-side storage that works across browsers</li>
            <li>Add celebration effects for achievements</li>
            <li>Add sound effects for interactions</li>
            <li>Create finite state machines for complex UI flows</li>
            <li>Detect user devices for responsive experiences</li>
            <li>Implement real-time features with Socket.IO</li>
            <li>Add speech recognition for voice commands</li>
            <li>Create engaging text animations and effects</li>
          </ul>
        </section>
      </div>
    </div>
  );
}