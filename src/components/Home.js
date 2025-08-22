import React from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Home Hub</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your comprehensive home management platform. Track inventory, manage finances, 
              collaborate with family, and automate your household tasks.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">All Features</h2>
          <p className="text-lg text-gray-600">
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
                className={`w-full p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-left ${feature.color}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <Icon size={32} />
                  <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Overview</h2>
            <p className="text-lg text-gray-600">
              Numbers that reflect our commitment to excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">8</div>
              <p className="text-gray-600">Core Features</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
              <p className="text-gray-600">Feature Complete</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">3</div>
              <p className="text-gray-600">Development Phases</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">∞</div>
              <p className="text-gray-600">Possibilities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-blue-600 rounded-lg p-8 text-center text-white">
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
