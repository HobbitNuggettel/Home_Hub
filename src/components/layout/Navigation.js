import { useState, useEffect } from 'react';
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
  Smartphone,
  ChevronLeft,
  ChevronRight,
  ChefHat,
  TrendingUp,
  Monitor,
  Database,
  AlertTriangle,
  Code,
  Building2,
  Bell,
  Cpu,
  Globe,
  FileText,
  Lock,
  CheckCircle,
  GitBranch,
  BarChart,
  PieChart,
  Gauge,
  Target,
  UserCheck,
  Search,
  Eye,
  HelpCircle,
  Palette,
  Cloud
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';
import DarkModeToggle from './DarkModeToggle.js';
import LanguageSelector from '../i18n/LanguageSelector.js';
import FixedHeader from './FixedHeader.js';
import '../../styles/sidebar.css';

export default function Navigation() {
  // Initialize sidebar state from localStorage or default to 'hidden'
  const [sidebarState, setSidebarState] = useState(() => {
    const saved = localStorage.getItem('homeHub-sidebar-state');
    return saved || 'hidden';
  });
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const userProfile = auth?.userProfile;
  const logout = auth?.logout;
  const navigate = useNavigate();

  // Organized navigation items with logical grouping
  const navigationItems = [
    // === CORE FEATURES ===
    {
      name: 'Home',
      href: '/home',
      icon: Home,
      tooltip: 'Dashboard and overview',
      section: 'core'
    },
    {
      name: 'Inventory Management',
      href: '/inventory',
      icon: Package,
      tooltip: 'Track and manage household inventory',
      section: 'core'
    },
    {
      name: 'Spending & Budgeting',
      href: '/spending',
      icon: DollarSign,
      tooltip: 'Track expenses and manage budgets',
      section: 'core'
    },
    {
      name: 'Shopping Lists',
      href: '/shopping',
      icon: ShoppingCart,
      tooltip: 'Create and manage shopping lists',
      section: 'core'
    },
    {
      name: 'Recipe Management',
      href: '/recipes',
      icon: ChefHat,
      tooltip: 'Store recipes and plan meals',
      section: 'core'
    },

    // === SMART FEATURES ===
    {
      name: 'Smart Suggestions',
      href: '/ai-suggestions',
      icon: Lightbulb,
      tooltip: 'AI-powered insights and recommendations',
      section: 'smart'
    },
    {
      name: 'Weather',
      href: '/weather',
      icon: Cloud,
      tooltip: 'Weather forecast and conditions',
      section: 'smart'
    },
    {
      name: 'Integrations & Automation',
      href: '/integrations',
      icon: Zap,
      tooltip: 'Smart home integration and automation',
      section: 'smart'
    },
    {
      name: 'Collaboration',
      href: '/collaboration',
      icon: Users,
      tooltip: 'Manage household members and roles',
      section: 'smart'
    },

    // === ANALYTICS & MONITORING ===
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      tooltip: 'Comprehensive analytics and user behavior tracking',
      section: 'analytics'
    },
    {
      name: 'Advanced Analytics',
      href: '/advanced-analytics',
      icon: TrendingUp,
      tooltip: 'Data visualization and analytics dashboard',
      section: 'analytics'
    },
    {
      name: 'Monitoring Dashboard',
      href: '/monitoring',
      icon: Monitor,
      tooltip: 'System monitoring, logs, and performance metrics',
      section: 'analytics'
    },
    {
      name: 'Performance Analytics',
      href: '/performance-analytics',
      icon: Gauge,
      tooltip: 'Real-time performance monitoring and optimization',
      section: 'analytics'
    },
    {
      name: 'Data & Alerts',
      href: '/data-alerts',
      icon: Bell,
      tooltip: 'Analytics, monitoring, and alerts',
      section: 'analytics'
    },

    // === SYSTEM & ADMIN ===
    {
      name: 'User Access',
      href: '/user-access',
      icon: UserCheck,
      tooltip: 'Manage user permissions and access control',
      section: 'admin'
    },
    {
      name: 'Enterprise',
      href: '/enterprise',
      icon: Building2,
      tooltip: 'Enterprise features: SSO, RBAC, audit logging, compliance',
      section: 'admin'
    },
    {
      name: 'Data Validation',
      href: '/validation',
      icon: CheckCircle,
      tooltip: 'Data validation, sanitization, and testing tools',
      section: 'admin'
    },
    {
      name: 'API Versioning',
      href: '/api-versioning',
      icon: GitBranch,
      tooltip: 'API version management and migration tools',
      section: 'admin'
    },

    // === APP FEATURES ===
    {
      name: 'PWA Settings',
      href: '/pwa',
      icon: Smartphone,
      tooltip: 'Progressive Web App settings and features',
      section: 'app'
    },
    {
      name: 'Offline Support',
      href: '/offline',
      icon: Database,
      tooltip: 'Offline data management and synchronization',
      section: 'app'
    },
    {
      name: 'Real-time Demo',
      href: '/real-time-demo',
      icon: Wifi,
      tooltip: 'Phase 2: Real-time collaboration features',
      section: 'app'
    },

    // === CUSTOMIZATION ===
    {
      name: 'Theme Settings',
      href: '/theme-settings',
      icon: Settings,
      tooltip: 'Customize app colors and themes',
      section: 'customization'
    },
    {
      name: 'Color Picker',
      href: '/color-picker',
      icon: Palette,
      tooltip: 'Test and experiment with different color schemes',
      section: 'customization'
    },

    // === INFORMATION ===
    {
      name: 'About',
      href: '/about',
      icon: Info,
      tooltip: 'Features, roadmap, and information',
      section: 'info'
    }
  ];

  const userMenuItems = [
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      tooltip: 'View and edit your profile'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      tooltip: 'Application preferences'
    }
  ];

  // Toggle sidebar through three states - exactly like HomeVault
  const toggleSidebar = () => {
    const body = document.body;
    let newState;

    // State 1: Hidden → Collapsed (show icons)
    if (!body.classList.contains('sidebar-visible') && !body.classList.contains('sidebar-collapsed')) {
      newState = 'collapsed';
      setSidebarState(newState);
      body.classList.add('sidebar-collapsed');
    }
    // State 2: Collapsed → Expanded (show full)
    else if (body.classList.contains('sidebar-collapsed')) {
      newState = 'expanded';
      setSidebarState(newState);
      body.classList.remove('sidebar-collapsed');
      body.classList.add('sidebar-visible');
    }
    // State 3: Expanded → Hidden
    else {
      newState = 'hidden';
      setSidebarState(newState);
      body.classList.remove('sidebar-visible');
    }

    // Save state to localStorage
    localStorage.setItem('homeHub-sidebar-state', newState);
  };

  // Handle navigation - keep sidebar state persistent
  const handleNavigation = (href) => {
    navigate(href);
    // Don't reset sidebar state - let it persist across pages
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      console.log('🚪 Logout button clicked');
      await logout();
      // Reset sidebar state only on logout
      setSidebarState('hidden');
      localStorage.removeItem('homeHub-sidebar-state');
      document.body.classList.remove('sidebar-visible', 'sidebar-collapsed');
      navigate('/login');
    } catch (error) {
      console.error('❌ Logout error:', error);
      setSidebarState('hidden');
      localStorage.removeItem('homeHub-sidebar-state');
      document.body.classList.remove('sidebar-visible', 'sidebar-collapsed');
      navigate('/login');
    }
  };

  // Get current path for active state
  const currentPath = window.location.pathname;

  // Effect to manage content shifting when sidebar state changes
  useEffect(() => {
    const body = document.body;

    // Remove all sidebar classes first
    body.classList.remove('sidebar-visible', 'sidebar-collapsed');

    // Apply appropriate class based on state
    if (sidebarState === 'collapsed') {
      body.classList.add('sidebar-collapsed');
    } else if (sidebarState === 'expanded') {
      body.classList.add('sidebar-visible');
    }
    // For 'hidden' state, no classes are added (sidebar stays hidden)

    // Don't remove classes on unmount - let them persist for navigation
    return () => {
      // No cleanup needed - preserve state across navigation
    };
  }, [sidebarState]);

  return (
    <>
      {/* Fixed Header */}
      <FixedHeader
        onMenuToggle={toggleSidebar}
        isMenuOpen={sidebarState !== 'hidden'}
      />

      {/* Sidebar */}
      <aside className="sidebar" id="sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Home size={20} />
            </div>
            <div className="sidebar-logo-text">Home Hub</div>
          </div>
        </div>

        {/* Main Navigation */}
        <ul className="sidebar-menu">
          {/* Render sections dynamically */}
          {['core', 'smart', 'analytics', 'admin', 'app', 'customization', 'info'].map((section) => {
            const sectionItems = navigationItems.filter(item => item.section === section);
            if (sectionItems.length === 0) return null;

            const sectionNames = {
              'core': 'Core Features',
              'smart': 'Smart Features',
              'analytics': 'Analytics & Monitoring',
              'admin': 'System & Admin',
              'app': 'App Features',
              'customization': 'Customization',
              'info': 'Information'
            };

            return (
              <div key={section}>
                <div className="sidebar-section-header">{sectionNames[section]}</div>
                {sectionItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <li
                      key={item.name}
                      className={`sidebar-item ${currentPath === item.href ? 'active' : ''} ${item.action ? 'action' : ''}`}
                      data-tooltip={sidebarState === 'collapsed' ? item.tooltip : ''}
                    >
                      <button
                        onClick={() => handleNavigation(item.href)}
                        onKeyDown={(e) => e.key === 'Enter' && handleNavigation(item.href)}
                        className="sidebar-item-button"
                        aria-label={item.name}
                        tabIndex={0}
                      >
                        <span className="sidebar-icon">
                          <IconComponent size={20} />
                        </span>
                        <span className="sidebar-text">{item.name}</span>
                      </button>
                    </li>
                  );
                })}
              </div>
            );
          })}

        </ul>

        {/* Theme Toggle - Always Visible */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Theme
          </div>
          <div className="mb-3 flex justify-center">
            <DarkModeToggle showLabel={sidebarState === 'expanded'} />
          </div>
        </div>

        {/* User Menu */}
        {currentUser && (
          <>
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                User Menu
              </div>

              {/* Language Selector */}
              <div className="mb-3 flex justify-center">
                <LanguageSelector
                  variant="dropdown"
                  showFlag={true}
                  showName={sidebarState === 'expanded'}
                />
              </div>

              <ul className="space-y-1">
                {userMenuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <li
                      key={item.name}
                      className={`sidebar-item ${currentPath === item.href ? 'active' : ''}`}
                      data-tooltip={sidebarState === 'collapsed' ? item.tooltip : ''}
                    >
                      <button
                        onClick={() => handleNavigation(item.href)}
                        onKeyDown={(e) => e.key === 'Enter' && handleNavigation(item.href)}
                        className="sidebar-item-button"
                        aria-label={item.name}
                      >
                        <span className="sidebar-icon">
                          <IconComponent size={20} />
                        </span>
                        <span className="sidebar-text">{item.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* User Info */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="text-blue-600 dark:text-blue-400" size={16} />
                  )}
                </div>
                {sidebarState === 'expanded' && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {userProfile?.displayName || currentUser.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {currentUser.email}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium capitalize">
                      {userProfile?.role || 'user'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <div className="px-4 py-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                data-tooltip={sidebarState === 'collapsed' ? 'Logout' : ''}
              >
                <LogOut size={16} />
                {sidebarState === 'expanded' && <span>Logout</span>}
              </button>
            </div>
          </>
        )}

        {/* Guest User Actions */}
        {!currentUser && (
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Not signed in</p>
              <div className="space-y-2">
                <button
                  onClick={() => handleNavigation('/login')}
                  className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavigation('/signup')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}