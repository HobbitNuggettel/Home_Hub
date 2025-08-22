import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Package, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Utensils, 
  Zap, 
  Activity, 
  BarChart3,
  Info,
  LogOut,
  User,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DarkModeToggle from './DarkModeToggle';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const navigationItems = [
    {
      name: 'Home',
      href: '/home',
      icon: Home,
      description: 'Dashboard and overview'
    },
    {
      name: 'Inventory Management',
      href: '/inventory',
      icon: Package,
      description: 'Track household items and supplies'
    },
    {
      name: 'Spending & Budgeting',
      href: '/spending',
      icon: DollarSign,
      description: 'Monitor expenses and manage budgets'
    },
    {
      name: 'Collaboration',
      href: '/collaboration',
      icon: Users,
      description: 'Manage household members and roles'
    },
    {
      name: 'Shopping Lists',
      href: '/shopping-lists',
      icon: ShoppingCart,
      description: 'Create and manage shopping lists'
    },
    {
      name: 'Recipe Management',
      href: '/recipes',
      icon: Utensils,
      description: 'Store recipes and plan meals'
    },
    {
      name: 'Integrations & Automation',
      href: '/integrations',
      icon: Zap,
      description: 'Smart home integration and automation'
    },
    {
      name: 'Data & Alerts',
      href: '/data-alerts',
      icon: Activity,
      description: 'Analytics, monitoring, and alerts'
    },
    {
      name: 'Advanced Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'Comprehensive data insights and reporting'
    },
    {
      name: 'About',
      href: '/about',
      icon: Info,
      description: 'Features, roadmap, and information'
    }
  ];



  const userMenuItems = [
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      description: 'View and edit your profile'
    },
    {
      name: 'Settings',
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
      await logout();
      setIsMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Home className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Home Hub</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Navigation</p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* User Info */}
            {currentUser ? (
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    {userProfile?.photoURL ? (
                      <img
                        src={userProfile.photoURL}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                        <User className="text-blue-600 dark:text-blue-400" size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {userProfile?.displayName || currentUser.displayName || 'User'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium capitalize">
                      {userProfile?.role || 'user'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Not signed in</p>
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        navigate('/login');
                        setIsMenuOpen(false);
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        navigate('/signup');
                        setIsMenuOpen(false);
                      }}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Main Navigation */}
            <div className="flex-1 overflow-y-auto py-4 max-h-[60vh]">
              <div className="px-4">
                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Main Features
                </h2>
                <nav className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.name}
                        onClick={() => handleNavigation(item.href)}
                        className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" size={20} />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* User Menu */}
              {currentUser && (
                <div className="px-4 mt-6">
                  <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    User Menu
                  </h2>

                  {/* Dark Mode Toggle */}
                  <div className="mb-4 flex justify-center">
                    <DarkModeToggle showLabel={true} />
                  </div>

                  <nav className="space-y-1">
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.name}
                          onClick={() => handleNavigation(item.href)}
                          className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" size={20} />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {item.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
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

            {/* Logout Button */}
            {currentUser && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
} 