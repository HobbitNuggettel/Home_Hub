/**
 * Firebase Offline Sync Service
 * Handles offline data synchronization and conflict resolution
 */

import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  writeBatch,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config.js';

class FirebaseOfflineSyncService {
  constructor() {
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.conflictResolution = 'server'; // 'server', 'client', 'manual'
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Add operation to sync queue
   */
  addToSyncQueue(operation) {
    const syncOperation = {
      id: this.generateOperationId(),
      type: operation.type, // 'create', 'update', 'delete'
      collection: operation.collection,
      docId: operation.docId,
      data: operation.data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      maxRetries: 3
    };
    
    this.syncQueue.push(syncOperation);
    this.saveSyncQueue();
    
    // Try to sync immediately if online
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  /**
   * Process the sync queue
   */
  async processSyncQueue() {
    if (this.syncInProgress || !this.isOnline || this.syncQueue.length === 0) {
      return;
    }
    
    this.syncInProgress = true;
    
    try {
      const operations = [...this.syncQueue];
      const batch = writeBatch(db);
      const operationsToRemove = [];
      
      for (const operation of operations) {
        try {
          await this.executeOperation(operation, batch);
          operationsToRemove.push(operation.id);
        } catch (error) {
          console.error(`Sync operation failed:`, error);
          operation.retryCount++;
          
          if (operation.retryCount >= operation.maxRetries) {
            operationsToRemove.push(operation.id);
            console.error(`Operation ${operation.id} exceeded max retries`);
          }
        }
      }
      
      // Commit batch if there are operations
      if (operationsToRemove.length > 0) {
        await batch.commit();
        
        // Remove successful operations from queue
        this.syncQueue = this.syncQueue.filter(
          op => !operationsToRemove.includes(op.id)
        );
        this.saveSyncQueue();
      }
      
    } catch (error) {
      console.error('Sync queue processing failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Execute a single operation
   */
  async executeOperation(operation, batch) {
    const docRef = doc(db, operation.collection, operation.docId);
    
    switch (operation.type) {
      case 'create':
        batch.set(docRef, {
          ...operation.data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        break;
        
      case 'update':
        batch.update(docRef, {
          ...operation.data,
          updatedAt: serverTimestamp()
        });
        break;
        
      case 'delete':
        batch.delete(docRef);
        break;
        
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  /**
   * Sync specific data type
   */
  async syncDataType(userId, dataType) {
    try {
      const localData = this.getLocalData(dataType, userId);
      const serverData = await this.getServerData(dataType, userId);
      
      const conflicts = this.detectConflicts(localData, serverData);
      
      if (conflicts.length > 0) {
        return this.resolveConflicts(conflicts, dataType, userId);
      }
      
      // No conflicts, proceed with sync
      return this.performSync(localData, serverData, dataType, userId);
      
    } catch (error) {
      console.error(`Sync failed for ${dataType}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Detect conflicts between local and server data
   */
  detectConflicts(localData, serverData) {
    const conflicts = [];
    
    for (const localItem of localData) {
      const serverItem = serverData.find(item => item.id === localItem.id);
      
      if (serverItem) {
        const localUpdated = new Date(localItem.updatedAt);
        const serverUpdated = new Date(serverItem.updatedAt);
        
        if (localUpdated > serverUpdated) {
          conflicts.push({
            type: 'local_newer',
            item: localItem,
            serverItem
          });
        } else if (serverUpdated > localUpdated) {
          conflicts.push({
            type: 'server_newer',
            item: localItem,
            serverItem
          });
        }
      }
    }
    
    return conflicts;
  }

  /**
   * Resolve conflicts based on strategy
   */
  resolveConflicts(conflicts, dataType, userId) {
    switch (this.conflictResolution) {
      case 'server':
        return this.resolveWithServerWins(conflicts, dataType, userId);
      case 'client':
        return this.resolveWithClientWins(conflicts, dataType, userId);
      case 'manual':
        return this.queueForManualResolution(conflicts, dataType, userId);
      default:
        return this.resolveWithServerWins(conflicts, dataType, userId);
    }
  }

  /**
   * Resolve conflicts with server wins
   */
  resolveWithServerWins(conflicts, dataType, userId) {
    const operations = [];
    
    for (const conflict of conflicts) {
      if (conflict.type === 'server_newer') {
        // Update local with server data
        this.updateLocalData(dataType, userId, conflict.serverItem);
      } else {
        // Update server with local data
        operations.push({
          type: 'update',
          collection: `users/${userId}/${dataType}`,
          docId: conflict.item.id,
          data: conflict.item
        });
      }
    }
    
    // Add operations to sync queue
    operations.forEach(op => this.addToSyncQueue(op));
    
    return { success: true, conflictsResolved: conflicts.length };
  }

  /**
   * Get local data
   */
  getLocalData(dataType, userId) {
    const key = `fallback_${dataType}_${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Update local data
   */
  updateLocalData(dataType, userId, item) {
    const key = `fallback_${dataType}_${userId}`;
    const data = this.getLocalData(dataType, userId);
    const index = data.findIndex(i => i.id === item.id);
    
    if (index >= 0) {
      data[index] = item;
    } else {
      data.push(item);
    }
    
    localStorage.setItem(key, JSON.stringify(data));
  }

  /**
   * Get server data
   */
  async getServerData(dataType, userId) {
    const collectionRef = collection(db, 'users', userId, dataType);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Save sync queue to localStorage
   */
  saveSyncQueue() {
    localStorage.setItem('firebase_sync_queue', JSON.stringify(this.syncQueue));
  }

  /**
   * Load sync queue from localStorage
   */
  loadSyncQueue() {
    const data = localStorage.getItem('firebase_sync_queue');
    this.syncQueue = data ? JSON.parse(data) : [];
  }

  /**
   * Generate operation ID
   */
  generateOperationId() {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      syncInProgress: this.syncInProgress,
      conflictResolution: this.conflictResolution
    };
  }

  /**
   * Clear sync queue
   */
  clearSyncQueue() {
    this.syncQueue = [];
    this.saveSyncQueue();
  }
}

// Create singleton instance
const firebaseOfflineSync = new FirebaseOfflineSyncService();

export default firebaseOfflineSync;
