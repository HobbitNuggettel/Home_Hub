import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { useRealTime } from '../contexts/RealTimeContext.js';
import { User, UserPlus, UserX, Shield, Users, Key, Check, X } from 'lucide-react';

/**
 * User Access Management Component
 * Allows users to grant access to other users and manage permissions
 */
const UserAccessManagement = () => {
  const { currentUser } = useAuth();
  const { setData, subscribeToUpdates } = useRealTime();
  
  const [grantedUsers, setGrantedUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState('read');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Subscribe to user access data
  useEffect(() => {
    if (currentUser?.uid) {
      const unsubscribe = subscribeToUpdates(
        `userAccess/${currentUser.uid}/canAccess`,
        'userAccess',
        (data) => {
          if (data) {
            const users = Object.entries(data).map(([uid, accessData]) => ({
              uid,
              access: true,
              accessLevel: accessData.accessLevel || 'read',
              email: accessData.email || 'No email',
              grantedAt: accessData.grantedAt || Date.now(),
              lastUpdated: accessData.lastUpdated || Date.now(),
              timestamp: Date.now()
            }));
            setGrantedUsers(users);
          }
        }
      );

      return () => unsubscribe && unsubscribe();
    }
  }, [currentUser?.uid, subscribeToUpdates]);

  // Get access level display text
  const getAccessLevelDisplay = (level) => {
    switch (level) {
      case 'read': return 'Read Only';
      case 'write': return 'Read & Write';
      case 'admin': return 'Full Access';
      default: return 'Unknown';
    }
  };

  // Get access level color
  const getAccessLevelColor = (level) => {
    switch (level) {
      case 'read': return 'text-blue-600 bg-blue-100';
      case 'write': return 'text-green-600 bg-green-100';
      case 'admin': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Grant access to a new user
  const grantAccess = async (e) => {
    e.preventDefault();
    if (!newUserEmail.trim() || !currentUser?.uid) return;

    setIsLoading(true);
    setMessage('');

    try {
      // Generate a unique user ID for the new user
      const newUserId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create user access record
      await setData(`userAccess/${currentUser.uid}/canAccess/${newUserId}`, {
        email: newUserEmail,
        accessLevel: accessLevel,
        grantedAt: Date.now(),
        grantedBy: currentUser.uid
      });

      // Create user profile
      await setData(`users/${newUserId}`, {
        id: newUserId,
        email: newUserEmail,
        accessLevel: accessLevel,
        grantedBy: currentUser.uid,
        grantedAt: Date.now(),
        lastSeen: Date.now(),
        isActive: true
      });

      setNewUserEmail('');
      setAccessLevel('read');
      setMessage(`✅ Access granted to ${newUserEmail}`);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to grant access:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Revoke access from a user
  const revokeAccess = async (uid) => {
    try {
      await setData(`userAccess/${currentUser.uid}/canAccess/${uid}`, null);
      await setData(`users/${uid}`, null);
      setMessage(`✅ Access revoked from user ${uid}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to revoke access:', error);
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  // Update access level
  const updateAccessLevel = async (uid, newLevel) => {
    try {
      await setData(`userAccess/${currentUser.uid}/canAccess/${uid}`, {
        accessLevel: newLevel,
        updatedAt: Date.now(),
        updatedBy: currentUser.uid
      });
      setMessage(`✅ Access level updated for user ${uid}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update access level:', error);
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">User Access Management</h2>
            <p className="text-gray-600">Grant and manage access for other users</p>
          </div>
        </div>
        
        {message && (
          <div className={`p-3 rounded-lg mb-4 ${
            message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Grant Access Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <UserPlus className="w-5 h-5 text-green-600 mr-2" />
          Grant Access to New User
        </h3>
        
        <form onSubmit={grantAccess} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Email
              </label>
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Level
              </label>
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              >
                <option value="read">Read Only</option>
                <option value="write">Read & Write</option>
                <option value="admin">Full Access</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Grant Access
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Current Access List */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 text-blue-600 mr-2" />
          Users with Access ({grantedUsers.length})
        </h3>
        
        {grantedUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No users have been granted access yet.</p>
            <p className="text-sm">Use the form above to grant access to other users.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {grantedUsers.map((user) => (
              <div key={user.uid} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.email}</p>
                    <p className="text-sm text-gray-500 mb-1">
                      ID: <span className="font-mono text-xs">{user.uid}</span>
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccessLevelColor(user.accessLevel)}`}>
                        {getAccessLevelDisplay(user.accessLevel)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Granted: {new Date(user.grantedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={user.accessLevel || 'read'}
                    onChange={(e) => updateAccessLevel(user.uid, e.target.value)}
                    className="p-2 border border-gray-300 rounded text-sm bg-white text-gray-900"
                  >
                    <option value="read">Read Only</option>
                    <option value="write">Read & Write</option>
                    <option value="admin">Full Access</option>
                  </select>
                  
                  <button
                    onClick={() => revokeAccess(user.uid)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Revoke Access"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Access Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
          <Key className="w-5 h-5 mr-2" />
          How Access Control Works
        </h3>
        
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex items-start space-x-2">
            <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p><strong>Read Only:</strong> Users can view your data but cannot modify it</p>
          </div>
          <div className="flex items-start space-x-2">
            <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p><strong>Read & Write:</strong> Users can view and modify your data</p>
          </div>
          <div className="flex items-start space-x-2">
            <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p><strong>Full Access:</strong> Users have complete control over your data</p>
          </div>
          <div className="flex items-start space-x-2">
            <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p><strong>Secure:</strong> All access is logged and can be revoked at any time</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccessManagement;
