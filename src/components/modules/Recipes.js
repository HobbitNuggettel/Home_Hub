import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Calendar, Clock, Users, ChefHat, BookOpen, Star, Heart, ShoppingCart, Utensils, Timer, Scale, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';
import hybridStorage from '../../firebase/hybridStorage.js';

const Recipes = () => {
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([
    'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts', 'Beverages', 'Appetizers', 'Soups', 'Salads', 'Main Dishes'
  ]);
  const [cuisines, setCuisines] = useState([
    'American', 'Italian', 'Mexican', 'Asian', 'Mediterranean', 'Indian', 'French', 'Thai', 'Japanese', 'Greek'
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [mealPlan, setMealPlan] = useState([]);
  const [favorites, setFavorites] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    cuisine: '',
    description: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'easy',
    ingredients: [{ id: Date.now() + Math.random(), item: '', amount: '', unit: '' }],
    instructions: [{ id: Date.now() + Math.random(), text: '' }],
    nutrition: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: ''
    },
    tags: [],
    image: '',
    notes: ''
  });

  // Load recipes from Firebase
  useEffect(() => {
    const loadRecipes = async () => {
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

    loadRecipes();
  }, [currentUser]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading recipes...</p>
        </div>
      </div>
    );
  }

  const handleAddRecipe = async () => {
    if (!formData.name || !formData.category || !currentUser) return;
    
    try {
      const newRecipe = {
        ...formData,
        rating: 0,
        reviews: 0,
        isFavorite: false,
        ingredients: formData.ingredients.filter(ing => ing.item.trim() !== ''),
        instructions: formData.instructions.filter(inst => (inst.text || inst).trim() !== '').map(inst => inst.text || inst),
        tags: formData.tags.filter(tag => tag.trim() !== ''),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const response = await hybridStorage.addRecipe(currentUser.uid, newRecipe);
      if (response.success) {
        setRecipes(prev => [...prev, response.recipe]);
        resetForm();
        setShowAddForm(false);
      } else {
        console.error('Failed to add recipe:', response.error);
      }
    } catch (error) {
      console.error('Error adding recipe:', error);
    }
  };

  const handleEditRecipe = async () => {
    if (!editingRecipe || !formData.name || !formData.category || !currentUser) return;
    
    try {
      const updatedRecipe = {
        ...editingRecipe,
        ...formData,
        ingredients: formData.ingredients.filter(ing => ing.item.trim() !== ''),
        instructions: formData.instructions.filter(inst => (inst.text || inst).trim() !== '').map(inst => inst.text || inst),
        tags: formData.tags.filter(tag => tag.trim() !== ''),
        updatedAt: new Date()
      };
      
      const response = await hybridStorage.updateRecipe(currentUser.uid, editingRecipe.id, updatedRecipe);
      if (response.success) {
        setRecipes(prev => prev.map(recipe => 
          recipe.id === editingRecipe.id ? updatedRecipe : recipe
        ));
        resetForm();
        setEditingRecipe(null);
      } else {
        console.error('Failed to update recipe:', response.error);
      }
    } catch (error) {
      console.error('Error updating recipe:', error);
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!currentUser) return;
    
    try {
      const response = await hybridStorage.deleteRecipe(currentUser.uid, recipeId);
      if (response.success) {
        setRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
        setFavorites(prev => prev.filter(id => id !== recipeId));
      } else {
        console.error('Failed to delete recipe:', response.error);
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const toggleFavorite = async (recipeId) => {
    if (!currentUser) return;
    
    try {
      const recipe = recipes.find(r => r.id === recipeId);
      if (!recipe) return;
      
      const updatedRecipe = { ...recipe, isFavorite: !recipe.isFavorite };
      
      const response = await hybridStorage.updateRecipe(currentUser.uid, recipeId, updatedRecipe);
      if (response.success) {
        setFavorites(prev => 
          prev.includes(recipeId)
            ? prev.filter(id => id !== recipeId)
            : [...prev, recipeId]
        );
        
        setRecipes(prev =>
          prev.map(recipe =>
            recipe.id === recipeId ? updatedRecipe : recipe
          )
        );
      } else {
        console.error('Failed to update favorite status:', response.error);
      }
    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { id: Date.now() + Math.random(), item: '', amount: '', unit: '' }]
    }));
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, { id: Date.now() + Math.random(), text: '' }]
    }));
  };

  const removeInstruction = (index) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const updateInstruction = (index, value) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) =>
        i === index ? { ...inst, text: value } : inst
      )
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      cuisine: '',
      description: '',
      prepTime: '',
      cookTime: '',
      servings: '',
      difficulty: 'easy',
      ingredients: [{ id: Date.now() + Math.random(), item: '', amount: '', unit: '' }],
      instructions: [{ id: Date.now() + Math.random(), text: '' }],
      nutrition: {
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: ''
      },
      tags: [],
      image: '',
      notes: ''
    });
    setEditingRecipe(null);
    setShowAddForm(false);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    const matchesCuisine = selectedCuisine === 'all' || recipe.cuisine === selectedCuisine;
    return matchesSearch && matchesCategory && matchesCuisine;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
              <ChefHat className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Recipe Management
              </h1>
              <p className="text-lg text-gray-600">
                Create, organize, and plan your favorite recipes
              </p>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Cuisines</option>
                {cuisines.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Recipe
            </button>
          </div>
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Recipe Image */}
              <div className="relative h-48 bg-gray-200">
                {recipe.image ? (
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Utensils className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                
                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(recipe.id)}
                  className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                    recipe.isFavorite
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${recipe.isFavorite ? 'fill-current' : ''}`} />
                </button>
                
                {/* Difficulty Badge */}
                <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                  {recipe.difficulty}
                </span>
              </div>
              
              {/* Recipe Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{recipe.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-700">{recipe.rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
                
                {/* Recipe Meta */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{recipe.prepTime + recipe.cookTime} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{recipe.servings} servings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{recipe.cuisine}</span>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {recipe.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                  {recipe.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{recipe.tags.length - 3}
                    </span>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingRecipe(recipe);
                      setFormData(recipe);
                      setShowAddForm(true);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRecipe(recipe.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Recipe Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); editingRecipe ? handleEditRecipe() : handleAddRecipe(); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Recipe Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                          </label>
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            required
                          >
                            <option value="">Select Category</option>
                            {categories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cuisine
                          </label>
                          <select
                            value={formData.cuisine}
                            onChange={(e) => setFormData(prev => ({ ...prev, cuisine: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          >
                            <option value="">Select Cuisine</option>
                            {cuisines.map(cuisine => (
                              <option key={cuisine} value={cuisine}>{cuisine}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prep Time (min)
                          </label>
                          <input
                            type="number"
                            value={formData.prepTime}
                            onChange={(e) => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cook Time (min)
                          </label>
                          <input
                            type="number"
                            value={formData.cookTime}
                            onChange={(e) => setFormData(prev => ({ ...prev, cookTime: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Servings
                          </label>
                          <input
                            type="number"
                            value={formData.servings}
                            onChange={(e) => setFormData(prev => ({ ...prev, servings: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Difficulty
                        </label>
                        <select
                          value={formData.difficulty}
                          onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Ingredients and Instructions */}
                    <div className="space-y-4">
                      {/* Ingredients */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ingredients
                        </label>
                        <div className="space-y-2">
                          {formData.ingredients.map((ingredient, index) => (
                            <div key={ingredient.id} className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Ingredient"
                                value={ingredient.item}
                                onChange={(e) => updateIngredient(index, 'item', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              />
                              <input
                                type="text"
                                placeholder="Amount"
                                value={ingredient.amount}
                                onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              />
                              <input
                                type="text"
                                placeholder="Unit"
                                value={ingredient.unit}
                                onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              />
                              <button
                                type="button"
                                onClick={() => removeIngredient(index)}
                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addIngredient}
                            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-colors"
                          >
                            <Plus className="h-4 w-4 inline mr-2" />
                            Add Ingredient
                          </button>
                        </div>
                      </div>
                      
                      {/* Instructions */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Instructions
                        </label>
                        <div className="space-y-2">
                          {formData.instructions.map((instruction, index) => (
                            <div key={instruction.id} className="flex gap-2">
                              <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </span>
                              <textarea
                                placeholder={`Step ${index + 1}`}
                                value={instruction.text || instruction}
                                onChange={(e) => updateInstruction(index, e.target.value)}
                                rows={2}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              />
                              <button
                                type="button"
                                onClick={() => removeInstruction(index)}
                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addInstruction}
                            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-colors"
                          >
                            <Plus className="h-4 w-4 inline mr-2" />
                            Add Instruction
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Form Actions */}
                  <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      {editingRecipe ? 'Update Recipe' : 'Add Recipe'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipes;
