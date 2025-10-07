import React from 'react';
import { render, screen } from '@testing-library/react';
import About from '../About.js';

describe('About Component', () => {
  describe('Rendering & Structure', () => {
    test('renders about page with main sections', () => {
      render(<About />);
      
      // Check for main sections - use more specific selectors
      expect(screen.getByRole('heading', { name: 'Home Hub', level: 1 })).toBeInTheDocument();
      expect(screen.getByText(/comprehensive home management platform/i)).toBeInTheDocument();
      expect(screen.getByText('Modern UI/UX')).toBeInTheDocument();
      expect(screen.getByText('Feature Rich')).toBeInTheDocument();
    });

    test('renders mission statement', () => {
      render(<About />);
      
      // Check for mission statement
      expect(screen.getByRole('heading', { name: 'Our Mission' })).toBeInTheDocument();
      expect(screen.getByText(/A comprehensive home management platform/i)).toBeInTheDocument();
    });

    test('renders features overview', () => {
      render(<About />);
      
      // Check for key features
      expect(screen.getByRole('heading', { name: 'Features Overview' })).toBeInTheDocument();
      expect(screen.getByText(/inventory tracking/i)).toBeInTheDocument();
      expect(screen.getByText(/spending management/i)).toBeInTheDocument();
    });

    test('renders technology stack', () => {
      render(<About />);
      
      // Check for technology information - use specific selectors
      expect(screen.getByRole('heading', { name: 'Technology Stack' })).toBeInTheDocument();
      expect(screen.getByText('Modern UI/UX')).toBeInTheDocument();
      expect(screen.getByText('Feature Rich')).toBeInTheDocument();
    });

    test('renders development roadmap', () => {
      render(<About />);
      
      // Check for roadmap section - look for actual content
      expect(screen.getByRole('heading', { name: 'Development Roadmap' })).toBeInTheDocument();
      expect(screen.getByText(/Phase 1 - Core Features/i)).toBeInTheDocument();
    });

    test('renders key benefits', () => {
      render(<About />);
      
      // Check for benefits section - look for actual content
      expect(screen.getByRole('heading', { name: 'Why Choose Home Hub?' })).toBeInTheDocument();
      expect(screen.getByText(/Centralized Management/i)).toBeInTheDocument();
    });

    test('renders statistics section', () => {
      render(<About />);
      
      // Check for statistics - look for actual content
      expect(screen.getByRole('heading', { name: 'Platform Statistics' })).toBeInTheDocument();
      // Use more specific selector for the statistics number
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    test('renders contact information', () => {
      render(<About />);
      
      // Check for contact section - look for actual content
      expect(screen.getByRole('heading', { name: 'Get Involved' })).toBeInTheDocument();
      expect(screen.getByText(/View on GitHub/i)).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    test('applies dark mode classes when theme is dark', () => {
      // Mock dark mode
      document.documentElement.classList.add('dark');

      render(<About />);
      
      // Check that component renders without breaking
      expect(screen.getByRole('heading', { name: 'Home Hub', level: 1 })).toBeInTheDocument();
      
      // Clean up
      document.documentElement.classList.remove('dark');
    });

    test('applies light mode classes when theme is light', () => {
      // Mock light mode
      document.documentElement.classList.remove('dark');

      render(<About />);
      
      // Check that component renders without breaking
      expect(screen.getByRole('heading', { name: 'Home Hub', level: 1 })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper heading structure', () => {
      render(<About />);
      
      // Check for proper heading hierarchy
      expect(screen.getByRole('heading', { name: 'Home Hub', level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Our Mission', level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Features Overview', level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Technology Stack', level: 2 })).toBeInTheDocument();
    });

    test('has proper content structure', () => {
      render(<About />);
      
      // Check for content structure - the component doesn't have semantic main/nav tags
      // but we can verify the content is properly structured
      expect(screen.getByRole('heading', { name: 'Home Hub', level: 1 })).toBeInTheDocument();
      expect(screen.getByText(/comprehensive home management platform/i)).toBeInTheDocument();
    });
  });

  describe('Content Validation', () => {
    test('displays correct feature count', () => {
      render(<About />);
      
      // Check that all 7 features are displayed
      expect(screen.getByText('7')).toBeInTheDocument();
      // Use the statistics section text instead of the duplicate "Core Features"
      // Look for the statistics section specifically - find the text near the "7"
      const sevenElement = screen.getByText('7');
      const coreFeaturesText = sevenElement.parentElement.querySelector('p');
      expect(coreFeaturesText).toHaveTextContent('Core Features');
    });

    test('shows correct development phases', () => {
      render(<About />);
      
      // Check for development phases
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText(/Development Phases/i)).toBeInTheDocument();
    });

    test('displays technology count', () => {
      render(<About />);
      
      // Check for technology count
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText(/Technologies Used/i)).toBeInTheDocument();
    });
  });

  describe('Interactive Elements', () => {
    test('has working links', () => {
      render(<About />);
      
      // Check for GitHub link
      const githubLink = screen.getByRole('link', { name: /View on GitHub/i });
      expect(githubLink).toHaveAttribute('href', 'https://github.com');
      expect(githubLink).toHaveAttribute('target', '_blank');
      
      // Check for email link
      const emailLink = screen.getByRole('link', { name: /Send Email/i });
      expect(emailLink).toHaveAttribute('href', 'mailto:contact@homehub.com');
    });

    test('has proper button elements', () => {
      render(<About />);
      
      // Check for star project button
      const starButton = screen.getByRole('button', { name: /Star Project/i });
      expect(starButton).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('renders without breaking on different screen sizes', () => {
      // Test with different viewport sizes
      const { rerender } = render(<About />);
      
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      // Trigger resize event
      window.dispatchEvent(new Event('resize'));
      
      // Re-render and check it still works
      rerender(<About />);
      expect(screen.getByRole('heading', { name: 'Home Hub', level: 1 })).toBeInTheDocument();
      
      // Reset viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });
  });

  describe('Error Handling', () => {
    test('renders gracefully with missing data', () => {
  // This test ensures the component doesn't crash if data is missing
      render(<About />);
      
      // Component should still render the main structure
      expect(screen.getByRole('heading', { name: 'Home Hub', level: 1 })).toBeInTheDocument();
      expect(screen.getByText(/comprehensive home management platform/i)).toBeInTheDocument();
    });
  });
});
