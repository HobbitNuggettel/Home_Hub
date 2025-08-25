#!/usr/bin/env node

/**
 * Simple API Test Script
 * Tests basic API functionality without authentication
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
const ENDPOINTS = [
  '/health',
  '/api-docs',
  '/api/auth',
  '/api/users',
  '/api/inventory',
  '/api/spending',
  '/api/analytics',
  '/api/budget',
  '/api/notifications',
  '/api/collaboration'
];

function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}`;
    
    const req = http.request(url, { method: 'GET' }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          endpoint,
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          data: data.length > 0 ? data.substring(0, 200) + '...' : 'No data'
        });
      });
    });
    
    req.on('error', (error) => {
      reject({
        endpoint,
        error: error.message
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject({
        endpoint,
        error: 'Request timeout'
      });
    });
    
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Home Hub API Test Suite');
  console.log('============================\n');
  
  console.log(`Testing API at: ${BASE_URL}\n`);
  
  const results = [];
  
  for (const endpoint of ENDPOINTS) {
    try {
      console.log(`Testing ${endpoint}...`);
      const result = await testEndpoint(endpoint);
      results.push(result);
      
      if (result.status === 200) {
        console.log(`✅ ${endpoint} - ${result.status} OK`);
      } else if (result.status === 401) {
        console.log(`🔒 ${endpoint} - ${result.status} Unauthorized (Expected for protected endpoints)`);
      } else if (result.status === 404) {
        console.log(`❌ ${endpoint} - ${result.status} Not Found`);
      } else {
        console.log(`⚠️  ${endpoint} - ${result.status} ${result.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error.error}`);
      results.push(error);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  
  const successful = results.filter(r => r.status === 200).length;
  const unauthorized = results.filter(r => r.status === 401).length;
  const errors = results.filter(r => r.error).length;
  const total = results.length;
  
  console.log(`Total endpoints tested: ${total}`);
  console.log(`✅ Successful (200): ${successful}`);
  console.log(`🔒 Unauthorized (401): ${unauthorized}`);
  console.log(`❌ Errors: ${errors}`);
  
  if (successful > 0) {
    console.log('\n🎉 API is running and responding!');
  } else {
    console.log('\n⚠️  API may not be running or there are connection issues.');
    console.log('Make sure to start the API server with: npm run dev');
  }
  
  console.log('\n📚 API Documentation available at:');
  console.log(`${BASE_URL}/api-docs`);
}

// Check if server is running before starting tests
function checkServer() {
  return new Promise((resolve) => {
    const req = http.request(`${BASE_URL}/health`, { method: 'GET' }, (res) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function main() {
  try {
    const serverRunning = await checkServer();
    
    if (!serverRunning) {
      console.log('❌ API server is not running!');
      console.log('Please start the API server first:');
      console.log('  cd api');
      console.log('  npm run dev');
      console.log('\nThen run this test script again.');
      process.exit(1);
    }
    
    await runTests();
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testEndpoint, runTests };
