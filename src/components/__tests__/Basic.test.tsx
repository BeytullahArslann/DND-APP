import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// A simple component to test setup
const TestComponent = ({ label }: { label: string }) => (
  <button>{label}</button>
);

describe('Basic Component Test', () => {
  it('renders correctly', () => {
    render(<TestComponent label="Click Me" />);
    const button = screen.getByText('Click Me');
    expect(button).toBeInTheDocument();
  });
});
