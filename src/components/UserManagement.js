import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Users, 
  UserPlus, 
  Home, 
  Settings, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Edit3,
  Trash2,
  Crown,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [households, setHouseholds] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCreateHousehold, setShowCreateHousehold] = useState(false);
  const [showInviteUser, setShowInviteUser] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      householdName: '',
      description: '',
      inviteEmail: '',
      userRole: 'member'
    }
  });

  // Load data from localStorage
  useEffect(() => {
    const savedHouseholds = localStorage.getItem('homeHubHouseholds');
    const savedCurrentUser = localStorage.getItem('homeHubCurrentUser');
    const savedInvitations = localStorage.getItem('homeHubInvitations');
    
    console.log('Loading collaboration data from localStorage:', { 
      savedHouseholds, 
      savedCurrentUser, 
      savedInvitations 
    });
    
    if (savedHouseholds) {
      const parsedHouseholds = JSON.parse(savedHouseholds);
      console.log('Loaded saved households:', parsedHouseholds);
      setHouseholds(parsedHouseholds);
    } else {
      // Load mock household data
      const mockHouseholds = [
        {
          id: '1',
          name: 'Smith Family',
          description: 'Main household for the Smith family',
          createdAt: new Date().toISOString(),
          members: [
            {
              id: 'user1',
              email: 'john.smith@email.com',
              name: 'John Smith',
              role: 'owner',
              joinedAt: new Date().toISOString(),
              avatar: null
            },
            {
              id: 'user2',
              email: 'jane.smith@email.com',
              name: 'Jane Smith',
              role: 'admin',
              joinedAt: new Date().toISOString(),
              avatar: null
            },
            {
              id: 'user3',
              email: 'teen.smith@email.com',
              name: 'Teen Smith',
              role: 'member',
              joinedAt: new Date().toISOString(),
              avatar: null
            }
          ],
          settings: {
            allowItemSharing: true,
            allowExpenseSharing: true,
            requireApproval: false,
            notifications: true
          }
        }
      ];
      console.log('Setting mock households:', mockHouseholds);
      setHouseholds(mockHouseholds);
      localStorage.setItem('homeHubHouseholds', JSON.stringify(mockHouseholds));
    }

    if (savedCurrentUser) {
      const parsedUser = JSON.parse(savedCurrentUser);
      console.log('Loaded saved current user:', parsedUser);
      setCurrentUser(parsedUser);
    } else {
      // Set default current user
      const defaultUser = {
        id: 'user1',
        email: 'john.smith@email.com',
        name: 'John Smith',
        role: 'owner',
        avatar: null,
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en'
        }
      };
      console.log('Setting default current user:', defaultUser);
      setCurrentUser(defaultUser);
      localStorage.setItem('homeHubCurrentUser', JSON.stringify(defaultUser));
    }

    if (savedInvitations) {
      const parsedInvitations = JSON.parse(savedInvitations);
      console.log('Loaded saved invitations:', parsedInvitations);
      setInvitations(parsedInvitations);
    } else {
      // Load mock invitations
      const mockInvitations = [
        {
          id: 'inv1',
          householdId: '1',
          householdName: 'Smith Family',
          email: 'cousin.smith@email.com',
          invitedBy: 'John Smith',
          status: 'pending',
          invitedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      console.log('Setting mock invitations:', mockInvitations);
      setInvitations(mockInvitations);
      localStorage.setItem('homeHubInvitations', JSON.stringify(mockInvitations));
    }
    
    setIsLoading(false);
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('homeHubHouseholds', JSON.stringify(households));
    console.log('Households state updated:', households);
  }, [households]);

  useEffect(() => {
    localStorage.setItem('homeHubCurrentUser', JSON.stringify(currentUser));
    console.log('Current user state updated:', currentUser);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('homeHubInvitations', JSON.stringify(invitations));
    console.log('Invitations state updated:', invitations);
  }, [invitations]);

  const handleCreateHousehold = async (data) => {
    try {
      const newHousehold = {
        id: Date.now().toString(),
        name: data.householdName,
        description: data.description,
        createdAt: new Date().toISOString(),
        members: [
          {
            ...currentUser,
            role: 'owner',
            joinedAt: new Date().toISOString()
          }
        ],
        settings: {
          allowItemSharing: true,
          allowExpenseSharing: true,
          requireApproval: false,
          notifications: true
        }
      };
      
      setHouseholds(prev => [...prev, newHousehold]);
      setShowCreateHousehold(false);
      reset();
      toast.success('Household created successfully!');
    } catch (error) {
      toast.error('Failed to create household');
      console.error('Error creating household:', error);
    }
  };

  const handleInviteUser = async (data) => {
    try {
      const newInvitation = {
        id: Date.now().toString(),
        householdId: selectedHousehold.id,
        householdName: selectedHousehold.name,
        email: data.inviteEmail,
        invitedBy: currentUser.name,
        status: 'pending',
        invitedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        role: data.userRole
      };
      
      setInvitations(prev => [...prev, newInvitation]);
      setShowInviteUser(false);
      reset();
      toast.success('Invitation sent successfully!');
    } catch (error) {
      toast.error('Failed to send invitation');
      console.error('Error sending invitation:', error);
    }
  };

  const handleAcceptInvitation = (invitationId) => {
    const invitation = invitations.find(inv => inv.id === invitationId);
    if (!invitation) return;

    // Add user to household
    const household = households.find(h => h.id === invitation.householdId);
    if (household) {
      const newMember = {
        id: `user${Date.now()}`,
        email: invitation.email,
        name: invitation.email.split('@')[0], // Use email prefix as name
        role: invitation.role || 'member',
        joinedAt: new Date().toISOString(),
        avatar: null
      };

      setHouseholds(prev => prev.map(h => 
        h.id === invitation.householdId 
          ? { ...h, members: [...h.members, newMember] }
          : h
      ));
    }

    // Remove invitation
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    toast.success('Invitation accepted! Welcome to the household.');
  };

  const handleDeclineInvitation = (invitationId) => {
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    toast.success('Invitation declined.');
  };

  const handleRemoveMember = (householdId, memberId) => {
    if (memberId === currentUser.id) {
      toast.error('You cannot remove yourself from the household');
      return;
    }

    setHouseholds(prev => prev.map(h => 
      h.id === householdId 
        ? { ...h, members: h.members.filter(m => m.id !== memberId) }
        : h
    ));
    toast.success('Member removed successfully');
  };

  const handleUpdateMemberRole = (householdId, memberId, newRole) => {
    setHouseholds(prev => prev.map(h => 
      h.id === householdId 
        ? { 
            ...h, 
            members: h.members.map(m => 
              m.id === memberId ? { ...m, role: newRole } : m
            )
          }
        : h
    ));
    toast.success('Member role updated successfully');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return <Crown className="text-yellow-600" size={16} />;
      case 'admin':
        return <Shield className="text-blue-600" size={16} />;
      default:
        return <Users className="text-gray-600" size={16} />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const CreateHouseholdForm = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Create New Household</h2>
        
        <form onSubmit={handleSubmit(handleCreateHousehold)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Household Name *
            </label>
            <input
              type="text"
              {...register('householdName', { required: 'Household name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Smith Family, Room 101"
            />
            {errors.householdName && (
              <p className="mt-1 text-sm text-red-600">{errors.householdName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of your household..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateHousehold(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Create Household
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const InviteUserForm = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Invite User to {selectedHousehold?.name}</h2>
        
        <form onSubmit={handleSubmit(handleInviteUser)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              {...register('inviteEmail', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
            />
            {errors.inviteEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.inviteEmail.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              {...register('userRole')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowInviteUser(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const UserProfileModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">User Profile</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={currentUser?.name || ''}
              onChange={(e) => setCurrentUser(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={currentUser?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Theme
            </label>
            <select
              value={currentUser?.preferences?.theme || 'light'}
              onChange={(e) => setCurrentUser(prev => ({
                ...prev,
                preferences: { ...prev.preferences, theme: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="notifications"
              checked={currentUser?.preferences?.notifications || false}
              onChange={(e) => setCurrentUser(prev => ({
                ...prev,
                preferences: { ...prev.preferences, notifications: e.target.checked }
              }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="notifications" className="text-sm font-medium text-gray-700">
              Enable notifications
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowUserProfile(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  console.log('Rendering UserManagement with:', { households, currentUser, invitations });
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">Home Hub</h1>
              <nav className="flex space-x-1">
                <a href="/inventory" className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  Inventory
                </a>
                <a href="/spending" className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  Spending
                </a>
                <a href="/collaboration" className="px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-700">
                  Collaboration
                </a>
                <a href="/data-alerts" className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  Data & Alerts
                </a>
                <a href="/shopping-lists" className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  Shopping Lists
                </a>
                <a href="/recipes" className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  Recipes
                </a>
                <a href="/integrations" className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  Integrations
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  localStorage.removeItem('homeHubHouseholds');
                  localStorage.removeItem('homeHubCurrentUser');
                  localStorage.removeItem('homeHubInvitations');
                  window.location.reload();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
              >
                Reset Data
              </button>
              <button
                onClick={() => setShowUserProfile(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                <Settings size={16} />
                <span>Profile</span>
              </button>
              <button
                onClick={() => setShowCreateHousehold(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                <Home size={16} />
                <span>Create Household</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Debug Info */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Debug Info:</strong> Loading: {isLoading ? 'Yes' : 'No'} | 
            Current User: {currentUser?.name || 'None'} | 
            Households: {households.length} | Invitations: {invitations.length}
          </p>
        </div>
        
        {/* Current User Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{currentUser?.name}</h2>
                <p className="text-gray-600">{currentUser?.email}</p>
                <p className="text-sm text-gray-500">Role: {currentUser?.role}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Member of</p>
              <p className="text-2xl font-bold text-blue-600">{households.length}</p>
              <p className="text-sm text-gray-600">households</p>
            </div>
          </div>
        </div>

        {/* Households */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Your Households ({households.length})
          </h3>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading households...</h3>
            </div>
          ) : households.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Home size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No households yet</h3>
              <p className="text-gray-500">Create your first household to get started</p>
            </div>
          ) : (
            households.map(household => (
            <div key={household.id} className="bg-white rounded-lg shadow-md border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{household.name}</h4>
                    <p className="text-gray-600">{household.description}</p>
                    <p className="text-sm text-gray-500">
                      Created {new Date(household.createdAt).toLocaleDateString()} • {household.members.length} members
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setSelectedHousehold(household);
                        setShowInviteUser(true);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      <UserPlus size={16} />
                      <span>Invite</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Members */}
              <div className="p-6">
                <h5 className="font-medium text-gray-900 mb-4">Members</h5>
                <div className="space-y-3">
                  {household.members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="text-gray-600" size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                          <div className="flex items-center space-x-1">
                            {getRoleIcon(member.role)}
                            <span>{member.role}</span>
                          </div>
                        </span>
                        
                        {currentUser?.role === 'owner' && member.id !== currentUser.id && (
                          <div className="flex items-center space-x-2">
                            <select
                              value={member.role}
                              onChange={(e) => handleUpdateMemberRole(household.id, member.id, e.target.value)}
                              className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => handleRemoveMember(household.id, member.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="p-6 bg-gray-50 rounded-b-lg">
                <h5 className="font-medium text-gray-900 mb-4">Household Settings</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`sharing-${household.id}`}
                      checked={household.settings.allowItemSharing}
                      onChange={(e) => {
                        setHouseholds(prev => prev.map(h => 
                          h.id === household.id 
                            ? { ...h, settings: { ...h.settings, allowItemSharing: e.target.checked } }
                            : h
                        ));
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`sharing-${household.id}`} className="text-sm text-gray-700">
                      Allow item sharing
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`expenses-${household.id}`}
                      checked={household.settings.allowExpenseSharing}
                      onChange={(e) => {
                        setHouseholds(prev => prev.map(h => 
                          h.id === household.id 
                            ? { ...h, settings: { ...h.settings, allowExpenseSharing: e.target.checked } }
                            : h
                        ));
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`expenses-${household.id}`} className="text-sm text-gray-700">
                      Allow expense sharing
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        </div>

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Invitations</h3>
            <div className="space-y-3">
              {invitations.map(invitation => (
                <div key={invitation.id} className="bg-white rounded-lg shadow-md p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Invitation to join <strong>{invitation.householdName}</strong>
                      </p>
                      <p className="text-sm text-gray-600">
                        Invited by {invitation.invitedBy} • {invitation.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAcceptInvitation(invitation.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                      >
                        <CheckCircle size={14} />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleDeclineInvitation(invitation.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                      >
                        <XCircle size={14} />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateHousehold && <CreateHouseholdForm />}
      {showInviteUser && selectedHousehold && <InviteUserForm />}
      {showUserProfile && <UserProfileModal />}
    </div>
  );
};

export default UserManagement; 