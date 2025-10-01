import { useState } from 'react';
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
  Settings,
  Lightbulb,
  Wifi,
  Shield,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DarkModeToggle from './DarkModeToggle';
import LanguageSelector from '../i18n/LanguageSelector';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const userProfile = auth?.userProfile;
  const logout = auth?.logout;
  const navigate = useNavigate();

  // Debug logging
  console.log('Navigation render - currentUser:', currentUser);
  console.log('Navigation render - userProfile:', userProfile);

  const navigationItems = [
    // CORE FEATURES - Most important daily use features
    {
      name: '🏠 Home',
      href: '/home',
      icon: Home,
      description: 'Dashboard and overview'
    },
    {
      name: '📦 Inventory Management',
      href: '/inventory',
      icon: Package,
      description: 'Track household items and supplies'
    },
    {
      name: '💰 Spending & Budgeting',
      href: '/spending',
      icon: DollarSign,
      description: 'Monitor expenses and manage budgets'
    },
    {
      name: '🛒 Shopping Lists',
      href: '/shopping-lists',
      icon: ShoppingCart,
      description: 'Create and manage shopping lists'
    },
    {
      name: '🍳 Recipe Management',
      href: '/recipes',
      icon: Utensils,
      description: 'Store recipes and plan meals'
    },

    // COLLABORATION & AI - Smart features
    {
      name: '👥 Collaboration',
      href: '/collaboration',
      icon: Users,
      description: 'Manage household members and roles'
    },
    {
      name: '🧠 Smart Suggestions',
      href: '/ai-suggestions',
      icon: Lightbulb,
      description: 'AI-powered insights and recommendations'
    },
    {
      name: '🚀 Real-time Demo',
      href: '/real-time-demo',
      icon: Wifi,
      description: 'Phase 2: Real-time collaboration features'
    },

    // INTEGRATIONS & AUTOMATION - Smart home features
    {
      name: '⚡ Integrations & Automation',
      href: '/integrations',
      icon: Zap,
      description: 'Smart home integration and automation'
    },
    {
      name: '📱 PWA Settings',
      href: '/pwa',
      icon: Smartphone,
      description: 'Progressive Web App settings and features'
    },
    {
      name: '📱 Offline Support',
      href: '/offline',
      icon: Wifi,
      description: 'Offline data management and synchronization'
    },

    // ANALYTICS & MONITORING - Data insights
    {
      name: '📊 Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'Comprehensive analytics and user behavior tracking'
    },
    {
      name: '📊 Advanced Analytics',
      href: '/advanced-analytics',
      icon: BarChart3,
      description: 'Data visualization and analytics dashboard'
    },
    {
      name: '📈 Monitoring Dashboard',
      href: '/monitoring',
      icon: BarChart3,
      description: 'System monitoring, logs, and performance metrics'
    },
    {
      name: '⚡ Performance Analytics',
      href: '/performance-analytics',
      icon: Activity,
      description: 'Real-time performance monitoring and optimization'
    },
    {
      name: '📊 Data & Alerts',
      href: '/data-alerts',
      icon: Activity,
      description: 'Analytics, monitoring, and alerts'
    },

    // ADMINISTRATION & SECURITY - Management features
    {
      name: '🔐 User Access',
      href: '/user-access',
      icon: Shield,
      description: 'Manage user permissions and access control'
    },
    {
      name: '🛡️ Data Validation',
      href: '/validation',
      icon: Shield,
      description: 'Data validation, sanitization, and testing tools'
    },
    {
      name: '🔧 API Versioning',
      href: '/api-versioning',
      icon: Settings,
      description: 'API version management and migration tools'
    },
    {
      name: '🏢 Enterprise',
      href: '/enterprise',
      icon: Shield,
      description: 'Enterprise features: SSO, RBAC, audit logging, compliance'
    },

    // INFORMATION - Help and about
    {
      name: 'ℹ️ About',
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

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Logout button clicked');
      console.log('Current user before logout:', currentUser);
      console.log('Logout function:', logout);

      const result = await logout();
      console.log('✅ Logout successful:', result);

      setIsMenuOpen(false);
      console.log('Menu closed, navigating to login...');
      navigate('/login');
    } catch (error) {
      console.error('❌ Logout error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      // Even if logout fails, close menu and redirect
      setIsMenuOpen(false);
      navigate('/login');
    }
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        onClick={handleMenuToggle}
        className="fixed top-4 left-4 z-[9999] p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-lg md:p-2 mobile-nav-button"
        aria-label="Open menu"

      >
        <Menu size={24} />

      </button>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9998]">

          <div className="fixed left-0 top-0 h-full w-[95vw] max-w-sm bg-white dark:bg-gray-800 shadow-xl flex flex-col overflow-hidden mobile-nav-container">
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
            <div className="flex-1 overflow-y-auto py-4 relative mobile-nav-menu mobile-nav-content">
              {/* Scroll indicator */}
              <div className="absolute top-0 right-2 w-1 h-8 bg-gradient-to-b from-blue-400 to-transparent rounded-full opacity-60 pointer-events-none"></div>
              <div className="px-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Main Features
                  </h2>
                  <span className="text-xs text-gray-400 dark:text-gray-500">({navigationItems.length} items) - Scroll to see all</span>
                  <Link
                    to="/logout-test"
                    className="text-xs text-blue-500 hover:text-blue-700 underline"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Test Logout
                  </Link>
                </div>
                <nav className="space-y-1 pb-4">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.name}
                        onClick={() => handleNavigation(item.href)}
                        className="w-full text-left p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors group touch-manipulation"
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
                <div className="px-4 mt-6 pb-4">
                  <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    User Menu
                  </h2>

                  {/* Dark Mode Toggle */}
                  <div className="mb-4 flex justify-center">
                    <DarkModeToggle showLabel={true} />
                  </div>

                  {/* Language Selector */}
                  <div className="mb-4 flex justify-center">
                    <LanguageSelector variant="dropdown" showFlag={true} showName={true} />
                  </div>

                  <nav className="space-y-1">
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.name}
                          onClick={() => handleNavigation(item.href)}
                          className="w-full text-left p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors group touch-manipulation"
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
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-all duration-200 shadow-lg"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>

                {/* Debug info - remove this later */}
                <div className="mt-2 text-xs text-gray-500 text-center">
                  User: {currentUser?.email || 'Unknown'} | Click to logout
                </div>
                <div className="mt-1 text-xs text-gray-400 text-center">
                  Auth Status: {currentUser ? '✅ Authenticated' : '❌ Not Authenticated'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
} 