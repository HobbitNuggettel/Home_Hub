import { getDatabase, ref, get, query, orderByChild, startAt, endAt } from 'firebase/database';

/**
 * Analytics Service for Home Hub
 * Provides comprehensive data analysis and insights
 */
class AnalyticsService {
  constructor() {
    this.db = getDatabase();
  }

  /**
   * Get spending analytics for a specific time range
   * @param {string} userId - User ID
   * @param {string} timeRange - Time range (7d, 30d, 90d, 1y)
   * @returns {Promise<Object>} Spending analytics data
   */
  async getSpendingAnalytics(userId, timeRange = '30d') {
    try {
      const startDate = this.getStartDate(timeRange);
      const endDate = new Date();
      
      const spendingRef = ref(this.db, `spending/${userId}`);
      const spendingQuery = query(
        spendingRef,
        orderByChild('date'),
        startAt(startDate.getTime()),
        endAt(endDate.getTime())
      );
      
      const snapshot = await get(spendingQuery);
      const spendingData = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          spendingData.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
      }
      
      return this.processSpendingData(spendingData, timeRange);
    } catch (error) {
      console.error('Error fetching spending analytics:', error);
      return this.getMockSpendingData(timeRange);
    }
  }

  /**
   * Get inventory analytics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Inventory analytics data
   */
  async getInventoryAnalytics(userId) {
    try {
      const inventoryRef = ref(this.db, `inventory/${userId}`);
      const snapshot = await get(inventoryRef);
      const inventoryData = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          inventoryData.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
      }
      
      return this.processInventoryData(inventoryData);
    } catch (error) {
      console.error('Error fetching inventory analytics:', error);
      return this.getMockInventoryData();
    }
  }

  /**
   * Get user activity analytics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User activity data
   */
  async getUserAnalytics(userId) {
    try {
      const userRef = ref(this.db, `users/${userId}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        return this.processUserData(snapshot.val());
      }
      
      return this.getMockUserData();
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return this.getMockUserData();
    }
  }

  /**
   * Get real-time analytics data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Real-time analytics data
   */
  async getRealTimeAnalytics(userId) {
    try {
      // Get recent activities from the last 24 hours
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const activitiesRef = ref(this.db, `activities/${userId}`);
      const activitiesQuery = query(
        activitiesRef,
        orderByChild('timestamp'),
        startAt(startDate.getTime())
      );
      
      const snapshot = await get(activitiesQuery);
      const activitiesData = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          activitiesData.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
      }
      
      return this.processRealTimeData(activitiesData);
    } catch (error) {
      console.error('Error fetching real-time analytics:', error);
      return this.getMockRealTimeData();
    }
  }

  /**
   * Process spending data into analytics format
   * @param {Array} spendingData - Raw spending data
   * @param {string} timeRange - Time range
   * @returns {Object} Processed spending analytics
   */
  processSpendingData(spendingData, timeRange) {
    const categories = {};
    const monthlyData = {};
    let totalSpending = 0;
    
    spendingData.forEach(item => {
      const date = new Date(item.date);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const category = item.category || 'Other';
      
      // Aggregate by category
      if (!categories[category]) {
        categories[category] = { total: 0, count: 0, items: [] };
      }
      categories[category].total += item.amount;
      categories[category].count += 1;
      categories[category].items.push(item);
      
      // Aggregate by month
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, categories: {} };
      }
      monthlyData[month].total += item.amount;
      if (!monthlyData[month].categories[category]) {
        monthlyData[month].categories[category] = 0;
      }
      monthlyData[month].categories[category] += item.amount;
      
      totalSpending += item.amount;
    });
    
    // Convert to chart format
    const chartData = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      total: data.total,
      ...data.categories
    }));
    
    const categoryBreakdown = Object.entries(categories).map(([category, data]) => ({
      name: category,
      amount: data.total,
      percentage: (data.total / totalSpending) * 100,
      count: data.count
    }));
    
    return {
      totalSpending,
      averageSpending: totalSpending / spendingData.length || 0,
      monthlyData: chartData,
      categoryBreakdown,
      topCategories: categoryBreakdown.sort((a, b) => b.amount - a.amount).slice(0, 5)
    };
  }

  /**
   * Process inventory data into analytics format
   * @param {Array} inventoryData - Raw inventory data
   * @returns {Object} Processed inventory analytics
   */
  processInventoryData(inventoryData) {
    const categories = {};
    let totalItems = 0;
    let totalValue = 0;
    let lowStockItems = 0;
    
    inventoryData.forEach(item => {
      const category = item.category || 'Other';
      
      if (!categories[category]) {
        categories[category] = { count: 0, value: 0, items: [] };
      }
      
      categories[category].count += 1;
      categories[category].value += item.value || 0;
      categories[category].items.push(item);
      
      totalItems += 1;
      totalValue += item.value || 0;
      
      if (item.quantity <= (item.minQuantity || 1)) {
        lowStockItems += 1;
      }
    });
    
    const categoryBreakdown = Object.entries(categories).map(([category, data]) => ({
      category,
      count: data.count,
      value: data.value,
      lowStock: data.items.filter(item => item.quantity <= (item.minQuantity || 1)).length
    }));
    
    return {
      totalItems,
      totalValue,
      lowStockItems,
      categoryBreakdown,
      topCategories: categoryBreakdown.sort((a, b) => b.value - a.value).slice(0, 5)
    };
  }

  /**
   * Process user data into analytics format
   * @param {Object} userData - Raw user data
   * @returns {Object} Processed user analytics
   */
  processUserData(userData) {
    const now = new Date();
    const lastSeen = new Date(userData.lastSeen || 0);
    const isActive = (now - lastSeen) < (5 * 60 * 1000); // Active if seen in last 5 minutes
    
    return {
      name: userData.displayName || 'Unknown User',
      email: userData.email || 'No email',
      isActive,
      lastSeen: userData.lastSeen || 0,
      lastSeenFormatted: this.formatTimeAgo(lastSeen),
      totalLogins: userData.loginCount || 0,
      preferences: userData.preferences || {},
      activityScore: this.calculateActivityScore(userData)
    };
  }

  /**
   * Process real-time data into analytics format
   * @param {Array} activitiesData - Raw activities data
   * @returns {Object} Processed real-time analytics
   */
  processRealTimeData(activitiesData) {
    const hourlyData = {};
    let totalActivities = 0;
    const uniqueUsers = new Set();
    
    activitiesData.forEach(activity => {
      const date = new Date(activity.timestamp);
      const hour = date.getHours();
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;
      
      if (!hourlyData[hourKey]) {
        hourlyData[hourKey] = { activities: 0, users: new Set(), dataPoints: 0 };
      }
      
      hourlyData[hourKey].activities += 1;
      hourlyData[hourKey].users.add(activity.userId);
      hourlyData[hourKey].dataPoints += activity.dataPoints || 1;
      
      totalActivities += 1;
      uniqueUsers.add(activity.userId);
    });
    
    // Convert to chart format
    const chartData = Object.entries(hourlyData).map(([time, data]) => ({
      time,
      activities: data.activities,
      users: data.users.size,
      dataPoints: data.dataPoints
    }));
    
    return {
      totalActivities,
      uniqueUsers: uniqueUsers.size,
      hourlyData: chartData,
      averageActivitiesPerHour: totalActivities / 24,
      peakHour: this.findPeakHour(chartData)
    };
  }

  /**
   * Calculate activity score for a user
   * @param {Object} userData - User data
   * @returns {number} Activity score (0-100)
   */
  calculateActivityScore(userData) {
    let score = 0;
    
    // Login frequency (30 points)
    const loginCount = userData.loginCount || 0;
    score += Math.min(loginCount * 3, 30);
    
    // Recent activity (40 points)
    const lastSeen = new Date(userData.lastSeen || 0);
    const hoursSinceLastSeen = (Date.now() - lastSeen.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastSeen < 1) score += 40;
    else if (hoursSinceLastSeen < 24) score += 30;
    else if (hoursSinceLastSeen < 168) score += 20;
    else if (hoursSinceLastSeen < 720) score += 10;
    
    // Feature usage (30 points)
    const features = userData.features || {};
    const featureCount = Object.keys(features).length;
    score += Math.min(featureCount * 5, 30);
    
    return Math.round(score);
  }

  /**
   * Find peak activity hour
   * @param {Array} hourlyData - Hourly data
   * @returns {string} Peak hour
   */
  findPeakHour(hourlyData) {
    if (!hourlyData.length) return 'N/A';
    
    const peakHour = hourlyData.reduce((peak, current) => 
      current.activities > peak.activities ? current : peak
    );
    
    return peakHour.time;
  }

  /**
   * Format time ago
   * @param {Date} date - Date to format
   * @returns {string} Formatted time ago
   */
  formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  /**
   * Get start date for time range
   * @param {string} timeRange - Time range
   * @returns {Date} Start date
   */
  getStartDate(timeRange) {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  // Mock data methods for development
  getMockSpendingData(timeRange) {
    return {
      totalSpending: 3850,
      averageSpending: 642,
      monthlyData: [
        { month: 'Jan', groceries: 450, utilities: 120, entertainment: 80, total: 650 },
        { month: 'Feb', groceries: 380, utilities: 110, entertainment: 95, total: 585 },
        { month: 'Mar', groceries: 520, utilities: 125, entertainment: 70, total: 715 },
        { month: 'Apr', groceries: 410, utilities: 115, entertainment: 110, total: 635 },
        { month: 'May', groceries: 480, utilities: 130, entertainment: 85, total: 695 },
        { month: 'Jun', groceries: 390, utilities: 120, entertainment: 90, total: 600 }
      ],
      categoryBreakdown: [
        { name: 'Groceries', amount: 2630, percentage: 68.3, count: 6 },
        { name: 'Utilities', amount: 720, percentage: 18.7, count: 6 },
        { name: 'Entertainment', amount: 530, percentage: 13.8, count: 6 }
      ],
      topCategories: [
        { name: 'Groceries', amount: 2630, percentage: 68.3, count: 6 },
        { name: 'Utilities', amount: 720, percentage: 18.7, count: 6 },
        { name: 'Entertainment', amount: 530, percentage: 13.8, count: 6 }
      ]
    };
  }

  getMockInventoryData() {
    return {
      totalItems: 138,
      totalValue: 5500,
      lowStockItems: 22,
      categoryBreakdown: [
        { category: 'Electronics', count: 15, value: 2500, lowStock: 2 },
        { category: 'Kitchen', count: 45, value: 800, lowStock: 8 },
        { category: 'Clothing', count: 32, value: 1200, lowStock: 5 },
        { category: 'Books', count: 28, value: 400, lowStock: 3 },
        { category: 'Tools', count: 18, value: 600, lowStock: 4 }
      ],
      topCategories: [
        { category: 'Electronics', count: 15, value: 2500, lowStock: 2 },
        { category: 'Clothing', count: 32, value: 1200, lowStock: 5 },
        { category: 'Kitchen', count: 45, value: 800, lowStock: 8 }
      ]
    };
  }

  getMockUserData() {
    return {
      name: 'Demo User',
      email: 'demo@example.com',
      isActive: true,
      lastSeen: Date.now(),
      lastSeenFormatted: 'Just now',
      totalLogins: 45,
      preferences: { theme: 'light', notifications: true },
      activityScore: 85
    };
  }

  getMockRealTimeData() {
    return {
      totalActivities: 156,
      uniqueUsers: 4,
      hourlyData: [
        { time: '09:00', users: 3, activities: 12, dataPoints: 45 },
        { time: '10:00', users: 4, activities: 18, dataPoints: 67 },
        { time: '11:00', users: 2, activities: 8, dataPoints: 23 },
        { time: '12:00', users: 5, activities: 25, dataPoints: 89 },
        { time: '13:00', users: 3, activities: 15, dataPoints: 56 },
        { time: '14:00', users: 4, activities: 20, dataPoints: 78 }
      ],
      averageActivitiesPerHour: 6.5,
      peakHour: '12:00'
    };
  }
}

export default new AnalyticsService();
