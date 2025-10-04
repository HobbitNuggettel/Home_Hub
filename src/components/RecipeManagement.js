import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  ChefHat, 
  Clock, 
  Users, 
  Star,
  Calendar,
  ShoppingCart,
  Edit,
  Trash2,
  Heart,
  Share,
  Download,
  Upload,
  Filter,
  Grid,
  List,
  Clock3,
  Thermometer,
  Scale,
  BookOpen,
  Brain,
  Lightbulb,
  Zap,
  TrendingUp,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import AIRecipeService from '../services/AIRecipeService';
import { useAuth } from '../contexts/AuthContext';
import hybridStorage from '../firebase/hybridStorage';

// Mock recipes data
const mockRecipes = [
  {
    id: '1',
    name: 'Spaghetti Carbonara',
    description: 'Classic Italian pasta dish with eggs, cheese, and pancetta',
    category: 'Italian',
    cuisine: 'Italian',
    prepTime: 15,
    cookTime: 20,
    totalTime: 35,
    servings: 4,
    difficulty: 'medium',
    rating: 4.8,
    favorite: true,
    ingredients: [
      { id: '1', name: 'Spaghetti', amount: 1, unit: 'lb', notes: 'High-quality pasta' },
      { id: '2', name: 'Eggs', amount: 4, unit: 'large', notes: 'Room temperature' },
      { id: '3', name: 'Pecorino Romano', amount: 1, unit: 'cup', notes: 'Freshly grated' },
      { id: '4', name: 'Pancetta', amount: 8, unit: 'oz', notes: 'Diced' },
      { id: '5', name: 'Black Pepper', amount: 1, unit: 'tsp', notes: 'Freshly ground' }
    ],
    instructions: [
      'Bring a large pot of salted water to boil and cook spaghetti according to package directions.',
      'Meanwhile, cook pancetta in a large skillet over medium heat until crispy.',
      'In a bowl, whisk together eggs, cheese, and pepper.',
      'Drain pasta, reserving 1 cup of pasta water.',
      'Add hot pasta to skillet with pancetta, remove from heat.',
      'Quickly stir in egg mixture, adding pasta water as needed for creamy consistency.',
      'Serve immediately with extra cheese and pepper.'
    ],
    tags: ['pasta', 'italian', 'quick', 'dinner'],
    nutrition: {
      calories: 650,
      protein: 25,
      carbs: 75,
      fat: 28,
      fiber: 3
    },
    image: null,
    createdBy: 'John Smith',
    createdAt: '2024-01-15',
    lastCooked: '2024-01-18',
    cookCount: 3
  },
  {
    id: '2',
    name: 'Chicken Tikka Masala',
    description: 'Creamy and flavorful Indian curry with tender chicken',
    category: 'Indian',
    cuisine: 'Indian',
    prepTime: 30,
    cookTime: 45,
    totalTime: 75,
    servings: 6,
    difficulty: 'hard',
    rating: 4.9,
    favorite: false,
    ingredients: [
      { id: '6', name: 'Chicken Breast', amount: 2, unit: 'lbs', notes: 'Cut into chunks' },
      { id: '7', name: 'Yogurt', amount: 1, unit: 'cup', notes: 'Plain, full-fat' },
      { id: '8', name: 'Garam Masala', amount: 2, unit: 'tbsp', notes: 'Freshly ground' },
      { id: '9', name: 'Heavy Cream', amount: 1, unit: 'cup', notes: 'For sauce' },
      { id: '10', name: 'Tomato Sauce', amount: 2, unit: 'cups', notes: 'Canned or fresh' }
    ],
    instructions: [
      'Marinate chicken in yogurt and spices for at least 2 hours.',
      'Grill or bake chicken until charred and cooked through.',
      'In a large pan, sauté onions and garlic until soft.',
      'Add tomato sauce and simmer for 15 minutes.',
      'Stir in cream and cooked chicken, simmer for 10 minutes.',
      'Garnish with cilantro and serve with rice or naan.'
    ],
    tags: ['chicken', 'curry', 'indian', 'spicy'],
    nutrition: {
      calories: 420,
      protein: 35,
      carbs: 8,
      fat: 28,
      fiber: 2
    },
    image: null,
    createdBy: 'Jane Smith',
    createdAt: '2024-01-10',
    lastCooked: '2024-01-20',
    cookCount: 1
  }
];

const categories = [
  'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Appetizer', 'Soup', 'Salad', 'Bread', 'Other'
];

const cuisines = [
  'American', 'Italian', 'Mexican', 'Chinese', 'Indian', 'French', 'Japanese', 'Thai', 'Mediterranean', 'Other'
];

const difficulties = ['easy', 'medium', 'hard'];

export default function RecipeManagement() {
  const { currentUser } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('recipes'); // 'recipes', 'meal-planning', 'shopping'
  const [displayMode, setDisplayMode] = useState('grid'); // 'grid', 'list'
  const [showCreateRecipe, setShowCreateRecipe] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load recipes data from Firebase
  useEffect(() => {
    const loadRecipesData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await hybridStorage.getRecipes(currentUser.uid);
        if (response.success) {
          setRecipes(response.data || []);
        } else {
          console.error('Failed to load recipes:', response.error);
          setRecipes([]);
        }
      } catch (error) {
        console.error('Error loading recipes:', error);
        setRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipesData();
  }, [currentUser]);
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [mealPlan, setMealPlan] = useState({});

  // AI Features State
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiMealPlan, setAiMealPlan] = useState(null);
  const [aiShoppingList, setAiShoppingList] = useState([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [familyPreferences, setFamilyPreferences] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    maxCookTime: 60,
    maxDifficulty: 'medium',
    preferredCuisines: []
  });

  // Filter recipes based on search and filters
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    const matchesCuisine = selectedCuisine === 'all' || recipe.cuisine === selectedCuisine;
    const matchesDifficulty = selectedDifficulty === 'all' || recipe.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesCuisine && matchesDifficulty;
  });

  // Create new recipe
  const createRecipe = (recipeData) => {
    const newRecipe = {
      id: Date.now().toString(),
      ...recipeData,
      rating: 0,
      favorite: false,
      createdBy: 'John Smith',
      createdAt: new Date().toISOString().split('T')[0],
      lastCooked: null,
      cookCount: 0,
      image: null
    };
    setRecipes([...recipes, newRecipe]);
    setShowCreateRecipe(false);
    toast.success('Recipe created successfully!');
  };

  // Update recipe
  const updateRecipe = (id, updates) => {
    setRecipes(recipes.map(recipe => 
      recipe.id === id ? { ...recipe, ...updates } : recipe
    ));
    setEditingRecipe(null);
    toast.success('Recipe updated successfully!');
  };

  // Delete recipe
  const deleteRecipe = (id) => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      setRecipes(recipes.filter(recipe => recipe.id !== id));
      toast.success('Recipe deleted successfully!');
    }
  };

  // Toggle favorite
  const toggleFavorite = (id) => {
    setRecipes(recipes.map(recipe => 
      recipe.id === id ? { ...recipe, favorite: !recipe.favorite } : recipe
    ));
  };

  // Add to meal plan
  const addToMealPlan = (recipeId, date, meal) => {
    setMealPlan(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [meal]: recipeId
      }
    }));
    toast.success('Recipe added to meal plan!');
  };

  // Remove from meal plan
  const removeFromMealPlan = (date, meal) => {
    setMealPlan(prev => {
      const newPlan = { ...prev };
      if (newPlan[date]) {
        delete newPlan[date][meal];
        if (Object.keys(newPlan[date]).length === 0) {
          delete newPlan[date];
        }
      }
      return newPlan;
    });
    toast.success('Recipe removed from meal plan!');
  };

  // Get recipe by ID
  const getRecipeById = (id) => recipes.find(recipe => recipe.id === id);

  // Generate shopping list from meal plan
  const generateShoppingList = () => {
    const ingredients = {};
    
    Object.values(mealPlan).forEach(dayMeals => {
      Object.values(dayMeals).forEach(recipeId => {
        const recipe = getRecipeById(recipeId);
        if (recipe) {
          recipe.ingredients.forEach(ingredient => {
            const key = `${ingredient.name}-${ingredient.unit}`;
            if (ingredients[key]) {
              ingredients[key].amount += ingredient.amount;
            } else {
              ingredients[key] = { ...ingredient };
            }
          });
        }
      });
    });

    return Object.values(ingredients);
  };

  // Export recipe to CSV
  const exportToCSV = (recipe) => {
    const csvContent = [
      ['Recipe', recipe.name],
      ['Description', recipe.description],
      ['Category', recipe.category],
      ['Cuisine', recipe.cuisine],
      ['Prep Time', `${recipe.prepTime} minutes`],
      ['Cook Time', `${recipe.cookTime} minutes`],
      ['Total Time', `${recipe.totalTime} minutes`],
      ['Servings', recipe.servings],
      ['Difficulty', recipe.difficulty],
      [''],
      ['Ingredients'],
      ['Name', 'Amount', 'Unit', 'Notes'],
      ...recipe.ingredients.map(ing => [ing.name, ing.amount, ing.unit, ing.notes || '']),
      [''],
      ['Instructions'],
      ...recipe.instructions.map((instruction, index) => [`${index + 1}.`, instruction])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.name.replace(/\s+/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Recipe exported to CSV!');
  };

  // Load AI insights and recommendations
  const loadAIInsights = useCallback(async () => {
    if (recipes.length === 0) return;

    setIsLoadingAI(true);
    try {
      const [recommendations, mealPlan] = await Promise.all([
        AIRecipeService.generateSmartRecipeRecommendations([], recipes), // Empty inventory for now
        AIRecipeService.generateMealPlan([], recipes, familyPreferences, 7)
      ]);

      setAiRecommendations(recommendations);
      setAiMealPlan(mealPlan);
      setAiShoppingList(mealPlan.shoppingList || []);
    } catch (error) {
      console.error('Error loading AI insights:', error);
      toast.error('Failed to load AI insights');
    } finally {
      setIsLoadingAI(false);
    }
  }, [recipes, familyPreferences]);

  // Load AI insights on component mount and when recipes change
  useEffect(() => {
    loadAIInsights();
  }, [loadAIInsights]);

  // Generate new AI meal plan
  const generateNewMealPlan = async () => {
    setIsLoadingAI(true);
    try {
      const newMealPlan = await AIRecipeService.generateMealPlan([], recipes, familyPreferences, 7);
      setAiMealPlan(newMealPlan);
      setAiShoppingList(newMealPlan.shoppingList || []);
      toast.success('New AI meal plan generated!');
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast.error('Failed to generate meal plan');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // AI Insights Panel Component
  const AIInsightsPanel = () => (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Recipe Insights & Smart Meal Planning
        </h3>
        <button
          onClick={() => setShowAIPanel(!showAIPanel)}
          className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
        >
          {showAIPanel ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {isLoadingAI ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-orange-600 dark:text-orange-400 mt-2">Analyzing your recipes and preferences...</p>
        </div>
      ) : (
        <>
          {/* Quick AI Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {aiRecommendations.filter(r => r.priority === 'high').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">High Priority</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {aiRecommendations.filter(r => r.type === 'waste_reduction').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Waste Reduction</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {aiMealPlan?.days?.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Planned Days</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {aiShoppingList.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Shopping Items</div>
            </div>
          </div>

          {/* Generate New Meal Plan Button */}
          <div className="text-center mb-4">
            <button
              onClick={generateNewMealPlan}
              disabled={isLoadingAI}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <ChefHat className="w-4 h-4" />
              {isLoadingAI ? 'Generating...' : 'Generate New AI Meal Plan'}
            </button>
          </div>

          {showAIPanel && (
            <div className="space-y-4">
              {/* AI Recipe Recommendations */}
              {aiRecommendations.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Smart Recipe Recommendations
                  </h4>
                  <div className="space-y-2">
                    {aiRecommendations.slice(0, 3).map((recommendation, index) => (
                      <div key={`ai-recommendation-${recommendation.recipeName}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg p-3 border-l-4 border-red-400">
                        <div className="font-medium text-gray-800 dark:text-gray-200">{recommendation.recipeName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{recommendation.reasoning}</div>
                        {recommendation.type === 'waste_reduction' && (
                          <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                            Save ${recommendation.estimatedSavings?.toFixed(2) || '0'} by using expiring ingredients
                          </div>
                        )}
                        {recommendation.type === 'budget_friendly' && (
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Estimated cost: ${recommendation.estimatedCost?.toFixed(2) || '0'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Meal Plan Preview */}
              {aiMealPlan && (
                <div>
                  <h4 className="font-medium text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    7-Day AI Meal Plan Preview
                  </h4>
                  <div className="space-y-2">
                    {aiMealPlan.days.slice(0, 3).map((day, index) => (
                      <div key={`ai-meal-plan-${day.day}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg p-3 border-l-4 border-orange-400">
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {day.meals.length} meals planned • {day.totalCalories} calories • ${day.totalCost?.toFixed(2) || '0'}
                        </div>
                        <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                          {day.meals.map(meal => meal.recipe?.name).filter(Boolean).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Shopping List */}
              {aiShoppingList.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Smart Shopping List
                  </h4>
                  <div className="space-y-2">
                    {aiShoppingList.slice(0, 5).map((item, index) => (
                      <div key={`ai-shopping-item-${item.name}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg p-3 border-l-4 border-green-400">
                        <div className="font-medium text-gray-800 dark:text-gray-200">{item.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {item.quantity} {item.category} • ${item.estimatedCost?.toFixed(2) || '0'}
                        </div>
                        {item.usedInRecipes && (
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Used in: {item.usedInRecipes.slice(0, 2).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recipe Management</h1>
              <p className="text-gray-600 dark:text-gray-300">Create, organize, and plan meals with AI-powered recommendations</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateRecipe(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Recipe</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AIInsightsPanel />
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1 mb-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setViewMode('recipes')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'recipes'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <BookOpen size={16} />
                <span>Recipes</span>
              </div>
            </button>
            <button
              onClick={() => setViewMode('meal-planning')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'meal-planning'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Calendar size={16} />
                <span>Meal Planning</span>
              </div>
            </button>
            <button
              onClick={() => setViewMode('shopping')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'shopping'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <ShoppingCart size={16} />
                <span>Shopping List</span>
              </div>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <BookOpen className="text-blue-600 dark:text-blue-400" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Recipes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{recipes.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <Heart className="text-red-600 dark:text-red-400" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Favorites</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {recipes.filter(recipe => recipe.favorite).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <Clock className="text-green-600 dark:text-green-400" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Prep Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(recipes.reduce((sum, recipe) => sum + recipe.prepTime, 0) / recipes.length)}m
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <Star className="text-yellow-600 dark:text-yellow-400" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {recipes.length > 0 ? (recipes.reduce((sum, recipe) => sum + recipe.rating, 0) / recipes.length).toFixed(1) : '0.0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'recipes' && (
          <div>
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Recipes</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by name, description, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine</label>
                  <select
                    value={selectedCuisine}
                    onChange={(e) => setSelectedCuisine(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Cuisines</option>
                    {cuisines.map(cuisine => (
                      <option key={cuisine} value={cuisine}>{cuisine}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Difficulties</option>
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end space-x-2">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedCuisine('all');
                      setSelectedDifficulty('all');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setDisplayMode(displayMode === 'grid' ? 'list' : 'grid')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    title={`Switch to ${displayMode === 'grid' ? 'list' : 'grid'} view`}
                  >
                    {displayMode === 'grid' ? <List size={16} /> : <Grid size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Recipes Display */}
            {displayMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map(recipe => (
                  <div key={recipe.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{recipe.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{recipe.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className="capitalize">{recipe.category}</span>
                            <span className="capitalize">{recipe.cuisine}</span>
                            <span className="capitalize">{recipe.difficulty}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleFavorite(recipe.id)}
                            className={`${recipe.favorite ? 'text-red-600' : 'text-gray-400'} hover:text-red-600`}
                            title={recipe.favorite ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Heart size={16} fill={recipe.favorite ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={() => setEditingRecipe(recipe)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Recipe"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => exportToCSV(recipe)}
                            className="text-green-600 hover:text-green-900"
                            title="Export to CSV"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => deleteRecipe(recipe.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Recipe"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Recipe Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{recipe.prepTime}m</div>
                          <div className="text-xs text-gray-500">Prep</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{recipe.cookTime}m</div>
                          <div className="text-xs text-gray-500">Cook</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{recipe.servings}</div>
                          <div className="text-xs text-gray-500">Serves</div>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-1">
                          <Star size={16} className="text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-gray-900">{recipe.rating}</span>
                        </div>
                        <span className="text-xs text-gray-500">Cooked {recipe.cookCount} times</span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {recipe.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                            {tag}
                          </span>
                        ))}
                        {recipe.tags.length > 3 && (
                          <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            +{recipe.tags.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => addToMealPlan(recipe.id, new Date().toISOString().split('T')[0], 'dinner')}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          Plan Meal
                        </button>
                        <button
                          onClick={() => window.open(`/recipe/${recipe.id}`, '_blank')}
                          className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recipes ({filteredRecipes.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipe</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRecipes.map(recipe => (
                        <tr key={recipe.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{recipe.name}</div>
                              <div className="text-sm text-gray-500">{recipe.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {recipe.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {recipe.totalTime}m
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              <Star size={14} className="text-yellow-500 fill-current" />
                              <span className="text-sm font-medium text-gray-900">{recipe.rating}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => toggleFavorite(recipe.id)}
                                className={`${recipe.favorite ? 'text-red-600' : 'text-gray-400'} hover:text-red-600`}
                                title={recipe.favorite ? 'Remove from favorites' : 'Add to favorites'}
                              >
                                <Heart size={14} fill={recipe.favorite ? 'currentColor' : 'none'} />
                              </button>
                              <button
                                onClick={() => setEditingRecipe(recipe)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit Recipe"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => deleteRecipe(recipe.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete Recipe"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'meal-planning' && (
          <div>
            {/* Weekly Meal Plan */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Meal Plan</h3>
              <div className="grid grid-cols-7 gap-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
                  const date = new Date();
                  date.setDate(date.getDate() + index);
                  const dateStr = date.toISOString().split('T')[0];
                  const dayMeals = mealPlan[dateStr] || {};
                  
                  return (
                    <div key={day} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">{day}</h4>
                      <div className="space-y-2">
                        {['breakfast', 'lunch', 'dinner'].map(meal => {
                          const recipeId = dayMeals[meal];
                          const recipe = recipeId ? getRecipeById(recipeId) : null;
                          
                          return (
                            <div key={meal} className="text-sm">
                              <div className="capitalize text-gray-600 mb-1">{meal}</div>
                              {recipe ? (
                                <div className="bg-blue-50 rounded p-2">
                                  <div className="font-medium text-blue-900">{recipe.name}</div>
                                  <button
                                    onClick={() => removeFromMealPlan(dateStr, meal)}
                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setShowCreateRecipe(true)}
                                  className="w-full text-left text-gray-400 hover:text-gray-600 text-xs border border-dashed border-gray-300 rounded p-2 hover:border-gray-400"
                                >
                                  + Add Recipe
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Add Recipes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Add to Meal Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recipes.slice(0, 6).map(recipe => (
                  <div key={recipe.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{recipe.name}</h4>
                    <div className="text-sm text-gray-600 mb-3">{recipe.description}</div>
                    <div className="flex space-x-2">
                      {['breakfast', 'lunch', 'dinner'].map(meal => (
                        <button
                          key={meal}
                          onClick={() => addToMealPlan(recipe.id, new Date().toISOString().split('T')[0], meal)}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 capitalize"
                        >
                          {meal}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'shopping' && (
          <div>
            {/* Generated Shopping List */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Shopping List from Meal Plan</h3>
                <button
                  onClick={() => {
                    const ingredients = generateShoppingList();
                    // Here you would typically send this to your shopping list component
                    console.log('Shopping list ingredients:', ingredients);
                    toast.success('Shopping list generated!');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Generate List
                </button>
              </div>
              
              {Object.keys(mealPlan).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No meals planned yet. Add recipes to your meal plan to generate a shopping list.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(mealPlan).map(([date, meals]) => (
                    <div key={date} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(meals).map(([meal, recipeId]) => {
                          const recipe = getRecipeById(recipeId);
                          return (
                            <div key={meal} className="flex items-center justify-between text-sm">
                              <span className="capitalize text-gray-600">{meal}:</span>
                              <span className="font-medium text-gray-900">{recipe?.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shopping List Tips */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Shopping List Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Before Shopping</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Check your pantry for existing ingredients</li>
                    <li>• Group items by store section</li>
                    <li>• Consider meal prep timing</li>
                    <li>• Set a budget limit</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">While Shopping</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Stick to your list to avoid impulse buys</li>
                    <li>• Compare prices and look for sales</li>
                    <li>• Choose fresh ingredients when possible</li>
                    <li>• Consider bulk options for staples</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Recipe Modal */}
      {(showCreateRecipe || editingRecipe) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingRecipe ? 'Edit Recipe' : 'Create New Recipe'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const recipeData = {
                  name: formData.get('name'),
                  description: formData.get('description'),
                  category: formData.get('category'),
                  cuisine: formData.get('cuisine'),
                  prepTime: parseInt(formData.get('prepTime')),
                  cookTime: parseInt(formData.get('cookTime')),
                  servings: parseInt(formData.get('servings')),
                  difficulty: formData.get('difficulty'),
                  ingredients: [], // This would need a more complex form
                  instructions: [], // This would need a more complex form
                  tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : []
                };
                
                if (editingRecipe) {
                  updateRecipe(editingRecipe.id, recipeData);
                } else {
                  createRecipe(recipeData);
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingRecipe?.name || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      defaultValue={editingRecipe?.description || ''}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        name="category"
                        defaultValue={editingRecipe?.category || 'Dinner'}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
                      <select
                        name="cuisine"
                        defaultValue={editingRecipe?.cuisine || 'American'}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {cuisines.map(cuisine => (
                          <option key={cuisine} value={cuisine}>{cuisine}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                      <input
                        type="number"
                        name="prepTime"
                        defaultValue={editingRecipe?.prepTime || ''}
                        min="0"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cook Time (min)</label>
                      <input
                        type="number"
                        name="cookTime"
                        defaultValue={editingRecipe?.cookTime || ''}
                        min="0"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
                      <input
                        type="number"
                        name="servings"
                        defaultValue={editingRecipe?.servings || ''}
                        min="1"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                    <select
                      name="difficulty"
                      defaultValue={editingRecipe?.difficulty || 'medium'}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {difficulties.map(difficulty => (
                        <option key={difficulty} value={difficulty}>{difficulty}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      name="tags"
                      defaultValue={editingRecipe?.tags?.join(', ') || ''}
                      placeholder="pasta, italian, quick, dinner"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingRecipe ? 'Update Recipe' : 'Create Recipe'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateRecipe(false);
                      setEditingRecipe(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Back to Home Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <a href="/" className="text-blue-600 hover:text-blue-800 underline">← Back to Home</a>
      </div>
    </div>
  );
} 