import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Home, 
  Package, 
  DollarSign, 
  Users, 
  Bell, 
  ShoppingCart, 
  ChefHat, 
  Zap,
  Info,
  Star,
  CheckCircle,
  ArrowRight,
  Download,
  Upload,
  Settings,
  Smartphone,
  Lightbulb,
  Thermometer,
  Camera,
  Brain,
  Target,
  Activity,
  BarChart3,
  TrendingUp,
  Shield,
  Database,
  Github,
  ExternalLink
} from 'lucide-react';

const AboutPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      id: 'inventory',
      name: 'Inventory Management',
      icon: Package,
      description: 'Track household items with categories, locations, and expiration dates',
      highlights: ['Barcode scanning', 'Category organization', 'Location tracking', 'Expiration alerts', 'Quantity management', 'Price tracking'],
      sampleData: {
        items: 12,
        categories: 8,
        locations: 6,
        totalValue: '$156.47'
      }
    },
    {
      id: 'spending',
      name: 'Spending & Budgeting',
      icon: DollarSign,
      description: 'Monitor expenses, create budgets, and track financial goals',
      highlights: ['Expense categorization', 'Budget management', 'Spending analytics', 'Payment methods', 'Recurring expenses', 'Progress tracking'],
      sampleData: {
        expenses: 24,
        budgets: 5,
        categories: 12,
        totalSpent: '$1,247.89'
      }
    },
    {
      id: 'collaboration',
      name: 'User & Household Collaboration',
      icon: Users,
      description: 'Manage multiple users, roles, and household settings',
      highlights: ['Multi-user support', 'Role management', 'Household creation', 'User invitations', 'Permission control', 'Activity sharing'],
      sampleData: {
        users: 4,
        households: 1,
        invitations: 2,
        roles: 3
      }
    },
    {
      id: 'shopping',
      name: 'Shopping Lists',
      icon: ShoppingCart,
      description: 'Create and manage shopping lists with budget planning',
      highlights: ['List management', 'Item tracking', 'Priority levels', 'Budget planning', 'Store assignment', 'Status tracking'],
      sampleData: {
        lists: 2,
        items: 8,
        totalBudget: '$350.00',
        completed: 3
      }
    },
    {
      id: 'recipes',
      name: 'Recipe Management',
      icon: ChefHat,
      description: 'Store recipes, plan meals, and integrate with shopping lists',
      highlights: ['Recipe storage', 'Ingredient management', 'Meal planning', 'Nutrition tracking', 'Shopping integration', 'Favorites system'],
      sampleData: {
        recipes: 3,
        mealPlans: 2,
        ingredients: 45,
        categories: 4
      }
    },
    {
      id: 'weather',
      name: 'Weather Dashboard',
      icon: Thermometer,
      description: 'Real-time weather data, forecasts, and analytics',
      highlights: ['Current weather', 'Forecast data', 'Weather alerts', 'Temperature units', 'Location services', 'Weather analytics'],
      sampleData: {
        locations: 2,
        forecasts: 7,
        alerts: 1,
        temperature: '72°F'
      }
    },
    {
      id: 'ai',
      name: 'AI Smart Suggestions',
      icon: Brain,
      description: 'AI-powered recommendations and intelligent automation',
      highlights: ['Smart recommendations', 'Predictive analytics', 'Automated insights', 'Learning algorithms', 'Pattern recognition', 'Optimization suggestions'],
      sampleData: {
        suggestions: 8,
        insights: 12,
        predictions: 5,
        accuracy: '94%'
      }
    },
    {
      id: 'analytics',
      name: 'Advanced Analytics',
      icon: BarChart3,
      description: 'Comprehensive analytics and performance monitoring',
      highlights: ['Data visualization', 'Performance metrics', 'Trend analysis', 'Custom reports', 'Real-time monitoring', 'Export capabilities'],
      sampleData: {
        reports: 6,
        metrics: 15,
        visualizations: 8,
        dataPoints: '2.4K'
      }
    },
    {
      id: 'smart-home',
      name: 'Smart Home Integration',
      icon: Zap,
      description: 'Connect and manage smart home devices',
      highlights: ['Device management', 'Automation rules', 'Energy monitoring', 'Security integration', 'Voice control', 'Remote access'],
      sampleData: {
        devices: 10,
        automations: 5,
        energySaved: '15%',
        securityLevel: 'High'
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise Features',
      icon: Shield,
      description: 'Enterprise-grade security and administration',
      highlights: ['RBAC system', 'Audit logging', 'SSO integration', 'Compliance tools', 'Security policies', 'Admin dashboard'],
      sampleData: {
        users: 25,
        roles: 8,
        policies: 12,
        compliance: '100%'
      }
    },
    {
      id: 'maintenance',
      name: 'Maintenance Tracking',
      icon: Settings,
      description: 'Track and schedule household maintenance tasks',
      highlights: ['Task scheduling', 'Maintenance logs', 'Reminder system', 'Cost tracking', 'Service history', 'Warranty management'],
      sampleData: {
        tasks: 8,
        completed: 5,
        upcoming: 3,
        totalCost: '$450'
      }
    },
    {
      id: 'alerts',
      name: 'Data & Alerts',
      icon: Bell,
      description: 'Export/import data, manage alerts, and track activities',
      highlights: ['Data backup', 'Import/export', 'Alert system', 'Activity logging', 'Notification settings', 'Data analytics'],
      sampleData: {
        alerts: 4,
        activities: 18,
        dataSize: '2.3KB',
        exports: 2
      }
    },
    {
      id: 'color-picker',
      name: 'Color Picker',
      icon: Settings,
      description: 'Customize app colors and themes with advanced color picker',
      highlights: ['Color customization', 'Theme switching', 'Live preview', 'Color palettes', 'Accessibility options', 'Export themes'],
      sampleData: {
        themes: 8,
        colors: 24,
        customizations: 12,
        accessibility: 'WCAG 2.1 AA'
      }
    }
  ];

  const techStack = [
    { name: 'React 18', description: 'Modern React with hooks and functional components', icon: '⚛️' },
    { name: 'Express.js', description: 'Fast, unopinionated web framework for Node.js', icon: '🚀' },
    { name: 'Tailwind CSS', description: 'Utility-first CSS framework for rapid UI development', icon: '🎨' },
    { name: 'React Router', description: 'Declarative routing for React applications', icon: '🛣️' },
    { name: 'Firebase', description: 'Backend-as-a-Service for authentication and data storage', icon: '🔥' },
    { name: 'JWT Authentication', description: 'Secure token-based authentication system', icon: '🔐' },
    { name: 'Swagger/OpenAPI', description: 'API documentation and testing interface', icon: '📚' },
    { name: 'Jest Testing', description: 'Comprehensive testing framework for reliability', icon: '🧪' },
    { name: 'Lucide Icons', description: 'Beautiful & consistent icon toolkit', icon: '🎯' },
    { name: 'AI Integration', description: 'Hugging Face, Gemini, and custom AI services', icon: '🤖' },
    { name: 'PWA Support', description: 'Progressive Web App capabilities', icon: '📱' },
    { name: 'Responsive Design', description: 'Mobile-first, cross-device compatibility', icon: '💻' }
  ];

  const upcomingFeatures = [
    'Enhanced mobile PWA with offline support',
    'Advanced AI model integrations',
    'Real-time collaboration improvements',
    'Enhanced security features',
    'Advanced automation workflows',
    'Multi-language support (i18n)',
    'Push notifications and alerts',
    'Data synchronization across devices',
    'Advanced reporting dashboards',
    'Third-party integrations'
  ];

  const TabContent = ({ tabId }) => {
    switch (tabId) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Home Hub v2.0</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Your comprehensive home management solution with 12 core features, 14 API categories,
                AI-powered suggestions, enterprise-grade security, and production-ready deployment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map(feature => (
                <div key={feature.id} className="bg-white rounded-lg shadow-md p-6 border hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <feature.icon className="text-blue-600" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{feature.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                  <div className="space-y-2">
                    {feature.highlights.slice(0, 3).map((highlight, index) => (
                      <div key={`highlight-${highlight}`} className="flex items-center space-x-2 text-sm text-gray-500">
                        <CheckCircle size={14} className="text-green-500" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Detailed Feature Overview</h2>
              <p className="text-xl text-gray-600">
                Explore each feature in detail with sample data and capabilities
              </p>
            </div>

            <div className="space-y-8">
              {features.map(feature => (
                <div key={feature.id} className="bg-white rounded-lg shadow-md p-6 border">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <feature.icon className="text-blue-600" size={32} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{feature.name}</h3>
                      <p className="text-gray-600 text-lg mb-4">{feature.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
                          <div className="space-y-2">
                            {feature.highlights.map((highlight, index) => (
                              <div key={`feature-highlight-${highlight}`} className="flex items-center space-x-2 text-sm text-gray-600">
                                <CheckCircle size={16} className="text-green-500" />
                                <span>{highlight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Sample Data</h4>
                          <div className="space-y-2">
                            {Object.entries(feature.sampleData).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                <span className="font-medium text-gray-900">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'technology':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Technology Stack</h2>
              <p className="text-xl text-gray-600">
                Built with modern, reliable technologies for optimal performance and user experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {techStack.map((tech, index) => (
                <div key={`tech-${tech.name}`} className="bg-white rounded-lg shadow-md p-6 border hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    <div className="text-4xl mb-3">{tech.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{tech.name}</h3>
                    <p className="text-gray-600 text-sm">{tech.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Why This Stack?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Performance</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• React 18 with concurrent features</li>
                    <li>• Optimized bundle size</li>
                    <li>• Fast rendering and updates</li>
                    <li>• Efficient state management</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">User Experience</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Responsive design for all devices</li>
                    <li>• Intuitive navigation and controls</li>
                    <li>• Smooth animations and transitions</li>
                    <li>• Accessibility best practices</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'roadmap':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Development Roadmap</h2>
              <p className="text-xl text-gray-600">
                Our vision for the future of Home Hub
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6 border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Phase 2: Advanced Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingFeatures.slice(0, 5).map((feature, index) => (
                    <div key={`upcoming-${feature}`} className="flex items-center space-x-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Phase 3: Enterprise & Scale</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingFeatures.slice(5).map((feature, index) => (
                    <div key={`upcoming-phase3-${feature}`} className="flex items-center space-x-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Get Involved</h3>
              <p className="text-center text-gray-600 mb-6">
                Home Hub is designed to grow with your needs. We welcome feedback, suggestions, and contributions!
              </p>
              <div className="flex justify-center space-x-4">
                <button className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <Github size={20} />
                  <span>View Source</span>
                </button>
                <button className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  <ExternalLink size={20} />
                  <span>Request Feature</span>
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">Home Hub</h1>
              <nav className="flex space-x-1">
                <a href="/inventory" className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  Inventory
                </a>
                <a href="/spending" className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  Spending
                </a>
                <a href="/collaboration" className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  Collaboration
                </a>
                <a href="/data-alerts" className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  Data & Alerts
                </a>
                <a href="/shopping-lists" className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  Shopping Lists
                </a>
                <a href="/recipes" className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  Recipes
                </a>
                <a href="/integrations" className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  Integrations
                </a>
                <a href="/about" className="px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-700">
                  About
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-white rounded-lg shadow-sm p-1">
          {[
            { id: 'overview', label: 'Overview', icon: Home },
            { id: 'features', label: 'Features', icon: Star },
            { id: 'technology', label: 'Technology', icon: Settings },
            { id: 'roadmap', label: 'Roadmap', icon: TrendingUp }
          ].map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <IconComponent size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <TabContent tabId={activeTab} />
      </div>
    </div>
  );
};

TabContent.propTypes = {
  tabId: PropTypes.string.isRequired
};

export default AboutPage; 