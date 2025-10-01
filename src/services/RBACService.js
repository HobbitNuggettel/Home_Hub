/**
 * RBAC Service
 * Role-Based Access Control for enterprise permissions
 */

import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import loggingService from './LoggingService';

class RBACService {
  constructor() {
    this.roles = {
      super_admin: {
        name: 'Super Administrator',
        permissions: ['*'],
        description: 'Full system access'
      },
      admin: {
        name: 'Administrator',
        permissions: [
          'users.read', 'users.create', 'users.update', 'users.delete',
          'inventory.read', 'inventory.create', 'inventory.update', 'inventory.delete',
          'spending.read', 'spending.create', 'spending.update', 'spending.delete',
          'analytics.read', 'analytics.export',
          'settings.read', 'settings.update',
          'reports.read', 'reports.create', 'reports.export'
        ],
        description: 'Full application access'
      },
      manager: {
        name: 'Manager',
        permissions: [
          'users.read',
          'inventory.read', 'inventory.create', 'inventory.update',
          'spending.read', 'spending.create', 'spending.update',
          'analytics.read',
          'reports.read', 'reports.create'
        ],
        description: 'Management level access'
      },
      user: {
        name: 'User',
        permissions: [
          'inventory.read', 'inventory.create', 'inventory.update',
          'spending.read', 'spending.create', 'spending.update',
          'analytics.read'
        ],
        description: 'Standard user access'
      },
      viewer: {
        name: 'Viewer',
        permissions: [
          'inventory.read',
          'spending.read',
          'analytics.read'
        ],
        description: 'Read-only access'
      }
    };

    this.permissions = {
      'users.read': 'Read user information',
      'users.create': 'Create new users',
      'users.update': 'Update user information',
      'users.delete': 'Delete users',
      'inventory.read': 'Read inventory data',
      'inventory.create': 'Create inventory items',
      'inventory.update': 'Update inventory items',
      'inventory.delete': 'Delete inventory items',
      'spending.read': 'Read spending data',
      'spending.create': 'Create spending records',
      'spending.update': 'Update spending records',
      'spending.delete': 'Delete spending records',
      'analytics.read': 'View analytics data',
      'analytics.export': 'Export analytics data',
      'settings.read': 'Read application settings',
      'settings.update': 'Update application settings',
      'reports.read': 'Read reports',
      'reports.create': 'Create reports',
      'reports.export': 'Export reports'
    };
  }

  /**
   * Check if user has permission
   */
  async hasPermission(userId, permission) {
    try {
      const userRole = await this.getUserRole(userId);
      if (!userRole) return false;

      const role = this.roles[userRole.role];
      if (!role) return false;

      // Super admin has all permissions
      if (role.permissions.includes('*')) return true;

      return role.permissions.includes(permission);
    } catch (error) {
      loggingService.error('Failed to check permission', {
        userId,
        permission,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(userId, permissions) {
    for (const permission of permissions) {
      if (await this.hasPermission(userId, permission)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if user has all of the specified permissions
   */
  async hasAllPermissions(userId, permissions) {
    for (const permission of permissions) {
      if (!(await this.hasPermission(userId, permission))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get user role
   */
  async getUserRole(userId) {
    try {
      const userRoleDoc = doc(db, 'user_roles', userId);
      const userRoleSnap = await getDoc(userRoleDoc);
      
      if (userRoleSnap.exists()) {
        return userRoleSnap.data();
      }
      
      // Return default role if no role assigned
      return {
        role: 'user',
        assignedAt: new Date().toISOString(),
        assignedBy: 'system'
      };
    } catch (error) {
      loggingService.error('Failed to get user role', {
        userId,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Assign role to user
   */
  async assignRole(userId, role, assignedBy) {
    try {
      if (!this.roles[role]) {
        throw new Error(`Invalid role: ${role}`);
      }

      const userRoleData = {
        role,
        assignedAt: new Date().toISOString(),
        assignedBy,
        updatedAt: new Date().toISOString()
      };

      const userRoleDoc = doc(db, 'user_roles', userId);
      await setDoc(userRoleDoc, userRoleData);

      loggingService.info('Role assigned successfully', {
        userId,
        role,
        assignedBy
      });

      return {
        success: true,
        userRole: userRoleData
      };
    } catch (error) {
      loggingService.error('Failed to assign role', {
        userId,
        role,
        assignedBy,
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update user role
   */
  async updateRole(userId, newRole, updatedBy) {
    try {
      if (!this.roles[newRole]) {
        throw new Error(`Invalid role: ${newRole}`);
      }

      const userRoleDoc = doc(db, 'user_roles', userId);
      await updateDoc(userRoleDoc, {
        role: newRole,
        updatedAt: new Date().toISOString(),
        updatedBy
      });

      loggingService.info('Role updated successfully', {
        userId,
        newRole,
        updatedBy
      });

      return {
        success: true
      };
    } catch (error) {
      loggingService.error('Failed to update role', {
        userId,
        newRole,
        updatedBy,
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Remove user role
   */
  async removeRole(userId, removedBy) {
    try {
      const userRoleDoc = doc(db, 'user_roles', userId);
      await updateDoc(userRoleDoc, {
        role: 'user', // Reset to default role
        removedAt: new Date().toISOString(),
        removedBy,
        updatedAt: new Date().toISOString()
      });

      loggingService.info('Role removed successfully', {
        userId,
        removedBy
      });

      return {
        success: true
      };
    } catch (error) {
      loggingService.error('Failed to remove role', {
        userId,
        removedBy,
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all roles
   */
  getRoles() {
    return Object.keys(this.roles).map(roleKey => ({
      key: roleKey,
      ...this.roles[roleKey]
    }));
  }

  /**
   * Get role by key
   */
  getRole(roleKey) {
    return this.roles[roleKey] || null;
  }

  /**
   * Get all permissions
   */
  getPermissions() {
    return Object.keys(this.permissions).map(permissionKey => ({
      key: permissionKey,
      name: this.permissions[permissionKey]
    }));
  }

  /**
   * Get permissions for role
   */
  getRolePermissions(roleKey) {
    const role = this.roles[roleKey];
    if (!role) return [];

    return role.permissions.map(permissionKey => ({
      key: permissionKey,
      name: this.permissions[permissionKey] || permissionKey
    }));
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role) {
    try {
      const userRolesRef = collection(db, 'user_roles');
      const q = query(userRolesRef, where('role', '==', role));
      const querySnapshot = await getDocs(q);
      
      const users = [];
      querySnapshot.forEach(doc => {
        users.push({
          userId: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        users
      };
    } catch (error) {
      loggingService.error('Failed to get users by role', {
        role,
        error: error.message
      });

      return {
        success: false,
        error: error.message,
        users: []
      };
    }
  }

  /**
   * Get role hierarchy
   */
  getRoleHierarchy() {
    return {
      super_admin: 5,
      admin: 4,
      manager: 3,
      user: 2,
      viewer: 1
    };
  }

  /**
   * Check if user can manage another user
   */
  async canManageUser(managerId, targetUserId) {
    try {
      const managerRole = await this.getUserRole(managerId);
      const targetRole = await this.getUserRole(targetUserId);
      
      if (!managerRole || !targetRole) return false;

      const hierarchy = this.getRoleHierarchy();
      const managerLevel = hierarchy[managerRole.role] || 0;
      const targetLevel = hierarchy[targetRole.role] || 0;

      return managerLevel > targetLevel;
    } catch (error) {
      loggingService.error('Failed to check user management permission', {
        managerId,
        targetUserId,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Get user permissions summary
   */
  async getUserPermissionsSummary(userId) {
    try {
      const userRole = await this.getUserRole(userId);
      if (!userRole) return null;

      const role = this.roles[userRole.role];
      if (!role) return null;

      return {
        role: userRole.role,
        roleName: role.name,
        permissions: role.permissions,
        permissionCount: role.permissions.length,
        hasAllPermissions: role.permissions.includes('*')
      };
    } catch (error) {
      loggingService.error('Failed to get user permissions summary', {
        userId,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Create custom role
   */
  async createCustomRole(roleKey, roleData) {
    try {
      // Validate role data
      if (!roleData.name || !roleData.permissions || !Array.isArray(roleData.permissions)) {
        throw new Error('Invalid role data');
      }

      // Check if role already exists
      if (this.roles[roleKey]) {
        throw new Error('Role already exists');
      }

      // Add custom role
      this.roles[roleKey] = {
        name: roleData.name,
        permissions: roleData.permissions,
        description: roleData.description || 'Custom role',
        isCustom: true,
        createdAt: new Date().toISOString()
      };

      loggingService.info('Custom role created', {
        roleKey,
        roleName: roleData.name
      });

      return {
        success: true,
        role: this.roles[roleKey]
      };
    } catch (error) {
      loggingService.error('Failed to create custom role', {
        roleKey,
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete custom role
   */
  async deleteCustomRole(roleKey) {
    try {
      const role = this.roles[roleKey];
      if (!role) {
        throw new Error('Role not found');
      }

      if (!role.isCustom) {
        throw new Error('Cannot delete system role');
      }

      delete this.roles[roleKey];

      loggingService.info('Custom role deleted', {
        roleKey
      });

      return {
        success: true
      };
    } catch (error) {
      loggingService.error('Failed to delete custom role', {
        roleKey,
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }
}

const rbacService = new RBACService();
export default rbacService;



