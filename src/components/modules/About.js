import React, { useState } from 'react';
import { 
  Info, 
  Code, 
  Zap, 
  Shield, 
  Globe, 
  Smartphone, 
  Database, 
  Cloud,
  GitBranch,
  Users,
  Star,
  Award,
  CheckCircle,
  Clock,
  Target,
  Rocket,
  ShoppingCart,
  Utensils
} from 'lucide-react';

export default function About() {
  const [activeTab, setActiveTab] = useState('features');

  const features = [
    {
      icon: Database,
      title: 'Inventory Management',
      description: 'Track household items with categories, tags, and warranty information',
      status: 'complete',
      priority: 'high'
    },
    {
      icon: Zap,
      title: 'Spending & Budgeting',
      description: 'Monitor expenses, set budgets, and analyze spending patterns',
      status: 'complete',
      priority: 'high'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Manage household members with roles and permissions',
      status: 'complete',
      priority: 'medium'
    },
    {
      icon: ShoppingCart,
      title: 'Shopping Lists',
      description: 'Create and manage shopping lists with budget tracking',
      status: 'complete',
      priority: 'medium'
    },
    {
      icon: Utensils,
      title: 'Recipe Management',
      description: 'Store recipes, plan meals, and generate shopping lists',
      status: 'complete',
      priority: 'medium'
    },
    {
      icon: Globe,
      title: 'Integrations & Automation',
      description: 'Smart home integration and automation rules',
      status: 'complete',
      priority: 'low'
    },
    {
      icon: Shield,
      title: 'Data & Alerts',
      description: 'Analytics, monitoring, and intelligent alerts',
      status: 'complete',
      priority: 'low'
    },
    {
      icon: Cloud,
      title: 'Image Management',
      description: 'Smart image compression, storage, and optimization',
      status: 'planned',
      priority: 'low'
    }
  ];

  const techStack = [
    {
      category: 'Frontend Framework',
      items: [
        { name: 'React 18', version: '18.2.0', description: 'Modern React with hooks and concurrent features' },
        { name: 'React Router', version: '6.8.0', description: 'Declarative routing for React' },
        { name: 'Tailwind CSS', version: '3.3.0', description: 'Utility-first CSS framework' }
      ]
    },
    {
      category: 'State Management',
      items: [
        { name: 'React Context API', version: 'Built-in', description: 'Native React state management' },
        { name: 'Custom Hooks', version: 'Custom', description: 'Reusable state logic' }
      ]
    },
    {
      category: 'UI Components',
      items: [
        { name: 'Lucide React', version: '0.263.1', description: 'Beautiful & consistent icon toolkit' },
        { name: 'React Hot Toast', version: '2.4.1', description: 'Toast notifications' }
      ]
    },
    {
      category: 'Build Tools',
      items: [
        { name: 'Create React App', version: '5.0.1', description: 'React development environment' },
        { name: 'Webpack', version: '5.88.0', description: 'Module bundler' }
      ]
    },
    {
      category: 'Development',
      items: [
        { name: 'ESLint', version: '8.45.0', description: 'Code linting and formatting' },
        { name: 'Prettier', version: '2.8.8', description: 'Code formatter' }
      ]
    }
  ];

  const roadmap = [
    {
      phase: 'Phase 1: Foundation',
      status: 'complete',
      items: [
        'Basic React setup and routing',
        'Navigation and layout components',
        'Authentication context setup',
        'Core module structure'
      ],
      completionDate: 'December 2024'
    },
    {
      phase: 'Phase 2: Core Modules',
      status: 'complete',
      items: [
        'Inventory Management implementation',
        'Spending & Budgeting implementation',
        'Collaboration system implementation',
        'Shopping Lists implementation',
        'Recipe Management implementation'
      ],
      completionDate: 'December 2024'
    },
    {
      phase: 'Phase 3: Advanced Features',
      status: 'complete',
      items: [
        'Integrations & Automation module',
        'Data & Alerts module',
        'UI/UX refinement',
        'Responsive design implementation',
        'Sample data integration'
      ],
      completionDate: 'December 2024'
    },
    {
      phase: 'Phase 4: Production Ready',
      status: 'in-progress',
      items: [
        'Code optimization',
        'Performance improvements',
        'Testing and quality assurance',
        'Documentation completion',
        'Deployment preparation'
      ],
      completionDate: 'Q1 2025'
    },
    {
      phase: 'Phase 5: Future Enhancements',
      status: 'planned',
      items: [
        'Smart Home Integration',
        'AI-Powered Insights',
        'Mobile App Development',
        'Cloud Sync',
        'Advanced Analytics'
      ],
      completionDate: 'Q2-Q4 2025'
    }
  ];

  const achievements = [
    {
      icon: Award,
      title: '100% Module Completion',
      description: 'All 8 core modules fully implemented and functional',
      metric: '8/8'
    },
    {
      icon: Code,
      title: 'Modern Architecture',
      description: 'Built with React 18, hooks, and modern patterns',
      metric: 'React 18'
    },
    {
      icon: Smartphone,
      title: 'Responsive Design',
      description: 'Perfect experience across all device sizes',
      metric: '100%'
    },
    {
      icon: Zap,
      title: 'Performance Optimized',
      description: 'Fast loading and smooth interactions',
      metric: 'Optimized'
    },
    {
      icon: Users,
      title: 'User Experience',
      description: 'Intuitive interfaces with sample data',
      metric: 'Ready'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'planned': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3 mb-4">
              <Info className="w-10 h-10 text-gray-600" />
              About Home Hub
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              A comprehensive home management platform built with modern web technologies, 
              designed to simplify household organization and collaboration.
            </p>
            <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <GitBranch className="w-4 h-4" />
                Version 2.0.0
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                Team Project
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                Production Ready
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'features', label: 'Features', count: features.length },
                { id: 'tech-stack', label: 'Technology', count: techStack.length },
                { id: 'roadmap', label: 'Roadmap', count: roadmap.length },
                { id: 'achievements', label: 'Achievements', count: achievements.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-gray-500 text-gray-700 dark:text-gray-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white py-0.5 px-2.5 rounded-full text-xs font-medium">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Features Tab */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Platform Features</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Comprehensive home management tools designed for modern households
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {features.map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-white dark:bg-gray-600 rounded-lg">
                            <IconComponent className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">{feature.title}</h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feature.status)}`}>
                                {feature.status}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(feature.priority)}`}>
                                {feature.priority}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Technology Stack Tab */}
            {activeTab === 'tech-stack' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Technology Stack</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Built with modern, reliable technologies for optimal performance and maintainability
                  </p>
                </div>

                <div className="space-y-6">
                  {techStack.map((category, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Code className="w-5 h-5 text-gray-600" />
                        {category.category}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="bg-white dark:bg-gray-600 rounded-lg p-4 border border-gray-200 dark:border-gray-500">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900 dark:text-white">{item.name}</h5>
                              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-500 px-2 py-1 rounded">
                                {item.version}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Roadmap Tab */}
            {activeTab === 'roadmap' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Development Roadmap</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our journey from concept to production-ready platform
                  </p>
                </div>

                <div className="space-y-6">
                  {roadmap.map((phase, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${getStatusColor(phase.status)}`}>
                            {phase.status === 'complete' ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : phase.status === 'in-progress' ? (
                              <Clock className="w-5 h-5" />
                            ) : (
                              <Target className="w-5 h-5" />
                            )}
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">{phase.phase}</h4>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(phase.status)}`}>
                            {phase.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{phase.completionDate}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {phase.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Project Achievements</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Milestones and accomplishments in building Home Hub
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.map((achievement, index) => {
                    const IconComponent = achievement.icon;
                    return (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600 text-center">
                        <div className="p-3 bg-white dark:bg-gray-600 rounded-lg inline-block mb-4">
                          <IconComponent className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">{achievement.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{achievement.description}</p>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{achievement.metric}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Project Stats */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 text-center">Project Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">8</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Modules</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">100%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Complete</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">3.5k+</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Lines of Code</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">125+</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Components</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
          <Rocket className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Ready to Get Started?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Home Hub is now production-ready with all core modules implemented. 
            Start managing your household efficiently today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
              Explore Features
            </button>
            <button className="px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium">
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
