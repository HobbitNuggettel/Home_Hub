import React, { createContext, useContext } from 'react';

const mockAuthContext = {
  currentUser: null,
  login: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid', email: 'test@example.com' } })),
  register: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid', email: 'test@example.com' } })),
  logout: jest.fn(() => Promise.resolve()),
  resetPassword: jest.fn(() => Promise.resolve()),
  signInWithGoogle: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid', email: 'test@example.com' } })),
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