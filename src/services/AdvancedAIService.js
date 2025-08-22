/**
 * Advanced AI Service integrating external APIs for next-gen features
 * Requires API keys in environment variables
 */

// Voice AI Integration
class VoiceAI {
  static initializeSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return null;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    return recognition;
  }

  static async processVoiceCommand(command, context = {}) {
    // Process voice commands for home management
    const normalizedCommand = command.toLowerCase();
    
    // Shopping list commands
    if (normalizedCommand.includes('add') && normalizedCommand.includes('shopping list')) {
      return this.parseShoppingCommand(normalizedCommand);
    }
    
    // Expense tracking commands
    if (normalizedCommand.includes('spent') || normalizedCommand.includes('bought')) {
      return this.parseExpenseCommand(normalizedCommand);
    }
    
    // Recipe queries
    if (normalizedCommand.includes('recipe') || normalizedCommand.includes('cook')) {
      return this.parseRecipeCommand(normalizedCommand);
    }
    
    // Inventory queries
    if (normalizedCommand.includes('inventory') || normalizedCommand.includes('have')) {
      return this.parseInventoryCommand(normalizedCommand);
    }
    
    return {
      type: 'unknown',
      message: 'I didn\'t understand that command. Try saying something like "Add milk to shopping list" or "How much did I spend on groceries?"'
    };
  }

  static parseShoppingCommand(command) {
    // Extract items from "add milk and bread to shopping list"
    const addMatch = command.match(/add (.*?) to shopping list/);
    if (addMatch) {
      const items = addMatch[1].split(' and ').map(item => item.trim());
      return {
        type: 'add_to_shopping_list',
        items: items,
        message: `Added ${items.join(', ')} to your shopping list`
      };
    }
    return { type: 'unknown', message: 'Could not parse shopping command' };
  }

  static parseExpenseCommand(command) {
    // Extract amount and description from "I spent 50 dollars on groceries"
    const spentMatch = command.match(/spent (\d+(?:\.\d{2})?) (?:dollars? )?on (.*)/);
    if (spentMatch) {
      return {
        type: 'add_expense',
        amount: parseFloat(spentMatch[1]),
        description: spentMatch[2],
        message: `Recorded expense: $${spentMatch[1]} for ${spentMatch[2]}`
      };
    }
    return { type: 'unknown', message: 'Could not parse expense command' };
  }

  static parseRecipeCommand(command) {
    if (command.includes('what can i cook') || command.includes('what recipes')) {
      return {
        type: 'recipe_suggestions',
        message: 'Let me find recipes based on your available ingredients'
      };
    }
    return { type: 'unknown', message: 'Could not parse recipe command' };
  }

  static parseInventoryCommand(command) {
    if (command.includes('do i have') || command.includes('how much')) {
      return {
        type: 'inventory_check',
        message: 'Let me check your inventory'
      };
    }
    return { type: 'unknown', message: 'Could not parse inventory command' };
  }
}

// Computer Vision AI
class VisionAI {
  /**
   * Process receipt image using OCR
   */
  static async processReceiptImage(imageFile) {
    try {
      // Using Tesseract.js for free OCR
      const Tesseract = await import('tesseract.js');
      
      const result = await Tesseract.recognize(imageFile, 'eng', {
        logger: m => console.log(m)
      });
      
      const text = result.data.text;
      return this.parseReceiptText(text);
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw new Error('Failed to process receipt image');
    }
  }

  static parseReceiptText(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const receipt = {
      items: [],
      total: 0,
      store: '',
      date: '',
      raw: text
    };
    
    // Extract store name (usually first few lines)
    const storePattern = /(walmart|kroger|safeway|target|costco|trader joe|whole foods)/i;
    const storeMatch = text.match(storePattern);
    if (storeMatch) {
      receipt.store = storeMatch[1];
    }
    
    // Extract date
    const datePattern = /(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2})/;
    const dateMatch = text.match(datePattern);
    if (dateMatch) {
      receipt.date = dateMatch[1];
    }
    
    // Extract items and prices
    lines.forEach(line => {
      // Look for patterns like "ITEM NAME    $12.99"
      const itemPattern = /^(.+?)\s+\$?(\d+\.\d{2})$/;
      const match = line.match(itemPattern);
      
      if (match) {
        const itemName = match[1].trim();
        const price = parseFloat(match[2]);
        
        // Filter out obvious non-items
        if (!this.isReceiptItem(itemName)) return;
        
        receipt.items.push({
          name: itemName,
          price: price,
          category: this.categorizeReceiptItem(itemName)
        });
      }
    });
    
    // Extract total
    const totalPattern = /total:?\s*\$?(\d+\.\d{2})/i;
    const totalMatch = text.match(totalPattern);
    if (totalMatch) {
      receipt.total = parseFloat(totalMatch[1]);
    }
    
    return receipt;
  }

  static isReceiptItem(text) {
    const excludePatterns = [
      'total', 'subtotal', 'tax', 'change', 'cash', 'credit', 'debit',
      'balance', 'payment', 'receipt', 'store', 'thank you'
    ];
    
    const lowerText = text.toLowerCase();
    return !excludePatterns.some(pattern => lowerText.includes(pattern)) && text.length > 2;
  }

  static categorizeReceiptItem(itemName) {
    const name = itemName.toLowerCase();
    
    const categories = {
      'Groceries': ['milk', 'bread', 'eggs', 'cheese', 'chicken', 'beef', 'apple', 'banana'],
      'Household': ['detergent', 'soap', 'paper', 'toilet', 'cleaning'],
      'Personal Care': ['shampoo', 'toothpaste', 'deodorant', 'lotion'],
      'Electronics': ['battery', 'cable', 'charger', 'phone'],
      'Health': ['medicine', 'vitamin', 'pharmacy', 'prescription']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => name.includes(keyword))) {
        return category;
      }
    }
    
    return 'Other';
  }

  /**
   * Barcode scanning for inventory management
   */
  static async initializeBarcodeScanner() {
    try {
      const Quagga = await import('quagga');
      
      return new Promise((resolve, reject) => {
        Quagga.init({
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#barcode-scanner'),
            constraints: {
              width: 640,
              height: 480,
              facingMode: "environment"
            }
          },
          decoder: {
            readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader"]
          }
        }, (err) => {
          if (err) {
            reject(err);
            return;
          }
          Quagga.start();
          resolve(Quagga);
        });
      });
    } catch (error) {
      throw new Error('Failed to initialize barcode scanner');
    }
  }

  static async lookupProductByBarcode(barcode) {
    try {
      // Using OpenFoodFacts API (free) for product information
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      
      if (data.status === 1) {
        const product = data.product;
        return {
          name: product.product_name || 'Unknown Product',
          brand: product.brands || '',
          category: this.categorizeProduct(product.categories || ''),
          nutrition: {
            calories: product.nutriments?.['energy-kcal_100g'],
            protein: product.nutriments?.['proteins_100g'],
            carbs: product.nutriments?.['carbohydrates_100g'],
            fat: product.nutriments?.['fat_100g']
          },
          ingredients: product.ingredients_text || '',
          imageUrl: product.image_url || null
        };
      }
      
      return null;
    } catch (error) {
      console.error('Product lookup failed:', error);
      return null;
    }
  }

  static categorizeProduct(categories) {
    if (categories.includes('dairy')) return 'Dairy';
    if (categories.includes('meat')) return 'Meat';
    if (categories.includes('vegetable')) return 'Produce';
    if (categories.includes('fruit')) return 'Produce';
    if (categories.includes('beverage')) return 'Beverages';
    return 'Pantry';
  }
}

// GPT Integration for Natural Language Processing
class GPTService {
  static async processNaturalLanguageQuery(query, context = {}) {
    // This would integrate with OpenAI API
    // For demo purposes, we'll use pattern matching
    
    const normalizedQuery = query.toLowerCase();
    
    // Spending queries
    if (normalizedQuery.includes('spend') || normalizedQuery.includes('cost')) {
      return await this.handleSpendingQuery(query, context);
    }
    
    // Recipe queries
    if (normalizedQuery.includes('recipe') || normalizedQuery.includes('cook') || normalizedQuery.includes('meal')) {
      return await this.handleRecipeQuery(query, context);
    }
    
    // Inventory queries
    if (normalizedQuery.includes('inventory') || normalizedQuery.includes('have') || normalizedQuery.includes('stock')) {
      return await this.handleInventoryQuery(query, context);
    }
    
    return {
      type: 'general',
      response: 'I can help you with spending tracking, recipe suggestions, and inventory management. What would you like to know?'
    };
  }

  static async handleSpendingQuery(query, context) {
    const expenses = context.expenses || [];
    
    if (query.includes('this month')) {
      const thisMonth = new Date().toISOString().substring(0, 7);
      const monthlyExpenses = expenses.filter(e => e.date.startsWith(thisMonth));
      const total = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      return {
        type: 'spending_analysis',
        response: `You've spent $${total.toFixed(2)} this month across ${monthlyExpenses.length} transactions.`,
        data: { total, count: monthlyExpenses.length }
      };
    }
    
    return {
      type: 'spending_general',
      response: 'I can help analyze your spending patterns. Try asking about spending this month, by category, or compared to budget.'
    };
  }

  static async handleRecipeQuery(query, context) {
    const inventory = context.inventory || [];
    const recipes = context.recipes || [];
    
    if (query.includes('what can i cook') || query.includes('what can i make')) {
      // Find recipes with available ingredients
      const availableRecipes = recipes.filter(recipe => 
        recipe.ingredients?.every(ingredient => 
          inventory.some(item => 
            item.name.toLowerCase().includes((ingredient.name || ingredient).toLowerCase())
          )
        )
      );
      
      return {
        type: 'recipe_suggestions',
        response: `Based on your inventory, you can make ${availableRecipes.length} recipes. Here are the top suggestions: ${availableRecipes.slice(0, 3).map(r => r.name).join(', ')}.`,
        data: { recipes: availableRecipes.slice(0, 5) }
      };
    }
    
    return {
      type: 'recipe_general',
      response: 'I can suggest recipes based on your available ingredients. What would you like to cook?'
    };
  }

  static async handleInventoryQuery(query, context) {
    const inventory = context.inventory || [];
    
    if (query.includes('running low') || query.includes('need to buy')) {
      const lowStockItems = inventory.filter(item => 
        item.quantity <= (item.minQuantity || 2)
      );
      
      return {
        type: 'inventory_alerts',
        response: `You have ${lowStockItems.length} items running low: ${lowStockItems.slice(0, 3).map(i => i.name).join(', ')}.`,
        data: { lowStockItems }
      };
    }
    
    return {
      type: 'inventory_general',
      response: 'I can check your inventory levels, suggest items to reorder, or help organize your items.'
    };
  }
}

// Image Recognition for Products
class ProductRecognitionAI {
  /**
   * Recognize products from images using TensorFlow.js
   */
  static async recognizeProductFromImage(imageFile) {
    try {
      // Load MobileNet model for general image classification
      const mobilenet = await import('@tensorflow-models/mobilenet');
      const tf = await import('@tensorflow/tfjs');
      
      const model = await mobilenet.load();
      
      // Create image element
      const img = new Image();
      const imageUrl = URL.createObjectURL(imageFile);
      img.src = imageUrl;
      
      return new Promise((resolve) => {
        img.onload = async () => {
          const predictions = await model.classify(img);
          
          // Clean up
          URL.revokeObjectURL(imageUrl);
          
          // Process predictions to extract useful product info
          const productInfo = this.processImagePredictions(predictions);
          resolve(productInfo);
        };
      });
    } catch (error) {
      console.error('Image recognition failed:', error);
      throw new Error('Failed to recognize product from image');
    }
  }

  static processImagePredictions(predictions) {
    if (!predictions || predictions.length === 0) {
      return null;
    }
    
    const topPrediction = predictions[0];
    
    // Map common predictions to inventory categories
    const categoryMapping = {
      'coffee': { category: 'Beverages', name: 'Coffee' },
      'milk': { category: 'Dairy', name: 'Milk' },
      'bread': { category: 'Bakery', name: 'Bread' },
      'apple': { category: 'Produce', name: 'Apple' },
      'banana': { category: 'Produce', name: 'Banana' },
      'bottle': { category: 'Beverages', name: 'Bottled Beverage' },
      'can': { category: 'Pantry', name: 'Canned Good' }
    };
    
    // Find the best category match
    for (const [keyword, info] of Object.entries(categoryMapping)) {
      if (topPrediction.className.toLowerCase().includes(keyword)) {
        return {
          confidence: topPrediction.probability,
          suggestedName: info.name,
          suggestedCategory: info.category,
          allPredictions: predictions.slice(0, 3)
        };
      }
    }
    
    return {
      confidence: topPrediction.probability,
      suggestedName: topPrediction.className,
      suggestedCategory: 'Other',
      allPredictions: predictions.slice(0, 3)
    };
  }
}

// Smart Home AI Integration
class SmartHomeAI {
  /**
   * Learn household patterns and generate automation suggestions
   */
  static async analyzeHouseholdPatterns(deviceData, familySchedule = []) {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const patterns = {
      occupancyPatterns: this.analyzeOccupancyPatterns(familySchedule),
      deviceUsagePatterns: this.analyzeDeviceUsage(deviceData),
      energyOptimization: [],
      automationSuggestions: []
    };
    
    // Generate energy optimization suggestions
    patterns.energyOptimization = this.generateEnergyOptimizations(deviceData, patterns.occupancyPatterns);
    
    // Generate automation suggestions
    patterns.automationSuggestions = this.generateAutomationSuggestions(patterns);
    
    return patterns;
  }

  static analyzeOccupancyPatterns(schedule) {
    const patterns = {
      weekdayRoutine: {},
      weekendRoutine: {},
      commonArrivalTimes: [],
      commonDepartureTimes: []
    };
    
    // Analyze when family is typically home/away
    schedule.forEach(event => {
      const hour = new Date(event.time).getHours();
      const isWeekend = new Date(event.time).getDay() % 6 === 0;
      
      if (event.type === 'arrive_home') {
        patterns.commonArrivalTimes.push(hour);
      } else if (event.type === 'leave_home') {
        patterns.commonDepartureTimes.push(hour);
      }
    });
    
    return patterns;
  }

  static analyzeDeviceUsage(deviceData) {
    const usage = {};
    
    deviceData.forEach(device => {
      usage[device.id] = {
        avgDailyUsage: device.usageHours || 0,
        peakUsageTimes: device.peakTimes || [],
        energyConsumption: device.energyUsage || 0,
        automationPotential: this.calculateAutomationPotential(device)
      };
    });
    
    return usage;
  }

  static calculateAutomationPotential(device) {
    // Score devices based on automation benefits
    const automationScores = {
      'Thermostat': 0.9,
      'Lights': 0.8,
      'Smart Locks': 0.7,
      'Coffee Maker': 0.6,
      'TV': 0.5
    };
    
    return automationScores[device.type] || 0.3;
  }

  static generateEnergyOptimizations(deviceData, occupancyPatterns) {
    const optimizations = [];
    
    // Find devices that could save energy with better scheduling
    deviceData.forEach(device => {
      if (device.type === 'Thermostat') {
        optimizations.push({
          device: device.name,
          type: 'schedule_optimization',
          description: 'Adjust temperature when family is away',
          estimatedSavings: '$25-40/month',
          effort: 'low'
        });
      }
      
      if (device.type === 'Lights' && device.smartFeatures?.includes('dimming')) {
        optimizations.push({
          device: device.name,
          type: 'dimming_schedule',
          description: 'Auto-dim lights during evening hours',
          estimatedSavings: '$5-10/month',
          effort: 'low'
        });
      }
    });
    
    return optimizations;
  }

  static generateAutomationSuggestions(patterns) {
    const suggestions = [];
    
    // Arrival routine automation
    if (patterns.occupancyPatterns.commonArrivalTimes.length > 0) {
      const avgArrival = patterns.occupancyPatterns.commonArrivalTimes.reduce((a, b) => a + b, 0) / 
                          patterns.occupancyPatterns.commonArrivalTimes.length;
      
      suggestions.push({
        type: 'arrival_routine',
        title: 'Welcome Home Automation',
        description: `Automatically turn on lights and adjust temperature when you typically arrive home around ${Math.round(avgArrival)}:00`,
        devices: ['Lights', 'Thermostat', 'Music System'],
        triggers: ['GPS location', 'Time of day', 'Motion sensor']
      });
    }
    
    // Bedtime routine
    suggestions.push({
      type: 'bedtime_routine',
      title: 'Goodnight Automation',
      description: 'Automatically lock doors, turn off lights, and adjust temperature for sleep',
      devices: ['Smart Locks', 'Lights', 'Thermostat'],
      triggers: ['Time-based', 'Manual trigger', 'Motion absence']
    });
    
    return suggestions;
  }
}

// Financial AI for advanced budgeting and predictions
class FinancialAI {
  /**
   * Predict future expenses using trend analysis
   */
  static async predictFutureExpenses(historicalExpenses, months = 3) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const predictions = [];
    const categories = [...new Set(historicalExpenses.map(e => e.category))];
    
    categories.forEach(category => {
      const categoryExpenses = historicalExpenses.filter(e => e.category === category);
      const prediction = this.analyzeCategoryTrend(categoryExpenses, months);
      
      if (prediction.confidence > 0.5) {
        predictions.push({
          category,
          predictedAmount: prediction.amount,
          confidence: prediction.confidence,
          trend: prediction.trend,
          seasonality: prediction.seasonality
        });
      }
    });
    
    return predictions;
  }

  static analyzeCategoryTrend(expenses, months) {
    if (expenses.length < 3) {
      return { confidence: 0.3, amount: 0, trend: 'stable' };
    }
    
    // Group by month
    const monthlySpending = {};
    expenses.forEach(expense => {
      const month = expense.date.substring(0, 7);
      monthlySpending[month] = (monthlySpending[month] || 0) + expense.amount;
    });
    
    const monthlyAmounts = Object.values(monthlySpending);
    const avgAmount = monthlyAmounts.reduce((a, b) => a + b, 0) / monthlyAmounts.length;
    
    // Calculate trend
    const recentAvg = monthlyAmounts.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, monthlyAmounts.length);
    const trendRatio = recentAvg / avgAmount;
    
    let trend = 'stable';
    if (trendRatio > 1.1) trend = 'increasing';
    else if (trendRatio < 0.9) trend = 'decreasing';
    
    return {
      amount: recentAvg * months,
      confidence: Math.min(0.9, expenses.length * 0.1),
      trend,
      seasonality: this.detectSeasonality(monthlySpending)
    };
  }

  static detectSeasonality(monthlySpending) {
    // Simple seasonality detection
    const months = Object.keys(monthlySpending).sort();
    if (months.length < 12) return 'insufficient_data';
    
    // Check for holiday spending patterns, summer/winter variations, etc.
    return 'normal'; // Simplified for demo
  }

  /**
   * Generate investment and savings recommendations
   */
  static async generateFinancialAdvice(spendingData, savingsGoals = {}) {
    const advice = [];
    
    const monthlySpending = spendingData.reduce((sum, expense) => sum + expense.amount, 0);
    const avgMonthlySpending = monthlySpending / Math.max(1, spendingData.length);
    
    // Savings rate analysis
    if (savingsGoals.monthlyIncome) {
      const savingsRate = 1 - (avgMonthlySpending / savingsGoals.monthlyIncome);
      
      if (savingsRate < 0.2) {
        advice.push({
          type: 'savings',
          title: 'Increase Savings Rate',
          description: `Your current savings rate is ${(savingsRate * 100).toFixed(1)}%. Experts recommend 20%+.`,
          suggestions: [
            'Reduce dining out expenses',
            'Look for subscription services to cancel',
            'Consider generic brands for household items'
          ]
        });
      }
    }
    
    // Emergency fund recommendations
    const monthlyExpenses = avgMonthlySpending;
    const recommendedEmergencyFund = monthlyExpenses * 6;
    
    advice.push({
      type: 'emergency_fund',
      title: 'Emergency Fund Planning',
      description: `Based on your spending patterns, aim for $${recommendedEmergencyFund.toFixed(2)} emergency fund (6 months expenses).`,
      currentMonthlyExpenses: monthlyExpenses,
      targetAmount: recommendedEmergencyFund
    });
    
    return advice;
  }
}

// Composite AI Manager
class AdvancedAIService {
  static async initializeAllServices() {
    const services = {
      voice: VoiceAI.initializeSpeechRecognition(),
      vision: null, // Initialize when needed
      nlp: true, // Always available
      smartHome: true,
      financial: true
    };
    
    return services;
  }

  static async processMultiModalInput(input) {
    const { type, data } = input;
    
    switch (type) {
      case 'voice':
        return await VoiceAI.processVoiceCommand(data.transcript, data.context);
      
      case 'image':
        if (data.imageType === 'receipt') {
          return await VisionAI.processReceiptImage(data.file);
        } else if (data.imageType === 'product') {
          return await ProductRecognitionAI.recognizeProductFromImage(data.file);
        }
        break;
      
      case 'text':
        return await GPTService.processNaturalLanguageQuery(data.query, data.context);
      
      case 'barcode':
        return await VisionAI.lookupProductByBarcode(data.barcode);
      
      default:
        throw new Error('Unsupported input type');
    }
  }

  /**
   * Generate comprehensive household insights using all AI services
   */
  static async generateHouseholdInsights(householdData) {
    const insights = {
      spending: await FinancialAI.predictFutureExpenses(householdData.expenses || []),
      smartHome: await SmartHomeAI.analyzeHouseholdPatterns(householdData.devices || [], householdData.schedule || []),
      financial: await FinancialAI.generateFinancialAdvice(householdData.expenses || [], householdData.goals || {}),
      summary: {
        totalPotentialSavings: 0,
        topRecommendations: [],
        urgentActions: []
      }
    };
    
    // Calculate summary metrics
    insights.summary = this.generateInsightsSummary(insights);
    
    return insights;
  }

  static generateInsightsSummary(insights) {
    const summary = {
      totalPotentialSavings: 0,
      topRecommendations: [],
      urgentActions: []
    };
    
    // Aggregate potential savings
    if (insights.smartHome.energyOptimization) {
      insights.smartHome.energyOptimization.forEach(opt => {
        // Extract savings amount from description
        const savingsMatch = opt.estimatedSavings.match(/\$(\d+)-?(\d+)?/);
        if (savingsMatch) {
          summary.totalPotentialSavings += parseInt(savingsMatch[1]);
        }
      });
    }
    
    // Collect top recommendations
    const allRecommendations = [
      ...(insights.financial || []),
      ...(insights.smartHome.automationSuggestions || [])
    ];
    
    summary.topRecommendations = allRecommendations
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, 5);
    
    return summary;
  }
}

export { 
  VoiceAI, 
  VisionAI, 
  ProductRecognitionAI, 
  GPTService, 
  SmartHomeAI, 
  FinancialAI, 
  AdvancedAIService 
};