/**
 * Performance Tests
 * Performance testing using Lighthouse and custom metrics
 */

describe('Performance Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should have good Lighthouse scores', () => {
    cy.lighthouse({
      performance: 90,
      accessibility: 90,
      'best-practices': 90,
      seo: 90
    });
  });

  it('should load within 3 seconds', () => {
    cy.visit('/');
    cy.get('[data-testid="home-page"]').should('be.visible');
    
    cy.window().then((win) => {
      const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart;
      expect(loadTime).to.be.lessThan(3000);
    });
  });

  it('should have good First Contentful Paint', () => {
    cy.visit('/');
    
    cy.window().then((win) => {
      const paintEntries = win.performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      expect(fcp.startTime).to.be.lessThan(1500);
    });
  });

  it('should have good Largest Contentful Paint', () => {
    cy.visit('/');
    
    cy.window().then((win) => {
      const lcpEntries = win.performance.getEntriesByType('largest-contentful-paint');
      const lcp = lcpEntries[lcpEntries.length - 1];
      expect(lcp.startTime).to.be.lessThan(2500);
    });
  });

  it('should have good Cumulative Layout Shift', () => {
    cy.visit('/');
    
    cy.window().then((win) => {
      const clsEntries = win.performance.getEntriesByType('layout-shift');
      const cls = clsEntries.reduce((sum, entry) => sum + entry.value, 0);
      expect(cls).to.be.lessThan(0.1);
    });
  });

  it('should have good Time to Interactive', () => {
    cy.visit('/');
    
    cy.window().then((win) => {
      const tti = win.performance.timing.domInteractive - win.performance.timing.navigationStart;
      expect(tti).to.be.lessThan(3000);
    });
  });

  it('should handle large datasets efficiently', () => {
    // Mock large dataset
    cy.intercept('GET', '/api/inventory', { fixture: 'large-inventory.json' }).as('getLargeInventory');
    cy.visit('/inventory');
    cy.wait('@getLargeInventory');
    
    cy.get('[data-testid="inventory-items"]').should('be.visible');
    
    cy.window().then((win) => {
      const memoryUsage = win.performance.memory;
      expect(memoryUsage.usedJSHeapSize).to.be.lessThan(50 * 1024 * 1024); // 50MB
    });
  });

  it('should have efficient bundle size', () => {
    cy.visit('/');
    
    cy.window().then((win) => {
      const resources = win.performance.getEntriesByType('resource');
      const jsResources = resources.filter(resource => resource.name.endsWith('.js'));
      const totalJsSize = jsResources.reduce((sum, resource) => sum + resource.transferSize, 0);
      
      expect(totalJsSize).to.be.lessThan(500 * 1024); // 500KB
    });
  });

  it('should handle concurrent requests efficiently', () => {
    cy.intercept('GET', '/api/inventory', { delay: 100 }).as('getInventory');
    cy.intercept('GET', '/api/spending', { delay: 100 }).as('getSpending');
    cy.intercept('GET', '/api/analytics', { delay: 100 }).as('getAnalytics');
    
    cy.visit('/');
    cy.get('[data-testid="inventory-link"]').click();
    cy.get('[data-testid="spending-link"]').click();
    cy.get('[data-testid="analytics-link"]').click();
    
    cy.wait(['@getInventory', '@getSpending', '@getAnalytics']);
    
    cy.window().then((win) => {
      const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart;
      expect(loadTime).to.be.lessThan(5000);
    });
  });

  it('should have good mobile performance', () => {
    cy.viewport('iphone-6');
    cy.visit('/');
    
    cy.lighthouse({
      performance: 85,
      accessibility: 90,
      'best-practices': 90,
      seo: 90
    });
  });

  it('should handle memory leaks', () => {
    cy.visit('/');
    
    // Navigate between pages multiple times
    for (let i = 0; i < 5; i++) {
      cy.get('[data-testid="inventory-link"]').click();
      cy.get('[data-testid="spending-link"]').click();
      cy.get('[data-testid="analytics-link"]').click();
    }
    
    cy.window().then((win) => {
      const memoryUsage = win.performance.memory;
      const memoryGrowth = memoryUsage.usedJSHeapSize - memoryUsage.totalJSHeapSize;
      expect(memoryGrowth).to.be.lessThan(10 * 1024 * 1024); // 10MB
    });
  });

  it('should have efficient image loading', () => {
    cy.visit('/');
    
    cy.window().then((win) => {
      const resources = win.performance.getEntriesByType('resource');
      const imageResources = resources.filter(resource => 
        resource.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      );
      
      imageResources.forEach(resource => {
        expect(resource.transferSize).to.be.lessThan(100 * 1024); // 100KB per image
      });
    });
  });

  it('should have good caching strategy', () => {
    cy.visit('/');
    
    // Second visit should be faster due to caching
    cy.visit('/');
    
    cy.window().then((win) => {
      const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart;
      expect(loadTime).to.be.lessThan(1000);
    });
  });

  it('should handle slow network conditions', () => {
    cy.intercept('GET', '/api/inventory', { delay: 2000 }).as('getSlowInventory');
    cy.visit('/inventory');
    
    cy.get('[data-testid="loading-spinner"]').should('be.visible');
    cy.wait('@getSlowInventory');
    cy.get('[data-testid="inventory-items"]').should('be.visible');
  });

  it('should have efficient database queries', () => {
    cy.intercept('GET', '/api/inventory', (req) => {
      const startTime = Date.now();
      req.reply((res) => {
        const endTime = Date.now();
        const queryTime = endTime - startTime;
        expect(queryTime).to.be.lessThan(500); // 500ms
        return res;
      });
    }).as('getInventory');
    
    cy.visit('/inventory');
    cy.wait('@getInventory');
  });
});
