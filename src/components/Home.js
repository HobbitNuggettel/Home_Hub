import React from 'react';
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
  ArrowRight
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { isDevMode, showDevTools } = useDevTools();
  
  const features = [
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Track household items with categories, tags, and warranty info',
      href: '/inventory',
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
    },
    {
      icon: DollarSign,
      title: 'Spending & Budgeting',
      description: 'Monitor expenses, set budgets, and analyze spending patterns',
      href: '/spending',
      color: 'bg-green-50 text-green-600 hover:bg-green-100'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Manage household members with roles and permissions',
      href: '/collaboration',
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100'
    },
    {
      icon: ShoppingCart,
      title: 'Shopping Lists',
      description: 'Create and manage shopping lists with budget tracking',
      href: '/shopping-lists',
      color: 'bg-orange-50 text-orange-600 hover:bg-orange-100'
    },
    {
      icon: Utensils,
      title: 'Recipe Management',
      description: 'Store recipes, plan meals, and generate shopping lists',
      href: '/recipes',
      color: 'bg-red-50 text-red-600 hover:bg-red-100'
    },
    {
      icon: Zap,
      title: 'Integrations & Automation',
      description: 'Smart home integration and automation rules',
      href: '/integrations',
      color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
    },
    {
      icon: Activity,
      title: 'Data & Alerts',
      description: 'Analytics, monitoring, and intelligent alerts',
      href: '/data-alerts',
      color: 'bg-teal-50 text-teal-600 hover:bg-teal-100'
    },
    {
      icon: Info,
      title: 'About',
      description: 'Learn about features, technology stack, and roadmap',
      href: '/about',
      color: 'bg-gray-50 text-gray-600 hover:bg-gray-100'
    }
  ];

  const handleNavigation = (href) => {
    navigate(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Welcome to Home Hub</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Your comprehensive home management platform. Track inventory, manage finances, 
              collaborate with family, and automate your household tasks.
            </p>
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 max-w-2xl mx-auto">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">🚀 Welcome Back!</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Your AI Assistant is ready to help! Click the brain icon (bottom-right) for instant assistance with recipes, inventory, and more.
              </p>
              {isDevMode && (
                <div className="mt-3 p-2 bg-purple-100 dark:bg-purple-900/30 rounded border border-purple-300 dark:border-purple-700">
                  <p className="text-xs text-purple-800 dark:text-purple-300">
                    🔧 Dev Mode Active | Dev Tools: {showDevTools ? 'Visible' : 'Hidden'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mock Data Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📊 Live Dashboard</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your home management overview with real-time data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Inventory Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">47</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">8 categories</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>• 3 items running low</p>
              <p>• 2 items expiring soon</p>
              <p>• Total value: $234.67</p>
            </div>
          </div>

          {/* Budget Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Budget</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">$1,200</p>
                <p className="text-xs text-green-500">29% under budget</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>• Spent: $847.50</p>
              <p>• Remaining: $352.50</p>
              <p>• Top: Groceries (38%)</p>
            </div>
          </div>

          {/* Recipe Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <Utensils className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saved Recipes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">15</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">5 favorites</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>• Chicken Tikka Masala ⭐⭐⭐⭐⭐</p>
              <p>• Spaghetti Carbonara ⭐⭐⭐⭐⭐</p>
              <p>• 3 new this week</p>
            </div>
          </div>

          {/* Shopping Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center">
              <ShoppingCart className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Shopping List</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">17</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">items</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>• Estimated: $78.37</p>
              <p>• 5 high priority</p>
              <p>• 3 stores recommended</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">All Features</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Everything you need to manage your home efficiently
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <button
                key={index}
                onClick={() => handleNavigation(feature.href)}
                className={`w-full p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${feature.color} dark:bg-gray-700`}>
                    <Icon size={24} className="dark:text-gray-300" />
                  </div>
                  <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white dark:bg-gray-800 py-16 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Platform Overview</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Numbers that reflect our commitment to excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">8</div>
              <p className="text-gray-600 dark:text-gray-300">Core Features</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">100%</div>
              <p className="text-gray-600 dark:text-gray-300">Feature Complete</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">3</div>
              <p className="text-gray-600 dark:text-gray-300">Development Phases</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">∞</div>
              <p className="text-gray-600 dark:text-gray-300">Possibilities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-blue-600 dark:bg-blue-700 rounded-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-6 opacity-90">
            Explore any feature above to begin managing your home more efficiently
          </p>
          <p className="text-lg opacity-75">
            Use the hamburger menu (top-left) to navigate between all features
          </p>
        </div>
      </div>
    </div>
  );
}
