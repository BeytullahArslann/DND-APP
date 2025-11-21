# Testing Guidelines

This project uses **Vitest** + **React Testing Library** for testing.

## Running Tests

- `npm test`: Runs all tests in watch mode.
- `npm run test:coverage`: Runs tests and generates a coverage report.

## File Structure

- **Unit Tests**: Co-located with the source file in a `__tests__` directory.
  - Example: `src/utils/__tests__/stats.test.ts` for `src/utils/stats.ts`.
- **Component Tests**: Co-located or in `src/components/__tests__`.

## Best Practices

1.  **Behavior-Driven**: Test how the code behaves, not its internal implementation.
2.  **Mocking**: Use `vi.mock()` to mock external dependencies like Firebase.
    - Global mocks are available in `src/setupTests.ts`.
3.  **Components**: Use `@testing-library/react` to render components and `screen` to query elements.
    - Avoid `querySelector`; use `getByRole`, `getByText`, etc.
    - Use `@testing-library/user-event` for interactions (clicking, typing).
4.  **Services**: Test service functions by mocking the underlying data source (Firestore).

## Example: Testing a Component

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

it('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
});
```
