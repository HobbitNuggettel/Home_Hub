import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevTools } from '../contexts/DevToolsContext';
import { 
  Package, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Utensils, 
  Zap, 
  Activity, 
  Info,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { isDevMode, showDevTools } = useDevTools();
  const [isLoading, setIsLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState({
    inventory: 0,
    budget: 0,
    recipes: 0,
    shopping: 0
  });
  
  const features = [
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Track household items with categories, tags, and warranty info',
      href: '/inventory',
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
      gradient: 'from-blue-500 to-blue-600',
      stats: { total: 47, categories: 8, low: 3, expiring: 2, value: 234.67 }
    },
    {
      icon: DollarSign,
      title: 'Spending & Budgeting',
      description: 'Monitor expenses, set budgets, and analyze spending patterns',
      href: '/spending',
      color: 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400',
      gradient: 'from-green-500 to-green-600',
      stats: { budget: 1200, spent: 847.50, remaining: 352.50, topCategory: 'Groceries', topPercentage: 38 }
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Manage household members with roles and permissions',
      href: '/collaboration',
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400',
      gradient: 'from-purple-500 to-purple-600',
      stats: { members: 4, active: 3, roles: 2 }
    },
    {
      icon: ShoppingCart,
      title: 'Shopping Lists',
      description: 'Create and manage shopping lists with budget tracking',
      href: '/shopping-lists',
      color: 'bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400',
      gradient: 'from-orange-500 to-orange-600',
      stats: { items: 17, estimated: 78.37, highPriority: 5, stores: 3 }
    },
    {
      icon: Utensils,
      title: 'Recipe Management',
      description: 'Store recipes, plan meals, and generate shopping lists',
      href: '/recipes',
      color: 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400',
      gradient: 'from-red-500 to-red-600',
      stats: { total: 15, favorites: 5, newThisWeek: 3 }
    },
    {
      icon: Zap,
      title: 'Integrations & Automation',
      description: 'Smart home integration and automation rules',
      href: '/integrations',
      color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400',
      gradient: 'from-indigo-500 to-indigo-600',
      stats: { devices: 12, automations: 8, integrations: 5 }
    },
    {
      icon: Activity,
      title: 'Data & Alerts',
      description: 'Analytics, monitoring, and intelligent alerts',
      href: '/data-alerts',
      color: 'bg-teal-50 text-teal-600 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-400',
      gradient: 'from-teal-500 to-teal-600',
      stats: { alerts: 3, insights: 12, reports: 4 }
    },
    {
      icon: Info,
      title: 'About',
      description: 'Learn about features, technology stack, and roadmap',
      href: '/about',
      color: 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300',
      gradient: 'from-gray-500 to-gray-600',
      stats: { version: '2.0.0', features: 8, phases: 3 }
    }
  ];

  // Simulate loading and animate stats
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Animate stats counting up
      const finalStats = {
        inventory: 47,
        budget: 1200,
        recipes: 15,
        shopping: 17
      };
      
      Object.keys(finalStats).forEach(key => {
        animateValue(key, 0, finalStats[key], 1500);
      });
    }, 800);

    return () => clearTimeout(timer);
  }, []);

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

  const handleNavigation = (event) => {
    // Add navigation animation
    const button = event.currentTarget;
    const href = button.dataset.href;
    
    button.classList.add('scale-95', 'opacity-75');
    setTimeout(() => {
      button.classList.remove('scale-95', 'opacity-75');
      navigate(href);
    }, 150);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading Home Hub...</h2>
          <p className="text-gray-500 dark:text-gray-500 mt-2">Preparing your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 pt-20">
      {/* Enhanced Header with Parallax Effect */}
      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-fade-in-up">
              Welcome to Home Hub
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              Your comprehensive home management platform. Track inventory, manage finances, 
              collaborate with family, and automate your household tasks with AI-powered intelligence.
            </p>
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm max-w-3xl mx-auto transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-center mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold">🚀 AI Assistant Ready!</p>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                Your AI Assistant is ready to help! Click the brain icon (bottom-right) for instant assistance with recipes, inventory, and more.
              </p>
              {isDevMode && (
                <div className="mt-4 p-3 bg-gradient-to-r from-purple-100/80 to-pink-100/80 dark:from-purple-900/40 dark:to-pink-900/40 rounded-xl border border-purple-300/50 dark:border-purple-700/50">
                  <p className="text-xs text-purple-800 dark:text-purple-200 font-medium">
                    🔧 Dev Mode Active | Dev Tools: {showDevTools ? 'Visible' : 'Hidden'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Live Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12 animate-fade-in-up animation-delay-400">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            📊 Live Dashboard
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your home management overview with real-time data and intelligent insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Enhanced Inventory Stats */}
          <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl p-6 border-l-4 border-blue-500 transform hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-500">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                <Package className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{animatedStats.inventory}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">8 categories</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span>3 items running low</span>
              </div>
              <div className="flex items-center text-sm text-red-600 dark:text-red-400">
                <Clock className="w-4 h-4 mr-2" />
                <span>2 items expiring soon</span>
              </div>
              <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                <DollarSign className="w-4 h-4 mr-2" />
                <span>Total value: $234.67</span>
              </div>
            </div>
          </div>

          {/* Enhanced Budget Stats */}
          <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl p-6 border-l-4 border-green-500 transform hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-600">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Budget</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">${animatedStats.budget.toLocaleString()}</p>
                <p className="text-xs text-green-500 font-medium">29% under budget</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Spent:</span>
                <span className="font-medium">$847.50</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                <span className="font-medium text-green-600">$352.50</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Top Category:</span>
                <span className="font-medium">Groceries (38%)</span>
              </div>
            </div>
          </div>

          {/* Enhanced Recipe Stats */}
          <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl p-6 border-l-4 border-red-500 transform hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-700">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
                <Utensils className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saved Recipes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{animatedStats.recipes}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">5 favorites</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
                <span className="mr-2">⭐⭐⭐⭐⭐</span>
                <span className="truncate">Chicken Tikka Masala</span>
              </div>
              <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
                <span className="mr-2">⭐⭐⭐⭐⭐</span>
                <span className="truncate">Spaghetti Carbonara</span>
              </div>
              <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>3 new this week</span>
              </div>
            </div>
          </div>

          {/* Enhanced Shopping Stats */}
          <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl p-6 border-l-4 border-orange-500 transform hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-800">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Shopping List</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{animatedStats.shopping}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">items</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Estimated:</span>
                <span className="font-medium">$78.37</span>
              </div>
              <div className="flex items-center text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span>5 high priority</span>
              </div>
              <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span>3 stores recommended</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16 animate-fade-in-up animation-delay-1000">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            All Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to manage your home efficiently with AI-powered intelligence
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <button
                key={index}
                onClick={handleNavigation}
                data-href={feature.href}
                className="group w-full p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-left bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transform hover:scale-105 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${1200 + index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${feature.color} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <Icon size={24} className="dark:text-gray-300" />
                  </div>
                  <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-gray-400 dark:text-gray-500 transform group-hover:translate-x-1" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  {feature.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                  <span>Click to explore</span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Enhanced Platform Overview */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-20 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up animation-delay-1400">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Platform Overview
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Numbers that reflect our commitment to excellence and innovation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: '8', label: 'Core Features', color: 'text-blue-600 dark:text-blue-400' },
              { number: '100%', label: 'Feature Complete', color: 'text-green-600 dark:text-green-400' },
              { number: '3', label: 'Development Phases', color: 'text-purple-600 dark:text-purple-400' },
              { number: '∞', label: 'Possibilities', color: 'text-orange-600 dark:text-orange-400' }
            ].map((stat, index) => (
              <div key={index} className="text-center group animate-fade-in-up" style={{ animationDelay: `${1600 + index * 100}ms` }}>
                <div className={`text-5xl md:text-6xl font-bold ${stat.color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  {stat.number}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-lg font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Call to Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-10 text-center text-white shadow-2xl transform hover:scale-105 transition-transform duration-500 animate-fade-in-up animation-delay-1800">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
            Explore any feature above to begin managing your home more efficiently with AI-powered intelligence
          </p>
          <p className="text-lg opacity-75 leading-relaxed">
            Use the hamburger menu (top-left) to navigate between all features, or click any feature card above
          </p>
          <div className="mt-8 flex justify-center">
            <div className="w-16 h-1 bg-white/30 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

