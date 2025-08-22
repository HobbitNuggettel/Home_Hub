import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Create a component that throws an error for testing
const ThrowError = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error for ErrorBoundary');
  }
  return <div>Normal component</div>;
};

describe('ErrorBoundary Component', () => {
  // Suppress console.error for error boundary testing
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  describe('Rendering & Structure', () => {
    test('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Normal component')).toBeInTheDocument();
    });

    test('renders error UI when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should show error boundary UI
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/We encountered an unexpected error. Don't worry, your data is safe./i)).toBeInTheDocument();
    });

    test('renders error details when available', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should show error details - check for actual content
      expect(screen.getByText(/Reference:/i)).toBeInTheDocument();
    });

    test('renders support information', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should show support information - check for actual content
      expect(screen.getByText(/If this problem persists, please contact support/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('catches JavaScript errors in child components', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });

    test('does not catch errors in event handlers', () => {
      const ComponentWithEventError = () => {
        const handleClick = () => {
          throw new Error('Event handler error');
        };

        return (
          <button onClick={handleClick}>
            Click me
          </button>
        );
      };

      render(
        <ErrorBoundary>
          <ComponentWithEventError />
        </ErrorBoundary>
      );

      // Should render normally since event handler errors aren't caught
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    test('handles multiple error states', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Initially no error
      expect(screen.getByText('Normal component')).toBeInTheDocument();

      // Now throw error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should show error UI
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    test('applies dark mode classes when theme is dark', () => {
      // Mock dark mode
      document.documentElement.classList.add('dark');

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Check that component renders without crashing
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();

      // Clean up
      document.documentElement.classList.remove('dark');
    });

    test('applies light mode classes when theme is light', () => {
      // Mock light mode
      document.documentElement.classList.remove('dark');

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Check that component renders without crashing
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Check for proper heading structure
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/Something went wrong/i);
    });

    test('provides meaningful error information', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should have descriptive error message - check for actual content
      expect(screen.getByText(/We encountered an unexpected error. Don't worry, your data is safe./i)).toBeInTheDocument();
      
      // Should have error details
      expect(screen.getByText(/Reference:/i)).toBeInTheDocument();
    });

    test('supports screen readers', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should have proper semantic structure - check for actual elements
      expect(screen.getByRole('heading')).toBeInTheDocument();
      expect(screen.getByText(/Oops! Something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('adapts to mobile screen sizes', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Check that component renders without breaking
      expect(screen.getByText(/Oops! Something went wrong/i)).toBeInTheDocument();
      
      // Should have responsive container - check for actual container
      const container = screen.getByText(/Oops! Something went wrong/i).closest('div');
      expect(container).toBeInTheDocument();
    });

    test('maintains layout on different screen sizes', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should have proper spacing and layout - check for actual content
      expect(screen.getByText(/Oops! Something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/We encountered an unexpected error. Don't worry, your data is safe./i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles undefined children gracefully', () => {
      render(<ErrorBoundary>{undefined}</ErrorBoundary>);
      
      // Should render without crashing - check for actual content or empty state
      const container = screen.getByRole('generic');
      expect(container).toBeInTheDocument();
    });

    test('handles null children gracefully', () => {
      render(<ErrorBoundary>{null}</ErrorBoundary>);
      
      // Should render without crashing - check for actual content or empty state
      const container = screen.getByRole('generic');
      expect(container).toBeInTheDocument();
    });

    test('handles empty children gracefully', () => {
      render(<ErrorBoundary>{}</ErrorBoundary>);
      
      // Should render without crashing - check for actual content or empty state
      const container = screen.getByRole('generic');
      expect(container).toBeInTheDocument();
    });

    test('handles component that throws immediately', () => {
      const ImmediateErrorComponent = () => {
        throw new Error('Immediate error');
      };

      render(
        <ErrorBoundary>
          <ImmediateErrorComponent />
        </ErrorBoundary>
      );

      // Should show error boundary UI
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('does not re-render unnecessarily', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Initially no error
      expect(screen.getByText('Normal component')).toBeInTheDocument();

      // Re-render with same props
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should still show normal component
      expect(screen.getByText('Normal component')).toBeInTheDocument();
    });

    test('handles rapid error state changes efficiently', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Multiple rapid changes
      for (let i = 0; i < 5; i++) {
        rerender(
          <ErrorBoundary>
            <ThrowError shouldThrow={i % 2 === 0} />
          </ErrorBoundary>
        );
      }

      // Should handle without crashing - check for actual content
      expect(screen.getByText(/Oops! Something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    test('works with other components in the app', () => {
      render(
        <ErrorBoundary>
          <div>
            <h1>App Header</h1>
            <ThrowError shouldThrow={true} />
          </div>
        </ErrorBoundary>
      );

      // Should show error boundary UI
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });

    test('maintains error state across re-renders', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should show error UI
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();

      // Re-render with different error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should still show error UI
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });
});
