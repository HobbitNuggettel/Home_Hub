import React from 'react';

// Mock AuthContext
export const AuthContext = React.createContext({
  currentUser: null,
  user: null,
  loading: false,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  resetPassword: jest.fn(),
  updateProfile: jest.fn(),
  updateEmail: jest.fn(),
  updatePassword: jest.fn(),
  deleteUser: jest.fn(),
  isAuthenticated: false,
  isAdmin: false,
  isModerator: false,
  userRole: 'user',
  permissions: [],
  checkPermission: jest.fn(),
  refreshUser: jest.fn()
});

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const mockValue = {
    currentUser: null,
    user: null,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
    updateProfile: jest.fn(),
    updateEmail: jest.fn(),
    updatePassword: jest.fn(),
    deleteUser: jest.fn(),
    isAuthenticated: false,
    isAdmin: false,
    isModerator: false,
    userRole: 'user',
    permissions: [],
    checkPermission: jest.fn(),
    refreshUser: jest.fn()
  };

  return React.createElement(AuthContext.Provider, { value: mockValue }, children);
};