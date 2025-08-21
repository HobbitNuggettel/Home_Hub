import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Users, 
  UserPlus, 
  Crown, 
  Shield, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Settings,
  Edit,
  Trash2,
  Check,
  X,
  MoreVertical,
  Home,
  Building,
  Bell,
  Lock,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock household data
const mockHouseholds = [
  {
    id: '1',
    name: 'Smith Family Home',
    address: '123 Main Street, Anytown, USA',
    description: 'Our family home with shared spaces and personal areas',
    createdAt: '2024-01-01',
    owner: {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      role: 'owner'
    },
    members: [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@email.com',
        role: 'owner',
        avatar: null,
        joinedAt: '2024-01-01',
        status: 'active',
        permissions: ['all']
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        role: 'admin',
        avatar: null,
        joinedAt: '2024-01-02',
        status: 'active',
        permissions: ['manage_members', 'manage_inventory', 'view_finances']
      },
      {
        id: '3',
        name: 'Mike Smith',
        email: 'mike.smith@email.com',
        role: 'member',
        avatar: null,
        joinedAt: '2024-01-05',
        status: 'active',
        permissions: ['view_inventory', 'view_finances']
      }
    ],
    invitations: [
      {
        id: '1',
        email: 'sarah.smith@email.com',
        role: 'member',
        invitedBy: 'John Smith',
        invitedAt: '2024-01-15',
        status: 'pending',
        expiresAt: '2024-01-22'
      }
    ],
    settings: {
      privacy: 'private',
      allowInvites: true,
      requireApproval: true,
      sharedSpaces: ['kitchen', 'living_room', 'garage'],
      personalSpaces: ['bedrooms', 'home_offices']
    }
  }
];

// Mock user roles and permissions
const userRoles = [
  {
    name: 'owner',
    label: 'Owner',
    icon: Crown,
    color: 'bg-purple-100 text-purple-800',
    description: 'Full control over household and all members',
    permissions: ['all']
  },
  {
    name: 'admin',
    label: 'Admin',
    icon: Shield,
    color: 'bg-blue-100 text-blue-800',
    description: 'Manage members, inventory, and household settings',
    permissions: ['manage_members', 'manage_inventory', 'view_finances', 'manage_shopping_lists']
  },
  {
    name: 'member',
    label: 'Member',
    icon: User,
    color: 'bg-green-100 text-green-800',
    description: 'View and contribute to household activities',
    permissions: ['view_inventory', 'view_finances', 'create_shopping_lists', 'add_expenses']
  },
  {
    name: 'guest',
    label: 'Guest',
    icon: Eye,
    color: 'bg-gray-100 text-gray-600',
    description: 'Limited access to household information',
    permissions: ['view_inventory']
  }
];

export default function Collaboration() {
  const [households, setHouseholds] = useState(mockHouseholds);
  const [currentHousehold, setCurrentHousehold] = useState(mockHouseholds[0]);
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'members', 'invitations', 'settings'
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  // Filter members based on search and role
  const filteredMembers = currentHousehold.members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Get role info
  const getRoleInfo = (roleName) => {
    return userRoles.find(role => role.name === roleName) || userRoles[3];
  };

  // Get role icon
  const getRoleIcon = (roleName) => {
    const role = getRoleInfo(roleName);
    return role.icon;
  };

  // Invite new member
  const inviteMember = (inviteData) => {
    const newInvitation = {
      id: Date.now().toString(),
      ...inviteData,
      invitedBy: 'John Smith', // Current user
      invitedAt: new Date().toISOString().split('T')[0],
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setHouseholds(households.map(household => 
      household.id === currentHousehold.id 
        ? { ...household, invitations: [...household.invitations, newInvitation] }
        : household
    ));

    setCurrentHousehold(prev => ({
      ...prev,
      invitations: [...prev.invitations, newInvitation]
    }));

    setShowInviteForm(false);
    toast.success(`Invitation sent to ${inviteData.email}`);
  };

  // Add new member
  const addMember = (memberData) => {
    const newMember = {
      id: Date.now().toString(),
      ...memberData,
      avatar: null,
      joinedAt: new Date().toISOString().split('T')[0],
      status: 'active',
      permissions: getRoleInfo(memberData.role).permissions
    };

    setHouseholds(households.map(household => 
      household.id === currentHousehold.id 
        ? { ...household, members: [...household.members, newMember] }
        : household
    ));

    setCurrentHousehold(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));

    setShowMemberForm(false);
    toast.success(`Member ${newMember.name} added successfully`);
  };

  // Update member
  const updateMember = (id, updates) => {
    setHouseholds(households.map(household => 
      household.id === currentHousehold.id 
        ? {
            ...household,
            members: household.members.map(member => 
              member.id === id 
                ? { ...member, ...updates, permissions: getRoleInfo(updates.role).permissions }
                : member
            )
          }
        : household
    ));

    setCurrentHousehold(prev => ({
      ...prev,
      members: prev.members.map(member => 
        member.id === id 
          ? { ...member, ...updates, permissions: getRoleInfo(updates.role).permissions }
          : member
      )
    }));

    setEditingMember(null);
    toast.success('Member updated successfully');
  };

  // Remove member
  const removeMember = (id) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      setHouseholds(households.map(household => 
        household.id === currentHousehold.id 
          ? { ...household, members: household.members.filter(member => member.id !== id) }
          : household
      ));

      setCurrentHousehold(prev => ({
        ...prev,
        members: prev.members.filter(member => member.id !== id)
      }));

      toast.success('Member removed successfully');
    }
  };

  // Cancel invitation
  const cancelInvitation = (id) => {
    if (window.confirm('Are you sure you want to cancel this invitation?')) {
      setHouseholds(households.map(household => 
        household.id === currentHousehold.id 
          ? { ...household, invitations: household.invitations.filter(inv => inv.id !== id) }
          : household
      ));

      setCurrentHousehold(prev => ({
        ...prev,
        invitations: prev.invitations.filter(inv => inv.id !== id)
      }));

      toast.success('Invitation cancelled successfully');
    }
  };

  // Update household settings
  const updateHouseholdSettings = (settings) => {
    setHouseholds(households.map(household => 
      household.id === currentHousehold.id 
        ? { ...household, settings: { ...household.settings, ...settings } }
        : household
    ));

    setCurrentHousehold(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings }
    }));

    toast.success('Household settings updated successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User & Household Collaboration</h1>
              <p className="text-gray-600">Manage multi-user households, roles, and invitations</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowMemberForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <UserPlus size={20} />
                <span>Add Member</span>
              </button>
              <button
                onClick={() => setShowInviteForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Mail size={20} />
                <span>Invite Member</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-1 mb-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setViewMode('overview')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Home size={16} />
                <span>Overview</span>
              </div>
            </button>
            <button
              onClick={() => setViewMode('members')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'members'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Users size={16} />
                <span>Members</span>
              </div>
            </button>
            <button
              onClick={() => setViewMode('invitations')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'invitations'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Mail size={16} />
                <span>Invitations</span>
              </div>
            </button>
            <button
              onClick={() => setViewMode('settings')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'settings'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Settings size={16} />
                <span>Settings</span>
              </div>
            </button>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'overview' && (
          <div>
            {/* Household Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{currentHousehold.name}</h2>
                  <p className="text-gray-600 mt-1">{currentHousehold.description}</p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Building size={16} />
                      <span>{currentHousehold.address}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={16} />
                      <span>Created {new Date(currentHousehold.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{currentHousehold.members.length}</div>
                  <div className="text-sm text-gray-600">Active Members</div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Crown className="text-blue-600" size={20} />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Owner</p>
                      <p className="text-sm text-blue-800">{currentHousehold.owner.name}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Users className="text-green-600" size={20} />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Total Members</p>
                      <p className="text-sm text-green-800">{currentHousehold.members.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Mail className="text-orange-600" size={20} />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-orange-600">Pending Invites</p>
                      <p className="text-sm text-orange-800">{currentHousehold.invitations.filter(inv => inv.status === 'pending').length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Lock className="text-purple-600" size={20} />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">Privacy</p>
                      <p className="text-sm text-purple-800 capitalize">{currentHousehold.settings.privacy}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {currentHousehold.members.slice(0, 3).map(member => (
                  <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleInfo(member.role).color}`}>
                      {getRoleInfo(member.role).label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'members' && (
          <div>
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Members</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Roles</option>
                    {userRoles.map(role => (
                      <option key={role.name} value={role.name}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedRole('all');
                    }}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Members List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Household Members ({filteredMembers.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMembers.map(member => {
                      const roleInfo = getRoleInfo(member.role);
                      const RoleIcon = roleInfo.icon;
                      return (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User size={20} className="text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                <div className="text-sm text-gray-500">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <RoleIcon size={16} className="text-gray-600" />
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleInfo.color}`}>
                                {roleInfo.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(member.joinedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {member.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-wrap gap-1">
                              {member.permissions.slice(0, 3).map(permission => (
                                <span key={permission} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                  {permission.replace('_', ' ')}
                                </span>
                              ))}
                              {member.permissions.length > 3 && (
                                <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                  +{member.permissions.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingMember(member)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit Member"
                              >
                                <Edit size={16} />
                              </button>
                              {member.role !== 'owner' && (
                                <button
                                  onClick={() => removeMember(member.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Remove Member"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'invitations' && (
          <div>
            {/* Invitations List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Pending Invitations ({currentHousehold.invitations.filter(inv => inv.status === 'pending').length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invited By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invited</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentHousehold.invitations.map(invitation => {
                      const roleInfo = getRoleInfo(invitation.role);
                      const RoleIcon = roleInfo.icon;
                      return (
                        <tr key={invitation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{invitation.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <RoleIcon size={16} className="text-gray-600" />
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleInfo.color}`}>
                                {roleInfo.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {invitation.invitedBy}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(invitation.invitedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(invitation.expiresAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => cancelInvitation(invitation.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Cancel Invitation"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'settings' && (
          <div>
            {/* Household Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Household Settings</h3>
              <div className="space-y-6">
                {/* Privacy Settings */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Privacy & Security</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Privacy Level</label>
                      <select
                        value={currentHousehold.settings.privacy}
                        onChange={(e) => updateHouseholdSettings({ privacy: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="private">Private - Invitation only</option>
                        <option value="public">Public - Anyone can join</option>
                        <option value="restricted">Restricted - Approval required</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Invitation Policy</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={currentHousehold.settings.allowInvites}
                            onChange={(e) => updateHouseholdSettings({ allowInvites: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Allow members to invite others</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={currentHousehold.settings.requireApproval}
                            onChange={(e) => updateHouseholdSettings({ requireApproval: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Require approval for new members</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Space Management */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Space Management</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shared Spaces</label>
                      <div className="space-y-2">
                        {['kitchen', 'living_room', 'garage', 'garden', 'laundry'].map(space => (
                          <label key={space} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={currentHousehold.settings.sharedSpaces.includes(space)}
                              onChange={(e) => {
                                const sharedSpaces = e.target.checked
                                  ? [...currentHousehold.settings.sharedSpaces, space]
                                  : currentHousehold.settings.sharedSpaces.filter(s => s !== space);
                                updateHouseholdSettings({ sharedSpaces });
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 capitalize">{space.replace('_', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Personal Spaces</label>
                      <div className="space-y-2">
                        {['bedrooms', 'home_offices', 'bathrooms', 'closets'].map(space => (
                          <label key={space} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={currentHousehold.settings.personalSpaces.includes(space)}
                              onChange={(e) => {
                                const personalSpaces = e.target.checked
                                  ? [...currentHousehold.settings.personalSpaces, space]
                                  : currentHousehold.settings.personalSpaces.filter(s => s !== space);
                                updateHouseholdSettings({ personalSpaces });
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 capitalize">{space.replace('_', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Invite New Member</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const inviteData = {
                  email: formData.get('email'),
                  role: formData.get('role')
                };
                inviteMember(inviteData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="member@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      name="role"
                      defaultValue="member"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {userRoles.filter(role => role.name !== 'owner').map(role => (
                        <option key={role.name} value={role.name}>{role.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Send Invitation
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Member Modal */}
      {(showMemberForm || editingMember) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingMember ? 'Edit Member' : 'Add New Member'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const memberData = {
                  name: formData.get('name'),
                  email: formData.get('email'),
                  role: formData.get('role')
                };
                
                if (editingMember) {
                  updateMember(editingMember.id, memberData);
                } else {
                  addMember(memberData);
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingMember?.name || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={editingMember?.email || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      name="role"
                      defaultValue={editingMember?.role || 'member'}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {userRoles.filter(role => role.name !== 'owner').map(role => (
                        <option key={role.name} value={role.name}>{role.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingMember ? 'Update Member' : 'Add Member'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMemberForm(false);
                      setEditingMember(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Back to Home Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <a href="/" className="text-blue-600 hover:text-blue-800 underline">← Back to Home</a>
      </div>
    </div>
  );
}
