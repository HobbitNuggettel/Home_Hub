import React, { createContext, useContext } from 'react';

const mockAuthContext = {
  currentUser: { uid: 'test-uid', email: 'test@example.com', displayName: 'Test User' },
  userProfile: { 
    name: 'Test User', 
    email: 'test@example.com',
    uid: 'test-uid',
    photoURL: null,
  },
  login: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid', email: 'test@example.com' } })),
  register: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid', email: 'test@example.com' } })),
  logout: jest.fn(() => Promise.resolve()),
  resetPassword: jest.fn(() => Promise.resolve()),
  signInWithGoogle: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid', email: 'test@example.com' } })),
  updateUserProfile: jest.fn(() => Promise.resolve()),
  loading: false,
  error: null,
};

const AuthContext = createContext(mockAuthContext);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  return (
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  );
};

export default mockAuthContext;