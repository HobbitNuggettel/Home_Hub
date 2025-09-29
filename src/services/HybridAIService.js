/**
 * Hybrid AI Service
 * Combines HuggingFace (free) + Gemini (free) for maximum reliability
 * 
 * Strategy:
 * 1. Try HuggingFace first (free, good quality)
 * 2. Fallback to Gemini (free, excellent quality)
 * 3. Use Firebase for data storage (no vector DB needed)
 */

import HuggingFaceService from './HuggingFaceService';
import GeminiService from './GeminiService';

class HybridAIService {
  constructor() {
    this.huggingface = HuggingFaceService;
    this.gemini = GeminiService;
    this.lastUsedService = null;
    this.serviceStats = {
      huggingface: { calls: 0, errors: 0, lastUsed: null },
      gemini: { calls: 0, errors: 0, lastUsed: null }
    };
  }

  /**
   * Check which services are available
   */
  getAvailableServices() {
    const services = [];
    
    if (this.huggingface.isConfigured()) {
      services.push('huggingface');
    }
    
    if (this.gemini.isConfigured()) {
      services.push('gemini');
    }
    
    return services;
  }

  /**
   * Smart AI response with automatic fallback
   */
  async generateResponse(userMessage, context = '', chatHistory = []) {
    const availableServices = this.getAvailableServices();
    
    if (availableServices.length === 0) {
      throw new Error('No AI services configured. Please set up HuggingFace or Gemini API keys.');
    }

    // Try HuggingFace first (free, good quality)
    if (availableServices.includes('huggingface')) {
      try {
        console.log('🤖 Hybrid: Trying HuggingFace first...');
        const response = await this.tryHuggingFace(userMessage, context);
        this.updateStats('huggingface', true);
        this.lastUsedService = 'huggingface';
        return response;
      } catch (error) {
        console.warn('🤖 HuggingFace failed, falling back to Gemini:', error.message);
        this.updateStats('huggingface', false);
      }
    }

    // Fallback to Gemini (free, excellent quality)
    if (availableServices.includes('gemini')) {
      try {
        console.log('🤖 Hybrid: Using Gemini fallback...');
        const response = await this.gemini.chat(userMessage, context, chatHistory);
        this.updateStats('gemini', true);
        this.lastUsedService = 'gemini';
        return response;
      } catch (error) {
        console.error('❌ Gemini also failed:', error.message);
        this.updateStats('gemini', false);
        throw new Error('All AI services are currently unavailable. Please try again later.');
      }
    }
  }

  /**
   * Try HuggingFace with smart routing
   */
  async tryHuggingFace(userMessage, context) {
    const message = userMessage.toLowerCase();
    
    // Route to specialized models based on content
    if (message.includes('inventory') || message.includes('stock') || message.includes('items')) {
      return await this.huggingface.analyzeFinanceEmbeddings(
        userMessage,
        ['inventory status', 'stock levels', 'expiring items', 'low stock', 'well stocked']
      );
    }
    
    if (message.includes('expense') || message.includes('spending') || message.includes('budget')) {
      return await this.huggingface.analyzeFinanceEmbeddings(
        userMessage,
        ['expense categorization', 'budget analysis', 'spending tracking', 'financial planning']
      );
    }
    
    if (message.includes('recipe') || message.includes('cook') || message.includes('meal')) {
      return await this.huggingface.completeWithFillMask(
        userMessage + ' [MASK] recipe suggestions'
      );
    }
    
    // Default to text generation
    return await this.huggingface.generateText(userMessage, 150);
  }

  /**
   * Update service statistics
   */
  updateStats(service, success) {
    this.serviceStats[service].calls++;
    this.serviceStats[service].lastUsed = new Date().toISOString();
    
    if (!success) {
      this.serviceStats[service].errors++;
    }
  }

  /**
   * Get service performance statistics
   */
  getServiceStats() {
    return {
      ...this.serviceStats,
      lastUsedService: this.lastUsedService,
      availableServices: this.getAvailableServices(),
      totalCalls: this.serviceStats.huggingface.calls + this.serviceStats.gemini.calls,
      totalErrors: this.serviceStats.huggingface.errors + this.serviceStats.gemini.errors
    };
  }

  /**
   * Test all available services
   */
  async testAllServices() {
    const results = {};
    
    if (this.huggingface.isConfigured()) {
      try {
        results.huggingface = await this.huggingface.testConnection();
      } catch (error) {
        results.huggingface = { success: false, error: error.message };
      }
    }
    
    if (this.gemini.isConfigured()) {
      try {
        results.gemini = await this.gemini.testConnection();
      } catch (error) {
        results.gemini = { success: false, error: error.message };
      }
    }
    
    return results;
  }

  /**
   * Get service recommendations
   */
  getServiceRecommendations() {
    const recommendations = [];
    
    if (!this.huggingface.isConfigured() && !this.gemini.isConfigured()) {
      recommendations.push({
        priority: 'high',
        service: 'gemini',
        reason: 'No AI services configured. Gemini is free and high quality.',
        action: 'Get API key from https://makersuite.google.com/app/apikey'
      });
    }
    
    if (this.serviceStats.huggingface.errors > this.serviceStats.huggingface.calls * 0.3) {
      recommendations.push({
        priority: 'medium',
        service: 'huggingface',
        reason: 'High error rate detected. Consider checking API key or rate limits.',
        action: 'Verify HuggingFace API key and check rate limits'
      });
    }
    
    if (this.serviceStats.gemini.errors > this.serviceStats.gemini.calls * 0.3) {
      recommendations.push({
        priority: 'medium',
        service: 'gemini',
        reason: 'High error rate detected. Consider checking API key.',
        action: 'Verify Gemini API key at https://makersuite.google.com/app/apikey'
      });
    }
    
    return recommendations;
  }

  /**
   * Clear all service caches
   */
  clearAllCaches() {
    if (this.huggingface.clearCache) {
      this.huggingface.clearCache();
    }
    
    if (this.gemini.clearCache) {
      this.gemini.clearCache();
    }
    
    console.log('🧹 Hybrid: All caches cleared');
  }
}

// Export as singleton
const hybridAIService = new HybridAIService();
export default hybridAIService;
