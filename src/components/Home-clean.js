import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDevTools } from '../contexts/DevToolsContext';
import { 
  Package, 
  DollarSign, 
  Utensils, 
  Users, 
  ShoppingCart, 
  Wrench, 
  BarChart3, 
  Smartphone, 
  Zap, 
  Brain, 
  Rocket,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import hybridStorage from '../firebase/hybridStorage';
import AnalyticsService from '../services/AnalyticsService';

function Home() {
  const { currentUser } = useAuth();
  const { isDevMode } = useDevTools();
  const [isLoading, setIsLoading] = useState(true);
  const [realData, setRealData] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({
    inventory: 0,
    budget: 0,
    recipes: 0,
    maintenance: 0
  });
  
  // Features will be loaded from configuration or API
  const [features, setFeatures] = useState([]);
  const [platformStats, setPlatformStats] = useState([]);
  const [benefits, setBenefits] = useState([]);

  // Fetch real data from Firebase
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const analyticsService = new AnalyticsService();

        const [inventoryResponse, recipesResponse, spendingAnalytics] = await Promise.all([
          hybridStorage.getInventoryItems(currentUser.uid),
          hybridStorage.getRecipes(currentUser.uid),
          analyticsService.getSpendingAnalytics(currentUser.uid, '30d')
        ]);

        const inventoryItems = inventoryResponse.success ? inventoryResponse.data : [];
        const recipes = recipesResponse.success ? recipesResponse.data : [];

        const finalStats = {
          inventory: inventoryItems.length || 0,
          budget: spendingAnalytics.totalBudget || 0,
          recipes: recipes.length || 0,
          maintenance: 0 // Will be loaded from maintenance service
        };

        setRealData({
          inventory: inventoryItems,
          recipes: recipes,
          spending: spendingAnalytics,
          stats: finalStats
        });

        setAnimatedStats(finalStats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const animateValue = (key, start, end, duration) => {
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(start + (end - start) * easeOutQuart(progress));
      
      setAnimatedStats(prev => ({
        ...prev,
        [key]: current
      }));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  };

  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

  useEffect(() => {
    if (realData) {
      Object.keys(realData.stats).forEach(key => {
        animateValue(key, 0, realData.stats[key], 1000);
      });
    }
  }, [realData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Home Hub
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Your comprehensive household management platform
            </p>
            
            {currentUser ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <Package className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-3xl font-bold">{animatedStats.inventory}</div>
                  <div className="text-sm text-blue-100">Items</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <DollarSign className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-3xl font-bold">${animatedStats.budget}</div>
                  <div className="text-sm text-blue-100">Budget</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <Utensils className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-3xl font-bold">{animatedStats.recipes}</div>
                  <div className="text-sm text-blue-100">Recipes</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <Wrench className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-3xl font-bold">{animatedStats.maintenance}</div>
                  <div className="text-sm text-blue-100">Tasks</div>
                </div>
              </div>
            ) : (
              <div className="mt-8">
                <Link 
                  to="/login" 
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Core Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Everything you need to manage your household efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link to="/inventory" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Inventory Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track and organize your household items with smart categorization
              </p>
            </div>
          </Link>

          <Link to="/spending" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-6">
                <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Spending Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor expenses and manage your household budget effectively
              </p>
            </div>
          </Link>

          <Link to="/recipes" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-6">
                <Utensils className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Recipe Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Store and organize your favorite recipes with meal planning
              </p>
            </div>
          </Link>

          <Link to="/collaboration" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Real-time Collaboration
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Share and collaborate with family members in real-time
              </p>
            </div>
          </Link>

          <Link to="/shopping" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-6">
                <ShoppingCart className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Smart Shopping Lists
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                AI-generated shopping lists based on inventory and meal plans
              </p>
            </div>
          </Link>

          <Link to="/maintenance" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-6">
                <Wrench className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Maintenance Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Schedule and track home maintenance tasks and reminders
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 dark:bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of users managing their households efficiently
            </p>
            {!currentUser && (
              <Link 
                to="/signup" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
              >
                Create Your Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
