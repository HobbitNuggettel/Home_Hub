/**
 * AI-powered recipe recommendations and meal planning service
 */
class AIRecipeService {
  
  /**
   * Generate smart meal plans based on inventory, preferences, and dietary needs
   * @param {Array} inventory - Current inventory items
   * @param {Array} recipes - Available recipes
   * @param {Object} preferences - Family dietary preferences and restrictions
   * @param {number} days - Number of days to plan for
   * @returns {Object} Complete meal plan with shopping list
   */
  static async generateMealPlan(inventory, recipes, preferences = {}, days = 7) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mealPlan = {
      days: [],
      shoppingList: [],
      nutritionSummary: {},
      estimatedCost: 0,
      wasteReduction: 0
    };
    
    // Analyze available ingredients
    const availableIngredients = inventory.map(item => ({
      name: item.name.toLowerCase(),
      quantity: item.quantity,
      expirationDate: item.expirationDate
    }));
    
    // Filter recipes based on preferences
    const suitableRecipes = this.filterRecipesByPreferences(recipes, preferences);
    
    // Generate daily meal suggestions
    for (let day = 0; day < days; day++) {
      const dayMeals = await this.generateDayMeals(
        suitableRecipes, 
        availableIngredients, 
        preferences,
        day
      );
      
      mealPlan.days.push({
        date: this.addDays(new Date(), day).toISOString().split('T')[0],
        meals: dayMeals,
        totalCalories: dayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0),
        totalCost: dayMeals.reduce((sum, meal) => sum + (meal.estimatedCost || 0), 0)
      });
      
      // Update available ingredients after "using" them
      this.updateAvailableIngredients(availableIngredients, dayMeals);
    }
    
    // Generate consolidated shopping list
    mealPlan.shoppingList = this.generateShoppingListFromMealPlan(mealPlan.days, inventory);
    
    // Calculate summary metrics
    mealPlan.estimatedCost = mealPlan.days.reduce((sum, day) => sum + day.totalCost, 0);
    mealPlan.wasteReduction = this.calculateWasteReduction(inventory, mealPlan.days);
    
    return mealPlan;
  }

  /**
   * Generate meals for a single day
   */
  static async generateDayMeals(recipes, availableIngredients, preferences, dayIndex) {
    const meals = [];
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    
    mealTypes.forEach(mealType => {
      const suitableRecipes = recipes.filter(recipe => 
        (recipe.mealType === mealType || !recipe.mealType) &&
        this.canMakeWithAvailable(recipe, availableIngredients) >= 0.5 // At least 50% ingredients available
      );
      
      if (suitableRecipes.length > 0) {
        // Use different recipes throughout the week
        const recipeIndex = (dayIndex + mealTypes.indexOf(mealType)) % suitableRecipes.length;
        const selectedRecipe = suitableRecipes[recipeIndex];
        
        meals.push({
          type: mealType,
          recipe: selectedRecipe,
          ingredientMatch: this.canMakeWithAvailable(selectedRecipe, availableIngredients),
          missingIngredients: this.getMissingIngredients(selectedRecipe, availableIngredients),
          calories: selectedRecipe.nutrition?.calories || 0,
          estimatedCost: this.estimateRecipeCost(selectedRecipe),
          prepTime: selectedRecipe.prepTime || 30
        });
      }
    });
    
    return meals;
  }

  /**
   * Check how many ingredients are available for a recipe
   */
  static canMakeWithAvailable(recipe, availableIngredients) {
    const required = recipe.ingredients || [];
    let available = 0;
    
    required.forEach(ingredient => {
      const ingredientName = (ingredient.name || ingredient).toLowerCase();
      const hasIngredient = availableIngredients.some(avail => 
        avail.name.includes(ingredientName) || ingredientName.includes(avail.name)
      );
      if (hasIngredient) available++;
    });
    
    return required.length > 0 ? available / required.length : 0;
  }

  /**
   * Get missing ingredients for a recipe
   */
  static getMissingIngredients(recipe, availableIngredients) {
    const required = recipe.ingredients || [];
    const missing = [];
    
    required.forEach(ingredient => {
      const ingredientName = (ingredient.name || ingredient).toLowerCase();
      const hasIngredient = availableIngredients.some(avail => 
        avail.name.includes(ingredientName) || ingredientName.includes(avail.name)
      );
      if (!hasIngredient) {
        missing.push(ingredient);
      }
    });
    
    return missing;
  }

  /**
   * Filter recipes based on dietary preferences and restrictions
   */
  static filterRecipesByPreferences(recipes, preferences) {
    return recipes.filter(recipe => {
      // Dietary restrictions
      if (preferences.vegetarian && recipe.tags?.includes('meat')) return false;
      if (preferences.vegan && (recipe.tags?.includes('dairy') || recipe.tags?.includes('meat'))) return false;
      if (preferences.glutenFree && recipe.tags?.includes('gluten')) return false;
      
      // Cooking time preference
      if (preferences.maxCookTime && recipe.cookTime > preferences.maxCookTime) return false;
      
      // Difficulty preference
      if (preferences.maxDifficulty && recipe.difficulty > preferences.maxDifficulty) return false;
      
      // Cuisine preferences
      if (preferences.preferredCuisines?.length > 0 && 
          !preferences.preferredCuisines.includes(recipe.cuisine)) return false;
      
      return true;
    });
  }

  /**
   * Generate smart recipe recommendations based on various factors
   */
  static async generateSmartRecipeRecommendations(inventory, recipes, spendingData = []) {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const recommendations = [];
    
    // Recipes using expiring ingredients
    const expiringIngredients = inventory.filter(item => {
      if (!item.expirationDate) return false;
      const daysUntilExpiry = (new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    });
    
    if (expiringIngredients.length > 0) {
      const recipesUsingExpiring = recipes.filter(recipe => 
        recipe.ingredients?.some(ingredient => 
          expiringIngredients.some(expiring => 
            (ingredient.name || ingredient).toLowerCase().includes(expiring.name.toLowerCase())
          )
        )
      );
      
      recipesUsingExpiring.forEach(recipe => {
        recommendations.push({
          recipeId: recipe.id,
          recipeName: recipe.name,
          type: 'waste_reduction',
          priority: 'high',
          reasoning: 'Uses ingredients expiring soon',
          expiringIngredients: expiringIngredients.filter(item =>
            recipe.ingredients?.some(ingredient =>
              (ingredient.name || ingredient).toLowerCase().includes(item.name.toLowerCase())
            )
          ).map(item => item.name),
          estimatedSavings: this.calculateWasteSavings(recipe, expiringIngredients)
        });
      });
    }
    
    // Budget-friendly recipes
    const avgGrocerySpend = this.calculateAverageGrocerySpending(spendingData);
    const budgetFriendlyRecipes = recipes.filter(recipe => 
      this.estimateRecipeCost(recipe) <= avgGrocerySpend * 0.3 // 30% of avg grocery spend
    );
    
    budgetFriendlyRecipes.slice(0, 5).forEach(recipe => {
      recommendations.push({
        recipeId: recipe.id,
        recipeName: recipe.name,
        type: 'budget_friendly',
        priority: 'medium',
        reasoning: 'Cost-effective option based on your spending patterns',
        estimatedCost: this.estimateRecipeCost(recipe),
        servings: recipe.servings
      });
    });
    
    // Quick & easy recipes for busy days
    const quickRecipes = recipes.filter(recipe => 
      (recipe.prepTime || 60) <= 30 && (recipe.difficulty || 'medium') === 'easy'
    );
    
    quickRecipes.slice(0, 3).forEach(recipe => {
      recommendations.push({
        recipeId: recipe.id,
        recipeName: recipe.name,
        type: 'quick_easy',
        priority: 'medium',
        reasoning: 'Quick and easy for busy weekdays',
        prepTime: recipe.prepTime || 30,
        difficulty: recipe.difficulty || 'easy'
      });
    });
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Calculate average grocery spending
   */
  static calculateAverageGrocerySpending(spendingData) {
    const groceryExpenses = spendingData.filter(expense => 
      expense.category === 'Groceries' || expense.category === 'Food'
    );
    
    if (groceryExpenses.length === 0) return 100; // Default assumption
    
    return groceryExpenses.reduce((sum, exp) => sum + exp.amount, 0) / groceryExpenses.length;
  }

  /**
   * Estimate the cost of making a recipe
   */
  static estimateRecipeCost(recipe) {
    if (!recipe.ingredients) return 10; // Default estimate
    
    // Simple cost estimation based on ingredient count and type
    return recipe.ingredients.reduce((cost, ingredient) => {
      const basePrice = this.estimateIngredientCost(ingredient);
      const quantity = ingredient.quantity || 1;
      return cost + (basePrice * quantity);
    }, 0);
  }

  /**
   * Estimate cost of individual ingredients
   */
  static estimateIngredientCost(ingredient) {
    const ingredientName = (ingredient.name || ingredient).toLowerCase();
    
    // Price estimates for common ingredient categories
    const priceMap = {
      meat: 8, beef: 12, chicken: 6, pork: 7, fish: 10,
      dairy: 3, milk: 4, cheese: 5, butter: 4,
      produce: 2, vegetables: 2, fruits: 3, onion: 1, garlic: 2,
      grains: 2, rice: 1, pasta: 2, bread: 3,
      spices: 1, salt: 0.5, pepper: 1, herbs: 2,
      oil: 3, olive: 4, coconut: 3
    };
    
    // Find matching price category
    for (const [key, price] of Object.entries(priceMap)) {
      if (ingredientName.includes(key)) {
        return price;
      }
    }
    
    return 3; // Default ingredient cost
  }

  /**
   * Calculate potential waste savings
   */
  static calculateWasteSavings(recipe, expiringIngredients) {
    return expiringIngredients.reduce((savings, item) => {
      return savings + ((item.price || 5) * (item.quantity || 1));
    }, 0);
  }

  /**
   * Update available ingredients after planning meals
   */
  static updateAvailableIngredients(availableIngredients, dayMeals) {
    dayMeals.forEach(meal => {
      if (meal.recipe?.ingredients) {
        meal.recipe.ingredients.forEach(ingredient => {
          const ingredientName = (ingredient.name || ingredient).toLowerCase();
          const available = availableIngredients.find(avail => 
            avail.name.includes(ingredientName) || ingredientName.includes(avail.name)
          );
          
          if (available) {
            available.quantity = Math.max(0, available.quantity - (ingredient.quantity || 1));
          }
        });
      }
    });
  }

  /**
   * Generate shopping list from meal plan
   */
  static generateShoppingListFromMealPlan(plannedDays, currentInventory) {
    const neededIngredients = {};
    
    // Collect all needed ingredients
    plannedDays.forEach(day => {
      day.meals.forEach(meal => {
        if (meal.missingIngredients) {
          meal.missingIngredients.forEach(ingredient => {
            const name = ingredient.name || ingredient;
            if (!neededIngredients[name]) {
              neededIngredients[name] = {
                name,
                quantity: 0,
                recipes: [],
                estimatedCost: this.estimateIngredientCost(ingredient)
              };
            }
            neededIngredients[name].quantity += ingredient.quantity || 1;
            neededIngredients[name].recipes.push(meal.recipe.name);
          });
        }
      });
    });
    
    // Convert to shopping list format
    return Object.values(neededIngredients).map(ingredient => ({
      name: ingredient.name,
      quantity: ingredient.quantity,
      category: this.categorizeIngredient(ingredient.name),
      estimatedCost: ingredient.estimatedCost * ingredient.quantity,
      usedInRecipes: [...new Set(ingredient.recipes)],
      priority: 'medium'
    }));
  }

  /**
   * Categorize ingredients for shopping list organization
   */
  static categorizeIngredient(ingredientName) {
    const name = ingredientName.toLowerCase();
    
    const categories = {
      'Produce': ['tomato', 'onion', 'carrot', 'potato', 'lettuce', 'cucumber', 'bell pepper', 'apple', 'banana', 'lemon'],
      'Meat & Seafood': ['chicken', 'beef', 'pork', 'fish', 'salmon', 'turkey', 'lamb'],
      'Dairy': ['milk', 'cheese', 'butter', 'yogurt', 'cream', 'eggs'],
      'Pantry': ['rice', 'pasta', 'flour', 'sugar', 'salt', 'oil', 'vinegar', 'sauce'],
      'Frozen': ['frozen', 'ice cream'],
      'Bakery': ['bread', 'bagel', 'muffin', 'roll'],
      'Beverages': ['juice', 'soda', 'water', 'coffee', 'tea']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => name.includes(keyword))) {
        return category;
      }
    }
    
    return 'Other';
  }

  /**
   * Calculate waste reduction from meal planning
   */
  static calculateWasteReduction(inventory, plannedDays) {
    let wasteReduction = 0;
    
    // Calculate value of expiring items that would be used
    inventory.forEach(item => {
      if (item.expirationDate) {
        const daysUntilExpiry = (new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24);
        
        if (daysUntilExpiry <= 7) {
          // Check if this item is used in the meal plan
          const isUsedInPlan = plannedDays.some(day => 
            day.meals.some(meal => 
              meal.recipe?.ingredients?.some(ingredient => 
                (ingredient.name || ingredient).toLowerCase().includes(item.name.toLowerCase())
              )
            )
          );
          
          if (isUsedInPlan) {
            wasteReduction += (item.price || 0) * (item.quantity || 1);
          }
        }
      }
    });
    
    return wasteReduction;
  }

  /**
   * Generate personalized recipe recommendations based on family behavior
   */
  static async generatePersonalizedRecommendations(recipes, familyHistory = {}) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const recommendations = [];
    
    // Analyze cooking patterns
    const cookingPatterns = this.analyzeCookingPatterns(familyHistory);
    
    // Suggest recipes based on successful patterns
    recipes.forEach(recipe => {
      const score = this.calculatePersonalizationScore(recipe, cookingPatterns);
      
      if (score > 0.6) {
        recommendations.push({
          recipe,
          score,
          reasoning: this.generatePersonalizationReasoning(recipe, cookingPatterns),
          confidence: score
        });
      }
    });
    
    // Sort by personalization score
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  /**
   * Analyze family cooking patterns
   */
  static analyzeCookingPatterns(familyHistory) {
    const patterns = {
      favoriteCuisines: {},
      preferredDifficulty: {},
      averageCookTime: 0,
      popularIngredients: {},
      mealTypeDistribution: { breakfast: 0, lunch: 0, dinner: 0 },
      dayOfWeekPreferences: {}
    };
    
    // Analyze historical cooking data
    if (familyHistory.cookedRecipes) {
      familyHistory.cookedRecipes.forEach(record => {
        // Track cuisine preferences
        if (record.cuisine) {
          patterns.favoriteCuisines[record.cuisine] = (patterns.favoriteCuisines[record.cuisine] || 0) + 1;
        }
        
        // Track difficulty preferences
        if (record.difficulty) {
          patterns.preferredDifficulty[record.difficulty] = (patterns.preferredDifficulty[record.difficulty] || 0) + 1;
        }
        
        // Track ingredient preferences
        if (record.ingredients) {
          record.ingredients.forEach(ingredient => {
            const name = (ingredient.name || ingredient).toLowerCase();
            patterns.popularIngredients[name] = (patterns.popularIngredients[name] || 0) + 1;
          });
        }
      });
    }
    
    return patterns;
  }

  /**
   * Calculate personalization score for a recipe
   */
  static calculatePersonalizationScore(recipe, patterns) {
    let score = 0.5; // Base score
    
    // Cuisine preference bonus
    if (patterns.favoriteCuisines[recipe.cuisine]) {
      score += 0.2 * (patterns.favoriteCuisines[recipe.cuisine] / 10); // Normalize
    }
    
    // Difficulty preference bonus
    if (patterns.preferredDifficulty[recipe.difficulty]) {
      score += 0.15;
    }
    
    // Ingredient familiarity bonus
    if (recipe.ingredients) {
      const familiarIngredients = recipe.ingredients.filter(ingredient => {
        const name = (ingredient.name || ingredient).toLowerCase();
        return patterns.popularIngredients[name];
      });
      
      score += 0.25 * (familiarIngredients.length / recipe.ingredients.length);
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Generate reasoning for personalized recommendations
   */
  static generatePersonalizationReasoning(recipe, patterns) {
    const reasons = [];
    
    if (patterns.favoriteCuisines[recipe.cuisine]) {
      reasons.push(`${recipe.cuisine} is a favorite cuisine`);
    }
    
    if (patterns.preferredDifficulty[recipe.difficulty]) {
      reasons.push(`${recipe.difficulty} difficulty matches your preferences`);
    }
    
    if (recipe.ingredients) {
      const familiarCount = recipe.ingredients.filter(ingredient => {
        const name = (ingredient.name || ingredient).toLowerCase();
        return patterns.popularIngredients[name];
      }).length;
      
      if (familiarCount > 0) {
        reasons.push(`Contains ${familiarCount} ingredients you cook with often`);
      }
    }
    
    return reasons.length > 0 ? reasons.join('; ') : 'Good match for your cooking style';
  }

  /**
   * Utility methods
   */
  static addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Smart nutrition analysis and recommendations
   */
  static async analyzeNutritionBalance(plannedMeals, familyGoals = {}) {
    const nutritionSummary = {
      totalCalories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      recommendations: []
    };
    
    // Calculate totals from planned meals
    plannedMeals.forEach(meal => {
      if (meal.recipe?.nutrition) {
        nutritionSummary.totalCalories += meal.recipe.nutrition.calories || 0;
        nutritionSummary.protein += meal.recipe.nutrition.protein || 0;
        nutritionSummary.carbs += meal.recipe.nutrition.carbs || 0;
        nutritionSummary.fat += meal.recipe.nutrition.fat || 0;
        nutritionSummary.fiber += meal.recipe.nutrition.fiber || 0;
      }
    });
    
    // Generate recommendations based on nutritional balance
    const recommendations = [];
    
    if (nutritionSummary.protein < (familyGoals.protein || 100)) {
      recommendations.push({
        type: 'nutrition',
        title: 'Increase Protein',
        description: `Consider adding more protein-rich meals. Current: ${nutritionSummary.protein}g, Goal: ${familyGoals.protein || 100}g`,
        suggestions: ['Add lean meats', 'Include more legumes', 'Consider protein smoothies']
      });
    }
    
    if (nutritionSummary.fiber < (familyGoals.fiber || 25)) {
      recommendations.push({
        type: 'nutrition',
        title: 'Increase Fiber',
        description: `Add more fiber-rich foods. Current: ${nutritionSummary.fiber}g, Goal: ${familyGoals.fiber || 25}g`,
        suggestions: ['More vegetables in meals', 'Whole grain alternatives', 'Add fruits to breakfast']
      });
    }
    
    nutritionSummary.recommendations = recommendations;
    return nutritionSummary;
  }
}

export default AIRecipeService;