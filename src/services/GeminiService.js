/**
 * Google Gemini AI Service (FREE TIER)
 * Provides AI-powered features using Google's Gemini Pro model
 * 
 * Free Tier Limits:
 * - 60 requests per minute
 * - 15 requests per second
 * - No credit card required
 * - High quality responses
 */

class GeminiService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    
    console.log('🔑 Gemini Service Constructor:');
    console.log('🔑 Environment variable:', process.env.REACT_APP_GEMINI_API_KEY ? 'Present' : 'Missing');
    console.log('🔑 API Key loaded:', this.apiKey ? '✅ Yes' : '❌ No');
    
    if (this.apiKey) {
      console.log('🔑 API Key preview:', this.apiKey.substring(0, 10) + '...');
      console.log('🔑 API Key length:', this.apiKey.length);
    } else {
      console.warn('⚠️ No Gemini API key found. Get one at: https://makersuite.google.com/app/apikey');
    }
    
    // Request cache for optimization
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Check if Gemini service is configured
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Generate text response using Gemini Pro
   */
  async generateText(prompt, maxLength = 500) {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured');
    }

    // Check cache first
    const cacheKey = `gemini_${prompt}_${maxLength}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        console.log('📦 Gemini: Using cached response');
        return cached.response;
      }
    }

    try {
      console.log('🚀 Gemini: Sending request for:', prompt.substring(0, 50) + '...');
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': this.apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful Home Hub AI assistant. Respond to: ${prompt}\n\nKeep response under ${maxLength} characters and be helpful.`
            }]
          }],
          generationConfig: {
            maxOutputTokens: maxLength,
            temperature: 0.7,
            topP: 0.8,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I could not generate a response.';

      // Cache the response
      this.cache.set(cacheKey, {
        response: generatedText,
        timestamp: Date.now()
      });

      console.log('✅ Gemini: Response generated successfully');
      return generatedText;

    } catch (error) {
      console.error('❌ Gemini API error:', error);
      throw error;
    }
  }

  /**
   * Chat with context (for conversation memory)
   */
  async chat(userMessage, context = '', chatHistory = []) {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured');
    }

    const cacheKey = `gemini_chat_${userMessage}_${context}_${chatHistory.length}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.response;
      }
    }

    try {
      let prompt = `You are a helpful Home Hub AI assistant. `;
      
      if (context) {
        prompt += `Context: ${context}\n\n`;
      }
      
      if (chatHistory.length > 0) {
        prompt += `Previous conversation:\n`;
        chatHistory.forEach(msg => {
          prompt += `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.message}\n`;
        });
        prompt += '\n';
      }
      
      prompt += `User: ${userMessage}\n\nAI:`;

      const response = await this.generateText(prompt, 800);
      
      // Cache the response
      this.cache.set(cacheKey, {
        response,
        timestamp: Date.now()
      });

      return response;

    } catch (error) {
      console.error('❌ Gemini chat error:', error);
      throw error;
    }
  }

  /**
   * Analyze text sentiment
   */
  async analyzeSentiment(text) {
    const prompt = `Analyze the sentiment of this text: "${text}". Respond with only: POSITIVE, NEGATIVE, or NEUTRAL.`;
    return await this.generateText(prompt, 50);
  }

  /**
   * Classify text into categories
   */
  async classifyText(text, candidateLabels) {
    const prompt = `Classify this text: "${text}" into one of these categories: ${candidateLabels.join(', ')}. Respond with only the category name.`;
    return await this.generateText(prompt, 100);
  }

  /**
   * Summarize text
   */
  async summarizeText(text, maxLength = 200) {
    const prompt = `Summarize this text in under ${maxLength} characters: "${text}"`;
    return await this.generateText(prompt, maxLength);
  }

  /**
   * Test connection to Gemini API
   */
  async testConnection() {
    try {
      const response = await this.generateText('Hello, test message', 50);
      return {
        success: true,
        message: 'Gemini API connection successful',
        response: response
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get service status
   */
  async getStatus() {
    return {
      configured: this.isConfigured(),
      apiKey: this.apiKey ? 'Present' : 'Missing',
      cacheSize: this.cache.size,
      cacheExpiry: this.cacheExpiry
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Gemini: Cache cleared');
  }
}

// Export as singleton
const geminiService = new GeminiService();
export default geminiService;
