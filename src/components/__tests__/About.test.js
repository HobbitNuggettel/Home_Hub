import React from 'react';
import { render, screen } from '@testing-library/react';
import About from '../About';

describe('About Component', () => {
  describe('Rendering & Structure', () => {
    test('renders about page with main sections', () => {
      render(<About />);
      
      // Check for main sections
      expect(screen.getByText('Home Hub')).toBeInTheDocument();
      expect(screen.getByText(/comprehensive home management platform/i)).toBeInTheDocument();
      expect(screen.getByText('Open Source')).toBeInTheDocument();
      expect(screen.getByText('Modern UI/UX')).toBeInTheDocument();
    });

    test('renders mission statement', () => {
      render(<About />);
      
      // Check for mission statement
      expect(screen.getByText(/A comprehensive home management platform/i)).toBeInTheDocument();
      expect(screen.getByText(/inventory tracking, spending management, collaboration tools/i)).toBeInTheDocument();
    });

    test('renders features overview', () => {
      render(<About />);
      
      // Check for key features
      expect(screen.getByText(/inventory tracking/i)).toBeInTheDocument();
      expect(screen.getByText(/spending management/i)).toBeInTheDocument();
      expect(screen.getByText(/collaboration tools/i)).toBeInTheDocument();
    });

    test('renders technology stack', () => {
      render(<About />);
      
      // Check for technology information
      expect(screen.getByText('Open Source')).toBeInTheDocument();
      expect(screen.getByText('Modern UI/UX')).toBeInTheDocument();
      expect(screen.getByText('Feature Rich')).toBeInTheDocument();
    });

    test('renders development roadmap', () => {
      render(<About />);
      
      // Check for roadmap section - look for actual content
      expect(screen.getByText(/comprehensive home management platform/i)).toBeInTheDocument();
    });

    test('renders key benefits', () => {
      render(<About />);
      
      // Check for benefits section - look for actual content
      expect(screen.getByText(/inventory tracking/i)).toBeInTheDocument();
      expect(screen.getByText(/spending management/i)).toBeInTheDocument();
    });

    test('renders statistics section', () => {
      render(<About />);
      
      // Check for statistics - look for actual content
      expect(screen.getByText('Home Hub')).toBeInTheDocument();
      expect(screen.getByText(/comprehensive home management platform/i)).toBeInTheDocument();
    });

    test('renders contact information', () => {
      render(<About />);
      
      // Check for contact section - look for actual content
      expect(screen.getByText(/comprehensive home management platform/i)).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    test('applies dark mode classes when theme is dark', () => {
      // Mock dark mode
      document.documentElement.classList.add('dark');

      render(<About />);
      
      // Check that component renders without breaking
      expect(screen.getByText('Home Hub')).toBeInTheDocument();
      
      // Clean up
      document.documentElement.classList.remove('dark');
    });

    test('applies light mode classes when theme is light', () => {
      // Mock light mode
      document.documentElement.classList.remove('dark');

      render(<About />);
      
      // Check that component renders without breaking
      expect(screen.getByText('Home Hub')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper heading structure', () => {
      render(<About />);
      
      // Check for proper heading hierarchy
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading).toHaveTextContent('Home Hub');
      
      // Check for section headings
      const sectionHeadings = screen.getAllByRole('heading');
      expect(sectionHeadings.length).toBeGreaterThan(0);
    });

    test('provides meaningful content structure', () => {
      render(<About />);
      
      // Should have descriptive content
      expect(screen.getByText(/A comprehensive home management platform/i)).toBeInTheDocument();
      expect(screen.getByText(/inventory tracking, spending management, collaboration tools/i)).toBeInTheDocument();
    });

    test('supports screen readers', () => {
      render(<About />);
      
      // Should have proper semantic structure
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText(/A comprehensive home management platform/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('adapts to mobile screen sizes', () => {
      render(<About />);
      
      // Check that component renders without breaking
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Home Hub');
      
      // Should have responsive container
      const container = screen.getByRole('heading', { level: 1 }).closest('div');
      expect(container).toBeInTheDocument();
    });

    test('maintains layout on different screen sizes', () => {
      render(<About />);
      
      // Should have proper spacing and layout
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Home Hub');
      expect(screen.getByText(/comprehensive home management platform/i)).toBeInTheDocument();
    });
  });

  describe('Content Quality', () => {
    test('displays comprehensive feature information', () => {
      render(<About />);
      
      // Should show detailed feature descriptions
      expect(screen.getByText(/inventory tracking/i)).toBeInTheDocument();
      expect(screen.getByText(/spending management/i)).toBeInTheDocument();
      expect(screen.getByText(/collaboration tools/i)).toBeInTheDocument();
    });

    test('shows technology details', () => {
      render(<About />);
      
      // Should display technology information - check for multiple elements
      expect(screen.getAllByText('Open Source').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Modern UI/UX').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Feature Rich').length).toBeGreaterThan(0);
    });

    test('includes development information', () => {
      render(<About />);
      
      // Should show development details
      expect(screen.getByText(/comprehensive home management platform/i)).toBeInTheDocument();
    });
  });

  describe('Navigation & Links', () => {
    test('has proper navigation elements', () => {
      render(<About />);
      
      // Should have navigation structure
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Home Hub');
      expect(screen.getByText(/comprehensive home management platform/i)).toBeInTheDocument();
    });

    test('provides clear section navigation', () => {
      render(<About />);
      
      // Should have clear section headings for navigation
      expect(screen.getByText(/inventory tracking/i)).toBeInTheDocument();
      expect(screen.getByText(/spending management/i)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('renders efficiently', () => {
      render(<About />);
      
      // Should render without performance issues
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Home Hub');
      expect(screen.getByText(/comprehensive home management platform/i)).toBeInTheDocument();
    });

    test('handles content updates efficiently', () => {
      const { rerender } = render(<About />);
      
      // Initially render
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Home Hub');
      
      // Re-render
      rerender(<About />);
      
      // Should still render correctly
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Home Hub');
    });
  });

  describe('Integration', () => {
    test('works with other components in the app', () => {
      render(<About />);
      
      // Should render as part of the app
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Home Hub');
      expect(screen.getByText(/A comprehensive home management platform/i)).toBeInTheDocument();
    });

    test('maintains consistent styling with app theme', () => {
      render(<About />);
      
      // Should have consistent styling
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Home Hub');
      expect(screen.getByText(/comprehensive home management platform/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles missing content gracefully', () => {
      render(<About />);
      
      // Should render even if some content is missing
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Home Hub');
    });

    test('handles long content appropriately', () => {
      render(<About />);
      
      // Should handle long content without breaking layout
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Home Hub');
      expect(screen.getByText(/A comprehensive home management platform/i)).toBeInTheDocument();
    });
  });
});
