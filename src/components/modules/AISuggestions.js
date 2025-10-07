import React, { useState, useEffect } from 'react';
import { Brain, Lightbulb, TrendingUp, AlertTriangle, Target, Zap, BarChart3, Clock, Star, CheckCircle, Package } from 'lucide-react';

const AISuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showInsights, setShowInsights] = useState(true);

  // AI-powered suggestions categories
  const categories = [
    'all', 'inventory', 'spending', 'energy', 'maintenance', 'shopping', 'health', 'productivity'
  ];

  useEffect(() => {
    generateAISuggestions();
    generateInsights();
  }, []);

  const generateAISuggestions = () => {
    setLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const aiSuggestions = [
        {
          id: 1,
          type: 'inventory',
          title: 'Low Stock Alert',
          description: 'Your coffee beans are running low. Consider restocking before you run out.',
          priority: 'high',
          impact: 'daily-routine',
          estimatedSavings: '$15',
          action: 'Add to shopping list',
          confidence: 95,
          category: 'inventory',
          icon: AlertTriangle,
          color: 'text-red-500'
        },
        {
          id: 2,
          type: 'spending',
          title: 'Budget Optimization',
          description: 'Your entertainment spending is 20% above average. Consider reviewing subscriptions.',
          priority: 'medium',
          impact: 'monthly-budget',
          estimatedSavings: '$45/month',
          action: 'Review subscriptions',
          confidence: 87,
          category: 'spending',
          icon: TrendingUp,
          color: 'text-orange-500'
        },
        {
          id: 3,
          type: 'energy',
          title: 'Energy Efficiency',
          description: 'Your energy usage peaks between 6-8 PM. Consider shifting high-power activities.',
          priority: 'medium',
          impact: 'monthly-bills',
          estimatedSavings: '$30/month',
          action: 'Schedule energy usage',
          confidence: 92,
          category: 'energy',
          icon: Zap,
          color: 'text-blue-500'
        },
        {
          id: 4,
          type: 'maintenance',
          title: 'Preventive Maintenance',
          description: 'Your HVAC system is due for annual maintenance. Schedule now to avoid breakdowns.',
          priority: 'high',
          impact: 'home-comfort',
          estimatedSavings: '$200',
          action: 'Schedule maintenance',
          confidence: 89,
          category: 'maintenance',
          icon: Target,
          color: 'text-green-500'
        },
        {
          id: 5,
          type: 'shopping',
          title: 'Smart Purchase Timing',
          description: 'Electronics prices typically drop in January. Wait 2 weeks for better deals.',
          priority: 'low',
          impact: 'purchase-timing',
          estimatedSavings: '$100-300',
          action: 'Delay purchase',
          confidence: 78,
          category: 'shopping',
          icon: Clock,
          color: 'text-purple-500'
        },
        {
          id: 6,
          type: 'health',
          title: 'Wellness Reminder',
          description: 'You\'ve been indoors for 6+ hours. Consider a 15-minute walk for better health.',
          priority: 'medium',
          impact: 'daily-wellness',
          estimatedSavings: 'N/A',
          action: 'Take a break',
          confidence: 94,
          category: 'health',
          icon: Star,
          color: 'text-yellow-500'
        }
      ];
      
      setSuggestions(aiSuggestions);
      setLoading(false);
    }, 1500);
  };

  const generateInsights = () => {
    const aiInsights = [
      {
        id: 1,
        title: 'Spending Pattern Analysis',
        description: 'Your grocery spending has increased 15% this month, likely due to inflation.',
        trend: 'increasing',
        data: [120, 135, 142, 138, 155],
        recommendation: 'Consider bulk purchases for non-perishables to offset rising costs.'
      },
      {
        id: 2,
        title: 'Energy Usage Optimization',
        description: 'Your energy consumption is 12% lower than last year, great job!',
        trend: 'decreasing',
        data: [450, 420, 395, 380, 360],
        recommendation: 'Continue using energy-efficient practices and consider solar panels.'
      },
      {
        id: 3,
        title: 'Inventory Turnover Rate',
        description: 'Kitchen items have the highest turnover rate (3.2x per month).',
        trend: 'stable',
        data: [2.8, 3.1, 3.0, 3.2, 3.1],
        recommendation: 'Optimize kitchen storage and consider meal planning to reduce waste.'
      }
    ];
    
    setInsights(aiInsights);
  };

  const handleSuggestionAction = (suggestion) => {
    // Simulate action execution
    console.log(`Executing action: ${suggestion.action} for ${suggestion.title}`);
    
    // Mark as completed
    setSuggestions(prev => 
      prev.map(s => 
        s.id === suggestion.id 
          ? { ...s, completed: true, completedAt: new Date().toISOString() }
          : s
      )
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'inventory': return Package;
      case 'spending': return TrendingUp;
      case 'energy': return Zap;
      case 'maintenance': return Target;
      case 'shopping': return Clock;
      case 'health': return Star;
      default: return Lightbulb;
    }
  };

  const filteredSuggestions = selectedCategory === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AI Smart Suggestions
              </h1>
              <p className="text-lg text-gray-600">
                Intelligent recommendations powered by artificial intelligence
              </p>
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* AI Insights Toggle */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">AI Insights & Analytics</h2>
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            {showInsights ? 'Hide Insights' : 'Show Insights'}
          </button>
        </div>

        {/* AI Insights */}
        {showInsights && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {insights.map(insight => (
              <div key={insight.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${
                    insight.trend === 'increasing' ? 'bg-red-100' :
                    insight.trend === 'decreasing' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <TrendingUp className={`h-5 w-5 ${
                      insight.trend === 'increasing' ? 'text-red-600' :
                      insight.trend === 'decreasing' ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                </div>
                
                <p className="text-gray-600 mb-4">{insight.description}</p>
                
                {/* Simple Chart */}
                <div className="flex items-end gap-1 mb-4 h-16">
                  {insight.data.map((value, index) => (
                    <div
                      key={`chart-bar-${insight.id}-${value}`}
                      className="bg-purple-200 rounded-t flex-1"
                      style={{ height: `${(value / Math.max(...insight.data)) * 100}%` }}
                    />
                  ))}
                </div>
                
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <strong>Recommendation:</strong> {insight.recommendation}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* AI Suggestions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Smart Recommendations ({filteredSuggestions.length})
            </h2>
            <button
              onClick={generateAISuggestions}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <Brain className="h-4 w-4" />
              {loading ? 'Generating...' : 'Refresh AI'}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-gray-600">AI is analyzing your data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSuggestions.map(suggestion => (
                <div
                  key={`suggestion-${suggestion.id}-${suggestion.title}`}
                  className={`bg-white rounded-xl p-6 border-2 transition-all hover:shadow-lg ${
                    suggestion.completed 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${suggestion.color.replace('text-', 'bg-').replace('-500', '-100')}`}>
                        <suggestion.icon className={`h-5 w-5 ${suggestion.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{suggestion.title}</h3>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(suggestion.priority)}`}>
                          {suggestion.priority} priority
                        </span>
                      </div>
                    </div>
                    
                    {suggestion.completed && (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4">{suggestion.description}</p>

                  {/* Impact & Savings */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Impact</p>
                      <p className="font-medium text-gray-900 capitalize">{suggestion.impact.replace('-', ' ')}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Estimated Savings</p>
                      <p className="font-medium text-gray-900">{suggestion.estimatedSavings}</p>
                    </div>
                  </div>

                  {/* Action & Confidence */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Confidence:</span>
                      <span className="text-sm font-medium text-gray-900">{suggestion.confidence}%</span>
                    </div>
                    
                    {!suggestion.completed && (
                      <button
                        onClick={() => handleSuggestionAction(suggestion)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        {suggestion.action}
                      </button>
                    )}
                  </div>

                  {/* Completion Status */}
                  {suggestion.completed && (
                    <div className="mt-4 p-3 bg-green-100 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✅ Completed on {new Date(suggestion.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Learning Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI Learning & Improvement</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Learning from your actions and preferences</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Adapting to seasonal patterns and trends</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Improving accuracy with more data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISuggestions;
