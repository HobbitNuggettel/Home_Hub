import React from 'react';
import { render, screen } from '@testing-library/react';
import DarkModeToggle from '../DarkModeToggle';

// Simple mock for useTheme hook
jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    themeMode: 'system',
    isDarkMode: false,
    toggleDarkMode: jest.fn(),
    updateThemeMode: jest.fn(),
  }),
}));

describe('DarkModeToggle Component - Simple Test', () => {
  test('renders without crashing', () => {
    render(<DarkModeToggle />);
    
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
  });

  test('has proper button role', () => {
    render(<DarkModeToggle />);
    
    const toggleButton = screen.getByRole('button');
    // HTML buttons have role="button" by default, so we just verify it's a button
    expect(toggleButton.tagName).toBe('BUTTON');
  });

  test('contains an icon', () => {
    render(<DarkModeToggle />);
    
    const toggleButton = screen.getByRole('button');
    const icon = toggleButton.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
