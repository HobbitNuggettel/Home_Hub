import React from 'react';
import { 
  Home,
  Package,
  DollarSign,
  Users,
  ShoppingCart,
  Utensils,
  Zap,
  Brain,
  Activity,
  BarChart3,
  Shield,
  Smartphone,
  Globe,
  Github,
  Mail,
  Heart,
  Code,
  Palette,
  Zap as Lightning,
  Target,
  TrendingUp,
  Database,
  Lock,
  Bell,
  Settings
} from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Track household items with categories, tags, warranty info, and supplier details. Multi-add, bulk actions, and CSV import/export.',
      status: 'Completed'
    },
    {
      icon: DollarSign,
      title: 'Spending & Budgeting',
      description: 'Monitor expenses, set budgets, track recurring payments, and analyze spending patterns with detailed analytics.',
      status: 'Completed'
    },
    {
      icon: Users,
      title: 'User & Household Collaboration',
      description: 'Manage household members, assign roles with granular permissions, and handle invitations seamlessly.',
      status: 'Completed'
    },
    {
      icon: ShoppingCart,
      title: 'Shopping Lists',
      description: 'Create and manage shopping lists with categories, priorities, and budget tracking.',
      status: 'Completed'
    },
    {
      icon: Utensils,
      title: 'Recipe Management',
      description: 'Store recipes, plan meals, generate shopping lists, and manage cooking instructions.',
      status: 'Completed'
    },
    {
      icon: Zap,
      title: 'Integrations & Automation',
      description: 'Smart home integration, automation rules, and AI-powered suggestions for optimization.',
      status: 'Completed'
    },
    {
      icon: Activity,
      title: 'Data & Alerts',
      description: 'Data visualization, alerts management, system monitoring, and comprehensive analytics.',
      status: 'Completed'
    }
  ];

  const technologies = [
    { name: 'React 18', description: 'Modern React with hooks and concurrent features' },
    { name: 'Tailwind CSS', description: 'Utility-first CSS framework for rapid UI development' },
    { name: 'React Router', description: 'Declarative routing for React applications' },
    { name: 'Lucide React', description: 'Beautiful & consistent icon toolkit' },
    { name: 'React Hot Toast', description: 'Elegant notifications for React' },
    { name: 'LocalStorage', description: 'Client-side data persistence' },
    { name: 'PWA Support', description: 'Progressive Web App capabilities' },
    { name: 'Responsive Design', description: 'Mobile-first, cross-device compatibility' }
  ];

  const roadmap = [
    {
      phase: 'Phase 1 - Core Features',
      items: ['Inventory Management', 'Spending Tracker', 'User Authentication'],
      status: 'Completed'
    },
    {
      phase: 'Phase 2 - Collaboration',
      items: ['Household Management', 'User Roles & Permissions', 'Shopping Lists'],
      status: 'Completed'
    },
    {
      phase: 'Phase 3 - Advanced Features',
      items: ['Recipe Management', 'Integrations & Automation', 'Data & Alerts'],
      status: 'Completed'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-6">
              <Home className="text-white" size={48} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Home Hub</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              A comprehensive home management platform that brings together inventory tracking, 
              spending management, collaboration tools, and smart automation in one unified interface.
            </p>
            <div className="mt-8 flex items-center justify-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <Code className="w-4 h-4 mr-2" />
                Open Source
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <Palette className="w-4 h-4 mr-2" />
                Modern UI/UX
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                <Zap className="w-4 h-4 mr-2" />
                Feature Rich
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Home Hub was created to simplify home management by providing a centralized platform 
            where families can track their belongings, manage finances, collaborate on household tasks, 
            and automate daily routines. We believe that a well-organized home leads to a more 
            peaceful and productive life.
          </p>
        </div>
      </div>

      {/* Features Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Features Overview</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Everything you need to manage your home efficiently
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Icon className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    feature.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {feature.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Technology Stack</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Built with modern, reliable technologies
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {technologies.map((tech, index) => (
              <div key={index} className="text-center p-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Code className="text-gray-600 dark:text-gray-400" size={32} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{tech.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Development Roadmap */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Development Roadmap</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Our journey to building the ultimate home management platform
          </p>
        </div>
        
        <div className="space-y-8">
          {roadmap.map((phase, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{phase.phase}</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  phase.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {phase.status}
                </span>
              </div>
              <ul className="space-y-2">
                {phase.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center text-gray-600 dark:text-gray-300">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      phase.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'
                    }`}></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Key Benefits */}
      <div className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Home Hub?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Discover the advantages of our comprehensive approach
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-blue-600 dark:text-blue-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Centralized Management</h3>
              <p className="text-gray-600 dark:text-gray-300">
                All your home management needs in one place - no more switching between apps
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-green-600 dark:text-green-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Family Collaboration</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Work together with household members through role-based access and permissions
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="text-purple-600 dark:text-purple-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Smart Automation</h3>
              <p className="text-gray-600 dark:text-gray-300">
                AI-powered suggestions and automation rules to optimize your home management
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-yellow-600 dark:text-yellow-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Data Insights</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Comprehensive analytics and reporting to make informed decisions
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-red-600 dark:text-red-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Privacy First</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your data stays on your device with optional cloud backup
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="text-indigo-600 dark:text-indigo-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cross-Platform</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Access from any device with responsive design and PWA support
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Platform Statistics</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Numbers that reflect our commitment to excellence
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">7</div>
            <p className="text-gray-600 dark:text-gray-300">Core Features</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">3</div>
            <p className="text-gray-600 dark:text-gray-300">Development Phases</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">8</div>
            <p className="text-gray-600 dark:text-gray-300">Technologies Used</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">100%</div>
            <p className="text-gray-600 dark:text-gray-300">Open Source</p>
          </div>
        </div>
      </div>

      {/* Contact & Links */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Get Involved</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Join our community and contribute to the future of home management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Github className="text-blue-600 dark:text-blue-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Open Source</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Contribute to the project on GitHub
              </p>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                <Github className="w-4 h-4 mr-2" />
                View on GitHub
              </a>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-green-600 dark:text-green-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contact Us</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Have questions or suggestions?
              </p>
              <a 
                href="mailto:contact@homehub.com" 
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </a>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-purple-600 dark:text-purple-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Support Us</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Help us continue improving Home Hub
              </p>
              <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <Heart className="w-4 h-4 mr-2" />
                Star Project
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Home className="text-blue-400 mr-2" size={24} />
              <span className="text-xl font-bold">Home Hub</span>
            </div>
            <p className="text-gray-400 mb-6">
              Simplifying home management for modern families
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
              <span>© 2024 Home Hub</span>
              <span>•</span>
              <span>MIT License</span>
              <span>•</span>
              <span>Made with ❤️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Home Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <a href="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">← Back to Home</a>
      </div>
    </div>
  );
}
