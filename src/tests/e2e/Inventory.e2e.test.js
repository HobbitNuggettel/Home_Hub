/**
 * E2E Tests for Inventory Management
 * End-to-end testing using Cypress
 */

describe('Inventory Management E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/inventory');
  });

  it('should load inventory page successfully', () => {
    cy.get('[data-testid="inventory-page"]').should('be.visible');
    cy.get('h1').should('contain', 'Inventory Management');
  });

  it('should display inventory items', () => {
    cy.get('[data-testid="inventory-items"]').should('be.visible');
    cy.get('[data-testid="inventory-item"]').should('have.length.greaterThan', 0);
  });

  it('should add new inventory item', () => {
    cy.get('[data-testid="add-item-button"]').click();
    cy.get('[data-testid="add-item-modal"]').should('be.visible');
    
    cy.get('[data-testid="item-name-input"]').type('Test Item');
    cy.get('[data-testid="item-quantity-input"]').type('10');
    cy.get('[data-testid="item-price-input"]').type('25.99');
    cy.get('[data-testid="item-category-select"]').select('Electronics');
    
    cy.get('[data-testid="save-item-button"]').click();
    
    cy.get('[data-testid="add-item-modal"]').should('not.exist');
    cy.get('[data-testid="inventory-items"]').should('contain', 'Test Item');
  });

  it('should edit existing inventory item', () => {
    cy.get('[data-testid="inventory-item"]').first().find('[data-testid="edit-item-button"]').click();
    cy.get('[data-testid="edit-item-modal"]').should('be.visible');
    
    cy.get('[data-testid="item-name-input"]').clear().type('Updated Item Name');
    cy.get('[data-testid="save-item-button"]').click();
    
    cy.get('[data-testid="edit-item-modal"]').should('not.exist');
    cy.get('[data-testid="inventory-items"]').should('contain', 'Updated Item Name');
  });

  it('should delete inventory item', () => {
    cy.get('[data-testid="inventory-item"]').first().find('[data-testid="delete-item-button"]').click();
    cy.get('[data-testid="delete-confirmation-modal"]').should('be.visible');
    
    cy.get('[data-testid="confirm-delete-button"]').click();
    
    cy.get('[data-testid="delete-confirmation-modal"]').should('not.exist');
    cy.get('[data-testid="inventory-items"]').should('not.contain', 'Test Item');
  });

  it('should filter inventory items by category', () => {
    cy.get('[data-testid="category-filter"]').select('Electronics');
    cy.get('[data-testid="inventory-items"]').should('contain', 'Electronics');
  });

  it('should search inventory items', () => {
    cy.get('[data-testid="search-input"]').type('Test');
    cy.get('[data-testid="inventory-items"]').should('contain', 'Test');
  });

  it('should sort inventory items', () => {
    cy.get('[data-testid="sort-select"]').select('name-asc');
    cy.get('[data-testid="inventory-items"]').should('be.visible');
  });

  it('should handle low stock alerts', () => {
    cy.get('[data-testid="low-stock-alert"]').should('be.visible');
    cy.get('[data-testid="low-stock-alert"]').should('contain', 'Low Stock');
  });

  it('should export inventory data', () => {
    cy.get('[data-testid="export-button"]').click();
    cy.get('[data-testid="export-modal"]').should('be.visible');
    
    cy.get('[data-testid="export-csv-button"]').click();
    cy.get('[data-testid="export-modal"]').should('not.exist');
  });

  it('should handle bulk operations', () => {
    cy.get('[data-testid="select-all-checkbox"]').check();
    cy.get('[data-testid="bulk-actions"]').should('be.visible');
    
    cy.get('[data-testid="bulk-delete-button"]').click();
    cy.get('[data-testid="bulk-delete-confirmation"]').should('be.visible');
  });

  it('should be responsive on mobile', () => {
    cy.viewport('iphone-6');
    cy.get('[data-testid="inventory-page"]').should('be.visible');
    cy.get('[data-testid="mobile-inventory-view"]').should('be.visible');
  });

  it('should handle offline mode', () => {
    cy.window().then((win) => {
      win.navigator.onLine = false;
    });
    
    cy.get('[data-testid="offline-indicator"]').should('be.visible');
    cy.get('[data-testid="inventory-items"]').should('be.visible');
  });

  it('should validate form inputs', () => {
    cy.get('[data-testid="add-item-button"]').click();
    cy.get('[data-testid="save-item-button"]').click();
    
    cy.get('[data-testid="item-name-error"]').should('be.visible');
    cy.get('[data-testid="item-quantity-error"]').should('be.visible');
    cy.get('[data-testid="item-price-error"]').should('be.visible');
  });

  it('should handle API errors gracefully', () => {
    cy.intercept('GET', '/api/inventory', { statusCode: 500 }).as('getInventoryError');
    cy.visit('/inventory');
    cy.wait('@getInventoryError');
    
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('[data-testid="retry-button"]').should('be.visible');
  });

  it('should maintain state during navigation', () => {
    cy.get('[data-testid="search-input"]').type('Test');
    cy.get('[data-testid="spending-link"]').click();
    cy.get('[data-testid="inventory-link"]').click();
    
    cy.get('[data-testid="search-input"]').should('have.value', 'Test');
  });
});
