/**
 * Test Runner
 * Comprehensive test execution script
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.results = {
      unit: { passed: 0, failed: 0, total: 0 },
      integration: { passed: 0, failed: 0, total: 0 },
      e2e: { passed: 0, failed: 0, total: 0 },
      performance: { passed: 0, failed: 0, total: 0 },
      security: { passed: 0, failed: 0, total: 0 }
    };
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive test suite...\n');
    
    try {
      await this.runUnitTests();
      await this.runIntegrationTests();
      await this.runE2ETests();
      await this.runPerformanceTests();
      await this.runSecurityTests();
      
      this.generateReport();
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  async runUnitTests() {
    console.log('📝 Running unit tests...');
    try {
      const output = execSync('npm test -- --coverage --watchAll=false', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Parse Jest output for results
      const lines = output.split('\n');
      const testResults = lines.find(line => line.includes('Tests:')) || 'Tests: 0 passed';
      const match = testResults.match(/(\d+) passed/);
      this.results.unit.passed = match ? parseInt(match[1]) : 0;
      
      console.log('✅ Unit tests completed');
    } catch (error) {
      console.log('❌ Unit tests failed');
      this.results.unit.failed = 1;
    }
  }

  async runIntegrationTests() {
    console.log('🔗 Running integration tests...');
    try {
      const output = execSync('npm run test:integration', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log('✅ Integration tests completed');
    } catch (error) {
      console.log('❌ Integration tests failed');
      this.results.integration.failed = 1;
    }
  }

  async runE2ETests() {
    console.log('🌐 Running E2E tests...');
    try {
      const output = execSync('npx cypress run --headless', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log('✅ E2E tests completed');
    } catch (error) {
      console.log('❌ E2E tests failed');
      this.results.e2e.failed = 1;
    }
  }

  async runPerformanceTests() {
    console.log('⚡ Running performance tests...');
    try {
      const output = execSync('npx cypress run --spec "src/tests/performance/**/*.test.js"', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log('✅ Performance tests completed');
    } catch (error) {
      console.log('❌ Performance tests failed');
      this.results.performance.failed = 1;
    }
  }

  async runSecurityTests() {
    console.log('🔒 Running security tests...');
    try {
      const output = execSync('npx cypress run --spec "src/tests/security/**/*.test.js"', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log('✅ Security tests completed');
    } catch (error) {
      console.log('❌ Security tests failed');
      this.results.security.failed = 1;
    }
  }

  generateReport() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    let totalPassed = 0;
    let totalFailed = 0;
    let totalTests = 0;
    
    Object.entries(this.results).forEach(([type, result]) => {
      const total = result.passed + result.failed;
      totalTests += total;
      totalPassed += result.passed;
      totalFailed += result.failed;
      
      const status = result.failed === 0 ? '✅' : '❌';
      console.log(`${status} ${type.toUpperCase()}: ${result.passed}/${total} passed`);
    });
    
    console.log('========================');
    console.log(`📈 Overall: ${totalPassed}/${totalTests} tests passed`);
    console.log(`📉 Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
    
    if (totalFailed > 0) {
      console.log('\n❌ Some tests failed. Please check the output above.');
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed!');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests();
}

module.exports = TestRunner;




