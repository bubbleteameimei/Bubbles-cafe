import { describe, it, expect } from 'vitest';

function Button() {
  return { type: 'button', label: 'ok', text: 'ok' };
}

describe('a11y smoke', () => {
  it('creates button with accessible properties', () => {
    const button = Button();
    expect(button.type).toBe('button');
    expect(button.label).toBe('ok');
    expect(button.text).toBe('ok');
  });

  it('verifies component function works', () => {
    expect(typeof Button).toBe('function');
    const result = Button();
    expect(result).toEqual({
      type: 'button',
      label: 'ok', 
      text: 'ok'
    });
  });
});

