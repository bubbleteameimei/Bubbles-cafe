import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Testing Setup', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div data-testid="test">Hello Test</div>;
    render(<TestComponent />);
    expect(screen.getByTestId('test')).toHaveTextContent('Hello Test');
  });
});