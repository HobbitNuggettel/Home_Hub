/**
 * Home Hub API Service
 * Centralized service for all API communications
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Get request headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email, password, displayName) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
  }

  async logout() {
    this.clearToken();
    return { success: true, message: 'Logged out successfully' };
  }

  // User management
  async getUserProfile() {
    return this.request('/api/users/profile');
  }

  async updateUserProfile(profileData) {
    return this.request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Inventory management
  async getInventoryItems(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/api/inventory?${queryParams}`);
  }

  async createInventoryItem(itemData) {
    return this.request('/api/inventory', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateInventoryItem(id, itemData) {
    return this.request(`/api/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  async deleteInventoryItem(id) {
    return this.request(`/api/inventory/${id}`, {
      method: 'DELETE',
    });
  }

  // Spending tracking
  async getSpendingTransactions(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/api/spending?${queryParams}`);
  }

  async createSpendingTransaction(transactionData) {
    return this.request('/api/spending', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async updateSpendingTransaction(id, transactionData) {
    return this.request(`/api/spending/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData),
    });
  }

  async deleteSpendingTransaction(id) {
    return this.request(`/api/spending/${id}`, {
      method: 'DELETE',
    });
  }

  // Budget management
  async getBudgets() {
    return this.request('/api/budget');
  }

  async createBudget(budgetData) {
    return this.request('/api/budget', {
      method: 'POST',
      body: JSON.stringify(budgetData),
    });
  }

  async updateBudget(id, budgetData) {
    return this.request(`/api/budget/${id}`, {
      method: 'PUT',
      body: JSON.stringify(budgetData),
    });
  }

  async deleteBudget(id) {
    return this.request(`/api/budget/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getAnalyticsOverview() {
    return this.request('/api/analytics/overview');
  }

  async getAnalyticsData(type, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/api/analytics/${type}?${queryParams}`);
  }

  // Notifications
  async getNotifications() {
    return this.request('/api/notifications');
  }

  async markNotificationAsRead(id) {
    return this.request(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async deleteNotification(id) {
    return this.request(`/api/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // Collaboration
  async getCollaborationData() {
    return this.request('/api/collaboration');
  }

  async updateCollaborationSettings(settings) {
    return this.request('/api/collaboration/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // API status
  async getApiStatus() {
    try {
      return await this.request('/api/status');
    } catch (error) {
      return { status: 'offline', error: error.message };
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
