import toast from 'react-hot-toast';

/**
 * AI-powered expense categorization and analysis service
 * Uses pattern matching and learning algorithms to categorize expenses
 */
class AIExpenseService {
  
  /**
   * Categorize an expense using AI pattern matching
   * @param {string} description - Expense description
   * @param {number} amount - Expense amount
   * @param {string} merchant - Merchant/vendor name
   * @param {Array} historicalExpenses - User's historical expenses for learning
   * @returns {Object} Category prediction with confidence score
   */
  static categorizeExpense(description, amount, merchant = '', historicalExpenses = []) {
    const patterns = this.buildCategoryPatterns(historicalExpenses);
    const prediction = this.predictCategory(description, amount, merchant, patterns);
    
    return {
      category: prediction.category,
      confidence: prediction.confidence,
      reasoning: prediction.reasoning,
      alternatives: prediction.alternatives
    };
  }

  /**
   * Build category patterns from historical data
   */
  static buildCategoryPatterns(expenses) {
    const patterns = {
      'Groceries': {
        keywords: ['grocery', 'supermarket', 'market', 'kroger', 'walmart', 'safeway', 'costco', 'food', 'produce'],
        merchants: ['kroger', 'walmart', 'safeway', 'trader joe', 'whole foods', 'costco'],
        amountRange: [10, 300],
        frequency: 'weekly'
      },
      'Dining Out': {
        keywords: ['restaurant', 'cafe', 'pizza', 'burger', 'coffee', 'starbucks', 'mcdonald'],
        merchants: ['starbucks', 'subway', 'chipotle', 'pizza hut', 'olive garden'],
        amountRange: [5, 100],
        frequency: 'occasional'
      },
      'Gas & Transportation': {
        keywords: ['gas', 'fuel', 'station', 'uber', 'lyft', 'taxi', 'parking', 'toll'],
        merchants: ['shell', 'exxon', 'bp', 'chevron', 'uber', 'lyft'],
        amountRange: [20, 80],
        frequency: 'regular'
      },
      'Utilities': {
        keywords: ['electric', 'gas', 'water', 'internet', 'phone', 'cable', 'utility'],
        merchants: ['pge', 'comcast', 'verizon', 'at&t'],
        amountRange: [30, 300],
        frequency: 'monthly'
      },
      'Entertainment': {
        keywords: ['movie', 'netflix', 'spotify', 'gaming', 'theater', 'concert', 'streaming'],
        merchants: ['netflix', 'spotify', 'amazon prime', 'hulu', 'steam'],
        amountRange: [5, 50],
        frequency: 'monthly'
      },
      'Healthcare': {
        keywords: ['pharmacy', 'doctor', 'medical', 'health', 'cvs', 'walgreens', 'clinic'],
        merchants: ['cvs', 'walgreens', 'kaiser', 'clinic'],
        amountRange: [10, 500],
        frequency: 'occasional'
      },
      'Home & Garden': {
        keywords: ['home depot', 'lowes', 'garden', 'hardware', 'improvement', 'furniture'],
        merchants: ['home depot', 'lowes', 'ikea', 'target'],
        amountRange: [10, 1000],
        frequency: 'occasional'
      },
      'Personal Care': {
        keywords: ['salon', 'spa', 'haircut', 'beauty', 'cosmetics', 'personal'],
        merchants: ['ulta', 'sephora', 'salon'],
        amountRange: [10, 200],
        frequency: 'monthly'
      }
    };

    // Learn from user's historical data
    if (expenses.length > 0) {
      this.enhancePatternsFromHistory(patterns, expenses);
    }

    return patterns;
  }

  /**
   * Enhance patterns based on user's historical expenses
   */
  static enhancePatternsFromHistory(patterns, expenses) {
    // Analyze user's actual spending patterns
    const userPatterns = {};
    
    expenses.forEach(expense => {
      if (!userPatterns[expense.category]) {
        userPatterns[expense.category] = {
          descriptions: [],
          merchants: [],
          amounts: [],
          count: 0
        };
      }
      
      userPatterns[expense.category].descriptions.push(expense.description.toLowerCase());
      if (expense.merchant) {
        userPatterns[expense.category].merchants.push(expense.merchant.toLowerCase());
      }
      userPatterns[expense.category].amounts.push(expense.amount);
      userPatterns[expense.category].count++;
    });

    // Update patterns with user-specific data
    Object.entries(userPatterns).forEach(([category, data]) => {
      if (patterns[category] && data.count >= 3) { // Only if we have enough data
        // Extract common keywords from descriptions
        const commonWords = this.extractCommonKeywords(data.descriptions);
        patterns[category].keywords = [...new Set([...patterns[category].keywords, ...commonWords])];
        
        // Add user's merchants
        patterns[category].merchants = [...new Set([...patterns[category].merchants, ...data.merchants])];
        
        // Update amount range based on user's actual spending
        const avgAmount = data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length;
        const minAmount = Math.min(...data.amounts);
        const maxAmount = Math.max(...data.amounts);
        patterns[category].userAmountRange = [minAmount, maxAmount];
        patterns[category].avgAmount = avgAmount;
      }
    });
  }

  /**
   * Extract common keywords from descriptions
   */
  static extractCommonKeywords(descriptions) {
    const words = {};
    descriptions.forEach(desc => {
      desc.split(' ').forEach(word => {
        if (word.length > 3) { // Ignore short words
          words[word] = (words[word] || 0) + 1;
        }
      });
    });
    
    // Return words that appear in at least 30% of descriptions
    const threshold = Math.max(1, Math.floor(descriptions.length * 0.3));
    return Object.entries(words)
      .filter(([_, count]) => count >= threshold)
      .map(([word, _]) => word);
  }

  /**
   * Predict category using AI-like scoring
   */
  static predictCategory(description, amount, merchant, patterns) {
    const desc = description.toLowerCase();
    const merch = merchant.toLowerCase();
    const scores = {};

    // Score each category
    Object.entries(patterns).forEach(([category, pattern]) => {
      let score = 0;
      
      // Keyword matching (40% weight)
      const keywordMatches = pattern.keywords.filter(keyword => 
        desc.includes(keyword) || merch.includes(keyword)
      ).length;
      score += (keywordMatches / pattern.keywords.length) * 0.4;
      
      // Merchant matching (30% weight)
      const merchantMatches = pattern.merchants.filter(merchantPattern => 
        merch.includes(merchantPattern)
      ).length;
      if (merchantMatches > 0) {
        score += 0.3;
      }
      
      // Amount range matching (20% weight)
      if (amount >= pattern.amountRange[0] && amount <= pattern.amountRange[1]) {
        score += 0.2;
      }
      
      // User-specific patterns (10% weight)
      if (pattern.userAmountRange) {
        const [userMin, userMax] = pattern.userAmountRange;
        if (amount >= userMin && amount <= userMax) {
          score += 0.1;
        }
      }
      
      scores[category] = Math.min(score, 1.0); // Cap at 100%
    });

    // Find best match
    const sortedScores = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .filter(([, score]) => score > 0);

    if (sortedScores.length === 0) {
      return {
        category: 'Other',
        confidence: 0.5,
        reasoning: 'No clear pattern match found',
        alternatives: []
      };
    }

    const [topCategory, topScore] = sortedScores[0];
    const alternatives = sortedScores.slice(1, 3).map(([cat, score]) => ({
      category: cat,
      confidence: score
    }));

    return {
      category: topCategory,
      confidence: topScore,
      reasoning: this.generateReasoning(topCategory, description, merchant, patterns[topCategory]),
      alternatives
    };
  }

  /**
   * Generate human-readable reasoning for the prediction
   */
  static generateReasoning(category, description, merchant, pattern) {
    const reasons = [];
    
    if (pattern.keywords.some(keyword => description.toLowerCase().includes(keyword))) {
      reasons.push(`Description contains "${pattern.keywords.find(k => description.toLowerCase().includes(k))}"`);
    }
    
    if (pattern.merchants.some(m => merchant.toLowerCase().includes(m))) {
      reasons.push(`Merchant matches known ${category.toLowerCase()} vendors`);
    }
    
    if (reasons.length === 0) {
      reasons.push(`Best match based on spending patterns`);
    }
    
    return reasons.join('; ');
  }

  /**
   * Analyze spending patterns and generate insights
   */
  static async generateSpendingInsights(expenses) {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const insights = [];
    
    // Spending trend analysis
    const monthlyTotals = this.getMonthlySpending(expenses);
    const trend = this.calculateTrend(monthlyTotals);
    
    if (trend > 0.1) {
      insights.push({
        type: 'warning',
        title: 'Spending Trend Alert',
        description: `Your spending has increased by ${(trend * 100).toFixed(1)}% compared to last month`,
        action: 'Review budget categories for optimization opportunities'
      });
    }
    
    // Category analysis
    const categorySpending = this.getCategorySpending(expenses);
    const topCategory = categorySpending[0];
    
    if (topCategory && topCategory.percentage > 40) {
      insights.push({
        type: 'suggestion',
        title: 'Category Concentration',
        description: `${topCategory.percentage}% of spending is on ${topCategory.category}`,
        action: 'Consider budget rebalancing or look for savings in this category'
      });
    }
    
    // Unusual spending detection
    const unusualExpenses = this.detectUnusualSpending(expenses);
    if (unusualExpenses.length > 0) {
      insights.push({
        type: 'info',
        title: 'Unusual Spending Detected',
        description: `Found ${unusualExpenses.length} expenses that differ from your typical patterns`,
        action: 'Review these expenses for accuracy'
      });
    }
    
    return insights;
  }

  /**
   * Helper methods for spending analysis
   */
  static getMonthlySpending(expenses) {
    const monthly = {};
    expenses.forEach(expense => {
      const month = expense.date.substring(0, 7); // YYYY-MM
      monthly[month] = (monthly[month] || 0) + expense.amount;
    });
    return monthly;
  }

  static calculateTrend(monthlyTotals) {
    const months = Object.keys(monthlyTotals).sort();
    if (months.length < 2) return 0;
    
    const lastMonth = monthlyTotals[months[months.length - 1]];
    const previousMonth = monthlyTotals[months[months.length - 2]];
    
    return (lastMonth - previousMonth) / previousMonth;
  }

  static getCategorySpending(expenses) {
    const categories = {};
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    expenses.forEach(expense => {
      categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
    });
    
    return Object.entries(categories)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: ((amount / total) * 100).toFixed(1)
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  static detectUnusualSpending(expenses) {
    // Simple anomaly detection based on amount
    const amounts = expenses.map(e => e.amount);
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / amounts.length);
    
    return expenses.filter(expense => 
      Math.abs(expense.amount - avg) > 2 * stdDev
    );
  }

  /**
   * Generate smart shopping suggestions based on spending patterns
   */
  static async generateShoppingSuggestions(expenses, inventory = []) {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const suggestions = [];
    
    // Analyze grocery spending for bulk purchase opportunities
    const groceryExpenses = expenses.filter(e => e.category === 'Groceries');
    if (groceryExpenses.length >= 5) {
      const avgGrocerySpend = groceryExpenses.reduce((sum, e) => sum + e.amount, 0) / groceryExpenses.length;
      
      if (avgGrocerySpend > 100) {
        suggestions.push({
          type: 'bulk_purchase',
          title: 'Bulk Purchase Opportunity',
          description: `Consider shopping at warehouse stores. Your average grocery spend of $${avgGrocerySpend.toFixed(2)} could save 15-20% with bulk purchases.`,
          potentialSavings: avgGrocerySpend * 0.175,
          confidence: 0.85
        });
      }
    }
    
    // Analyze dining out patterns
    const diningExpenses = expenses.filter(e => e.category === 'Dining Out');
    if (diningExpenses.length >= 8) {
      const monthlyDining = diningExpenses.reduce((sum, e) => sum + e.amount, 0);
      suggestions.push({
        type: 'meal_prep',
        title: 'Meal Prep Savings',
        description: `You spend $${monthlyDining.toFixed(2)}/month dining out. Meal prepping 2-3 meals could save $${(monthlyDining * 0.4).toFixed(2)}.`,
        potentialSavings: monthlyDining * 0.4,
        confidence: 0.78
      });
    }
    
    return suggestions;
  }

  /**
   * Smart budget recommendations based on spending analysis
   */
  static async generateBudgetRecommendations(expenses, currentBudgets = []) {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const recommendations = [];
    const categorySpending = this.getCategorySpending(expenses);
    
    // Analyze each category
    categorySpending.forEach(({ category, amount, percentage }) => {
      const currentBudget = currentBudgets.find(b => b.category === category)?.amount || 0;
      
      // Under-budgeted categories
      if (amount > currentBudget * 1.1) {
        recommendations.push({
          type: 'increase_budget',
          category,
          currentBudget,
          suggestedBudget: Math.ceil(amount * 1.1),
          reasoning: `Consistently spending ${((amount/currentBudget - 1) * 100).toFixed(1)}% over budget`
        });
      }
      
      // Over-budgeted categories
      if (currentBudget > amount * 1.3) {
        recommendations.push({
          type: 'reduce_budget',
          category,
          currentBudget,
          suggestedBudget: Math.ceil(amount * 1.2),
          reasoning: `Consistently under-spending, could reallocate $${(currentBudget - amount * 1.2).toFixed(2)}`
        });
      }
    });
    
    return recommendations;
  }

  /**
   * Predict upcoming expenses based on patterns
   */
  static async predictUpcomingExpenses(expenses) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const predictions = [];
    const now = new Date();
    
    // Analyze recurring expenses
    const recurringPatterns = this.findRecurringPatterns(expenses);
    
    recurringPatterns.forEach(pattern => {
      const daysSinceLastExpense = this.daysSince(pattern.lastDate);
      
      if (daysSinceLastExpense >= pattern.avgInterval * 0.8) {
        predictions.push({
          category: pattern.category,
          description: pattern.description,
          estimatedAmount: pattern.avgAmount,
          estimatedDate: this.addDays(now, pattern.avgInterval - daysSinceLastExpense),
          confidence: pattern.confidence,
          type: 'recurring'
        });
      }
    });
    
    return predictions.sort((a, b) => new Date(a.estimatedDate) - new Date(b.estimatedDate));
  }

  /**
   * Find recurring expense patterns
   */
  static findRecurringPatterns(expenses) {
    const patterns = {};
    
    expenses.forEach(expense => {
      const key = `${expense.category}-${expense.description.substring(0, 20)}`;
      if (!patterns[key]) {
        patterns[key] = {
          category: expense.category,
          description: expense.description,
          dates: [],
          amounts: []
        };
      }
      patterns[key].dates.push(new Date(expense.date));
      patterns[key].amounts.push(expense.amount);
    });
    
    // Filter for recurring patterns (3+ occurrences)
    return Object.values(patterns)
      .filter(pattern => pattern.dates.length >= 3)
      .map(pattern => {
        const sortedDates = pattern.dates.sort((a, b) => a - b);
        const intervals = [];
        
        for (let i = 1; i < sortedDates.length; i++) {
          const days = (sortedDates[i] - sortedDates[i-1]) / (1000 * 60 * 60 * 24);
          intervals.push(days);
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const avgAmount = pattern.amounts.reduce((a, b) => a + b, 0) / pattern.amounts.length;
        const lastDate = sortedDates[sortedDates.length - 1];
        
        // Calculate confidence based on interval consistency
        const intervalVariance = intervals.reduce((sum, interval) => 
          sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
        const confidence = Math.max(0.3, 1 - (intervalVariance / (avgInterval * avgInterval)));
        
        return {
          ...pattern,
          avgInterval,
          avgAmount,
          lastDate,
          confidence: Math.min(confidence, 0.95)
        };
      })
      .filter(pattern => pattern.confidence > 0.6); // Only high-confidence patterns
  }

  /**
   * Utility methods
   */
  static daysSince(date) {
    return (new Date() - new Date(date)) / (1000 * 60 * 60 * 24);
  }

  static addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Smart expense suggestions for the current month
   */
  static async getMonthlyExpenseInsights(expenses, budgets = []) {
    const insights = [];
    const currentMonth = new Date().toISOString().substring(0, 7);
    const thisMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
    
    // Budget utilization warnings
    const categorySpending = this.getCategorySpending(thisMonthExpenses);
    
    budgets.forEach(budget => {
      const spent = categorySpending.find(c => c.category === budget.category)?.amount || 0;
      const utilization = spent / budget.amount;
      
      if (utilization > 0.8 && utilization <= 1.0) {
        insights.push({
          type: 'warning',
          priority: 'high',
          title: `${budget.category} Budget Alert`,
          description: `You've used ${(utilization * 100).toFixed(1)}% of your ${budget.category} budget`,
          suggestion: 'Consider reducing spending in this category for the rest of the month'
        });
      } else if (utilization > 1.0) {
        insights.push({
          type: 'alert',
          priority: 'critical',
          title: `${budget.category} Budget Exceeded`,
          description: `You've exceeded your ${budget.category} budget by $${(spent - budget.amount).toFixed(2)}`,
          suggestion: 'Review recent expenses and adjust budget or spending habits'
        });
      }
    });
    
    return insights;
  }
}

export default AIExpenseService;