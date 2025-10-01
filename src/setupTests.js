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

// Mock ReadableStream for Firebase tests
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = class ReadableStream {
    constructor() {}
    cancel() { return Promise.resolve(); }
    getReader() {
      return {
        read() { return Promise.resolve({ done: true, value: undefined }); },
        releaseLock() {},
        cancel() { return Promise.resolve(); }
      };
    }
  };
}

// Mock fetch for tests that need it
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      blob: () => Promise.resolve(new Blob()),
    })
  );
}

// Mock Firebase Auth for tests
jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: jest.fn(),
  FacebookAuthProvider: jest.fn(),
  TwitterAuthProvider: jest.fn(),
  GithubAuthProvider: jest.fn(),
  PhoneAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
  signOut: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn(),
  getAuth: jest.fn(() => ({
    currentUser: null,
    signOut: jest.fn(() => Promise.resolve()),
  })),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
  updateProfile: jest.fn(() => Promise.resolve()),
}));

// Mock Firebase App
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({ name: '[DEFAULT]' })),
  getApps: jest.fn(() => [{ name: '[DEFAULT]' }]),
  getApp: jest.fn(() => ({ name: '[DEFAULT]' })),
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

// Mock Firebase Storage
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

// Mock Firebase Database
jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(() => ({})),
  ref: jest.fn(),
  set: jest.fn(),
  get: jest.fn(),
  onValue: jest.fn(),
  off: jest.fn(),
}));

// Mock React contexts globally
jest.mock('./contexts/AuthContext', () => {
  const React = require('react');
  const AuthContext = React.createContext();

  const mockAuthValue = {
    currentUser: { uid: 'test-uid', email: 'test@example.com', displayName: 'Test User' },
    userProfile: { name: 'Test User', email: 'test@example.com' },
    updateUserProfile: jest.fn(() => Promise.resolve()),
    login: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
    logout: jest.fn(() => Promise.resolve()),
    loading: false,
    error: null,
  };

  return {
    AuthContext,
    useAuth: jest.fn(() => mockAuthValue),
    AuthProvider: ({ children }) => React.createElement(AuthContext.Provider, { value: mockAuthValue }, children),
  };
});
jest.mock('./contexts/DevToolsContext');
jest.mock('./contexts/RealTimeContext');

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
