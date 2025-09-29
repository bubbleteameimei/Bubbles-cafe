import { describe, it, expect } from 'vitest';
import { QueryClient } from '@tanstack/react-query';

// Simple smoke test to verify testing setup
describe('App Testing Setup', () => {
  it('should create QueryClient without crashing', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    expect(queryClient).toBeDefined();
    expect(queryClient.getDefaultOptions().queries?.retry).toBe(false);
  });

  it('should create test components', () => {
    const TestComponent = () => 'Hello World';
    expect(typeof TestComponent).toBe('function');
    expect(TestComponent()).toBe('Hello World');
  });
});