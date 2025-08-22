/**
 * AI-powered inventory management and prediction service
 * Analyzes usage patterns and predicts inventory needs
 */
class AIInventoryService {
  
  /**
   * Predict when items will run out based on usage patterns
   * @param {Array} inventory - Current inventory items
   * @param {Array} usageHistory - Historical usage/consumption data
   * @returns {Array} Predictions with reorder recommendations
   */
  static async predictInventoryNeeds(inventory, usageHistory = []) {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const predictions = [];
    
    inventory.forEach(item => {
      const usage = this.analyzeItemUsage(item, usageHistory);
      
      if (usage.consumptionRate > 0) {
        const daysRemaining = item.quantity / usage.consumptionRate;
        
        if (daysRemaining <= 7) { // Within a week
          predictions.push({
            itemId: item.id,
            itemName: item.name,
            category: item.category,
            currentQuantity: item.quantity,
            daysRemaining: Math.ceil(daysRemaining),
            urgency: daysRemaining <= 3 ? 'critical' : daysRemaining <= 7 ? 'high' : 'medium',
            suggestedReorderQuantity: usage.optimalReorderQuantity,
            confidence: usage.confidence,
            reasoning: `Based on ${usage.dataPoints} data points over ${usage.analysisPeriod} days`
          });
        }
      }
    });
    
    return predictions.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  /**
   * Analyze item usage patterns
   */
  static analyzeItemUsage(item, usageHistory) {
    // Filter usage history for this specific item
    const itemUsage = usageHistory.filter(usage => 
      usage.itemId === item.id || usage.itemName === item.name
    );
    
    if (itemUsage.length < 2) {
      return {
        consumptionRate: 0,
        confidence: 0.3,
        dataPoints: itemUsage.length,
        analysisPeriod: 0,
        optimalReorderQuantity: item.quantity
      };
    }
    
    // Calculate consumption rate (quantity per day)
    const sortedUsage = itemUsage.sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstDate = new Date(sortedUsage[0].date);
    const lastDate = new Date(sortedUsage[sortedUsage.length - 1].date);
    const analysisPeriod = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
    
    const totalConsumed = sortedUsage.reduce((sum, usage) => sum + (usage.quantityUsed || 1), 0);
    const consumptionRate = totalConsumed / Math.max(analysisPeriod, 1);
    
    // Calculate optimal reorder quantity based on usage patterns
    const avgWeeklyUsage = consumptionRate * 7;
    const optimalReorderQuantity = Math.ceil(avgWeeklyUsage * 2); // 2 weeks supply
    
    return {
      consumptionRate,
      confidence: Math.min(0.9, itemUsage.length * 0.15), // More data = higher confidence
      dataPoints: itemUsage.length,
      analysisPeriod,
      optimalReorderQuantity
    };
  }

  /**
   * Generate smart shopping list based on inventory analysis
   */
  static async generateSmartShoppingList(inventory, usageHistory, familyPreferences = {}) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const smartList = {
      urgentItems: [], // Items running out soon
      suggestedItems: [], // Items to consider buying
      bulkOpportunities: [], // Items good for bulk purchase
      seasonalRecommendations: [] // Seasonal items to consider
    };
    
    // Predict urgent reorders
    const predictions = await this.predictInventoryNeeds(inventory, usageHistory);
    smartList.urgentItems = predictions.filter(p => p.urgency === 'critical' || p.urgency === 'high');
    
    // Suggest items based on consumption patterns
    const frequentlyUsed = inventory.filter(item => {
      const usage = this.analyzeItemUsage(item, usageHistory);
      return usage.consumptionRate > 0.1; // Used regularly
    });
    
    frequentlyUsed.forEach(item => {
      if (item.quantity <= item.minQuantity * 1.5) {
        smartList.suggestedItems.push({
          name: item.name,
          category: item.category,
          reason: 'Running low on frequently used item',
          suggestedQuantity: this.analyzeItemUsage(item, usageHistory).optimalReorderQuantity
        });
      }
    });
    
    // Identify bulk purchase opportunities
    const bulkCandidates = this.identifyBulkOpportunities(inventory, usageHistory);
    smartList.bulkOpportunities = bulkCandidates;
    
    // Seasonal recommendations
    const seasonalItems = this.getSeasonalRecommendations();
    smartList.seasonalRecommendations = seasonalItems;
    
    return smartList;
  }

  /**
   * Identify items good for bulk purchasing
   */
  static identifyBulkOpportunities(inventory, usageHistory) {
    const opportunities = [];
    
    inventory.forEach(item => {
      const usage = this.analyzeItemUsage(item, usageHistory);
      
      // High usage + non-perishable = good for bulk
      if (usage.consumptionRate > 0.5 && // Used frequently
          !this.isPerishable(item.category) && // Non-perishable
          usage.confidence > 0.6) { // High confidence in usage pattern
        
        opportunities.push({
          itemName: item.name,
          category: item.category,
          weeklyUsage: (usage.consumptionRate * 7).toFixed(1),
          suggestedBulkQuantity: Math.ceil(usage.consumptionRate * 30), // 30-day supply
          estimatedSavings: this.estimateBulkSavings(item, usage.consumptionRate),
          confidence: usage.confidence
        });
      }
    });
    
    return opportunities.sort((a, b) => b.estimatedSavings - a.estimatedSavings);
  }

  /**
   * Check if item category is perishable
   */
  static isPerishable(category) {
    const perishableCategories = ['Dairy', 'Produce', 'Meat', 'Frozen', 'Fresh', 'Vegetables', 'Fruits'];
    return perishableCategories.some(cat => 
      category.toLowerCase().includes(cat.toLowerCase())
    );
  }

  /**
   * Estimate savings from bulk purchases
   */
  static estimateBulkSavings(item, consumptionRate) {
    const monthlyUsage = consumptionRate * 30;
    const estimatedMonthlyCost = monthlyUsage * (item.price || 5); // Default $5 if no price
    return estimatedMonthlyCost * 0.15; // Assume 15% bulk savings
  }

  /**
   * Get seasonal recommendations
   */
  static getSeasonalRecommendations() {
    const month = new Date().getMonth(); // 0-11
    const seasonalItems = {
      // Winter (Dec, Jan, Feb)
      winter: [
        { name: 'Hot Chocolate Mix', category: 'Pantry', reason: 'Cold weather comfort food' },
        { name: 'Soup Ingredients', category: 'Pantry', reason: 'Warming meals for winter' },
        { name: 'Batteries', category: 'Electronics', reason: 'Holiday toy season' }
      ],
      // Spring (Mar, Apr, May)
      spring: [
        { name: 'Cleaning Supplies', category: 'Household', reason: 'Spring cleaning season' },
        { name: 'Garden Seeds', category: 'Garden', reason: 'Planting season' },
        { name: 'Allergy Medicine', category: 'Healthcare', reason: 'Allergy season' }
      ],
      // Summer (Jun, Jul, Aug)
      summer: [
        { name: 'Sunscreen', category: 'Personal Care', reason: 'UV protection essential' },
        { name: 'BBQ Supplies', category: 'Kitchen', reason: 'Outdoor cooking season' },
        { name: 'Insect Repellent', category: 'Household', reason: 'Bug season' }
      ],
      // Fall (Sep, Oct, Nov)
      fall: [
        { name: 'Flu Shots/Medicine', category: 'Healthcare', reason: 'Flu season preparation' },
        { name: 'Warm Clothing', category: 'Clothing', reason: 'Cooler weather' },
        { name: 'Canning Supplies', category: 'Kitchen', reason: 'Harvest preservation' }
      ]
    };
    
    let season;
    if ([11, 0, 1].includes(month)) season = 'winter';
    else if ([2, 3, 4].includes(month)) season = 'spring';
    else if ([5, 6, 7].includes(month)) season = 'summer';
    else season = 'fall';
    
    return seasonalItems[season];
  }

  /**
   * Smart inventory organization suggestions
   */
  static async generateOrganizationSuggestions(inventory) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const suggestions = [];
    
    // FIFO rotation suggestions
    const expiringItems = inventory
      .filter(item => item.expirationDate)
      .filter(item => {
        const expDate = new Date(item.expirationDate);
        const daysUntilExpiry = (expDate - new Date()) / (1000 * 60 * 60 * 24);
        return daysUntilExpiry <= 14 && daysUntilExpiry > 0;
      })
      .sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));
    
    if (expiringItems.length > 0) {
      suggestions.push({
        type: 'expiration_alert',
        title: 'Items Expiring Soon',
        items: expiringItems.slice(0, 5),
        action: 'Use these items first or consider donating/sharing',
        urgency: 'high'
      });
    }
    
    // Category consolidation suggestions
    const categoryAnalysis = this.analyzeCategoryDistribution(inventory);
    if (categoryAnalysis.fragmentedCategories.length > 0) {
      suggestions.push({
        type: 'organization',
        title: 'Category Organization',
        description: 'Consider consolidating similar items into consistent categories',
        fragmentedCategories: categoryAnalysis.fragmentedCategories,
        action: 'Standardize category naming for better organization'
      });
    }
    
    // Storage location optimization
    const locationSuggestions = this.generateLocationSuggestions(inventory);
    if (locationSuggestions.length > 0) {
      suggestions.push({
        type: 'storage',
        title: 'Storage Optimization',
        suggestions: locationSuggestions,
        action: 'Optimize item placement for better accessibility'
      });
    }
    
    return suggestions;
  }

  /**
   * Analyze category distribution
   */
  static analyzeCategoryDistribution(inventory) {
    const categories = {};
    
    inventory.forEach(item => {
      const cat = item.category.toLowerCase();
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push(item);
    });
    
    // Find similar categories that could be consolidated
    const fragmentedCategories = [];
    const categoryNames = Object.keys(categories);
    
    categoryNames.forEach(cat1 => {
      categoryNames.forEach(cat2 => {
        if (cat1 !== cat2 && this.areSimilarCategories(cat1, cat2)) {
          const existing = fragmentedCategories.find(f => 
            f.categories.includes(cat1) || f.categories.includes(cat2)
          );
          
          if (!existing) {
            fragmentedCategories.push({
              categories: [cat1, cat2],
              suggestion: `Consider consolidating "${cat1}" and "${cat2}" categories`,
              itemCount: categories[cat1].length + categories[cat2].length
            });
          }
        }
      });
    });
    
    return { fragmentedCategories };
  }

  /**
   * Check if two categories are similar
   */
  static areSimilarCategories(cat1, cat2) {
    const similarityPairs = [
      ['bathroom', 'personal care'],
      ['kitchen', 'cooking'],
      ['electronic', 'electronics'],
      ['tool', 'tools'],
      ['cleaning', 'household'],
      ['medicine', 'healthcare'],
      ['food', 'pantry'],
      ['garden', 'outdoor']
    ];
    
    return similarityPairs.some(([a, b]) => 
      (cat1.includes(a) && cat2.includes(b)) || 
      (cat1.includes(b) && cat2.includes(a))
    );
  }

  /**
   * Generate storage location optimization suggestions
   */
  static generateLocationSuggestions(inventory) {
    const suggestions = [];
    
    // Group by location
    const locations = {};
    inventory.forEach(item => {
      if (item.location) {
        if (!locations[item.location]) locations[item.location] = [];
        locations[item.location].push(item);
      }
    });
    
    // Analyze each location
    Object.entries(locations).forEach(([location, items]) => {
      if (items.length > 20) { // Overcrowded locations
        suggestions.push({
          location,
          type: 'overcrowded',
          itemCount: items.length,
          suggestion: `Consider redistributing some items from ${location} to reduce crowding`,
          categories: [...new Set(items.map(i => i.category))]
        });
      }
      
      // Items in wrong category locations
      const wrongLocationItems = items.filter(item => 
        !this.isAppropriateLocation(item.category, location)
      );
      
      if (wrongLocationItems.length > 0) {
        suggestions.push({
          location,
          type: 'misplaced',
          items: wrongLocationItems.slice(0, 3),
          suggestion: `Some items might be better stored elsewhere`,
          action: 'Review item placement for optimal accessibility'
        });
      }
    });
    
    return suggestions;
  }

  /**
   * Check if item category is appropriate for location
   */
  static isAppropriateLocation(category, location) {
    const locationMappings = {
      'kitchen': ['kitchen', 'pantry', 'food', 'cooking', 'dining'],
      'bathroom': ['bathroom', 'personal care', 'hygiene', 'health'],
      'bedroom': ['bedroom', 'clothing', 'personal', 'sleep'],
      'garage': ['garage', 'tools', 'automotive', 'outdoor', 'sports'],
      'office': ['office', 'electronics', 'work', 'study'],
      'living room': ['living room', 'entertainment', 'electronics']
    };
    
    const loc = location.toLowerCase();
    const cat = category.toLowerCase();
    
    return Object.entries(locationMappings).some(([locPattern, categories]) => 
      loc.includes(locPattern) && categories.some(c => cat.includes(c))
    );
  }

  /**
   * Generate recipe suggestions based on current inventory
   */
  static async generateRecipeSuggestions(inventory, recipes = [], familyPreferences = {}) {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const suggestions = [];
    
    // Find recipes that can be made with current inventory
    recipes.forEach(recipe => {
      const { canMake, missingIngredients, ingredientMatch } = this.analyzeRecipeCompatibility(recipe, inventory);
      
      if (canMake) {
        suggestions.push({
          recipeId: recipe.id,
          recipeName: recipe.name,
          cuisine: recipe.cuisine,
          difficulty: recipe.difficulty,
          servings: recipe.servings,
          type: 'ready_to_make',
          ingredientMatch: 100,
          missingIngredients: [],
          reasoning: 'All ingredients available in inventory'
        });
      } else if (ingredientMatch >= 0.7) { // 70% ingredients available
        suggestions.push({
          recipeId: recipe.id,
          recipeName: recipe.name,
          cuisine: recipe.cuisine,
          difficulty: recipe.difficulty,
          servings: recipe.servings,
          type: 'almost_ready',
          ingredientMatch: (ingredientMatch * 100).toFixed(1),
          missingIngredients: missingIngredients.slice(0, 3),
          reasoning: `${(ingredientMatch * 100).toFixed(1)}% ingredients available`
        });
      }
    });
    
    // Sort by ingredient match and family preferences
    return suggestions
      .sort((a, b) => {
        // Prioritize recipes that can be made immediately
        if (a.type === 'ready_to_make' && b.type !== 'ready_to_make') return -1;
        if (b.type === 'ready_to_make' && a.type !== 'ready_to_make') return 1;
        
        // Then by ingredient match
        return b.ingredientMatch - a.ingredientMatch;
      })
      .slice(0, 10); // Top 10 suggestions
  }

  /**
   * Analyze recipe compatibility with current inventory
   */
  static analyzeRecipeCompatibility(recipe, inventory) {
    const requiredIngredients = recipe.ingredients || [];
    const availableIngredients = inventory.map(item => item.name.toLowerCase());
    
    let matchedIngredients = 0;
    const missingIngredients = [];
    
    requiredIngredients.forEach(ingredient => {
      const ingredientName = ingredient.name ? ingredient.name.toLowerCase() : ingredient.toLowerCase();
      const isAvailable = availableIngredients.some(available => 
        available.includes(ingredientName) || ingredientName.includes(available)
      );
      
      if (isAvailable) {
        matchedIngredients++;
      } else {
        missingIngredients.push(ingredient.name || ingredient);
      }
    });
    
    const ingredientMatch = requiredIngredients.length > 0 ? 
      matchedIngredients / requiredIngredients.length : 0;
    
    return {
      canMake: ingredientMatch === 1,
      missingIngredients,
      ingredientMatch
    };
  }

  /**
   * Analyze inventory value and cost optimization
   */
  static async analyzeInventoryValue(inventory, purchaseHistory = []) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const analysis = {
      totalValue: 0,
      categoryBreakdown: {},
      costOptimization: [],
      unusedItems: [],
      highValueItems: []
    };
    
    // Calculate total value and category breakdown
    inventory.forEach(item => {
      const value = (item.price || 0) * (item.quantity || 1);
      analysis.totalValue += value;
      
      if (!analysis.categoryBreakdown[item.category]) {
        analysis.categoryBreakdown[item.category] = {
          count: 0,
          totalValue: 0,
          items: []
        };
      }
      
      analysis.categoryBreakdown[item.category].count++;
      analysis.categoryBreakdown[item.category].totalValue += value;
      analysis.categoryBreakdown[item.category].items.push(item);
    });
    
    // Find unused items (no recent usage)
    analysis.unusedItems = inventory.filter(item => {
      const lastUsed = item.lastUsed ? new Date(item.lastUsed) : null;
      if (!lastUsed) return true; // Never used
      
      const daysSinceUsed = (new Date() - lastUsed) / (1000 * 60 * 60 * 24);
      return daysSinceUsed > 90; // Not used in 3 months
    });
    
    // Identify high-value items
    analysis.highValueItems = inventory
      .filter(item => (item.price || 0) > 100)
      .sort((a, b) => (b.price || 0) - (a.price || 0))
      .slice(0, 5);
    
    return analysis;
  }

  /**
   * Generate smart alerts for inventory management
   */
  static async generateInventoryAlerts(inventory, usageHistory = []) {
    const alerts = [];
    
    // Expiration alerts
    const expiringItems = inventory.filter(item => {
      if (!item.expirationDate) return false;
      const daysUntilExpiry = (new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry <= 3 && daysUntilExpiry > 0;
    });
    
    if (expiringItems.length > 0) {
      alerts.push({
        type: 'expiration',
        priority: 'critical',
        title: 'Items Expiring Soon',
        count: expiringItems.length,
        items: expiringItems.map(item => item.name),
        action: 'Use these items immediately or they will expire'
      });
    }
    
    // Low stock alerts with AI predictions
    const predictions = await this.predictInventoryNeeds(inventory, usageHistory);
    const criticalItems = predictions.filter(p => p.urgency === 'critical');
    
    if (criticalItems.length > 0) {
      alerts.push({
        type: 'stock',
        priority: 'high',
        title: 'Critical Stock Levels',
        count: criticalItems.length,
        items: criticalItems.map(p => `${p.itemName} (${p.daysRemaining} days remaining)`),
        action: 'Reorder these items immediately'
      });
    }
    
    return alerts;
  }
}

export default AIInventoryService;