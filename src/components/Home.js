import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { useDevTools } from '../contexts/DevToolsContext.js';
import { useTheme } from '../contexts/ThemeContext.js';
import hybridStorage from '../firebase/hybridStorage.js';
import AnalyticsService from '../services/AnalyticsService.js';
import { 
  Package, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Utensils, 
  Zap, 
  Activity, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Brain,
  Wrench,
  Image,
  Home as HomeIcon,
  BarChart3,
  Sparkles,
  Shield,
  Rocket,
  Heart,
  Star,
  Info
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const { isDevMode } = useDevTools();
  const { isDarkMode, colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [realData, setRealData] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({
    inventory: 0,
    budget: 0,
    recipes: 0,
    users: 0
  });
  
  // Core features - simplified and focused
  const coreFeatures = [
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Track household items with barcode scanning and smart organization',
      href: '/inventory',
      color: 'from-blue-500 to-cyan-500',
      stats: realData?.inventory?.total || 0
    },
    {
      icon: DollarSign,
      title: 'Spending & Budgeting',
      description: 'Manage finances with AI-powered insights and budget tracking',
      href: '/spending',
      color: 'from-green-500 to-emerald-500',
      stats: `$${realData?.spending?.budget || 0}`
    },
    {
      icon: Utensils,
      title: 'Recipe Management',
      description: 'Store recipes and plan meals with smart suggestions',
      href: '/recipes',
      color: 'from-red-500 to-pink-500',
      stats: realData?.recipes?.total || 0
    },
    {
      icon: ShoppingCart,
      title: 'Shopping Lists',
      description: 'Collaborative shopping with real-time updates',
      href: '/shopping',
      color: 'from-orange-500 to-amber-500',
      stats: 'Live'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Manage household members and shared tasks',
      href: '/collaboration',
      color: 'from-purple-500 to-violet-500',
      stats: 'Active'
    },
    {
      icon: Brain,
      title: 'AI Assistant',
      description: 'Get smart recommendations and automated insights',
      href: '/ai-suggestions',
      color: 'from-violet-500 to-purple-500',
      stats: 'Smart'
    },
    {
      icon: Info,
      title: 'About',
      description: 'Learn about Home Hub features, roadmap, and information',
      href: '/about',
      color: 'from-indigo-500 to-blue-500',
      stats: 'Info'
    }
  ];

  // Platform stats and highlights
  const platformStats = [
    { label: 'Active Features', value: '12+', icon: Sparkles },
    { label: 'AI Integrations', value: '3', icon: Brain },
    { label: 'Data Sources', value: 'Firebase', icon: Shield },
    { label: 'Real-time Sync', value: 'Live', icon: Zap },
    { label: 'About', value: 'Info', icon: Info }
  ];

  // Key benefits
  const benefits = [
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and stored securely with Firebase authentication'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Instant synchronization across all devices with live collaboration'
    },
    {
      icon: Brain,
      title: 'AI-Powered',
      description: 'Intelligent suggestions using Hugging Face, Gemini, and custom AI models'
    },
    {
      icon: Rocket,
      title: 'Production Ready',
      description: '73% test coverage, zero ESLint errors, and complete CI/CD pipeline'
    }
  ];

  const animateValue = useCallback((key, start, end, duration) => {
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(start + (end - start) * easeOutQuart(progress));
      setAnimatedStats(prev => ({ ...prev, [key]: current }));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, []);

  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

  // Fetch real data from Firebase
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const analyticsService = AnalyticsService;

        const [inventoryResponse, recipesResponse, spendingAnalytics] = await Promise.all([
          hybridStorage.getInventoryItems(currentUser.uid),
          hybridStorage.getRecipes(currentUser.uid),
          analyticsService.getSpendingAnalytics(currentUser.uid, '30d')
        ]);

        const inventoryItems = inventoryResponse.success ? inventoryResponse.data : [];
        const recipes = recipesResponse.success ? recipesResponse.data : [];

        const finalStats = {
          inventory: inventoryItems.length || 0,
          budget: spendingAnalytics.totalBudget || 0,
          recipes: recipes.length || 0,
          users: 1 // Current user, can be expanded with collaboration data
        };

        setRealData({
          inventory: {
            total: inventoryItems.length,
            lowStock: inventoryItems.filter(item => item.quantity <= 2).length,
            categories: [...new Set(inventoryItems.map(item => item.category))].length,
            totalValue: inventoryItems.reduce((sum, item) => sum + (item.price * item.quantity || 0), 0)
          },
          spending: {
            budget: spendingAnalytics.totalBudget || 0,
            spent: spendingAnalytics.totalSpending || 0,
            remaining: (spendingAnalytics.totalBudget || 0) - (spendingAnalytics.totalSpending || 0),
            topCategory: spendingAnalytics.topCategory || 'N/A'
          },
          recipes: {
            total: recipes.length,
            categories: [...new Set(recipes.map(r => r.category))].length
          }
        });

        setIsLoading(false);
        
        Object.keys(finalStats).forEach((key, index) => {
          setTimeout(() => {
            animateValue(key, 0, finalStats[key], 1500);
          }, index * 200);
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser, animateValue]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 dark:border-blue-800 mx-auto"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-600 dark:border-blue-400 mx-auto absolute inset-0"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-6">Loading Home Hub...</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Preparing your personalized dashboard</p>
        </div>
      </div>
    );
  }

  // Show login prompt if user is not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 pt-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
          >
            <HomeIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">Welcome to Home Hub</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Please log in to access your personalized dashboard and manage your household.</p>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/login')}
              className="w-full text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                '--hover-bg': `linear-gradient(135deg, ${colors.primary}dd, ${colors.secondary}dd)`
              }}
              onMouseEnter={(e) => e.target.style.background = `linear-gradient(135deg, ${colors.primary}dd, ${colors.secondary}dd)`}
              onMouseLeave={(e) => e.target.style.background = `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`}
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 pt-20">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Main Heading */}
            <div className="inline-flex items-center px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg mb-6 animate-fade-in-up">
              <HomeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Welcome to Home Hub v2.0</span>
              <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">Production Ready</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up animation-delay-100">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Your Complete
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                Home Management
              </span>
              <br />
              <span className="bg-gradient-to-r from-pink-600 via-red-600 to-orange-600 bg-clip-text text-transparent">
                Platform
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8 animate-fade-in-up animation-delay-200">
              Track inventory, manage finances, organize recipes, collaborate with family, 
              and automate your home—all powered by AI intelligence.
            </p>

            {/* CTA Buttons - Only show for non-logged-in users */}
            {!currentUser && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up animation-delay-300">
                <button
                  onClick={() => navigate('/login')}
                  className="group px-8 py-4 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                  }}
                  onMouseEnter={(e) => e.target.style.background = `linear-gradient(135deg, ${colors.primary}dd, ${colors.secondary}dd)`}
                  onMouseLeave={(e) => e.target.style.background = `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`}
                >
                  <span className="flex items-center justify-center">
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button
                  onClick={() => navigate('/about')}
                  className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-gray-200 dark:border-gray-700"
                >
                  Learn More
                </button>
              </div>
            )}

            {/* Platform Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl mx-auto animate-fade-in-up animation-delay-400">
              {platformStats.map((stat) => (
                <div
                  key={stat.label}
                  className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg ${stat.label === 'About'
                      ? 'cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-indigo-500'
                      : ''
                    }`}
                  onClick={stat.label === 'About' ? () => navigate('/about') : undefined}
                  onKeyDown={stat.label === 'About' ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate('/about');
                    }
                  } : undefined}
                  role={stat.label === 'About' ? 'button' : undefined}
                  tabIndex={stat.label === 'About' ? 0 : undefined}
                  aria-label={stat.label === 'About' ? 'Navigate to About page' : undefined}
                >
                  <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Dashboard Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Your Live Dashboard
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Real-time insights from your data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Inventory Card */}
          <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl p-6 border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white`}>
                  <Package className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inventory Items</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{animatedStats.inventory}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Categories:</span>
                  <span className="font-semibold">{realData?.inventory.categories || 0}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Low Stock:</span>
                  <span className="font-semibold text-amber-600">{realData?.inventory.lowStock || 0}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Total Value:</span>
                  <span className="font-semibold text-green-600">${realData?.inventory.totalValue.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Card */}
          <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl p-6 border-2 border-transparent hover:border-green-500 dark:hover:border-green-400 transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white`}>
                  <DollarSign className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Budget</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">${animatedStats.budget.toLocaleString()}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Spent:</span>
                  <span className="font-semibold">${realData?.spending.spent.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Remaining:</span>
                  <span className="font-semibold text-green-600">${realData?.spending.remaining.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Top Category:</span>
                  <span className="font-semibold">{realData?.spending.topCategory || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recipes Card */}
          <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl p-6 border-2 border-transparent hover:border-red-500 dark:hover:border-red-400 transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white`}>
                  <Utensils className="w-6 h-6" />
                </div>
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saved Recipes</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{animatedStats.recipes}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Categories:</span>
                  <span className="font-semibold">{realData?.recipes.categories || 0}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Ready to Cook</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Users Card */}
          <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl p-6 border-2 border-transparent hover:border-purple-500 dark:hover:border-purple-400 transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white`}>
                  <Users className="w-6 h-6" />
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{animatedStats.users}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Status:</span>
                  <span className="font-semibold text-green-600">Online</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Collaboration</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Access your most used features instantly
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreFeatures.map((feature) => (
            <div
              key={feature.title}
              role="button"
              tabIndex={0}
              onClick={() => navigate(feature.href)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(feature.href);
                }
              }}
              className="group cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl p-6 transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-transparent relative overflow-hidden"
              aria-label={`Navigate to ${feature.title}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} text-white`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{feature.stats}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Current</div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {feature.description}
              </p>

              <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                <span>Open</span>
                <ArrowRight className="ml-1 w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your latest updates and insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">Inventory</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {realData?.inventory?.lowStock > 0
                ? `${realData.inventory.lowStock} items need restocking`
                : 'All items are well stocked'
              }
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">Budget</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {realData?.spending?.remaining > 0
                ? `$${realData.spending.remaining.toFixed(2)} remaining this month`
                : 'Budget exceeded this month'
              }
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <Utensils className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">Recipes</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {realData?.recipes?.total > 0
                ? `${realData.recipes.total} recipes saved`
                : 'No recipes saved yet'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Dev Mode Indicator */}
      {isDevMode && (
        <div className="fixed bottom-4 left-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
          🔧 Dev Mode Active
        </div>
      )}
    </div>
  );
}