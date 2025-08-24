import React, { useState, useEffect } from 'react';
import { Plus, ChefHat, Clock, Users, Star, Heart, Share, Edit, Trash2, Calendar, ShoppingCart, BookOpen, Filter, XCircle } from 'lucide-react';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [showRecipeDetail, setShowRecipeDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [recipeForm, setRecipeForm] = useState({
    name: '',
    description: '',
    category: 'main-dish',
    difficulty: 'medium',
    prepTime: '',
    cookTime: '',
    servings: 4,
    ingredients: [{ id: 1, name: '', amount: '', unit: '' }],
    instructions: [{ id: 1, step: '' }],
    notes: '',
    tags: []
  });

  const categories = [
    'appetizer', 'main-dish', 'side-dish', 'dessert', 'breakfast', 'lunch', 'dinner', 'snack', 'beverage'
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', color: 'text-green-600 bg-green-100' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'hard', label: 'Hard', color: 'text-red-600 bg-red-100' }
  ];

  const units = [
    'cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l', 'piece', 'slice', 'clove', 'bunch', 'can', 'package'
  ];

  // Load sample data
  useEffect(() => {
    const sampleRecipes = [
      {
        id: 1,
        name: 'Classic Spaghetti Carbonara',
        description: 'A traditional Italian pasta dish with eggs, cheese, and pancetta',
        category: 'main-dish',
        difficulty: 'medium',
        prepTime: 15,
        cookTime: 20,
        servings: 4,
        ingredients: [
          { id: 1, name: 'Spaghetti', amount: 1, unit: 'lb' },
          { id: 2, name: 'Eggs', amount: 4, unit: 'piece' },
          { id: 3, name: 'Pancetta', amount: 8, unit: 'oz' },
          { id: 4, name: 'Parmesan Cheese', amount: 1, unit: 'cup' },
          { id: 5, name: 'Black Pepper', amount: 2, unit: 'tsp' },
          { id: 6, name: 'Salt', amount: 1, unit: 'tsp' }
        ],
        instructions: [
          { id: 1, step: 'Bring a large pot of salted water to boil and cook spaghetti according to package directions.' },
          { id: 2, step: 'Meanwhile, cook pancetta in a large skillet over medium heat until crispy.' },
          { id: 3, step: 'In a bowl, whisk together eggs, cheese, and pepper.' },
          { id: 4, step: 'Drain pasta, reserving 1 cup of pasta water.' },
          { id: 5, step: 'Add hot pasta to skillet with pancetta, remove from heat.' },
          { id: 6, step: 'Quickly stir in egg mixture, adding pasta water as needed for creaminess.' }
        ],
        notes: 'Serve immediately while hot. The eggs should create a creamy sauce without scrambling.',
        tags: ['italian', 'pasta', 'quick', 'dinner'],
        rating: 4.8,
        favorites: 12,
        createdAt: '2024-01-15'
      },
      {
        id: 2,
        name: 'Chocolate Chip Cookies',
        description: 'Soft and chewy chocolate chip cookies with crispy edges',
        category: 'dessert',
        difficulty: 'easy',
        prepTime: 15,
        cookTime: 12,
        servings: 24,
        ingredients: [
          { id: 1, name: 'All-purpose Flour', amount: 2.25, unit: 'cup' },
          { id: 2, name: 'Butter', amount: 1, unit: 'cup' },
          { id: 3, name: 'Brown Sugar', amount: 0.75, unit: 'cup' },
          { id: 4, name: 'White Sugar', amount: 0.75, unit: 'cup' },
          { id: 5, name: 'Eggs', amount: 2, unit: 'piece' },
          { id: 6, name: 'Vanilla Extract', amount: 2, unit: 'tsp' },
          { id: 7, name: 'Chocolate Chips', amount: 2, unit: 'cup' }
        ],
        instructions: [
          { id: 1, step: 'Preheat oven to 375°F (190°C).' },
          { id: 2, step: 'Cream together butter and sugars until light and fluffy.' },
          { id: 3, step: 'Beat in eggs one at a time, then stir in vanilla.' },
          { id: 4, step: 'Combine flour, baking soda, and salt; gradually blend into the butter mixture.' },
          { id: 5, step: 'Stir in chocolate chips.' },
          { id: 6, step: 'Drop by rounded tablespoons onto ungreased baking sheets.' },
          { id: 7, step: 'Bake for 10 to 12 minutes or until golden brown.' }
        ],
        notes: 'Let cookies cool on baking sheet for 2 minutes before transferring to wire rack.',
        tags: ['dessert', 'cookies', 'chocolate', 'baking'],
        rating: 4.9,
        favorites: 25,
        createdAt: '2024-01-10'
      }
    ];

    setRecipes(sampleRecipes);
  }, []);

  const handleAddRecipe = () => {
    if (!recipeForm.name || !recipeForm.ingredients[0].name || !recipeForm.instructions[0].step) return;
    
    const newRecipe = {
      id: Date.now(),
      ...recipeForm,
      prepTime: parseInt(recipeForm.prepTime) || 0,
      cookTime: parseInt(recipeForm.cookTime) || 0,
      servings: parseInt(recipeForm.servings) || 4,
      ingredients: recipeForm.ingredients.filter(ing => ing.name.trim() !== ''),
      instructions: recipeForm.instructions.filter(inst => inst.step.trim() !== ''),
      tags: recipeForm.tags.filter(tag => tag.trim() !== ''),
      rating: 0,
      favorites: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setRecipes([...recipes, newRecipe]);
    
    setRecipeForm({
      name: '',
      description: '',
      category: 'main-dish',
      difficulty: 'medium',
      prepTime: '',
      cookTime: '',
      servings: 4,
      ingredients: [{ id: 1, name: '', amount: '', unit: '' }],
      instructions: [{ id: 1, step: '' }],
      notes: '',
      tags: []
    });
    setShowAddRecipe(false);
  };

  const handleDeleteRecipe = (id) => {
    setRecipes(recipes.filter(recipe => recipe.id !== id));
  };

  const addIngredient = () => {
    const newId = Math.max(...recipeForm.ingredients.map(ing => ing.id)) + 1;
    setRecipeForm({
      ...recipeForm,
      ingredients: [...recipeForm.ingredients, { id: newId, name: '', amount: '', unit: '' }]
    });
  };

  const removeIngredient = (id) => {
    if (recipeForm.ingredients.length > 1) {
      setRecipeForm({
        ...recipeForm,
        ingredients: recipeForm.ingredients.filter(ing => ing.id !== id)
      });
    }
  };

  const updateIngredient = (id, field, value) => {
    setRecipeForm({
      ...recipeForm,
      ingredients: recipeForm.ingredients.map(ing =>
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    });
  };

  const addInstruction = () => {
    const newId = Math.max(...recipeForm.instructions.map(inst => inst.id)) + 1;
    setRecipeForm({
      ...recipeForm,
      instructions: [...recipeForm.instructions, { id: newId, step: '' }]
    });
  };

  const removeInstruction = (id) => {
    if (recipeForm.instructions.length > 1) {
      setRecipeForm({
        ...recipeForm,
        instructions: recipeForm.instructions.filter(inst => inst.id !== id)
      });
    }
  };

  const updateInstruction = (id, value) => {
    setRecipeForm({
      ...recipeForm,
      instructions: recipeForm.instructions.map(inst =>
        inst.id === id ? { ...inst, step: value } : inst
      )
    });
  };

  const addTag = (tag) => {
    if (tag && !recipeForm.tags.includes(tag)) {
      setRecipeForm({ ...recipeForm, tags: [...recipeForm.tags, tag] });
    }
  };

  const removeTag = (tagToRemove) => {
    setRecipeForm({
      ...recipeForm,
      tags: recipeForm.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || recipe.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getTotalTime = (recipe) => {
    return recipe.prepTime + recipe.cookTime;
  };

  const getDifficultyColor = (difficulty) => {
    return difficulties.find(d => d.value === difficulty)?.color || 'text-gray-600 bg-gray-100';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'appetizer': 'text-blue-600 bg-blue-100',
      'main-dish': 'text-green-600 bg-green-100',
      'side-dish': 'text-yellow-600 bg-yellow-100',
      'dessert': 'text-pink-600 bg-pink-100',
      'breakfast': 'text-orange-600 bg-orange-100',
      'lunch': 'text-purple-600 bg-purple-100',
      'dinner': 'text-indigo-600 bg-indigo-100',
      'snack': 'text-gray-600 bg-gray-100',
      'beverage': 'text-teal-600 bg-teal-100'
    };
    return colors[category] || colors['main-dish'];
  };

  const generateShoppingList = (recipe) => {
    const ingredients = recipe.ingredients.map(ing => 
      `${ing.amount} ${ing.unit} ${ing.name}`
    ).join('\n');
    
    alert(`Shopping List for ${recipe.name}:\n\n${ingredients}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Recipe Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Store recipes, plan meals, and generate shopping lists
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Recipes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{recipes.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <ChefHat className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {recipes.length > 0 ? (recipes.reduce((sum, r) => sum + r.rating, 0) / recipes.length).toFixed(1) : '0.0'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Favorites</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {recipes.reduce((sum, r) => sum + r.favorites, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
              
              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Difficulties</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Add Button */}
            <button
              onClick={() => setShowAddRecipe(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Recipe
            </button>
          </div>
        </div>

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {recipe.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {recipe.description}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowRecipeDetail(recipe)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <BookOpen className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRecipe(recipe.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(recipe.category)}`}>
                    {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1).replace('-', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                    {difficulties.find(d => d.value === recipe.difficulty)?.label}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {getTotalTime(recipe)} min
                    </span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {recipe.servings} servings
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                      {recipe.rating}
                    </span>
                    <span className="flex items-center">
                      <Heart className="h-4 w-4 mr-1 text-red-500" />
                      {recipe.favorites}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowRecipeDetail(recipe)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    View Recipe
                  </button>
                  <button
                    onClick={() => generateShoppingList(recipe)}
                    className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Recipe Form */}
        {showAddRecipe && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Recipe</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recipe Name *
                  </label>
                  <input
                    type="text"
                    value={recipeForm.name}
                    onChange={(e) => setRecipeForm({ ...recipeForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter recipe name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={recipeForm.category}
                    onChange={(e) => setRecipeForm({ ...recipeForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={recipeForm.difficulty}
                    onChange={(e) => setRecipeForm({ ...recipeForm, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Servings
                  </label>
                  <input
                    type="number"
                    value={recipeForm.servings}
                    onChange={(e) => setRecipeForm({ ...recipeForm, servings: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prep Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={recipeForm.prepTime}
                    onChange={(e) => setRecipeForm({ ...recipeForm, prepTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cook Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={recipeForm.cookTime}
                    onChange={(e) => setRecipeForm({ ...recipeForm, cookTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    min="0"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={recipeForm.description}
                    onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Describe your recipe..."
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ingredients *
                  </label>
                  <div className="space-y-3">
                    {recipeForm.ingredients.map((ingredient) => (
                      <div key={ingredient.id} className="flex space-x-3">
                        <input
                          type="number"
                          value={ingredient.amount}
                          onChange={(e) => updateIngredient(ingredient.id, 'amount', e.target.value)}
                          className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Amount"
                        />
                        <select
                          value={ingredient.unit}
                          onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                          className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                          {units.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={ingredient.name}
                          onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Ingredient name"
                        />
                        <button
                          onClick={() => removeIngredient(ingredient.id)}
                          className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addIngredient}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                    >
                      + Add Ingredient
                    </button>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Instructions *
                  </label>
                  <div className="space-y-3">
                    {recipeForm.instructions.map((instruction) => (
                      <div key={instruction.id} className="flex space-x-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300">
                          {instruction.id}
                        </span>
                        <textarea
                          value={instruction.step}
                          onChange={(e) => updateInstruction(instruction.id, e.target.value)}
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Describe this step..."
                        />
                        <button
                          onClick={() => removeInstruction(instruction.id)}
                          className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addInstruction}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                    >
                      + Add Step
                    </button>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={recipeForm.notes}
                    onChange={(e) => setRecipeForm({ ...recipeForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Additional notes, tips, or variations..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddRecipe(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRecipe}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add Recipe
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recipe Detail Modal */}
        {showRecipeDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {showRecipeDetail.name}
                </h3>
                <button
                  onClick={() => setShowRecipeDetail(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {showRecipeDetail.description}
                  </p>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Ingredients</h4>
                    <div className="space-y-2">
                      {showRecipeDetail.ingredients.map((ingredient) => (
                        <div key={ingredient.id} className="flex items-center space-x-3">
                          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                          <span className="text-gray-900 dark:text-white">
                            {ingredient.amount} {ingredient.unit} {ingredient.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Instructions</h4>
                    <div className="space-y-4">
                      {showRecipeDetail.instructions.map((instruction) => (
                        <div key={instruction.id} className="flex space-x-4">
                          <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {instruction.id}
                          </span>
                          <p className="text-gray-700 dark:text-gray-300">{instruction.step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Recipe Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Category:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(showRecipeDetail.category)}`}>
                          {showRecipeDetail.category.charAt(0).toUpperCase() + showRecipeDetail.category.slice(1).replace('-', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(showRecipeDetail.difficulty)}`}>
                          {difficulties.find(d => d.value === showRecipeDetail.difficulty)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Prep Time:</span>
                        <span>{showRecipeDetail.prepTime} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Cook Time:</span>
                        <span>{showRecipeDetail.cookTime} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Time:</span>
                        <span>{getTotalTime(showRecipeDetail)} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Servings:</span>
                        <span>{showRecipeDetail.servings}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Actions</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => generateShoppingList(showRecipeDetail)}
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Generate Shopping List</span>
                      </button>
                      <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Add to Meal Plan</span>
                      </button>
                      <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                        <Heart className="h-4 w-4" />
                        <span>Add to Favorites</span>
                      </button>
                    </div>
                  </div>
                  
                  {showRecipeDetail.notes && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Notes</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {showRecipeDetail.notes}
                      </p>
                    </div>
                  )}
                  
                  {showRecipeDetail.tags.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {showRecipeDetail.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipes;
