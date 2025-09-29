import { describe, it, expect } from 'vitest';

describe('Testing Setup', () => {
  it('should create a simple component', () => {
    const TestComponent = () => 'Hello Test';
    expect(typeof TestComponent).toBe('function');
    expect(TestComponent()).toBe('Hello Test');
  });

  it('should verify test environment works', () => {
    expect(1 + 1).toBe(2);
    expect(typeof describe).toBe('function');
    expect(typeof it).toBe('function');
    expect(typeof expect).toBe('function');
  });
});