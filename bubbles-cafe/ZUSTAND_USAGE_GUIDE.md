# Zustand Usage Guide

## Overview

Zustand is a small, fast, and scalable state management solution for React applications. This guide explains how to use Zustand in our project and demonstrates its advantages over other state management libraries.

## Why Zustand?

Zustand offers several advantages over other state management solutions:

1. **Simplicity**: Minimal boilerplate compared to Redux or Context API
2. **Performance**: Optimized re-rendering with fine-grained updates
3. **TypeScript Support**: Excellent type inference and safety
4. **Middleware**: Built-in support for persistence, devtools, and more
5. **Size**: Very small bundle size (only ~1KB)
6. **Compatibility**: Works with React hooks, class components, or even outside React

## Basic Usage

### Creating a Store

A basic Zustand store is created using the `create` function:

```typescript
import { create } from 'zustand';

interface BearState {
  bears: number;
  increasePopulation: () => void;
}

const useBearStore = create<BearState>((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
}));
```

### Using the Store in Components

Import and use the store in your React components:

```tsx
import { useBearStore } from './stores/bearStore';

function BearCounter() {
  const bears = useBearStore((state) => state.bears);
  return <h1>{bears} bears around here</h1>;
}

function Controls() {
  const increasePopulation = useBearStore((state) => state.increasePopulation);
  return <button onClick={increasePopulation}>Add a bear</button>;
}
```

## Advanced Features

### Persistence

Zustand offers middleware for persisting state to localStorage or sessionStorage:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage', // Storage key
    }
  )
);
```

### Middleware

Zustand supports custom middleware for extending functionality:

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useStore = create(
  devtools(
    persist(
      (set) => ({
        // Your state and actions here
      }),
      { name: 'storage-key' }
    )
  )
);
```

## Project Example

In our project, we've implemented a theme store using Zustand:

1. **Theme Store**: `client/src/stores/themeStore.ts`
   - Manages theme state (light/dark/system)
   - Persists user preference to localStorage
   - Provides actions for changing theme

2. **Theme Toggle Component**: `client/src/components/ZustandThemeToggle.tsx` 
   - Uses the theme store to display and change theme
   - Demonstrates the simplicity of using Zustand in components

3. **Demo Page**: `client/src/pages/zustand-demo.tsx`
   - Showcases the theme toggle component
   - Explains Zustand features and benefits

## Migration from Context API

If you're migrating from React Context, here's a quick comparison:

**Context API:**
```tsx
// Create context
const ThemeContext = createContext();

// Provider component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Consumer component
function ThemeConsumer() {
  const { theme, setTheme } = useContext(ThemeContext);
  // ...
}
```

**Zustand:**
```tsx
// Create store
const useThemeStore = create((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}));

// Consumer component
function ThemeConsumer() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  // ...
}
```

## Best Practices

1. **Selective Subscription**: Only subscribe to the state you need to prevent unnecessary re-renders
   ```tsx
   // Good - Component only re-renders when `bears` changes
   const bears = useBearStore((state) => state.bears);
   
   // Avoid - Component re-renders on any state change
   const { bears } = useBearStore();
   ```

2. **Create Actions Within the Store**: Keep state manipulation logic in the store
   ```tsx
   const useCounterStore = create((set) => ({
     count: 0,
     // Good - Logic inside store
     increment: () => set((state) => ({ count: state.count + 1 })),
   }));
   ```

3. **Use Middleware for Common Patterns**: Leverage built-in middleware for common tasks like persistence, logging, etc.

## Resources

- [Zustand GitHub Repository](https://github.com/pmndrs/zustand)
- [Official Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Zustand with TypeScript](https://docs.pmnd.rs/zustand/guides/typescript)