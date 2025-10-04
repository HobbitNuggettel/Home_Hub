class DataManagementService {
  constructor() {
    this.syncInterval = 30000; // 30 seconds
    this.retryAttempts = 3;
    this.isOnline = navigator.onLine;
    this.pendingChanges = new Map();
    this.syncInProgress = false;
  }

  // Initialize data management
  async initialize() {
    this.setupEventListeners();
    await this.loadPendingChanges();
    this.startSyncInterval();
  }

  // Setup event listeners
  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingChanges();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Listen for storage changes
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('homeHub_')) {
        this.handleStorageChange(e.key, e.newValue);
      }
    });
  }

  // Load pending changes from localStorage
  async loadPendingChanges() {
    try {
      const pending = localStorage.getItem('homeHub_pending_changes');
      if (pending) {
        this.pendingChanges = new Map(JSON.parse(pending));
      }
    } catch (error) {
      console.error('Failed to load pending changes:', error);
    }
  }

  // Save pending changes to localStorage
  async savePendingChanges() {
    try {
      localStorage.setItem(
        'homeHub_pending_changes',
        JSON.stringify(Array.from(this.pendingChanges.entries()))
      );
    } catch (error) {
      console.error('Failed to save pending changes:', error);
    }
  }

  // Add change to pending queue
  addPendingChange(type, data, id) {
    const changeId = id || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.pendingChanges.set(changeId, {
      type,
      data,
      timestamp: Date.now(),
      attempts: 0,
    });

    this.savePendingChanges();
    return changeId;
  }

  // Remove change from pending queue
  removePendingChange(changeId) {
    this.pendingChanges.delete(changeId);
    this.savePendingChanges();
  }

  // Sync pending changes
  async syncPendingChanges() {
    if (!this.isOnline || this.syncInProgress || this.pendingChanges.size === 0) {
      return;
    }

    this.syncInProgress = true;

    try {
      const changes = Array.from(this.pendingChanges.entries());
      
      for (const [changeId, change] of changes) {
        try {
          await this.syncChange(change.type, change.data);
          this.removePendingChange(changeId);
        } catch (error) {
          change.attempts++;
          
          if (change.attempts >= this.retryAttempts) {
            console.error(`Failed to sync change ${changeId} after ${this.retryAttempts} attempts:`, error);
            this.removePendingChange(changeId);
          } else {
            this.pendingChanges.set(changeId, change);
          }
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  // Sync individual change
  async syncChange(type, data) {
    const endpoint = this.getEndpointForType(type);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // Get endpoint for data type
  getEndpointForType(type) {
    const endpoints = {
      inventory: '/api/inventory/sync',
      spending: '/api/spending/sync',
      recipes: '/api/recipes/sync',
      shopping: '/api/shopping/sync',
      maintenance: '/api/maintenance/sync',
      settings: '/api/settings/sync',
    };

    return endpoints[type] || '/api/sync';
  }

  // Start sync interval
  startSyncInterval() {
    setInterval(() => {
      this.syncPendingChanges();
    }, this.syncInterval);
  }

  // Handle storage change
  handleStorageChange(key, newValue) {
    // Handle cross-tab synchronization
    if (key.startsWith('homeHub_')) {
      this.notifyStorageChange(key, newValue);
    }
  }

  // Notify storage change
  notifyStorageChange(key, value) {
    window.dispatchEvent(new CustomEvent('homeHub_storage_change', {
      detail: { key, value }
    }));
  }

  // Export data
  async exportData(types = ['all']) {
    try {
      const data = {};

      if (types.includes('all') || types.includes('inventory')) {
        data.inventory = await this.getLocalData('inventory');
      }

      if (types.includes('all') || types.includes('spending')) {
        data.spending = await this.getLocalData('spending');
      }

      if (types.includes('all') || types.includes('recipes')) {
        data.recipes = await this.getLocalData('recipes');
      }

      if (types.includes('all') || types.includes('shopping')) {
        data.shopping = await this.getLocalData('shopping');
      }

      if (types.includes('all') || types.includes('maintenance')) {
        data.maintenance = await this.getLocalData('maintenance');
      }

      if (types.includes('all') || types.includes('settings')) {
        data.settings = await this.getLocalData('settings');
      }

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        version: '1.0',
      };
    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  // Import data
  async importData(data, options = {}) {
    try {
      const { merge = false, overwrite = false } = options;
      const results = {};

      for (const [type, typeData] of Object.entries(data)) {
        if (type === 'timestamp' || type === 'version') continue;

        const existingData = await this.getLocalData(type);
        
        if (merge) {
          results[type] = await this.mergeData(type, existingData, typeData);
        } else if (overwrite) {
          results[type] = await this.setLocalData(type, typeData);
        } else {
          results[type] = await this.setLocalData(type, typeData);
        }
      }

      return {
        success: true,
        results,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  // Merge data
  async mergeData(type, existing, incoming) {
    // Simple merge strategy - can be enhanced based on data structure
    const merged = { ...existing, ...incoming };
    return await this.setLocalData(type, merged);
  }

  // Get local data
  async getLocalData(type) {
    try {
      const data = localStorage.getItem(`homeHub_${type}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Failed to get local data for ${type}:`, error);
      return null;
    }
  }

  // Set local data
  async setLocalData(type, data) {
    try {
      localStorage.setItem(`homeHub_${type}`, JSON.stringify(data));
      return data;
    } catch (error) {
      console.error(`Failed to set local data for ${type}:`, error);
      throw error;
    }
  }

  // Clear all data
  async clearAllData() {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('homeHub_'));
      keys.forEach(key => localStorage.removeItem(key));
      
      this.pendingChanges.clear();
      await this.savePendingChanges();
      
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to clear data: ${error.message}`);
    }
  }

  // Get data statistics
  async getDataStats() {
    try {
      const stats = {
        totalSize: 0,
        itemCount: 0,
        types: {},
        lastModified: null,
      };

      const keys = Object.keys(localStorage).filter(key => key.startsWith('homeHub_'));
      
      for (const key of keys) {
        const value = localStorage.getItem(key);
        const size = new Blob([value]).size;
        
        stats.totalSize += size;
        stats.itemCount++;
        
        const type = key.replace('homeHub_', '');
        if (!stats.types[type]) {
          stats.types[type] = { count: 0, size: 0 };
        }
        stats.types[type].count++;
        stats.types[type].size += size;
        
        const item = JSON.parse(value);
        if (item.timestamp && (!stats.lastModified || item.timestamp > stats.lastModified)) {
          stats.lastModified = item.timestamp;
        }
      }

      return stats;
    } catch (error) {
      throw new Error(`Failed to get data statistics: ${error.message}`);
    }
  }

  // Backup data
  async backupData() {
    try {
      const data = await this.exportData(['all']);
      const backup = {
        ...data,
        backup: true,
        timestamp: new Date().toISOString(),
      };

      // Save backup to localStorage
      const backupKey = `homeHub_backup_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(backup));

      return {
        success: true,
        backupKey,
        timestamp: backup.timestamp,
      };
    } catch (error) {
      throw new Error(`Backup failed: ${error.message}`);
    }
  }

  // Restore from backup
  async restoreFromBackup(backupKey) {
    try {
      const backup = localStorage.getItem(backupKey);
      if (!backup) {
        throw new Error('Backup not found');
      }

      const data = JSON.parse(backup);
      return await this.importData(data, { overwrite: true });
    } catch (error) {
      throw new Error(`Restore failed: ${error.message}`);
    }
  }

  // Get available backups
  getAvailableBackups() {
    const backups = [];
    const keys = Object.keys(localStorage).filter(key => key.startsWith('homeHub_backup_'));
    
    for (const key of keys) {
      try {
        const backup = JSON.parse(localStorage.getItem(key));
        backups.push({
          key,
          timestamp: backup.timestamp,
          size: new Blob([localStorage.getItem(key)]).size,
        });
      } catch (error) {
        console.error(`Failed to parse backup ${key}:`, error);
      }
    }

    return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Clean old backups
  async cleanOldBackups(keepCount = 5) {
    try {
      const backups = this.getAvailableBackups();
      
      if (backups.length > keepCount) {
        const toDelete = backups.slice(keepCount);
        
        for (const backup of toDelete) {
          localStorage.removeItem(backup.key);
        }
        
        return { success: true, deleted: toDelete.length };
      }
      
      return { success: true, deleted: 0 };
    } catch (error) {
      throw new Error(`Failed to clean backups: ${error.message}`);
    }
  }

  // Get service status
  getStatus() {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      pendingChanges: this.pendingChanges.size,
      syncInterval: this.syncInterval,
    };
  }
}

export default new DataManagementService();





