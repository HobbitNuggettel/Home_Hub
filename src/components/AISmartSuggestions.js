import React, { useState, useEffect, useMemo } from 'react';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Clock,
  Zap,
  CheckCircle,
  X,
  RefreshCw,
  Star,
  AlertTriangle,
  Info,
  ChefHat,
  Package,
  Home,
  Users,
  Calendar,
  BarChart3,
  ChevronDown
} from 'lucide-react';
import { useAuth } from './AuthSystem';
import toast from 'react-hot-toast';

// AI Suggestion Categories
const SUGGESTION_CATEGORIES = {
  SHOPPING: 'shopping',
  BUDGETING: 'budgeting',
  INVENTORY: 'inventory',
  MEAL_PLANNING: 'meal_planning',
  ENERGY_SAVING: 'energy_saving',
  ORGANIZATION: 'organization',
  HEALTH: 'health',
  AUTOMATION: 'automation'
};

// Mock AI Service
class AIService {
  static async generateSuggestions(userData, preferences = {}) {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const suggestions = [
      {
        id: '1',
        category: SUGGESTION_CATEGORIES.SHOPPING,
        type: 'cost_optimization',
        title: 'Bulk Purchase Opportunity',
        description: 'Buy milk in 2-gallon containers to save $3.20 per month based on your consumption pattern.',
        confidence: 0.89,
        impact: 'medium',
        savings: 38.40,
        timeframe: 'monthly',
        actionable: true,
        data: {
          currentSpending: 19.96,
          optimizedSpending: 16.76,
          items: ['Organic Milk', 'Regular Milk']
        }
      },
      {
        id: '2',
        category: SUGGESTION_CATEGORIES.MEAL_PLANNING,
        type: 'meal_optimization',
        title: 'Weekly Meal Planning',
        description: 'Plan meals 3 days in advance to reduce food waste by 23% and save $47 monthly.',
        confidence: 0.92,
        impact: 'high',
        savings: 47.00,
        timeframe: 'monthly',
        actionable: true,
        data: {
          wasteReduction: 23,
          currentWaste: 12.5,
          optimizedWaste: 9.6
        }
      },
      {
        id: '3',
        category: SUGGESTION_CATEGORIES.INVENTORY,
        type: 'expiration_prevention',
        title: 'Smart Inventory Rotation',
        description: 'Reorganize your pantry using FIFO method to prevent $15 worth of food from expiring.',
        confidence: 0.85,
        impact: 'medium',
        savings: 15.00,
        timeframe: 'monthly',
        actionable: true,
        data: {
          expiringItems: 5,
          totalValue: 15.00,
          categories: ['Dairy', 'Produce', 'Pantry']
        }
      },
      {
        id: '4',
        category: SUGGESTION_CATEGORIES.BUDGETING,
        type: 'spending_pattern',
        title: 'Grocery Shopping Timing',
        description: 'Shop on Tuesday evenings to take advantage of 12% average discounts on fresh produce.',
        confidence: 0.78,
        impact: 'low',
        savings: 18.50,
        timeframe: 'monthly',
        actionable: true,
        data: {
          bestDays: ['Tuesday', 'Wednesday'],
          averageDiscount: 12,
          categories: ['Produce', 'Dairy', 'Meat']
        }
      },
      {
        id: '5',
        category: SUGGESTION_CATEGORIES.ENERGY_SAVING,
        type: 'appliance_optimization',
        title: 'Smart Appliance Usage',
        description: 'Run dishwasher and laundry during off-peak hours (10 PM - 6 AM) to save $23 monthly.',
        confidence: 0.91,
        impact: 'medium',
        savings: 23.00,
        timeframe: 'monthly',
        actionable: true,
        data: {
          peakHours: ['6 AM - 10 PM'],
          offPeakHours: ['10 PM - 6 AM'],
          savingsPerKwh: 0.08
        }
      },
      {
        id: '6',
        category: SUGGESTION_CATEGORIES.ORGANIZATION,
        type: 'space_optimization',
        title: 'Kitchen Storage Optimization',
        description: 'Reorganize kitchen cabinets to reduce meal prep time by 15 minutes daily.',
        confidence: 0.83,
        impact: 'medium',
        savings: 0, // Time savings, not monetary
        timeframe: 'daily',
        actionable: true,
        data: {
          timeSaved: 15,
          areas: ['Spice Rack', 'Pantry', 'Refrigerator'],
          efficiency: 15
        }
      },
      {
        id: '7',
        category: SUGGESTION_CATEGORIES.HEALTH,
        type: 'nutrition_optimization',
        title: 'Balanced Meal Suggestions',
        description: 'Add more fiber-rich foods to your shopping list to improve household nutrition by 18%.',
        confidence: 0.87,
        impact: 'high',
        savings: 0,
        timeframe: 'weekly',
        actionable: true,
        data: {
          nutritionImprovement: 18,
          recommendedItems: ['Quinoa', 'Black Beans', 'Broccoli', 'Oats'],
          currentFiber: 22,
          targetFiber: 35
        }
      },
      {
        id: '8',
        category: SUGGESTION_CATEGORIES.AUTOMATION,
        type: 'smart_automation',
        title: 'Automated Reordering',
        description: 'Set up automatic reordering for essentials to prevent stockouts and save 2 hours monthly.',
        confidence: 0.94,
        impact: 'high',
        savings: 0,
        timeframe: 'monthly',
        actionable: true,
        data: {
          timeSaved: 120, // minutes
          items: ['Toilet Paper', 'Laundry Detergent', 'Milk', 'Bread'],
          frequency: 'bi-weekly'
        }
      }
    ];
    
    // Filter suggestions based on user preferences
    return suggestions.filter(suggestion => {
      if (preferences.categories && preferences.categories.length > 0) {
        return preferences.categories.includes(suggestion.category);
      }
      return true;
    });
  }
  
  static async applySuggestion(suggestionId, userData) {
    // Simulate API call to apply suggestion
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, message: 'Suggestion applied successfully!' };
  }
  
  static async dismissSuggestion(suggestionId) {
    // Simulate API call to dismiss suggestion
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  }
}

// AI Smart Suggestions Component
const AISmartSuggestions = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('impact'); // 'impact', 'savings', 'confidence'
  const [showDismissed, setShowDismissed] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState([]);

  // Load suggestions
  useEffect(() => {
    loadSuggestions();
  }, [selectedCategories]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const preferences = {
        categories: selectedCategories
      };
      const newSuggestions = await AIService.generateSuggestions(user, preferences);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      toast.error('Failed to load AI suggestions');
    } finally {
      setLoading(false);
    }
  };

  // Sort suggestions
  const sortedSuggestions = useMemo(() => {
    return [...suggestions].sort((a, b) => {
      switch (sortBy) {
        case 'savings':
          return b.savings - a.savings;
        case 'confidence':
          return b.confidence - a.confidence;
        case 'impact':
        default:
          const impactOrder = { high: 3, medium: 2, low: 1 };
          return impactOrder[b.impact] - impactOrder[a.impact];
      }
    });
  }, [suggestions, sortBy]);

  // Apply suggestion
  const handleApplySuggestion = async (suggestion) => {
    try {
      const result = await AIService.applySuggestion(suggestion.id, user);
      if (result.success) {
        toast.success(result.message);
        // Remove applied suggestion from list
        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      }
    } catch (error) {
      toast.error('Failed to apply suggestion');
    }
  };

  // Dismiss suggestion
  const handleDismissSuggestion = async (suggestion) => {
    try {
      await AIService.dismissSuggestion(suggestion.id);
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      setDismissedSuggestions(prev => [...prev, suggestion]);
      toast.info('Suggestion dismissed');
    } catch (error) {
      toast.error('Failed to dismiss suggestion');
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case SUGGESTION_CATEGORIES.SHOPPING: return ShoppingCart;
      case SUGGESTION_CATEGORIES.BUDGETING: return DollarSign;
      case SUGGESTION_CATEGORIES.INVENTORY: return Package;
      case SUGGESTION_CATEGORIES.MEAL_PLANNING: return ChefHat;
      case SUGGESTION_CATEGORIES.ENERGY_SAVING: return Zap;
      case SUGGESTION_CATEGORIES.ORGANIZATION: return Home;
      case SUGGESTION_CATEGORIES.HEALTH: return Target;
      case SUGGESTION_CATEGORIES.AUTOMATION: return Brain;
      default: return Lightbulb;
    }
  };

  // Get impact color
  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Brain className="text-purple-600 dark:text-purple-400" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Smart Suggestions</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Personalized recommendations to optimize your home management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={loadSuggestions}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Categories:</span>
                <div className="flex flex-wrap gap-2">
                  {Object.values(SUGGESTION_CATEGORIES).map(category => (
                    <label key={category} className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, category]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c !== category));
                          }
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs text-gray-600 capitalize">
                        {category.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="impact">Impact</option>
                  <option value="savings">Savings</option>
                  <option value="confidence">Confidence</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* AI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3">
              <Brain className="text-purple-600 dark:text-purple-400" size={20} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI Confidence</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">87%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="text-green-600 dark:text-green-400" size={20} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Potential Savings</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">$142</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 border">
            <div className="flex items-center space-x-3">
              <Clock className="text-blue-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Time Saved</p>
                <p className="text-lg font-bold text-gray-900">3.2 hrs</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 border">
            <div className="flex items-center space-x-3">
              <TrendingUp className="text-orange-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Efficiency Gain</p>
                <p className="text-lg font-bold text-gray-900">+15%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <Brain className="mx-auto mb-4 animate-pulse text-purple-600" size={48} />
              <p className="text-gray-600">AI is analyzing your data...</p>
            </div>
          ) : sortedSuggestions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md border">
              <Lightbulb className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions available</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later for new recommendations.</p>
            </div>
          ) : (
            sortedSuggestions.map(suggestion => {
              const IconComponent = getCategoryIcon(suggestion.category);
              return (
                <div key={suggestion.id} className="bg-white rounded-lg shadow-md p-6 border hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <IconComponent className="text-gray-600" size={24} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{suggestion.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(suggestion.impact)}`}>
                            {suggestion.impact} impact
                          </span>
                          <div className="flex items-center space-x-1">
                            <Star className="text-yellow-500" size={14} />
                            <span className="text-sm text-gray-600">{Math.round(suggestion.confidence * 100)}%</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{suggestion.description}</p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          {suggestion.savings > 0 && (
                            <div className="flex items-center space-x-1">
                              <DollarSign size={14} />
                              <span>${suggestion.savings.toFixed(2)} {suggestion.timeframe}</span>
                            </div>
                          )}
                          
                          {suggestion.data.timeSaved && (
                            <div className="flex items-center space-x-1">
                              <Clock size={14} />
                              <span>{suggestion.data.timeSaved} min saved</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-1">
                            <BarChart3 size={14} />
                            <span className="capitalize">{suggestion.category.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {suggestion.actionable && (
                        <button
                          onClick={() => handleApplySuggestion(suggestion)}
                          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                        >
                          <CheckCircle size={14} />
                          <span>Apply</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDismissSuggestion(suggestion)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Dismissed Suggestions */}
        {dismissedSuggestions.length > 0 && (
          <div className="mt-8">
            <button
              onClick={() => setShowDismissed(!showDismissed)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
            >
              <span>Dismissed Suggestions ({dismissedSuggestions.length})</span>
              <ChevronDown className={`transform transition-transform ${showDismissed ? 'rotate-180' : ''}`} size={16} />
            </button>
            
            {showDismissed && (
              <div className="space-y-2">
                {dismissedSuggestions.map(suggestion => (
                  <div key={suggestion.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 opacity-60">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                        <p className="text-sm text-gray-600">{suggestion.description}</p>
                      </div>
                      <span className="text-xs text-gray-500">Dismissed</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AISmartSuggestions;