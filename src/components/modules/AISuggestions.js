import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Zap, 
  Clock, 
  Star, 
  CheckCircle,
  AlertCircle,
  DollarSign,
  ShoppingCart,
  Utensils,
  Home,
  Users,
  BarChart3,
  Plus,
  Filter,
  Search,
  Bookmark,
  Share2
} from 'lucide-react';

export default function AISuggestions() {
  const [activeTab, setActiveTab] = useState('insights');
  const [suggestions, setSuggestions] = useState([
    {
      id: 1,
      type: 'budget',
      title: 'Reduce Grocery Spending',
      description: 'Based on your spending patterns, you could save $120/month by switching to bulk purchases and meal planning.',
      category: 'Finance',
      priority: 'high',
      impact: 'High',
      effort: 'Medium',
      status: 'pending',
      tags: ['budget', 'groceries', 'savings'],
      createdAt: '2024-12-20',
      estimatedSavings: '$120/month',
      confidence: 92,
      icon: DollarSign
    },
    {
      id: 2,
      type: 'inventory',
      title: 'Optimize Home Inventory',
      description: 'You have 15 items approaching warranty expiration. Consider selling or replacing them to maximize value.',
      category: 'Inventory',
      priority: 'medium',
      impact: 'Medium',
      effort: 'Low',
      status: 'in-progress',
      tags: ['inventory', 'warranty', 'optimization'],
      createdAt: '2024-12-19',
      estimatedSavings: '$300',
      confidence: 87,
      icon: Home
    },
    {
      id: 3,
      type: 'recipe',
      title: 'Meal Planning Optimization',
      description: 'Your current meal planning could be 30% more efficient. Try batch cooking on Sundays to save time and money.',
      category: 'Recipes',
      priority: 'medium',
      impact: 'Medium',
      effort: 'Low',
      status: 'completed',
      tags: ['recipes', 'meal-planning', 'efficiency'],
      createdAt: '2024-12-18',
      estimatedSavings: '2 hours/week',
      confidence: 89,
      icon: Utensils
    },
    {
      id: 4,
      type: 'collaboration',
      title: 'Household Task Distribution',
      description: 'Task distribution analysis shows uneven workload. Consider implementing a rotating chore schedule.',
      category: 'Collaboration',
      priority: 'low',
      impact: 'Low',
      effort: 'Medium',
      status: 'pending',
      tags: ['collaboration', 'chores', 'fairness'],
      createdAt: '2024-12-17',
      estimatedSavings: 'Improved harmony',
      confidence: 78,
      icon: Users
    },
    {
      id: 5,
      type: 'shopping',
      title: 'Smart Shopping List',
      description: 'AI detected you frequently forget essential items. Enable smart reminders for your next shopping trip.',
      category: 'Shopping',
      priority: 'medium',
      impact: 'Medium',
      effort: 'Low',
      status: 'pending',
      tags: ['shopping', 'reminders', 'efficiency'],
      createdAt: '2024-12-16',
      estimatedSavings: 'Fewer trips',
      confidence: 85,
      icon: ShoppingCart
    }
  ]);

  const [insights, setInsights] = useState([
    {
      id: 1,
      title: 'Spending Pattern Analysis',
      description: 'Your entertainment spending increased 25% this month compared to last month.',
      type: 'trend',
      category: 'Finance',
      severity: 'info',
      data: {
        currentMonth: '$450',
        previousMonth: '$360',
        change: '+25%',
        trend: 'increasing'
      },
      recommendations: [
        'Review subscription services',
        'Set entertainment budget limit',
        'Look for free alternatives'
      ]
    },
    {
      id: 2,
      title: 'Inventory Efficiency Score',
      description: 'Your home inventory management efficiency is 78/100, above average for households your size.',
      type: 'score',
      category: 'Inventory',
      severity: 'success',
      data: {
        score: 78,
        maxScore: 100,
        percentile: 75,
        areas: ['Organization', 'Tracking', 'Maintenance']
      },
      recommendations: [
        'Implement barcode scanning',
        'Set up maintenance reminders',
        'Create digital inventory map'
      ]
    },
    {
      id: 3,
      title: 'Energy Usage Alert',
      description: 'Your energy consumption is 15% higher than similar households in your area.',
      type: 'alert',
      category: 'Utilities',
      severity: 'warning',
      data: {
        yourUsage: '850 kWh',
        averageUsage: '740 kWh',
        difference: '+15%',
        cost: '$127/month'
      },
      recommendations: [
        'Check for energy leaks',
        'Optimize thermostat settings',
        'Consider energy-efficient appliances'
      ]
    }
  ]);

  const [trends, setTrends] = useState([
    {
      id: 1,
      title: 'Grocery Spending Trend',
      category: 'Finance',
      period: 'Last 6 months',
      data: [
        { month: 'Jul', amount: 320 },
        { month: 'Aug', amount: 340 },
        { month: 'Sep', amount: 310 },
        { month: 'Oct', amount: 380 },
        { month: 'Nov', amount: 350 },
        { month: 'Dec', amount: 420 }
      ],
      trend: 'increasing',
      change: '+31%',
      insight: 'Holiday season and inflation are driving costs up'
    },
    {
      id: 2,
      title: 'Home Maintenance Frequency',
      category: 'Maintenance',
      period: 'Last 12 months',
      data: [
        { month: 'Jan', tasks: 8 },
        { month: 'Feb', tasks: 6 },
        { month: 'Mar', tasks: 12 },
        { month: 'Apr', tasks: 9 },
        { month: 'May', tasks: 7 },
        { month: 'Jun', tasks: 11 },
        { month: 'Jul', tasks: 8 },
        { month: 'Aug', tasks: 10 },
        { month: 'Sep', tasks: 13 },
        { month: 'Oct', tasks: 9 },
        { month: 'Nov', tasks: 7 },
        { month: 'Dec', tasks: 15 }
      ],
      trend: 'stable',
      change: '+2%',
      insight: 'Consistent maintenance schedule maintained'
    }
  ]);

  const [filters, setFilters] = useState({
    category: 'all',
    priority: 'all',
    status: 'all',
    timeRange: 'all'
  });

  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['all', 'finance', 'inventory', 'recipes', 'collaboration', 'shopping', 'maintenance', 'utilities'];
  const priorities = ['all', 'high', 'medium', 'low'];
  const statuses = ['all', 'pending', 'in-progress', 'completed'];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'in-progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'success': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'info': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing': return 'text-red-600';
      case 'decreasing': return 'text-green-600';
      case 'stable': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion => {
    const matchesSearch = suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suggestion.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suggestion.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filters.category === 'all' || suggestion.category.toLowerCase() === filters.category;
    const matchesPriority = filters.priority === 'all' || suggestion.priority === filters.priority;
    const matchesStatus = filters.status === 'all' || suggestion.status === filters.status;
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const markAsCompleted = (suggestionId) => {
    setSuggestions(suggestions.map(suggestion =>
      suggestion.id === suggestionId
        ? { ...suggestion, status: 'completed' }
        : suggestion
    ));
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-blue-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-600" />
                AI Suggestions & Insights
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Intelligent recommendations and data-driven insights to optimize your home management
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Generate New Insights
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Lightbulb className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Suggestions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{suggestions.filter(s => s.status !== 'completed').length}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Ready to implement
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{suggestions.filter(s => s.status === 'completed').length}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Successfully implemented
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Insights</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{insights.length}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Data-driven analysis
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Priority</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{suggestions.filter(s => s.priority === 'high').length}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Require attention
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'insights', label: 'AI Insights', count: insights.length },
                { id: 'suggestions', label: 'Smart Suggestions', count: suggestions.length },
                { id: 'trends', label: 'Trends & Patterns', count: trends.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
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
            {/* AI Insights Tab */}
            {activeTab === 'insights' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI-Powered Insights</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Data-driven analysis and intelligent recommendations for your home
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {insights.map((insight) => (
                    <div key={insight.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(insight.severity)}`}>
                            {insight.type}
                          </span>
                          <span className="text-sm text-gray-500">{insight.category}</span>
                        </div>
                      </div>
                      
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{insight.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{insight.description}</p>

                      {insight.type === 'trend' && (
                        <div className="bg-white dark:bg-gray-600 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Current Month</span>
                            <span className="font-medium text-gray-900 dark:text-white">{insight.data.currentMonth}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Previous Month</span>
                            <span className="font-medium text-gray-900 dark:text-white">{insight.data.previousMonth}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Change</span>
                            <span className={`font-medium ${getTrendColor(insight.data.trend)}`}>{insight.data.change}</span>
                          </div>
                        </div>
                      )}

                      {insight.type === 'score' && (
                        <div className="bg-white dark:bg-gray-600 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Efficiency Score</span>
                            <span className="text-2xl font-bold text-blue-600">{insight.data.score}/{insight.data.maxScore}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${insight.data.score}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">Top {insight.data.percentile}%</div>
                        </div>
                      )}

                      {insight.type === 'alert' && (
                        <div className="bg-white dark:bg-gray-600 rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Your Usage:</span>
                              <span className="font-medium text-gray-900 dark:text-white ml-2">{insight.data.yourUsage}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Average:</span>
                              <span className="font-medium text-gray-900 dark:text-white ml-2">{insight.data.averageUsage}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Difference:</span>
                              <span className="font-medium text-red-600 ml-2">{insight.data.difference}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Monthly Cost:</span>
                              <span className="font-medium text-gray-900 dark:text-white ml-2">{insight.data.cost}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Recommendations:</h5>
                        <ul className="space-y-1">
                          {insight.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Smart Suggestions Tab */}
            {activeTab === 'suggestions' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Smart Suggestions</h3>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search suggestions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>
                        {priority === 'all' ? 'All Priorities' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Suggestions List */}
                <div className="space-y-4">
                  {filteredSuggestions.map((suggestion) => {
                    const IconComponent = suggestion.icon;
                    return (
                      <div key={suggestion.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="p-3 bg-white dark:bg-gray-600 rounded-lg">
                              <IconComponent className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="text-lg font-medium text-gray-900 dark:text-white">{suggestion.title}</h4>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                                  {suggestion.priority}
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(suggestion.status)}`}>
                                  {suggestion.status}
                                </span>
                              </div>
                              
                              <p className="text-gray-600 dark:text-gray-400 mb-3">{suggestion.description}</p>
                              
                              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                                <span>Category: {suggestion.category}</span>
                                <span>Impact: {suggestion.impact}</span>
                                <span>Effort: {suggestion.effort}</span>
                                <span>Created: {suggestion.createdAt}</span>
                              </div>

                              <div className="flex items-center space-x-4 mb-3">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-500">Estimated Savings:</span>
                                  <span className="font-medium text-green-600">{suggestion.estimatedSavings}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-500">AI Confidence:</span>
                                  <span className={`font-medium ${getConfidenceColor(suggestion.confidence)}`}>{suggestion.confidence}%</span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                {suggestion.tags.map((tag, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {suggestion.status === 'pending' && (
                              <button
                                onClick={() => markAsCompleted(suggestion.id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4 inline mr-1" />
                                Mark Complete
                              </button>
                            )}
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                              <Bookmark className="w-4 h-4 inline mr-1" />
                              Save
                            </button>
                            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                              <Share2 className="w-4 h-4 inline mr-1" />
                              Share
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trends & Patterns Tab */}
            {activeTab === 'trends' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Trends & Patterns</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Discover patterns in your data and track changes over time
                  </p>
                </div>

                <div className="space-y-6">
                  {trends.map((trend) => (
                    <div key={trend.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">{trend.title}</h4>
                          <p className="text-sm text-gray-500">{trend.category} • {trend.period}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getTrendColor(trend.trend)}`}>{trend.change}</div>
                          <div className="text-sm text-gray-500 capitalize">{trend.trend} trend</div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-600 rounded-lg p-4 mb-4">
                        <div className="h-32 bg-gray-100 dark:bg-gray-500 rounded-lg flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <BarChart3 className="w-16 h-16 mx-auto mb-2" />
                            <p>Chart visualization coming soon</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                        {trend.data.map((item, index) => (
                          <div key={index} className="text-center">
                            <div className="text-sm text-gray-500">{item.month}</div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {trend.category === 'Finance' ? `$${item.amount}` : item.tasks}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h5 className="font-medium text-blue-900 dark:text-blue-100">AI Insight</h5>
                            <p className="text-sm text-blue-700 dark:text-blue-300">{trend.insight}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
