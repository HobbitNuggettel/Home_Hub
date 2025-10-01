/**
 * E2E Test Support
 * Common utilities and commands for E2E tests
 */

// Import commands
import './commands';

// Import code coverage
import '@cypress/code-coverage/support';

// Global test configuration
beforeEach(() => {
  // Clear localStorage before each test
  cy.clearLocalStorage();
  
  // Clear cookies before each test
  cy.clearCookies();
  
  // Mock service worker
  cy.intercept('GET', '/sw.js', { fixture: 'service-worker.js' });
});

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Don't fail tests on uncaught exceptions
  return false;
});

// Custom commands
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/home');
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

Cypress.Commands.add('mockApi', (method, url, response) => {
  cy.intercept(method, url, response);
});

Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe();
  cy.checkA11y();
});



