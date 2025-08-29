import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Logout Test Component
 * Simple component to test logout functionality
 */
const LogoutTest = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleTestLogout = async () => {
    try {
      console.log('🧪 Testing logout...');
      console.log('Current user before logout:', currentUser);
      
      const result = await logout();
      console.log('Logout result:', result);
      
      console.log('Current user after logout:', currentUser);
      console.log('✅ Logout test completed');
      
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('❌ Logout test failed:', error);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        🧪 Logout Test Component
      </h2>
      
      <div className="space-y-4">
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Current User:</strong> {currentUser ? currentUser.email : 'None'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>User ID:</strong> {currentUser ? currentUser.uid : 'None'}
          </p>
        </div>
        
        <button
          onClick={handleTestLogout}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          🧪 Test Logout
        </button>
        
        <div className="text-xs text-gray-500 text-center">
          Check console for detailed logout test results
        </div>
      </div>
    </div>
  );
};

export default LogoutTest;
