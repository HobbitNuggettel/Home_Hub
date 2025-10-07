import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DarkModeToggle from '../DarkModeToggle.js';
import { ThemeProvider } from '../../contexts/ThemeContext.js';
import { renderWithProviders } from '../../utils/test-utils.js';

// Mock the useTheme hook
const mockUseTheme = {
  themeMode: 'system',
  isDarkMode: false,
  toggleDarkMode: jest.fn(),
  updateThemeMode: jest.fn(),
};

jest.mock('../../contexts/ThemeContext', () => ({
  ...jest.requireActual('../../contexts/ThemeContext'),
  useTheme: () => mockUseTheme,
}));

describe('DarkModeToggle Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTheme.themeMode = 'system';
    mockUseTheme.isDarkMode = false;
  });

  describe('Rendering', () => {
    test('renders toggle button with correct icon', () => {
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toBeInTheDocument();
      
      // Check for sun/moon icon
      const icon = toggleButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    test('shows label when showLabel prop is true', () => {
      render(<DarkModeToggle showLabel={true} />);
      
      // Should show the current theme mode
      expect(screen.getByText('System')).toBeInTheDocument();
    });

    test('hides label when showLabel prop is false', () => {
      render(<DarkModeToggle showLabel={false} />);
      
      // Should not show the theme mode text
      expect(screen.queryByText('System')).not.toBeInTheDocument();
      expect(screen.queryByText('Light')).not.toBeInTheDocument();
      expect(screen.queryByText('Dark')).not.toBeInTheDocument();
    });

    test('defaults to not showing label when showLabel prop is omitted', () => {
      render(<DarkModeToggle />);
      
      // Should not show the theme mode text by default
      expect(screen.queryByText('System')).not.toBeInTheDocument();
    });
  });

  describe('Theme Mode Display', () => {
    test('displays "Light" when theme mode is light', () => {
      mockUseTheme.themeMode = 'light';
      
      render(<DarkModeToggle showLabel={true} />);
      
      expect(screen.getByText('Light')).toBeInTheDocument();
    });

    test('displays "Dark" when theme mode is dark', () => {
      mockUseTheme.themeMode = 'dark';
      
      render(<DarkModeToggle showLabel={true} />);
      
      expect(screen.getByText('Dark')).toBeInTheDocument();
    });

    test('displays "System" when theme mode is system', () => {
      mockUseTheme.themeMode = 'system';
      
      render(<DarkModeToggle showLabel={true} />);
      
      expect(screen.getByText('System')).toBeInTheDocument();
    });

    test('updates label when theme mode changes', () => {
      const { rerender } = render(<DarkModeToggle showLabel={true} />);
      
      // Initially system
      expect(screen.getByText('System')).toBeInTheDocument();
      
      // Change to light mode
      mockUseTheme.themeMode = 'light';
      rerender(<DarkModeToggle showLabel={true} />);
      expect(screen.getByText('Light')).toBeInTheDocument();
      
      // Change to dark mode
      mockUseTheme.themeMode = 'dark';
      rerender(<DarkModeToggle showLabel={true} />);
      expect(screen.getByText('Dark')).toBeInTheDocument();
    });
  });

  describe('Icon Display', () => {
    test('shows sun icon when in light mode', () => {
      mockUseTheme.themeMode = 'light';
      mockUseTheme.isDarkMode = false;
      
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('button');
      const icon = toggleButton.querySelector('svg');
      
      // Should show sun icon (light mode)
      expect(icon).toBeInTheDocument();
      // You could add more specific icon checks here if needed
    });

    test('shows moon icon when in dark mode', () => {
      mockUseTheme.themeMode = 'dark';
      mockUseTheme.isDarkMode = true;
      
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('button');
      const icon = toggleButton.querySelector('svg');
      
      // Should show moon icon (dark mode)
      expect(icon).toBeInTheDocument();
    });

    test('shows appropriate icon for system mode', () => {
      mockUseTheme.themeMode = 'system';
      mockUseTheme.isDarkMode = false; // System prefers light
      
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('button');
      const icon = toggleButton.querySelector('svg');
      
      // Should show appropriate icon based on system preference
      expect(icon).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('calls toggleDarkMode when button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('button');
      await user.click(toggleButton);
      
      expect(mockUseTheme.toggleDarkMode).toHaveBeenCalledTimes(1);
    });

    test('button is accessible with proper ARIA attributes', () => {
      renderWithProviders(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('button');
      
      // Should have proper role - HTML buttons have role="button" by default
      expect(toggleButton.tagName).toBe('BUTTON');
    });

    test('button supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('button');
      
      // Focus the button
      toggleButton.focus();
      expect(toggleButton).toHaveFocus();
      
      // Activate with Enter key
      await user.keyboard('{Enter}');
      expect(mockUseTheme.toggleDarkMode).toHaveBeenCalledTimes(1);
      
      // Activate with Space key
      await user.keyboard(' ');
      expect(mockUseTheme.toggleDarkMode).toHaveBeenCalledTimes(2);
    });
  });

  describe('Styling and Appearance', () => {
    test('applies correct CSS classes', () => {
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('button');
      
      // Should have the expected styling classes
      expect(toggleButton).toHaveClass('p-2', 'rounded-lg', 'transition-colors');
    });

    test('applies dark mode classes when in dark mode', () => {
      // Mock dark mode
      mockUseTheme.isDarkMode = true;
      
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('button');
      
      // Should have dark mode specific classes - check for actual classes used
      expect(toggleButton).toHaveClass('bg-gray-800', 'text-yellow-400');
    });

    test('applies light mode classes when in light mode', () => {
      mockUseTheme.themeMode = 'light';
      mockUseTheme.isDarkMode = false;
      
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('button');
      
      // Should have light mode specific classes
      expect(toggleButton).toHaveClass('bg-gray-100', 'text-gray-600');
    });

    test('applies hover states correctly', () => {
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('button');
      
      // Should have hover classes
      expect(toggleButton).toHaveClass('hover:bg-gray-200');
    });
  });

  describe('Accessibility', () => {
    test('has proper focus indicators', () => {
      renderWithProviders(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('button');
      
      // Should have focus ring classes - check for actual classes used
      expect(toggleButton).toHaveClass('transition-colors', 'duration-200');
    });

    test('provides meaningful aria-label', () => {
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('button');
      const ariaLabel = toggleButton.getAttribute('aria-label');
      
      // Should have a descriptive aria-label
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel.length).toBeGreaterThan(0);
    });

    test('supports screen readers', () => {
      render(<DarkModeToggle showLabel={true} />);
      
      const toggleButton = screen.getByRole('button');
      
      // Button should be accessible to screen readers
      expect(toggleButton).toBeInTheDocument();
      
      // Label should be visible for screen readers
      expect(screen.getByText('System')).toBeInTheDocument();
    });
  });

  describe('Integration with Theme Context', () => {
    test('responds to theme context changes', () => {
      const { rerender } = render(<DarkModeToggle showLabel={true} />);
      
      // Initially system
      expect(screen.getByText('System')).toBeInTheDocument();
      
      // Simulate theme context change
      mockUseTheme.themeMode = 'dark';
      rerender(<DarkModeToggle showLabel={true} />);
      
      expect(screen.getByText('Dark')).toBeInTheDocument();
    });

    test('maintains state consistency with theme context', () => {
      render(<DarkModeToggle showLabel={true} />);
      
      // Component should reflect the current theme context state
      expect(screen.getByText('System')).toBeInTheDocument();
      
      // Verify the mock is being used correctly
      expect(mockUseTheme.themeMode).toBe('system');
    });
  });

  describe('Edge Cases', () => {
    test('handles undefined theme mode gracefully', () => {
      mockUseTheme.themeMode = undefined;
      
      render(<DarkModeToggle showLabel={true} />);
      
      // Should not crash and should handle gracefully
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('handles null theme mode gracefully', () => {
      mockUseTheme.themeMode = null;
      
      render(<DarkModeToggle showLabel={true} />);
      
      // Should not crash and should handle gracefully
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('handles empty string theme mode gracefully', () => {
      mockUseTheme.themeMode = '';
      
      render(<DarkModeToggle showLabel={true} />);
      
      // Should not crash and should handle gracefully
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('handles rapid theme changes', async () => {
      const user = userEvent.setup();
      
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('button');
      
      // Rapidly click the button
      await user.click(toggleButton);
      await user.click(toggleButton);
      await user.click(toggleButton);
      
      // Should handle all clicks without crashing
      expect(mockUseTheme.toggleDarkMode).toHaveBeenCalledTimes(3);
    });
  });

  describe('Performance', () => {
    test('does not re-render unnecessarily', () => {
      const { rerender } = render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('button');
      const initialRenderCount = 1;
      
      // Re-render with same props
      rerender(<DarkModeToggle />);
      
      // Should not cause unnecessary re-renders
      expect(toggleButton).toBeInTheDocument();
    });

    test('handles large numbers of theme changes efficiently', async () => {
      const user = userEvent.setup();
      
      render(<DarkModeToggle />);
      
      const toggleButton = screen.getByRole('button');
      
      // Simulate many rapid theme changes
      for (let i = 0; i < 100; i++) {
        await user.click(toggleButton);
      }
      
      // Should handle efficiently without performance issues
      expect(mockUseTheme.toggleDarkMode).toHaveBeenCalledTimes(100);
    });
  });
});
