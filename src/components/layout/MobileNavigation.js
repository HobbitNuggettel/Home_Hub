import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Package, DollarSign, Users, ShoppingCart, 
  Utensils, Zap, Activity, Info, Lightbulb, Wifi, Shield, 
  BarChart3, User, Settings, TrendingUp
} from 'lucide-react';
import apiService from '../services/apiService';
import DarkModeToggle from './DarkModeToggle';
import {
  MobileMenuButton,
  MobileMenuHeader,
  MobileUserSection,
  MobileNavigationList,
  MobileMenuFooter
} from '../mobile';

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

  // Navigation items with enhanced mobile experience - organized by priority
  const navigationItems = [
    // CORE FEATURES - Most important daily use features
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

    // COLLABORATION & AI - Smart features
    {
      name: '👥 Collaboration',
      href: '/collaboration',
      icon: Users,
      description: 'Manage household members and roles',
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

    // INTEGRATIONS & AUTOMATION - Smart home features
    {
      name: '⚡ Integrations & Automation',
      href: '/integrations',
      icon: Zap,
      description: 'Smart home integration and automation',
      badge: null
    },

    // ANALYTICS & MONITORING - Data insights
    {
      name: '📊 Data & Alerts',
      href: '/data-alerts',
      icon: Activity,
      description: 'Analytics, monitoring, and alerts',
      badge: null
    },

    // INFORMATION - Help and about
    {
      name: 'ℹ️ About',
      href: '/about',
      icon: Info,
      description: 'Features, roadmap, and information',
      badge: null
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
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when menu is closed
      document.body.style.overflow = 'unset';
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.mobile-menu')) {
        setIsMenuOpen(false);
        document.body.style.overflow = 'unset';
      }
    };

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Enhanced Hamburger Menu Button */}
      <MobileMenuButton
        onClick={handleMenuToggle}
        isOpen={isMenuOpen}
        apiStatus={apiStatus}
      />

      {/* Enhanced Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9998] backdrop-blur-sm">
          <div className="mobile-menu fixed left-0 top-0 h-full w-[95vw] max-w-sm bg-white dark:bg-gray-800 shadow-xl flex flex-col overflow-hidden mobile-nav-container">
            
            {/* Enhanced Header */}
            <MobileMenuHeader
              onClose={handleMenuToggle}
              apiStatus={apiStatus}
            />

            {/* User Info Section */}
            <MobileUserSection
              userProfile={userProfile}
              notifications={notifications}
              onLogin={() => {
                navigate('/login');
                setIsMenuOpen(false);
              }}
              onSignup={() => {
                navigate('/signup');
                setIsMenuOpen(false);
              }}
            />

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
                
                <MobileNavigationList
                  items={navigationItems}
                  onNavigate={handleNavigation}
                />
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

                  <MobileNavigationList
                    items={userMenuItems}
                    onNavigate={handleNavigation}
                  />
                </div>
              )}
            </div>

            {/* Enhanced Logout Button */}
            <MobileMenuFooter
              userProfile={userProfile}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavigation;
