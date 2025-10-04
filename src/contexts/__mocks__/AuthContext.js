import React from 'react';
import PropTypes from 'prop-types';

// Mock AuthContext
export const AuthContext = React.createContext({
  currentUser: null,
  user: null,
  userProfile: null,
  loading: false,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  resetPassword: jest.fn(),
  updateProfile: jest.fn(),
  updateUserProfile: jest.fn(),
  updateEmail: jest.fn(),
  updatePassword: jest.fn(),
  deleteUser: jest.fn(),
  isAuthenticated: false,
  isAdmin: false,
  isModerator: false,
  userRole: 'user',
  permissions: [],
  checkPermission: jest.fn(),
  refreshUser: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  error: null
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
    userProfile: null,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
    updateProfile: jest.fn(),
    updateUserProfile: jest.fn(),
    updateEmail: jest.fn(),
    updatePassword: jest.fn(),
    deleteUser: jest.fn(),
    isAuthenticated: false,
    isAdmin: false,
    isModerator: false,
    userRole: 'user',
    permissions: [],
    checkPermission: jest.fn(),
    refreshUser: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    error: null
  };

  return React.createElement(AuthContext.Provider, { value: mockValue }, children);
};
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};
