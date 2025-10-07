import { ref, onValue, off, set, push, update, remove } from 'firebase/database';
import { realtimeDb } from '../firebase/config.js';

/**
 * Real-time Service for Home Hub Phase 2
 * Handles real-time collaboration, live updates, and multi-user interactions
 */
class RealTimeService {
  constructor() {
    this.listeners = new Map();
    this.connectionStatus = 'disconnected';
    this.mockMode = false;
    this.mockData = new Map();
    this.mockListeners = new Map();
    this.setupConnectionMonitoring();
  }

  /**
   * Monitor connection status
   */
  setupConnectionMonitoring() {
    try {
      const connectedRef = ref(realtimeDb, '.info/connected');
      onValue(connectedRef, (snapshot) => {
        const newStatus = snapshot.val() ? 'connected' : 'disconnected';
        if (this.connectionStatus !== newStatus) {
          this.connectionStatus = newStatus;
          console.log('🔄 Real-time connection status:', this.connectionStatus);
        }
      });
    } catch (error) {
      console.warn('⚠️ Firebase Realtime Database not available, using mock mode');
      this.mockMode = true;
      this.connectionStatus = 'connected'; // Mock as connected
      this.startMockMode();
    }
  }

  /**
   * Start mock mode for development
   */
  startMockMode() {
    console.log('🎭 Starting mock real-time mode for development');
    
    // Simulate connection monitoring
    setInterval(() => {
      this.connectionStatus = 'connected';
    }, 5000);
  }

  /**
   * Subscribe to real-time updates for a specific path
   * @param {string} path - Database path to listen to
   * @param {Function} callback - Callback function for updates
   * @param {string} listenerId - Unique identifier for this listener
   */
  subscribe(path, callback, listenerId) {
    // Remove existing listener if it exists
    if (this.listeners.has(listenerId)) {
      this.unsubscribe(listenerId);
    }

    if (this.mockMode) {
      return this.mockSubscribe(path, callback, listenerId);
    }

    try {
      const dbRef = ref(realtimeDb, path);
      const unsubscribe = onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        callback(data, snapshot.key);
      });

      this.listeners.set(listenerId, { path, unsubscribe, callback });
      // Only log on first subscription to reduce noise
      if (this.listeners.size <= 3) {
        console.log(`🔔 Subscribed to real-time updates: ${path}`);
      }
      
      return unsubscribe;
    } catch (error) {
      console.warn('⚠️ Falling back to mock mode for subscription');
      this.mockMode = true;
      return this.mockSubscribe(path, callback, listenerId);
    }
  }

  /**
   * Mock subscription for development
   */
  mockSubscribe(path, callback, listenerId) {
    const mockListener = {
      path,
      callback,
      interval: null
    };

    // Simulate real-time updates
    mockListener.interval = setInterval(() => {
      const data = this.mockData.get(path) || null;
      callback(data, path.split('/').pop());
    }, 1000);

    this.mockListeners.set(listenerId, mockListener);
    console.log(`🎭 Mock subscribed to: ${path}`);
    
    // Return mock unsubscribe function
    return () => {
      this.mockUnsubscribe(listenerId);
    };
  }

  /**
   * Unsubscribe from real-time updates
   * @param {string} listenerId - Listener identifier to remove
   */
  unsubscribe(listenerId) {
    if (this.mockMode) {
      this.mockUnsubscribe(listenerId);
      return;
    }

    if (this.listeners.has(listenerId)) {
      const listener = this.listeners.get(listenerId);
      listener.unsubscribe();
      this.listeners.delete(listenerId);
      // Only log on final unsubscription to reduce noise
      if (this.listeners.size === 0) {
        console.log(`🔕 All real-time listeners unsubscribed`);
      }
    }
  }

  /**
   * Mock unsubscribe
   */
  mockUnsubscribe(listenerId) {
    if (this.mockListeners.has(listenerId)) {
      const listener = this.mockListeners.get(listenerId);
      if (listener.interval) {
        clearInterval(listener.interval);
      }
      this.mockListeners.delete(listenerId);
      console.log(`🎭 Mock unsubscribed from: ${listener.path}`);
    }
  }

  /**
   * Set data at a specific path
   * @param {string} path - Database path
   * @param {any} data - Data to set
   * @returns {Promise} - Promise that resolves when data is set
   */
  async setData(path, data) {
    try {
      if (this.mockMode) {
        return this.mockSetData(path, data);
      }

      const dbRef = ref(realtimeDb, path);
      await set(dbRef, {
        ...data,
        lastUpdated: Date.now(),
        updatedBy: this.getCurrentUserId()
      });
      console.log(`✅ Data set successfully at: ${path}`);
      return true;
    } catch (error) {
      console.error(`❌ Error setting data at ${path}:`, error);
      // Fall back to mock mode
      if (!this.mockMode) {
        console.warn('⚠️ Falling back to mock mode for data operations');
        this.mockMode = true;
      }
      return this.mockSetData(path, data);
    }
  }

  /**
   * Mock set data
   */
  async mockSetData(path, data) {
    const enhancedData = {
      ...data,
      lastUpdated: Date.now(),
      updatedBy: this.getCurrentUserId()
    };
    
    this.mockData.set(path, enhancedData);
    console.log(`🎭 Mock data set at: ${path}`, enhancedData);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
  }

  /**
   * Push new data to a list
   * @param {string} path - Database path for the list
   * @param {any} data - Data to add
   * @returns {Promise<string>} - Promise that resolves to the new item's key
   */
  async pushData(path, data) {
    try {
      if (this.mockMode) {
        return this.mockPushData(path, data);
      }

      const dbRef = ref(realtimeDb, path);
      const newRef = push(dbRef);
      await set(newRef, {
        ...data,
        createdAt: Date.now(),
        createdBy: this.getCurrentUserId(),
        lastUpdated: Date.now(),
        updatedBy: this.getCurrentUserId()
      });
      console.log(`✅ Data pushed successfully to: ${path}`);
      return newRef.key;
    } catch (error) {
      console.error(`❌ Error pushing data to ${path}:`, error);
      if (!this.mockMode) {
        this.mockMode = true;
      }
      return this.mockPushData(path, data);
    }
  }

  /**
   * Mock push data
   */
  async mockPushData(path, data) {
    const key = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const enhancedData = {
      ...data,
      createdAt: Date.now(),
      createdBy: this.getCurrentUserId(),
      lastUpdated: Date.now(),
      updatedBy: this.getCurrentUserId()
    };
    
    // Get existing data or create new array
    const existingData = this.mockData.get(path) || {};
    existingData[key] = enhancedData;
    this.mockData.set(path, existingData);
    
    console.log(`🎭 Mock data pushed to: ${path}`, enhancedData);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return key;
  }

  /**
   * Update data at a specific path
   * @param {string} path - Database path
   * @param {Object} updates - Partial updates to apply
   * @returns {Promise} - Promise that resolves when update is complete
   */
  async updateData(path, updates) {
    try {
      if (this.mockMode) {
        return this.mockUpdateData(path, updates);
      }

      const dbRef = ref(realtimeDb, path);
      await update(dbRef, {
        ...updates,
        lastUpdated: Date.now(),
        updatedBy: this.getCurrentUserId()
      });
      console.log(`✅ Data updated successfully at: ${path}`);
      return true;
    } catch (error) {
      console.error(`❌ Error updating data at ${path}:`, error);
      if (!this.mockMode) {
        this.mockMode = true;
      }
      return this.mockUpdateData(path, updates);
    }
  }

  /**
   * Mock update data
   */
  async mockUpdateData(path, updates) {
    const existingData = this.mockData.get(path) || {};
    const updatedData = {
      ...existingData,
      ...updates,
      lastUpdated: Date.now(),
      updatedBy: this.getCurrentUserId()
    };
    
    this.mockData.set(path, updatedData);
    console.log(`🎭 Mock data updated at: ${path}`, updatedData);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
  }

  /**
   * Remove data at a specific path
   * @param {string} path - Database path
   * @returns {Promise} - Promise that resolves when removal is complete
   */
  async removeData(path) {
    try {
      if (this.mockMode) {
        return this.mockRemoveData(path);
      }

      const dbRef = ref(realtimeDb, path);
      await remove(dbRef);
      console.log(`✅ Data removed successfully from: ${path}`);
      return true;
    } catch (error) {
      console.error(`❌ Error removing data from ${path}:`, error);
      if (!this.mockMode) {
        this.mockMode = true;
      }
      return this.mockRemoveData(path);
    }
  }

  /**
   * Mock remove data
   */
  async mockRemoveData(path) {
    this.mockData.delete(path);
    console.log(`🎭 Mock data removed from: ${path}`);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
  }

  /**
   * Get current user ID for tracking changes
   * @returns {string} - Current user ID or 'anonymous'
   */
  getCurrentUserId() {
    // This will be enhanced when we integrate with auth context
    return 'anonymous';
  }

  /**
   * Get connection status
   * @returns {string} - Current connection status
   */
  getConnectionStatus() {
    return this.connectionStatus;
  }

  /**
   * Check if running in mock mode
   * @returns {boolean} - True if in mock mode
   */
  isMockMode() {
    return this.mockMode;
  }

  /**
   * Clean up all listeners
   */
  cleanup() {
    // Clean up real listeners
    this.listeners.forEach((listener, id) => {
      this.unsubscribe(id);
    });
    
    // Clean up mock listeners
    this.mockListeners.forEach((listener, id) => {
      this.mockUnsubscribe(id);
    });
    
    console.log('🧹 All real-time listeners cleaned up');
  }

  /**
   * Get active listener count
   * @returns {number} - Number of active listeners
   */
  getActiveListenerCount() {
    return this.listeners.size + this.mockListeners.size;
  }
}

// Create singleton instance
const realTimeService = new RealTimeService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    realTimeService.cleanup();
  });
}

export default realTimeService;
