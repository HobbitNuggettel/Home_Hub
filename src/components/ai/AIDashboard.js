import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Lightbulb, 
  Zap, 
  TrendingUp, 
  Target, 
  Clock, 
  DollarSign, 
  Package, 
  ChefHat, 
  ShoppingCart, 
  AlertTriangle, 
  BarChart3, 
  Users, 
  Settings,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowRight,
  Star,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import AIExpenseService from '../services/AIExpenseService';
import AIInventoryService from '../services/AIInventoryService';
import AIRecipeService from '../services/AIRecipeService';
import { AdvancedAIService } from '../services/AdvancedAIService';

export default function AIDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // AI Insights State
  const [expenseInsights, setExpenseInsights] = useState([]);
  const [inventoryPredictions, setInventoryPredictions] = useState([]);
  const [recipeRecommendations, setRecipeRecommendations] = useState([]);
  const [aiAlerts, setAiAlerts] = useState([]);
  const [overallScore, setOverallScore] = useState(0);
  
  // Mock data for demonstration
  const mockExpenses = [
    { id: '1', description: 'Grocery Shopping', amount: 125.50, category: 'Food & Groceries', date: '2024-01-20' },
    { id: '2', description: 'Gas Station', amount: 45.00, category: 'Transportation', date: '2024-01-19' },
    { id: '3', description: 'Netflix Subscription', amount: 15.99, category: 'Entertainment', date: '2024-01-15' }
  ];
  
  const mockInventory = [
    { id: '1', name: 'Coffee Maker', category: 'Kitchen', quantity: 1, price: 89.99 },
    { id: '2', name: 'Laptop', category: 'Electronics', quantity: 1, price: 1299.99 },
    { id: '3', name: 'Toothpaste', category: 'Bathroom', quantity: 2, price: 4.99 }
  ];
  
  const mockRecipes = [
    { id: '1', name: 'Spaghetti Carbonara', cuisine: 'Italian', difficulty: 'medium', prepTime: 15 },
    { id: '2', name: 'Chicken Tikka Masala', cuisine: 'Indian', difficulty: 'medium', prepTime: 30 }
  ];

  // Load all AI insights
  const loadAllAIInsights = async () => {
    setIsLoading(true);
    try {
      const [
        expenses,
        inventory,
        recipes,
        alerts
      ] = await Promise.all([
        AIExpenseService.generateSpendingInsights(mockExpenses),
        AIInventoryService.predictInventoryNeeds(mockInventory),
        AIRecipeService.generateSmartRecipeRecommendations(mockInventory, mockRecipes),
        AIInventoryService.generateInventoryAlerts(mockInventory)
      ]);
      
      setExpenseInsights(expenses);
      setInventoryPredictions(inventory);
      setRecipeRecommendations(recipes);
      setAiAlerts(alerts);
      
      // Calculate overall AI score
      const score = calculateOverallScore(expenses, inventory, recipes, alerts);
      setOverallScore(score);
      
      setLastUpdated(new Date());
      toast.success('AI insights refreshed successfully!');
    } catch (error) {
      console.error('Error loading AI insights:', error);
      toast.error('Failed to load AI insights');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate overall AI effectiveness score
  const calculateOverallScore = (expenses, inventory, recipes, alerts) => {
    let score = 0;
    let total = 0;
    
    // Expense insights score
    if (expenses.length > 0) {
      score += Math.min(expenses.length * 10, 30);
      total += 30;
    }
    
    // Inventory predictions score
    if (inventory.length > 0) {
      score += Math.min(inventory.length * 15, 30);
      total += 30;
    }
    
    // Recipe recommendations score
    if (recipes.length > 0) {
      score += Math.min(recipes.length * 8, 25);
      total += 25;
    }
    
    // Alert accuracy score
    if (alerts.length > 0) {
      score += Math.min(alerts.length * 12, 15);
      total += 15;
    }
    
    return total > 0 ? Math.round((score / total) * 100) : 0;
  };

  // Load insights on component mount
  useEffect(() => {
    loadAllAIInsights();
  }, []);

  // AI Score Badge Component
  const AIScoreBadge = ({ score }) => {
    let color = 'text-gray-500';
    let bgColor = 'bg-gray-100';
    let icon = <Info className="w-4 h-4" />;
    
    if (score >= 80) {
      color = 'text-green-600';
      bgColor = 'bg-green-100';
      icon = <Star className="w-4 h-4" />;
    } else if (score >= 60) {
      color = 'text-blue-600';
      bgColor = 'bg-blue-100';
      icon = <CheckCircle className="w-4 h-4" />;
    } else if (score >= 40) {
      color = 'text-yellow-600';
      bgColor = 'bg-yellow-100';
      icon = <Clock className="w-4 h-4" />;
    } else {
      color = 'text-red-600';
      bgColor = 'bg-red-100';
      icon = <XCircle className="w-4 h-4" />;
    }
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${bgColor} ${color}`}>
        {icon}
        <span className="font-medium">{score}% AI Score</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-600" />
                AI Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Your AI-powered home management command center
              </p>
            </div>
            <div className="flex items-center gap-4">
              <AIScoreBadge score={overallScore} />
              <button
                onClick={loadAllAIInsights}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
              >
                {showDetails ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* AI Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Expense AI */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                {expenseInsights.length} insights
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Smart Spending
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              AI-powered expense categorization and budget optimization
            </p>
            <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm">
              <ArrowRight className="w-4 h-4 mr-1" />
              View Details
            </div>
          </div>

          {/* Inventory AI */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-green-600" />
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                {inventoryPredictions.length} predictions
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Smart Inventory
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Predictive analytics for inventory optimization
            </p>
            <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
              <ArrowRight className="w-4 h-4 mr-1" />
              View Details
            </div>
          </div>

          {/* Recipe AI */}
          <div className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <ChefHat className="w-8 h-8 text-orange-600" />
              <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                {recipeRecommendations.length} recipes
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Smart Recipes
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              AI-powered meal planning and recipe suggestions
            </p>
            <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm">
              <ArrowRight className="w-4 h-4 mr-1" />
              View Details
            </div>
          </div>

          {/* Overall AI */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Brain className="w-8 h-8 text-purple-600" />
              <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                {aiAlerts.length} alerts
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AI Intelligence
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Comprehensive AI insights and recommendations
            </p>
            <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm">
              <ArrowRight className="w-4 h-4 mr-1" />
              View Details
            </div>
          </div>
        </div>

        {/* AI Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Expense Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Smart Spending Insights
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {expenseInsights.length} insights
              </span>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Analyzing spending patterns...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expenseInsights.slice(0, 3).map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {insight.title}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                        {insight.description}
                      </div>
                    </div>
                  </div>
                ))}
                {expenseInsights.length === 0 && (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No spending insights available
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Inventory Predictions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                Inventory Predictions
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {inventoryPredictions.length} predictions
              </span>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Analyzing inventory patterns...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inventoryPredictions.slice(0, 3).map((prediction, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {prediction.itemName}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                        {prediction.daysRemaining} days remaining • {prediction.urgency} priority
                      </div>
                    </div>
                  </div>
                ))}
                {inventoryPredictions.length === 0 && (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No inventory predictions available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* AI Alerts Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              AI Alerts & Recommendations
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {aiAlerts.length} active alerts
            </span>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Checking for alerts...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {aiAlerts.slice(0, 5).map((alert, index) => (
                <div key={index} className={`flex items-start gap-3 p-4 rounded-lg border-l-4 ${
                  alert.priority === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-400' :
                  alert.priority === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400' :
                  'bg-blue-50 dark:bg-blue-900/20 border-blue-400'
                }`}>
                  <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    alert.priority === 'critical' ? 'text-red-600' :
                    alert.priority === 'high' ? 'text-orange-600' :
                    'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {alert.title}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      {alert.count} items need attention
                    </div>
                    <div className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                      {alert.action}
                    </div>
                  </div>
                </div>
              ))}
              {aiAlerts.length === 0 && (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  No active alerts - everything looks good! 🎉
                </div>
              )}
            </div>
          )}
        </div>

        {/* Last Updated Footer */}
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
