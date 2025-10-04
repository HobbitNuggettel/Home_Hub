/**
 * Cypress Configuration
 * E2E testing configuration
 */

const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    supportFile: 'src/tests/support/e2e.js',
    specPattern: 'src/tests/e2e/**/*.e2e.test.js',
    fixturesFolder: 'src/tests/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    downloadsFolder: 'cypress/downloads',
    env: {
      coverage: true,
      codeCoverage: {
        url: 'http://localhost:3000/__coverage__',
        exclude: 'cypress/**/*.*'
      }
    },
    setupNodeEvents(on, config) {
      // Code coverage
      require('@cypress/code-coverage/task')(on, config);
      
      // Lighthouse
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome' && browser.isHeadless) {
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-dev-shm-usage');
        }
        return launchOptions;
      });
      
      // Performance testing
      on('task', {
        lighthouse: (lighthouseOptions) => {
          return require('lighthouse')(lighthouseOptions.url, lighthouseOptions.options);
        }
      });
      
      return config;
    }
  },
  
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack'
    },
    specPattern: 'src/tests/component/**/*.component.test.js',
    supportFile: 'src/tests/support/component.js'
  },
  
  env: {
    // Test environment variables
    TEST_USER_EMAIL: 'test@example.com',
    TEST_USER_PASSWORD: 'testpassword123',
    TEST_ADMIN_EMAIL: 'admin@example.com',
    TEST_ADMIN_PASSWORD: 'adminpassword123',
    
    // API endpoints
    API_BASE_URL: 'http://localhost:3001/api',
    
    // Feature flags
    ENABLE_ANALYTICS: false,
    ENABLE_OFFLINE_MODE: true,
    ENABLE_PWA: true
  },
  
  retries: {
    runMode: 2,
    openMode: 0
  },
  
  experimentalStudio: true,
  experimentalRunAllSpecs: true
});




