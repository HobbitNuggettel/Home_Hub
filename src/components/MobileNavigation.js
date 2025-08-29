import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, X, Home, Package, DollarSign, Users, ShoppingCart, 
  Utensils, Zap, Activity, Info, Lightbulb, Wifi, Shield, 
  BarChart3, User, Settings, LogOut, Bell, TrendingUp
} from 'lucide-react';
import apiService from '../services/apiService';
import DarkModeToggle from './DarkModeToggle';

/**
 * Enhanced Mobile Navigation Component
 * Provides optimized mobile experience with API integration
 */
const MobileNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [notifications, setNotifications] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  // Check API status on component mount
  useEffect(() => {
    checkApiStatus();
    loadUserProfile();
    loadNotifications();
  }, []);

  // Check API connectivity
  const checkApiStatus = async () => {
    try {
      const status = await apiService.healthCheck();
      setApiStatus(status ? 'online' : 'offline');
    } catch (error) {
      setApiStatus('offline');
    }
  };

  // Load user profile
  const loadUserProfile = async () => {
    try {
      const profile = await apiService.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.log('User not authenticated or API offline');
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    try {
      const notifs = await apiService.getNotifications();
      setNotifications(notifs);
    } catch (error) {
      console.log('Could not load notifications');
    }
  };

  // Navigation items with enhanced mobile experience
  const navigationItems = [
    {
      name: '🏠 Home',
      href: '/home',
      icon: Home,
      description: 'Dashboard and overview',
      badge: null
    },
    {
      name: '📦 Inventory Management',
      href: '/inventory',
      icon: Package,
      description: 'Track household items and supplies',
      badge: null
    },
    {
      name: '💰 Spending & Budgeting',
      href: '/spending',
      icon: DollarSign,
      description: 'Monitor expenses and manage budgets',
      badge: null
    },
    {
      name: '👥 Collaboration',
      href: '/collaboration',
      icon: Users,
      description: 'Manage household members and roles',
      badge: null
    },
    {
      name: '🛒 Shopping Lists',
      href: '/shopping-lists',
      icon: ShoppingCart,
      description: 'Create and manage shopping lists',
      badge: null
    },
    {
      name: '🍳 Recipe Management',
      href: '/recipes',
      icon: Utensils,
      description: 'Store recipes and plan meals',
      badge: null
    },
    {
      name: '⚡ Integrations & Automation',
      href: '/integrations',
      icon: Zap,
      description: 'Smart home integration and automation',
      badge: null
    },
    {
      name: '📊 Data & Alerts',
      href: '/data-alerts',
      icon: Activity,
      description: 'Analytics, monitoring, and alerts',
      badge: null
    },
    {
      name: 'ℹ️ About',
      href: '/about',
      icon: Info,
      description: 'Features, roadmap, and information',
      badge: null
    },
    {
      name: '🧠 Smart Suggestions',
      href: '/ai-suggestions',
      icon: Lightbulb,
      description: 'AI-powered insights and recommendations',
      badge: null
    },
    {
      name: '🚀 Real-time Demo',
      href: '/real-time-demo',
      icon: Wifi,
      description: 'Phase 2: Real-time collaboration features',
      badge: 'NEW'
    },
    {
      name: '🔐 User Access',
      href: '/user-access',
      icon: Shield,
      description: 'Manage user permissions and access control',
      badge: null
    },
    {
      name: '📈 Advanced Analytics',
      href: '/advanced-analytics',
      icon: BarChart3,
      description: 'Data visualization and analytics dashboard',
      badge: null
    },
    {
      name: '⚡ Performance Analytics',
      href: '/performance-analytics',
      icon: TrendingUp,
      description: 'Real-time performance monitoring and optimization',
      badge: null
    }
  ];

  const userMenuItems = [
    {
      name: '👤 Profile',
      href: '/profile',
      icon: User,
      description: 'View and edit your profile'
    },
    {
      name: '⚙️ Settings',
      href: '/settings',
      icon: Settings,
      description: 'Application preferences'
    }
  ];

  const handleNavigation = (href) => {
    navigate(href);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      setIsMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      // Refresh data when opening menu
      checkApiStatus();
      loadNotifications();
    }
  };

  // Get API status indicator
  const getApiStatusIndicator = () => {
    switch (apiStatus) {
      case 'online':
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />;
      case 'offline':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-spin" />;
    }
  };

  return (
    <>
      {/* Enhanced Hamburger Menu Button */}
      <button
        onClick={handleMenuToggle}
        className="fixed top-4 left-4 z-[9999] p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 shadow-lg mobile-nav-button group"
        aria-label="Open menu"
      >
        <Menu size={24} className="group-hover:scale-110 transition-transform" />
        
        {/* API Status Indicator */}
        <div className="absolute -top-1 -right-1">
          {getApiStatusIndicator()}
        </div>
      </button>

      {/* Enhanced Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9998] backdrop-blur-sm">
          <div className="fixed left-0 top-0 h-full w-[95vw] max-w-sm bg-white dark:bg-gray-800 shadow-xl flex flex-col overflow-hidden mobile-nav-container">
            
            {/* Enhanced Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Home className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Home Hub</h1>
                  <div className="flex items-center space-x-2 text-sm opacity-90">
                    <span>Mobile Navigation</span>
                    {getApiStatusIndicator()}
                    <span className="text-xs">{apiStatus}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleMenuToggle}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* User Info Section */}
            {userProfile ? (
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    {userProfile.photoURL ? (
                      <img
                        src={userProfile.photoURL}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="text-blue-600 dark:text-blue-400" size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {userProfile.displayName || 'User'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{userProfile.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full capitalize">
                        {userProfile.role || 'user'}
                      </span>
                      {notifications.length > 0 && (
                        <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full">
                          {notifications.length} notifications
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Not signed in</p>
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        navigate('/login');
                        setIsMenuOpen(false);
                      }}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        navigate('/signup');
                        setIsMenuOpen(false);
                      }}
                      className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Main Navigation */}
            <div className="flex-1 overflow-y-auto py-4 relative mobile-nav-menu mobile-nav-content">
              {/* Scroll indicator */}
              <div className="absolute top-0 right-2 w-1 h-8 bg-gradient-to-b from-blue-400 to-transparent rounded-full opacity-60 pointer-events-none"></div>
              
              <div className="px-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Main Features
                  </h2>
                  <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {navigationItems.length} items
                  </span>
                </div>
                
                <nav className="space-y-2 pb-4">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.name}
                        onClick={() => handleNavigation(item.href)}
                        className="w-full text-left p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-all duration-200 group touch-manipulation border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Icon className="text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" size={22} />
                            {item.badge && (
                              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Enhanced User Menu */}
              {userProfile && (
                <div className="px-4 mt-6 pb-4">
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                    User Menu
                  </h2>

                  {/* Dark Mode Toggle */}
                  <div className="mb-4 flex justify-center">
                    <DarkModeToggle showLabel={true} />
                  </div>

                  <nav className="space-y-2">
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.name}
                          onClick={() => handleNavigation(item.href)}
                          className="w-full text-left p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-all duration-200 group touch-manipulation border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" size={22} />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {item.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              )}
            </div>

            {/* Enhanced Logout Button */}
            {userProfile && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900 dark:to-red-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 active:bg-red-800 transition-all duration-200 shadow-lg"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavigation;
