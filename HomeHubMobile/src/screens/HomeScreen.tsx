import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../contexts/OfflineContext';

const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { isOnline, syncData, isDataStale } = useOffline();
  const [refreshing, setRefreshing] = useState(false);
  const [quickStats, setQuickStats] = useState({
    inventory: 0,
    spending: 0,
    alerts: 0,
  });

  useEffect(() => {
    loadQuickStats();
  }, []);

  const loadQuickStats = () => {
    // Mock data - replace with actual data loading
    setQuickStats({
      inventory: 156,
      spending: 3850,
      alerts: 3,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await syncData();
      loadQuickStats();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout },
      ]
    );
  };

  const QuickActionCard = ({ icon, title, subtitle, onPress, color }: any) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <LinearGradient
        colors={[color, color + '80']}
        style={styles.quickActionGradient}
      >
        <Ionicons name={icon} size={32} color="white" />
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const StatCard = ({ icon, value, label, color }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Connection Status */}
        <View style={styles.connectionStatus}>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#EF4444' }]} />
          <Text style={styles.statusText}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
          {!isOnline && (
            <Text style={styles.offlineNote}>Working offline</Text>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="cube"
            value={quickStats.inventory}
            label="Items"
            color="#3B82F6"
          />
          <StatCard
            icon="card"
            value={`$${quickStats.spending}`}
            label="Spent"
            color="#10B981"
          />
          <StatCard
            icon="alert-circle"
            value={quickStats.alerts}
            label="Alerts"
            color="#F59E0B"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              icon="add-circle"
              title="Add Item"
              subtitle="New inventory item"
              onPress={() => Alert.alert('Add Item', 'Navigate to inventory')}
              color="#3B82F6"
            />
            <QuickActionCard
              icon="card-outline"
              title="Log Expense"
              subtitle="Track spending"
              onPress={() => Alert.alert('Log Expense', 'Navigate to spending')}
              color="#10B981"
            />
            <QuickActionCard
              icon="analytics-outline"
              title="View Analytics"
              subtitle="See insights"
              onPress={() => Alert.alert('Analytics', 'Navigate to analytics')}
              color="#8B5CF6"
            />
            <QuickActionCard
              icon="settings-outline"
              title="Settings"
              subtitle="App preferences"
              onPress={() => Alert.alert('Settings', 'Navigate to settings')}
              color="#F59E0B"
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {[
              { icon: 'add', text: 'Added Coffee Maker to inventory', time: '2h ago', color: '#10B981' },
              { icon: 'card', text: 'Logged grocery expense: $45.20', time: '4h ago', color: '#3B82F6' },
              { icon: 'alert', text: 'Low stock alert: Paper towels', time: '1d ago', color: '#F59E0B' },
            ].map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                  <Ionicons name={activity.icon as any} size={16} color={activity.color} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{activity.text}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Sync Status */}
        {isDataStale('inventory') && (
          <View style={styles.syncWarning}>
            <Ionicons name="warning" size={20} color="#F59E0B" />
            <Text style={styles.syncWarningText}>
              Data may be outdated. Pull to refresh.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutButton: {
    padding: 8,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  offlineNote: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  quickActionsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    marginBottom: 15,
  },
  quickActionGradient: {
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  quickActionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  quickActionSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
  recentActivityContainer: {
    marginBottom: 30,
  },
  activityList: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  syncWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  syncWarningText: {
    color: '#92400E',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default HomeScreen;
