import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';

function Button() {
  return <button aria-label="ok">ok</button>;
}

describe('a11y smoke', () => {
  it('renders with accessible name', () => {
    const { getByRole } = render(<Button />);
    expect(getByRole('button', { name: /ok/i })).toBeTruthy();
  });
});

