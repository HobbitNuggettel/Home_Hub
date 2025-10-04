/**
 * E2E Tests for Home Page
 * End-to-end testing using Cypress
 */

describe('Home Page E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the home page successfully', () => {
    cy.get('h1').should('contain', 'Home Hub');
    cy.get('[data-testid="home-page"]').should('be.visible');
  });

  it('should display navigation menu', () => {
    cy.get('[data-testid="navigation"]').should('be.visible');
    cy.get('[data-testid="navigation"]').should('contain', 'Home');
    cy.get('[data-testid="navigation"]').should('contain', 'Inventory');
    cy.get('[data-testid="navigation"]').should('contain', 'Spending');
  });

  it('should toggle dark mode', () => {
    cy.get('[data-testid="dark-mode-toggle"]').click();
    cy.get('html').should('have.class', 'dark');
    
    cy.get('[data-testid="dark-mode-toggle"]').click();
    cy.get('html').should('not.have.class', 'dark');
  });

  it('should navigate to inventory page', () => {
    cy.get('[data-testid="inventory-link"]').click();
    cy.url().should('include', '/inventory');
    cy.get('[data-testid="inventory-page"]').should('be.visible');
  });

  it('should navigate to spending page', () => {
    cy.get('[data-testid="spending-link"]').click();
    cy.url().should('include', '/spending');
    cy.get('[data-testid="spending-page"]').should('be.visible');
  });

  it('should display user menu when logged in', () => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({
        uid: 'test-user',
        email: 'test@example.com'
      }));
    });
    
    cy.reload();
    cy.get('[data-testid="user-menu"]').should('be.visible');
  });

  it('should handle mobile navigation', () => {
    cy.viewport('iphone-6');
    cy.get('[data-testid="mobile-menu-button"]').click();
    cy.get('[data-testid="mobile-menu"]').should('be.visible');
    
    cy.get('[data-testid="mobile-menu-button"]').click();
    cy.get('[data-testid="mobile-menu"]').should('not.be.visible');
  });

  it('should display loading state', () => {
    cy.intercept('GET', '/api/data', { delay: 1000 }).as('getData');
    cy.visit('/');
    cy.get('[data-testid="loading-spinner"]').should('be.visible');
    cy.wait('@getData');
    cy.get('[data-testid="loading-spinner"]').should('not.exist');
  });

  it('should handle error states', () => {
    cy.intercept('GET', '/api/data', { statusCode: 500 }).as('getDataError');
    cy.visit('/');
    cy.wait('@getDataError');
    cy.get('[data-testid="error-message"]').should('be.visible');
  });

  it('should be accessible', () => {
    cy.get('[data-testid="navigation"]').should('have.attr', 'role', 'navigation');
    cy.get('[data-testid="main-content"]').should('have.attr', 'role', 'main');
    cy.get('button').should('have.attr', 'aria-label');
  });

  it('should work with keyboard navigation', () => {
    cy.get('body').tab();
    cy.focused().should('have.attr', 'data-testid', 'navigation');
    
    cy.focused().tab();
    cy.focused().should('have.attr', 'data-testid', 'main-content');
  });
});




