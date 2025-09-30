import React, { useState, useEffect } from 'react';
import { Plus, Users, Shield, Mail, Phone, Calendar, Edit, Trash2, UserPlus, Settings, Bell, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import hybridStorage from '../../firebase/hybridStorage';

const Collaboration = () => {
  const { currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'member',
    permissions: []
  });
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member',
    message: ''
  });

  const roles = [
    { value: 'owner', label: 'Owner', description: 'Full access to all features and settings' },
    { value: 'admin', label: 'Administrator', description: 'Can manage members and most features' },
    { value: 'member', label: 'Member', description: 'Standard access to household features' },
    { value: 'guest', label: 'Guest', description: 'Limited access to basic features' }
  ];

  const permissions = [
    { value: 'inventory', label: 'Inventory Management', description: 'View and edit household inventory' },
    { value: 'spending', label: 'Spending & Budgets', description: 'View and manage expenses and budgets' },
    { value: 'shopping', label: 'Shopping Lists', description: 'Create and manage shopping lists' },
    { value: 'recipes', label: 'Recipe Management', description: 'Access and edit recipes' },
    { value: 'collaboration', label: 'Member Management', description: 'Invite and manage household members' },
    { value: 'settings', label: 'Household Settings', description: 'Modify household configuration' }
  ];

  // Load real data from Firebase
  useEffect(() => {
    const loadCollaborationData = async () => {
      if (!currentUser) {
        setMembers([]);
        setInvitations([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [membersResponse, invitationsResponse] = await Promise.all([
          hybridStorage.getCollaborationMembers(currentUser.uid),
          hybridStorage.getCollaborationInvitations(currentUser.uid)
        ]);

        if (membersResponse.success) {
          setMembers(membersResponse.data || []);
        } else {
          console.error('Failed to load members:', membersResponse.error);
          setMembers([]);
        }

        if (invitationsResponse.success) {
          setInvitations(invitationsResponse.data || []);
        } else {
          console.error('Failed to load invitations:', invitationsResponse.error);
          setInvitations([]);
        }
      } catch (error) {
        console.error('Error loading collaboration data:', error);
        setMembers([]);
        setInvitations([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCollaborationData();
  }, [currentUser]);

  // Show loading state while authentication is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading collaboration data...</p>
        </div>
      </div>
    );
  }

  const handleAddMember = () => {
    if (!memberForm.name || !memberForm.email || !memberForm.role) return;
    
    const newMember = {
      id: Date.now(),
      ...memberForm,
      joinedAt: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    
    setMembers([...members, newMember]);
    
    setMemberForm({
      name: '',
      email: '',
      phone: '',
      role: 'member',
      permissions: []
    });
    setShowAddMember(false);
  };

  const handleInviteMember = () => {
    if (!inviteForm.email || !inviteForm.role) return;
    
    const newInvitation = {
      id: Date.now(),
      ...inviteForm,
      invitedBy: 'John Smith', // Current user
      invitedAt: new Date().toISOString().split('T')[0],
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    setInvitations([...invitations, newInvitation]);
    
    setInviteForm({
      email: '',
      role: 'member',
      message: ''
    });
    setShowInviteForm(false);
  };

  const handleDeleteMember = (id) => {
    setMembers(members.filter(member => member.id !== id));
  };

  const handleDeleteInvitation = (id) => {
    setInvitations(invitations.filter(invitation => invitation.id !== id));
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setMemberForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      permissions: [...member.permissions]
    });
    setShowAddMember(true);
  };

  const handleUpdateMember = () => {
    if (!selectedMember) return;
    
    const updatedMembers = members.map(member => 
      member.id === selectedMember.id 
        ? { ...member, ...memberForm }
        : member
    );
    
    setMembers(updatedMembers);
    setSelectedMember(null);
    setMemberForm({
      name: '',
      email: '',
      phone: '',
      role: 'member',
      permissions: []
    });
    setShowAddMember(false);
  };

  const togglePermission = (permission) => {
    const newPermissions = memberForm.permissions.includes(permission)
      ? memberForm.permissions.filter(p => p !== permission)
      : [...memberForm.permissions, permission];
    
    setMemberForm({ ...memberForm, permissions: newPermissions });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'text-purple-600 bg-purple-100';
      case 'admin': return 'text-blue-600 bg-blue-100';
      case 'member': return 'text-green-600 bg-green-100';
      case 'guest': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getInvitationStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getInvitationStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'expired': return 'Expired';
      default: return 'Unknown';
    }
  };

  const isInvitationExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  const getActiveMembers = () => {
    return members.filter(member => member.status === 'active');
  };

  const getPendingInvitations = () => {
    return invitations.filter(invitation => invitation.status === 'pending');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Collaboration
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage household members with roles and permissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Members</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{members.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Members</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getActiveMembers().length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Invites</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getPendingInvitations().length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Roles</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{roles.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Household Members</h3>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowInviteForm(true)}
                className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
              >
                <Mail className="h-5 w-5 mr-2" />
                Invite Member
              </button>
              <button
                onClick={() => setShowAddMember(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Member
              </button>
            </div>
          </div>
          
          {members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No household members yet. Add your first member!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Permissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {member.email}
                          </div>
                          {member.phone && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {member.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                          {roles.find(r => r.value === member.role)?.label || member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {member.permissions.map((permission) => {
                            const perm = permissions.find(p => p.value === permission);
                            return (
                              <span
                                key={permission}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                                title={perm?.description}
                              >
                                {perm?.label || permission}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(member.lastActive).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditMember(member)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Member Form */}
        {showAddMember && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {selectedMember ? 'Edit Member' : 'Add New Member'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter member name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={memberForm.phone}
                  onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role *
                </label>
                <select
                  value={memberForm.role}
                  onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Permissions
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {permissions.map((permission) => (
                    <label key={permission.value} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={memberForm.permissions.includes(permission.value)}
                        onChange={() => togglePermission(permission.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {permission.label}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {permission.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddMember(false);
                  setSelectedMember(null);
                  setMemberForm({
                    name: '',
                    email: '',
                    phone: '',
                    role: 'member',
                    permissions: []
                  });
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={selectedMember ? handleUpdateMember : handleAddMember}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {selectedMember ? 'Update Member' : 'Add Member'}
              </button>
            </div>
          </div>
        )}

        {/* Invitations Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pending Invitations</h3>
          
          {invitations.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No pending invitations.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Invited By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {invitations.map((invitation) => {
                    const isExpired = isInvitationExpired(invitation.expiresAt);
                    const status = isExpired ? 'expired' : invitation.status;
                    
                    return (
                      <tr key={invitation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {invitation.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(invitation.role)}`}>
                            {roles.find(r => r.value === invitation.role)?.label || invitation.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {invitation.invitedBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getInvitationStatusColor(status)}`}>
                            {getInvitationStatusText(status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(invitation.expiresAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeleteInvitation(invitation.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invite New Member</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role *
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={inviteForm.message}
                  onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Add a personal message to your invitation..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowInviteForm(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteMember}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                Send Invitation
              </button>
            </div>
          </div>
        )}

        {/* Role Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Role Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role) => (
              <div key={role.value} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role.value)}`}>
                    {role.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collaboration;
