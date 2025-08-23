// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock window.matchMedia for theme testing - must be set up before any imports
const mockMatchMedia = jest.fn().mockImplementation(query => ({
  matches: query.includes('dark') ? false : true, // Default to light mode
  media: query,
  onchange: null,
  addListener: jest.fn(), // deprecated
  removeListener: jest.fn(), // deprecated
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

// Ensure matchMedia is available globally and properly mocked
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = class IntersectionObserver {
  constructor() { }
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver for components that use it
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock TextEncoder and TextDecoder for components that use them
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Suppress console.error for known test warnings
const originalError = console.error;
console.error = (...args) => {
  // Suppress specific known warnings that don't affect test functionality
  if (
    args[0]?.includes?.('Warning: ReactDOM.render is no longer supported') ||
    args[0]?.includes?.('Warning: componentWillReceiveProps has been renamed') ||
    args[0]?.includes?.('Warning: componentWillMount has been renamed') ||
    args[0]?.includes?.('Warning: componentWillUpdate has been renamed') ||
    args[0]?.includes?.('Warning: findDOMNode is deprecated') ||
    args[0]?.includes?.('Warning: Using UNSAFE_componentWillMount') ||
    args[0]?.includes?.('Warning: Using UNSAFE_componentWillReceiveProps') ||
    args[0]?.includes?.('Warning: Using UNSAFE_componentWillUpdate')
  ) {
    return;
  }
  originalError.call(console, ...args);
};
