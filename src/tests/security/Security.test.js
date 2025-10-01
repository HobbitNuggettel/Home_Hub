/**
 * Security Tests
 * Security testing for vulnerabilities and best practices
 */

describe('Security Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should have secure headers', () => {
    cy.request('/').then((response) => {
      expect(response.headers).to.have.property('x-content-type-options', 'nosniff');
      expect(response.headers).to.have.property('x-frame-options', 'DENY');
      expect(response.headers).to.have.property('x-xss-protection', '1; mode=block');
      expect(response.headers).to.have.property('strict-transport-security');
    });
  });

  it('should prevent XSS attacks', () => {
    const maliciousScript = '<script>alert("XSS")</script>';
    
    cy.get('[data-testid="search-input"]').type(maliciousScript);
    cy.get('[data-testid="search-results"]').should('not.contain', '<script>');
    cy.get('[data-testid="search-results"]').should('contain', '&lt;script&gt;');
  });

  it('should prevent SQL injection', () => {
    const maliciousQuery = "'; DROP TABLE users; --";
    
    cy.get('[data-testid="search-input"]').type(maliciousQuery);
    cy.get('[data-testid="search-results"]').should('not.contain', 'DROP TABLE');
  });

  it('should validate input sanitization', () => {
    const maliciousInput = '<img src="x" onerror="alert(1)">';
    
    cy.get('[data-testid="item-name-input"]').type(maliciousInput);
    cy.get('[data-testid="item-name-input"]').should('not.have.value', maliciousInput);
  });

  it('should prevent CSRF attacks', () => {
    cy.request({
      method: 'POST',
      url: '/api/inventory',
      body: { name: 'Test Item' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(403);
    });
  });

  it('should enforce authentication', () => {
    cy.visit('/inventory');
    cy.url().should('include', '/login');
  });

  it('should validate user permissions', () => {
    // Mock unauthorized user
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({
        uid: 'unauthorized-user',
        role: 'viewer'
      }));
    });
    
    cy.visit('/inventory');
    cy.get('[data-testid="add-item-button"]').should('not.exist');
  });

  it('should handle session timeout', () => {
    // Mock expired session
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({
        uid: 'test-user',
        expiresAt: Date.now() - 1000
      }));
    });
    
    cy.visit('/inventory');
    cy.url().should('include', '/login');
  });

  it('should prevent directory traversal', () => {
    cy.request({
      url: '/api/files/../../../etc/passwd',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(403);
    });
  });

  it('should validate file uploads', () => {
    const maliciousFile = new File(['malicious content'], 'malicious.exe', {
      type: 'application/x-executable'
    });
    
    cy.get('[data-testid="file-upload"]').then((input) => {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(maliciousFile);
      input[0].files = dataTransfer.files;
      input[0].dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    cy.get('[data-testid="file-upload-error"]').should('be.visible');
  });

  it('should prevent clickjacking', () => {
    cy.request('/').then((response) => {
      expect(response.headers).to.have.property('x-frame-options', 'DENY');
    });
  });

  it('should handle rate limiting', () => {
    // Make multiple rapid requests
    for (let i = 0; i < 10; i++) {
      cy.request({
        method: 'POST',
        url: '/api/inventory',
        body: { name: `Item ${i}` },
        failOnStatusCode: false
      });
    }
    
    cy.request({
      method: 'POST',
      url: '/api/inventory',
      body: { name: 'Rate Limited Item' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(429);
    });
  });

  it('should validate JWT tokens', () => {
    const invalidToken = 'invalid.jwt.token';
    
    cy.window().then((win) => {
      win.localStorage.setItem('token', invalidToken);
    });
    
    cy.visit('/inventory');
    cy.url().should('include', '/login');
  });

  it('should prevent information disclosure', () => {
    cy.request('/api/debug').then((response) => {
      expect(response.status).to.equal(404);
    });
    
    cy.request('/.env').then((response) => {
      expect(response.status).to.equal(404);
    });
  });

  it('should handle secure cookies', () => {
    cy.request('/').then((response) => {
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        cookies.forEach(cookie => {
          expect(cookie).to.include('HttpOnly');
          expect(cookie).to.include('Secure');
          expect(cookie).to.include('SameSite');
        });
      }
    });
  });

  it('should prevent brute force attacks', () => {
    // Attempt multiple failed logins
    for (let i = 0; i < 5; i++) {
      cy.get('[data-testid="email-input"]').type('test@example.com');
      cy.get('[data-testid="password-input"]').type('wrongpassword');
      cy.get('[data-testid="login-button"]').click();
    }
    
    cy.get('[data-testid="account-locked-message"]').should('be.visible');
  });

  it('should validate API endpoints', () => {
    cy.request({
      method: 'GET',
      url: '/api/inventory',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(401);
    });
  });

  it('should prevent prototype pollution', () => {
    const maliciousPayload = {
      '__proto__': {
        'isAdmin': true
      }
    };
    
    cy.request({
      method: 'POST',
      url: '/api/inventory',
      body: maliciousPayload,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(400);
    });
  });

  it('should handle secure redirects', () => {
    cy.visit('/login?redirect=https://malicious-site.com');
    cy.url().should('not.include', 'malicious-site.com');
  });

  it('should validate content security policy', () => {
    cy.request('/').then((response) => {
      expect(response.headers).to.have.property('content-security-policy');
      const csp = response.headers['content-security-policy'];
      expect(csp).to.include('default-src \'self\'');
      expect(csp).to.include('script-src \'self\'');
      expect(csp).to.include('style-src \'self\'');
    });
  });

  it('should prevent timing attacks', () => {
    const startTime = Date.now();
    
    cy.get('[data-testid="email-input"]').type('nonexistent@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();
    
    cy.get('[data-testid="login-error"]').should('be.visible');
    
    cy.window().then(() => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      expect(responseTime).to.be.greaterThan(1000); // Should take at least 1 second
    });
  });
});
