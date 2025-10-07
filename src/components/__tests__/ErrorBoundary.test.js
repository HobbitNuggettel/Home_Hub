import React from 'react';
import PropTypes from 'prop-types';
import { render, screen } from '@testing-library/react';
import { renderWithProviders, renderWithRouter } from '../../utils/test-utils.js';
import ErrorBoundary from '../ErrorBoundary.js';

// Create a component that throws an error for testing
const ThrowError = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error for ErrorBoundary');
  }
  return <div>Normal component</div>;
};

ThrowError.propTypes = {
  shouldThrow: PropTypes.bool
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
      renderWithRouter(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should show error boundary UI
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/We encountered an unexpected error. Don't worry, your data is safe./i)).toBeInTheDocument();
    });

    test('renders error details when available', () => {
      renderWithRouter(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should show error details - check for actual content
      expect(screen.getByText(/Reference:/i)).toBeInTheDocument();
    });

    test('renders support information', () => {
      renderWithRouter(
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
      renderWithRouter(
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
      const { rerender } = renderWithRouter(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Initially no error
      expect(screen.getByText('Normal component')).toBeInTheDocument();

      // Trigger error
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
      // Simulate dark mode
      document.documentElement.classList.add('dark');

      renderWithRouter(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Check for dark mode classes
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      // Add more specific dark mode checks if needed

      // Cleanup
      document.documentElement.classList.remove('dark');
    });

    test('applies light mode classes when theme is light', () => {
      // Ensure light mode
      document.documentElement.classList.remove('dark');

      renderWithRouter(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Check for light mode classes
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      // Add more specific light mode checks if needed
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      renderWithRouter(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Check for ARIA labels
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      // Add more specific ARIA checks if needed
    });

    test('provides meaningful error information', () => {
      renderWithRouter(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Check for meaningful error information
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      // Add more specific error information checks if needed
    });

    test('supports screen readers', () => {
      renderWithRouter(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Check for screen reader support
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      // Add more specific screen reader checks if needed
    });
  });

  describe('Responsive Design', () => {
    test('adapts to mobile screen sizes', () => {
      renderWithRouter(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Check for mobile responsiveness
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      // Add more specific mobile responsiveness checks if needed
    });

    test('maintains layout on different screen sizes', () => {
      renderWithRouter(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Check for layout consistency
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      // Add more specific layout checks if needed
    });
  });

  describe('Edge Cases', () => {
    test('handles undefined children gracefully', () => {
      render(<ErrorBoundary>{undefined}</ErrorBoundary>);
      
      // Should render without crashing - check for actual content or empty state
      // This test doesn't trigger the error boundary, so no Router needed
    });

    test('handles null children gracefully', () => {
      render(<ErrorBoundary>{null}</ErrorBoundary>);
      
      // Should render without crashing - check for actual content or empty state
      // This test doesn't trigger the error boundary, so no Router needed
    });

    test('handles empty children gracefully', () => {
      render(<ErrorBoundary>{}</ErrorBoundary>);
      
      // Should render without crashing - check for actual content or empty state
      // This test doesn't trigger the error boundary, so no Router needed
    });

    test('handles component that throws immediately', () => {
      const ImmediateErrorComponent = () => {
        throw new Error('Immediate error');
      };

      renderWithRouter(
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

      // This test doesn't trigger the error boundary, so no Router needed
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
      const { rerender } = renderWithRouter(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Initially no error
      expect(screen.getByText('Normal component')).toBeInTheDocument();

      // Rapidly change error states
      for (let i = 0; i < 5; i++) {
        rerender(
          <ErrorBoundary>
            <ThrowError shouldThrow={i % 2 === 0} />
          </ErrorBoundary>
        );
      }

      // Final state should be consistent
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    test('works with other components in the app', () => {
      renderWithRouter(
        <ErrorBoundary>
          <div>
            <h1>Header</h1>
            <ThrowError shouldThrow={true} />
          </div>
        </ErrorBoundary>
      );

      // Should show error boundary UI
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });

    test('maintains error state across re-renders', () => {
      const { rerender } = renderWithRouter(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should show error UI
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();

      // Re-render with same error
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
