import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDevTools } from '../contexts/DevToolsContext';
import hybridStorage from '../firebase/hybridStorage';
import AnalyticsService from '../services/AnalyticsService';
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
  Star
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const { isDevMode } = useDevTools();
  const [isLoading, setIsLoading] = useState(true);
  const [realData, setRealData] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({
    inventory: 0,
    budget: 0,
    recipes: 0,
    users: 0
  });
  
  // Comprehensive feature definitions with all capabilities
  const features = [
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Complete household inventory tracking with smart organization',
      href: '/inventory',
      color: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500',
      capabilities: [
        'Barcode scanning & SKU tracking',
        'Category & location organization',
        'Warranty & maintenance tracking',
        'Low stock alerts',
        'Value calculations',
        'Bulk import/export (CSV)',
        'Image attachments',
        'Custom tags & notes'
      ]
    },
    {
      icon: DollarSign,
      title: 'Spending & Budgeting',
      description: 'Smart financial management with AI-powered insights',
      href: '/spending',
      color: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-500',
      capabilities: [
        'Monthly budget tracking',
        'Category-based expenses',
        'Recurring payments',
        'Spending analytics & trends',
        'Budget alerts & notifications',
        'Receipt attachments',
        'Custom expense tags',
        'Financial reports & exports'
      ]
    },
    {
      icon: Utensils,
      title: 'Recipe Management',
      description: 'Your personal digital cookbook with meal planning',
      href: '/recipes',
      color: 'from-red-500 to-pink-500',
      iconBg: 'bg-red-500',
      capabilities: [
        'Recipe storage & organization',
        'Ingredient lists & portions',
        'Step-by-step instructions',
        'Nutrition information',
        'Meal planning calendar',
        'Shopping list generation',
        'Dietary filters & tags',
        'Recipe ratings & reviews'
      ]
    },
    {
      icon: ShoppingCart,
      title: 'Shopping Lists',
      description: 'Collaborative shopping with smart recommendations',
      href: '/shopping-lists',
      color: 'from-orange-500 to-amber-500',
      iconBg: 'bg-orange-500',
      capabilities: [
        'Multiple shopping lists',
        'Real-time collaboration',
        'Budget tracking per list',
        'Store organization',
        'Priority items',
        'Quantity & unit tracking',
        'Price estimates',
        'Completed item history'
      ]
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Family & household member management',
      href: '/collaboration',
      color: 'from-purple-500 to-violet-500',
      iconBg: 'bg-purple-500',
      capabilities: [
        'Household member management',
        'Role-based permissions',
        'Real-time updates',
        'Activity tracking',
        'Member invitations',
        'Shared calendars',
        'Task assignments',
        'Family notifications'
      ]
    },
    {
      icon: Zap,
      title: 'Smart Home & IoT',
      description: 'Device management and home automation',
      href: '/integrations',
      color: 'from-indigo-500 to-blue-500',
      iconBg: 'bg-indigo-500',
      capabilities: [
        'Smart device management',
        'Automation rules & triggers',
        'Energy usage tracking',
        'Device status monitoring',
        'Room-based organization',
        'Schedule-based controls',
        'Integration with major platforms',
        'Custom automation workflows'
      ]
    },
    {
      icon: Brain,
      title: 'AI Assistant',
      description: 'Intelligent suggestions and automated insights',
      href: '/ai-assistant',
      color: 'from-violet-500 to-purple-500',
      iconBg: 'bg-violet-500',
      capabilities: [
        'Smart recommendations',
        'Natural language queries',
        'Recipe suggestions',
        'Budget optimization tips',
        'Predictive analytics',
        'Pattern recognition',
        'Automated insights',
        'Context-aware assistance'
      ]
    },
    {
      icon: Image,
      title: 'Image Management',
      description: 'Smart image storage with AI-powered organization',
      href: '/image-management',
      color: 'from-pink-500 to-rose-500',
      iconBg: 'bg-pink-500',
      capabilities: [
        'Cloudinary & Imgur integration',
        'Automatic compression',
        'AI image analysis',
        'Tag generation',
        'Gallery organization',
        'OCR text extraction',
        'Thumbnail generation',
        'Multi-provider fallback'
      ]
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive data visualization and insights',
      href: '/advanced-analytics',
      color: 'from-cyan-500 to-blue-500',
      iconBg: 'bg-cyan-500',
      capabilities: [
        'Interactive dashboards',
        'Spending trends & patterns',
        'Inventory analytics',
        'Custom reports',
        'Real-time metrics',
        'Predictive insights',
        'Export capabilities',
        'Historical comparisons'
      ]
    },
    {
      icon: Activity,
      title: 'Data Alerts',
      description: 'Smart notifications and monitoring',
      href: '/data-alerts',
      color: 'from-yellow-500 to-orange-500',
      iconBg: 'bg-yellow-500',
      capabilities: [
        'Custom alert rules',
        'Budget threshold alerts',
        'Low stock notifications',
        'Expiry date reminders',
        'Spending pattern alerts',
        'Device status notifications',
        'Email & push notifications',
        'Alert history & logs'
      ]
    },
    {
      icon: Wrench,
      title: 'Maintenance Tracking',
      description: 'Schedule and track home maintenance tasks',
      href: '/maintenance',
      color: 'from-gray-500 to-slate-500',
      iconBg: 'bg-gray-500',
      capabilities: [
        'Maintenance schedules',
        'Task assignments',
        'Service history',
        'Warranty tracking',
        'Reminder notifications',
        'Vendor management',
        'Cost tracking',
        'Documentation storage'
      ]
    },
    {
      icon: Sparkles,
      title: 'AI Suggestions',
      description: 'Proactive recommendations for home management',
      href: '/ai-suggestions',
      color: 'from-fuchsia-500 to-pink-500',
      iconBg: 'bg-fuchsia-500',
      capabilities: [
        'Smart shopping suggestions',
        'Recipe recommendations',
        'Budget optimization',
        'Energy saving tips',
        'Maintenance reminders',
        'Trend analysis',
        'Priority insights',
        'Personalized advice'
      ]
    }
  ];

  // Platform stats and highlights
  const platformStats = [
    { label: 'Active Features', value: '12+', icon: Sparkles },
    { label: 'AI Integrations', value: '3', icon: Brain },
    { label: 'Data Sources', value: 'Firebase', icon: Shield },
    { label: 'Real-time Sync', value: 'Live', icon: Zap }
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

  // Fetch real data from Firebase
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const analyticsService = new AnalyticsService();

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
        
        Object.keys(finalStats).forEach(key => {
          animateValue(key, 0, finalStats[key], 1500);
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const animateValue = (key, start, end, duration) => {
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
  };

  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

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

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up animation-delay-300">
              <button
                onClick={() => navigate('/login')}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
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

            {/* Platform Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto animate-fade-in-up animation-delay-400">
              {platformStats.map((stat, index) => (
                <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
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

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features for Modern Living
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Everything you need to manage your home efficiently, all in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              role="button"
              tabIndex={0}
              onClick={() => navigate(feature.href)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(feature.href);
                }
              }}
              className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl p-8 transform hover:scale-105 transition-all duration-300 border-2 border-gray-100 dark:border-gray-700 hover:border-transparent relative overflow-hidden"
              aria-label={`Navigate to ${feature.title}`}
            >
              {/* Gradient Overlay on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl`}></div>

              <div className="relative">
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {feature.description}
                </p>

                {/* Capabilities */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase mb-3">Key Features:</p>
                  <ul className="space-y-2">
                    {feature.capabilities.slice(0, 4).map((capability, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{capability}</span>
                      </li>
                    ))}
                  </ul>
                  {feature.capabilities.length > 4 && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 italic mt-2">
                      +{feature.capabilities.length - 4} more features...
                    </p>
                  )}
                </div>

                {/* Arrow Icon */}
                <div className="mt-6 flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform">
                  <span>Explore</span>
                  <ArrowRight className="ml-2 w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose Home Hub?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Built with modern technology and best practices
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-4">
                <benefit.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800/50 dark:to-gray-800/50 rounded-3xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powered by Modern Technology
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Built with industry-leading tools and frameworks
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {['React 18', 'Firebase', 'Tailwind CSS', 'Hugging Face AI', 'Gemini AI', 'Node.js'].map((tech, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{tech}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-green-100 dark:bg-green-900/30 rounded-full">
            <Star className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-green-800 dark:text-green-300 font-semibold">
              Production Ready • 73% Test Coverage • Zero Errors
            </span>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Get Organized?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Start managing your home smarter, not harder
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/inventory')}
                className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Start Your Journey
              </button>
              <button
                onClick={() => navigate('/about')}
                className="px-8 py-4 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                View Documentation
              </button>
            </div>
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