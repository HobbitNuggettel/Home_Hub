/**
 * Hugging Face API Integration Service
 * Provides AI-powered features using Hugging Face's free tier API
 * 
 * Free Tier Limits:
 * - 30,000 requests per month
 * - Rate limit: 1 request per second
 * - Models: Text generation, sentiment analysis, image classification
 */

class HuggingFaceService {
  constructor() {
    this.apiKey = process.env.REACT_APP_HUGGINGFACE_API_KEY;
    console.log('🔑 HuggingFace Service Constructor:');
    console.log('🔑 Environment variable:', process.env.REACT_APP_HUGGINGFACE_API_KEY ? 'Present' : 'Missing');
    console.log('🔑 API Key loaded:', this.apiKey ? '✅ Yes' : '❌ No');
    if (this.apiKey) {
      console.log('🔑 API Key preview:', this.apiKey.substring(0, 10) + '...');
      console.log('🔑 API Key length:', this.apiKey.length);
    } else {
      console.log('❌ No API key found in environment variables');
      console.log('❌ Available env vars:', Object.keys(process.env).filter(key => key.includes('REACT_APP')));
    }
    this.baseUrl = 'https://api-inference.huggingface.co/models';
    this.rateLimitDelay = 1000; // 1 second delay between requests
    this.lastRequestTime = 0;
    
    // Test alternative endpoints
    this.alternativeEndpoints = [
      'https://api-inference.huggingface.co/models',
      'https://huggingface.co/api/models',
      'https://api-inference.huggingface.co'
    ];
    
    // WORKING MODELS (tested and confirmed working with 200 OK responses)
    this.models = {
      // Primary AI Tasks
      textClassification: 'facebook/bart-large-mnli', // Zero-shot classification
      summarization: 'sshleifer/distilbart-cnn-12-6', // Text summarization
      questionAnswering: 'deepset/roberta-base-squad2', // Question answering
      sentimentAnalysis: 'nlptown/bert-base-multilingual-uncased-sentiment', // 5-star sentiment
      
      // Translation Models
      translationES: 'Helsinki-NLP/opus-mt-en-es', // English to Spanish
      translationFR: 'Helsinki-NLP/opus-mt-en-fr', // English to French
      translationRU: 'Helsinki-NLP/opus-mt-en-ru', // English to Russian
      
      // Specialized Tasks
      namedEntityRecognition: 'dslim/bert-base-NER', // NER
      sentenceSimilarity: 'sentence-transformers/all-MiniLM-L6-v2', // Similarity scoring
      
      // NEW SPECIAL MODELS (discovered through full force testing)
      financeEmbeddings: 'FinLang/finance-embeddings-investopedia', // Finance embeddings
      advancedFillMask: 'prithivida/Splade_PP_en_v2', // Advanced fill-mask with SPLADE++
      
      // Comprehensive Fallback System (All 11 Models)
      fallbacks: [
        'facebook/bart-large-mnli', // 1. Zero-shot classification (most versatile)
        'sshleifer/distilbart-cnn-12-6', // 2. Text summarization
        'deepset/roberta-base-squad2', // 3. Question answering
        'nlptown/bert-base-multilingual-uncased-sentiment', // 4. Sentiment analysis
        'Helsinki-NLP/opus-mt-en-es', // 5. English to Spanish translation
        'Helsinki-NLP/opus-mt-en-fr', // 6. English to French translation
        'Helsinki-NLP/opus-mt-en-ru', // 7. English to Russian translation
        'dslim/bert-base-NER', // 8. Named entity recognition
        'sentence-transformers/all-MiniLM-L6-v2', // 9. Sentence similarity
        'FinLang/finance-embeddings-investopedia', // 10. Finance embeddings
        'prithivida/Splade_PP_en_v2' // 11. Advanced fill-mask with SPLADE++
      ],
      
      // Legacy fallback names (for backward compatibility)
      textGenerationFallback: 'facebook/bart-large-mnli',
      textGenerationBackup: 'sshleifer/distilbart-cnn-12-6'
    };
    
    // Request cache for free tier optimization
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Rate limiting helper for free tier compliance
   */
  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Advanced HuggingFace API parameters for optimal performance
   * Based on: https://medium.com/neural-engineer/huggingface-inference-endpoint-advanced-parameters-6c96ca817254
   */
  getAdvancedHeaders(useCache = true, waitForModel = false) {
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    // x-use-cache: Enable caching for deterministic models (classifiers, embeddings)
    // This can provide 5x faster response times for repeated requests
    if (useCache) {
      headers['x-use-cache'] = 'true';
    } else {
      headers['x-use-cache'] = 'false';
    }

    // x-wait-for-model: Wait for model loading instead of getting 503 errors
    // Only use when you encounter 503 "Model is currently loading" errors
    if (waitForModel) {
      headers['x-wait-for-model'] = 'true';
    }

    return headers;
  }

  /**
   * Smart retry with advanced parameters
   * First try without wait-for-model, then with it if 503 occurs
   */
  async smartRequest(url, requestBody, useCache = true) {
    try {
      // First attempt: Normal request with caching
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAdvancedHeaders(useCache, false),
        body: JSON.stringify(requestBody)
      });

      // If 503 (model loading), retry with wait-for-model
      if (response.status === 503) {
        console.log('🔄 Model is loading (503), retrying with wait-for-model...');
        const retryResponse = await fetch(url, {
          method: 'POST',
          headers: this.getAdvancedHeaders(useCache, true),
          body: JSON.stringify(requestBody)
        });
        return retryResponse;
      }

      return response;
    } catch (error) {
      console.error('Smart request failed:', error);
      throw error;
    }
  }

  /**
   * Check cache before making API calls
   */
  getCachedResponse(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  /**
   * Cache API responses
   */
  setCachedResponse(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Try all 9 working models as fallbacks until one succeeds
   */
  async tryAllModels(prompt, maxLength = 100) {
    console.log('🔄 Trying all 11 working models as fallbacks...');
    
    for (let i = 0; i < this.models.fallbacks.length; i++) {
      const model = this.models.fallbacks[i];
      console.log(`🧪 Trying model ${i + 1}/11: ${model}`);
      
      try {
        const result = await this.trySpecificModel(model, prompt, maxLength);
        if (result.success) {
          console.log(`✅ Model ${i + 1} succeeded: ${model}`);
          return result.data;
        }
      } catch (error) {
        console.log(`❌ Model ${i + 1} failed: ${model} - ${error.message}`);
        continue; // Try next model
      }
    }
    
    console.log('❌ All 11 models failed, returning fallback response');
    return `AI Response: ${prompt} - I'm here to help with your home management needs!`;
  }

  /**
   * Try a specific model with appropriate input format
   */
  async trySpecificModel(model, prompt, maxLength = 100) {
    const url = `${this.baseUrl}/${model}`;
    console.log(`📡 Trying ${model} at: ${url}`);
    
    let requestBody;
    
    // Determine the appropriate input format for each model type
    if (model.includes('bart-large-mnli')) {
      // Zero-shot classification
      requestBody = {
        inputs: prompt,
        parameters: {
          candidate_labels: ["positive", "negative", "neutral", "informative", "helpful"]
        }
      };
    } else if (model.includes('distilbart-cnn')) {
      // Summarization
      requestBody = {
        inputs: prompt
      };
    } else if (model.includes('roberta-base-squad2')) {
      // Question answering (needs context)
      requestBody = {
        inputs: {
          question: prompt,
          context: "This is a general context for the question."
        }
      };
    } else if (model.includes('bert-base-multilingual-uncased-sentiment')) {
      // Sentiment analysis
      requestBody = {
        inputs: prompt
      };
    } else if (model.includes('opus-mt-en-')) {
      // Translation
      requestBody = {
        inputs: prompt
      };
    } else if (model.includes('bert-base-NER')) {
      // Named entity recognition
      requestBody = {
        inputs: prompt
      };
    } else if (model.includes('all-MiniLM-L6-v2')) {
      // Sentence similarity (needs comparison)
      requestBody = {
        inputs: {
          source_sentence: prompt,
          sentences: ["This is a test sentence", "This is another sentence"]
        }
      };
    } else if (model.includes('finance-embeddings-investopedia')) {
      // Finance embeddings (needs comparison)
      requestBody = {
        inputs: {
          source_sentence: prompt,
          sentences: ["This is a financial investment", "This is a personal expense", "This is a business transaction"]
        }
      };
    } else if (model.includes('Splade_PP_en_v2')) {
      // Advanced fill-mask (needs [MASK] token)
      requestBody = {
        inputs: prompt.includes('[MASK]') ? prompt : prompt + ' [MASK]'
      };
    } else {
      // Default fallback
      requestBody = {
        inputs: prompt
      };
    }
    
    // Use advanced parameters: caching enabled, smart retry for 503 errors
    const response = await this.smartRequest(url, requestBody, true);
    
    if (response.ok) {
      const data = await response.json();
      return { success: true, data: this.formatModelResponse(model, data, prompt) };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Format the response based on model type
   */
  formatModelResponse(model, data, originalPrompt) {
    if (model.includes('bart-large-mnli')) {
      // Zero-shot classification
      if (data && data.labels && data.scores) {
        const topLabel = data.labels[0];
        const topScore = data.scores[0];
        return `AI Analysis: "${originalPrompt}" is classified as "${topLabel}" with ${(topScore * 100).toFixed(1)}% confidence.`;
      }
    } else if (model.includes('distilbart-cnn')) {
      // Summarization
      if (data && data[0] && data[0].summary_text) {
        return `AI Summary: ${data[0].summary_text}`;
      }
    } else if (model.includes('roberta-base-squad2')) {
      // Question answering
      if (data && data.answer) {
        return `AI Answer: ${data.answer}`;
      }
    } else if (model.includes('bert-base-multilingual-uncased-sentiment')) {
      // Sentiment analysis
      if (data && data[0] && data[0].label) {
        return `AI Sentiment: ${data[0].label} (${(data[0].score * 100).toFixed(1)}% confidence)`;
      }
    } else if (model.includes('opus-mt-en-')) {
      // Translation
      if (data && data[0] && data[0].translation_text) {
        return `AI Translation: ${data[0].translation_text}`;
      }
    } else if (model.includes('bert-base-NER')) {
      // Named entity recognition
      if (data && Array.isArray(data)) {
        const entities = data.map(item => `${item.word} (${item.entity_group})`).join(', ');
        return `AI Entities: ${entities}`;
      }
    } else if (model.includes('all-MiniLM-L6-v2')) {
      // Sentence similarity
      if (data && Array.isArray(data)) {
        const avgScore = (data.reduce((sum, score) => sum + score, 0) / data.length * 100).toFixed(1);
        return `AI Similarity: Average similarity score: ${avgScore}%`;
      }
    }
    
    // Default fallback
    return `AI Response: ${JSON.stringify(data)}`;
  }

  /**
   * Generate text using available models (free tier friendly)
   */
  async generateText(prompt, maxLength = 100) {
    if (!this.apiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    console.log('🤖 generateText called with:', { prompt, maxLength });
    console.log('🔑 API Key available:', !!this.apiKey);
    console.log('🤖 Using model:', this.models.textClassification);

    const cacheKey = `text_${prompt}_${maxLength}`;
    const cached = this.getCachedResponse(cacheKey);
    if (cached) {
      console.log('💾 Returning cached response');
      return cached;
    }

    await this.enforceRateLimit();

    try {
      const requestUrl = `${this.baseUrl}/${this.models.textClassification}`;
      console.log('📡 Sending request to:', requestUrl);
      
      const requestBody = {
        inputs: prompt,
        parameters: {
          candidate_labels: ["positive", "negative", "neutral", "informative", "helpful"]
        }
      };

      // Use advanced parameters: caching enabled, smart retry for 503 errors
      const response = await this.smartRequest(requestUrl, requestBody, true);

      console.log('📥 Response received:');
      console.log('   Status:', response.status);
      console.log('   Status Text:', response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Response data:', data);
        
        // Handle classification results
        if (data && data.labels && data.scores) {
          const topLabel = data.labels[0];
          const topScore = data.scores[0];
          const result = `AI Analysis: "${prompt}" is classified as "${topLabel}" with ${(topScore * 100).toFixed(1)}% confidence.`;
          console.log('🤖 Classification result:', result);
          
          this.setCachedResponse(cacheKey, result);
          return result;
        } else {
          const result = `AI Analysis: ${JSON.stringify(data)}`;
          this.setCachedResponse(cacheKey, result);
          return result;
        }
      } else if (response.status === 404) {
        // Try all 9 working models as fallbacks
        console.log('🔄 Primary model not available, trying all 9 working models...');
        return await this.tryAllModels(prompt, maxLength);
      } else {
        throw new Error(`API request failed: ${response.status}`);
      }

    } catch (error) {
      console.error('Text generation failed:', error);
      // Try all 9 working models as fallbacks
      console.log('🔄 Error occurred, trying all 9 working models...');
      return await this.tryAllModels(prompt, maxLength);
    }
  }

  /**
   * Analyze sentiment of text
   */
  async analyzeSentiment(text) {
    if (!this.apiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    const cacheKey = `sentiment_${text}`;
    const cached = this.getCachedResponse(cacheKey);
    if (cached) return cached;

    await this.enforceRateLimit();

    try {
      const requestBody = { inputs: text };
      const response = await this.smartRequest(`${this.baseUrl}/${this.models.sentimentAnalysis}`, requestBody, true);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const sentiment = this.parseSentimentResult(data);
      
      this.setCachedResponse(cacheKey, sentiment);
      return sentiment;

    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return { label: 'neutral', score: 0.5 };
    }
  }

  /**
   * Parse sentiment analysis results
   */
  parseSentimentResult(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return { label: 'neutral', score: 0.5 };
    }

    // Find the highest confidence prediction
    const prediction = data.reduce((max, current) => 
      current.score > max.score ? current : max
    );

    return {
      label: prediction.label,
      score: prediction.score,
      confidence: prediction.score
    };
  }

  /**
   * Classify text into categories
   */
  async classifyText(text, candidateLabels = []) {
    if (!this.apiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    if (candidateLabels.length === 0) {
      candidateLabels = ['positive', 'negative', 'neutral'];
    }

    const cacheKey = `classification_${text}_${candidateLabels.join('_')}`;
    const cached = this.getCachedResponse(cacheKey);
    if (cached) return cached;

    await this.enforceRateLimit();

    try {
      const requestBody = {
        inputs: text,
        parameters: {
          candidate_labels: candidateLabels
        }
      };
      const response = await this.smartRequest(`${this.baseUrl}/${this.models.textClassification}`, requestBody, true);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const classification = {
        label: data.labels[0],
        score: data.scores[0],
        allScores: data.labels.map((label, index) => ({
          label,
          score: data.scores[index]
        }))
      };
      
      this.setCachedResponse(cacheKey, classification);
      return classification;

    } catch (error) {
      console.error('Text classification failed:', error);
      return { label: candidateLabels[0], score: 0.5 };
    }
  }

  /**
   * Summarize long text
   */
  async summarizeText(text, maxLength = 150) {
    if (!this.apiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    if (text.length < maxLength) {
      return text; // No need to summarize short text
    }

    const cacheKey = `summary_${text.substring(0, 100)}_${maxLength}`;
    const cached = this.getCachedResponse(cacheKey);
    if (cached) return cached;

    await this.enforceRateLimit();

    try {
      const requestBody = {
        inputs: text,
        parameters: {
          max_length: maxLength,
          min_length: 30,
          do_sample: false
        }
      };
      const response = await this.smartRequest(`${this.baseUrl}/${this.models.summarization}`, requestBody, true);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const summary = data[0]?.summary_text || text.substring(0, maxLength);
      
      this.setCachedResponse(cacheKey, summary);
      return summary;

    } catch (error) {
      console.error('Text summarization failed:', error);
      // Fallback: return truncated text
      return text.substring(0, maxLength) + '...';
    }
  }

  /**
   * Get API usage statistics
   */
  getUsageStats() {
    const cacheSize = this.cache.size;
    const cacheKeys = Array.from(this.cache.keys());
    
    return {
      cacheSize,
      cacheKeys: cacheKeys.slice(0, 10), // Show first 10 keys
      lastRequestTime: this.lastRequestTime,
      rateLimitDelay: this.rateLimitDelay
    };
  }

  /**
   * Clear cache to free memory
   */
  clearCache() {
    this.cache.clear();
    console.log('Hugging Face service cache cleared');
  }

  /**
   * Check if API key is configured
   */
  isConfigured() {
    const configured = !!this.apiKey;
    console.log('🔍 isConfigured check:', { configured, hasKey: !!this.apiKey, keyLength: this.apiKey?.length });
    return configured;
  }

  /**
   * Validate API key format
   */
  validateApiKey() {
    if (!this.apiKey) {
      return { valid: false, error: 'No API key found' };
    }
    
    if (!this.apiKey.startsWith('hf_')) {
      return { valid: false, error: 'API key should start with hf_' };
    }
    
    if (this.apiKey.length < 20) {
      return { valid: false, error: 'API key too short' };
    }
    
    return { valid: true, key: this.apiKey.substring(0, 10) + '...' };
  }

  /**
   * Generate text using fallback model
   */
  async generateTextWithFallback(prompt, maxLength = 100) {
    try {
      console.log('🔄 Using fallback model:', this.models.textGenerationFallback);
      
      const response = await fetch(`${this.baseUrl}/${this.models.textGenerationFallback}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: maxLength,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const generatedText = data[0]?.generated_text || prompt;
        return generatedText;
      } else {
        throw new Error(`Fallback model failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Fallback model failed:', error);
      // Return enhanced prompt as fallback
      return `AI Response: ${prompt} - I'm here to help with your home management needs!`;
    }
  }

  /**
   * Test API connection with multiple approaches
   */
  async testConnection() {
    if (!this.apiKey) {
      throw new Error('API key not configured');
    }

    // Validate API key format first
    const validation = this.validateApiKey();
    console.log('🔍 API Key validation:', validation);

    try {
      console.log('🧪 Testing HuggingFace API connection...');
      console.log('🔑 API Key loaded:', this.apiKey ? 'Yes' : 'No');
      console.log('🔑 API Key preview:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'None');
      console.log('🌐 Base URL:', this.baseUrl);
      console.log('🤖 Primary Model:', this.models.textClassification);
      console.log('🔄 Fallback Model:', this.models.textGenerationFallback);
      
      // First, test if the API key works with a simple endpoint
      console.log('🔑 Testing API key validity first...');
      const keyTest = await this.testApiKeyValidity();
      if (!keyTest.valid) {
        return { success: false, error: `API key test failed: ${keyTest.error}` };
      }
      
      const testUrl = `${this.baseUrl}/${this.models.textClassification}`;
      console.log('📡 Full URL:', testUrl);
      
      // First, try to load the model
      console.log('📤 Sending request to:', testUrl);
      const loadResponse = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: 'Hello, this is a test.',
          parameters: {
            candidate_labels: ["positive", "negative", "neutral"]
          }
        })
      });

      console.log('📥 Response received:');
      console.log('   Status:', loadResponse.status);
      console.log('   Status Text:', loadResponse.statusText);
      console.log('   Headers:', Object.fromEntries(loadResponse.headers.entries()));

      if (loadResponse.ok) {
        const data = await loadResponse.json();
        console.log('✅ HuggingFace API test successful:', data);
        return { success: true, data };
      } else if (loadResponse.status === 503) {
        // Model is loading, this is normal for first request
        console.log('⏳ Model is loading, this is normal for first request');
        return { success: true, message: 'Model loading initiated' };
      } else {
        console.error('❌ HuggingFace API test failed:', loadResponse.status, loadResponse.statusText);
        
        // Try to get error details
        try {
          const errorText = await loadResponse.text();
          console.error('❌ Error response body:', errorText);
        } catch (e) {
          console.error('❌ Could not read error response body');
        }
        
        return { success: false, error: `${loadResponse.status}: ${loadResponse.statusText}` };
      }
    } catch (error) {
      console.error('❌ HuggingFace API test error:', error);
      console.error('❌ Error stack:', error.stack);
      return { success: false, error: error.message };
    }
    
    // If we get here, try to find a working model
    console.log('🔄 Trying to find a working model...');
    const modelResult = await this.findWorkingModel();
    
    if (!modelResult.success) {
      console.log('🔄 No working models found, trying all 9 working models...');
      // Test with a simple prompt using all 9 models
      try {
        const fallbackResult = await this.tryAllModels('Hello, this is a test.', 50);
        return { success: true, message: 'Fallback models working', data: fallbackResult };
      } catch (fallbackError) {
        console.log('🔄 All fallback models failed, testing endpoint formats...');
        return await this.testEndpointFormats();
      }
    }
    
    return modelResult;
  }

  /**
   * Test if the API key is valid by trying a simple endpoint
   */
  async testApiKeyValidity() {
    try {
      console.log('🔑 Testing API key with a simple model...');
      
      // Try with WORKING model (tested and confirmed!)
      const testUrl = `${this.baseUrl}/facebook/bart-large-mnli`;
      console.log('📡 Testing URL:', testUrl);
      
      // First check if model is available
      const checkResponse = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      console.log('🔍 Model availability check:', checkResponse.status, checkResponse.statusText);
      
      if (checkResponse.status === 200) {
        console.log('✅ Model is available!');
        return { valid: true, modelAvailable: true };
      } else if (checkResponse.status === 401) {
        console.error('❌ API key is invalid (401 Unauthorized)');
        return { valid: false, error: 'Invalid API key' };
      } else if (checkResponse.status === 404) {
        console.error('❌ Model not found (404) - but API key might be valid');
        return { valid: true, warning: 'Model not found', modelAvailable: false };
      } else {
        console.error('❌ Model check failed:', checkResponse.status);
        return { valid: true, warning: `HTTP ${checkResponse.status}`, modelAvailable: false };
      }
    } catch (error) {
      console.error('❌ API key test error:', error);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Test with a simpler, more reliable model
   */
  async testSimpleConnection() {
    try {
      console.log('🧪 Testing with fallback model:', this.models.textGenerationFallback);
      
      const simpleUrl = `${this.baseUrl}/${this.models.textGenerationFallback}`;
      console.log('📡 Simple test URL:', simpleUrl);
      
      const simpleResponse = await fetch(simpleUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: 'Test',
          parameters: {
            max_length: 10,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false
          }
        })
      });

      console.log('📥 Simple test response:');
      console.log('   Status:', simpleResponse.status);
      console.log('   Status Text:', simpleResponse.statusText);

      if (simpleResponse.ok) {
        const data = await simpleResponse.json();
        console.log('✅ Simple test successful:', data);
        return { success: true, data, method: 'fallback' };
      } else {
        console.error('❌ Simple test failed:', simpleResponse.status, simpleResponse.statusText);
        
        // Try to get error details
        try {
          const errorText = await simpleResponse.text();
          console.error('❌ Error response body:', errorText);
        } catch (e) {
          console.error('❌ Could not read error response body');
        }
        
        return { success: false, error: `Fallback failed: ${simpleResponse.status}`, method: 'fallback' };
      }
    } catch (error) {
      console.error('❌ Simple test error:', error);
      return { valid: false, error: error.message, method: 'fallback' };
    }
  }

  /**
   * Test multiple models to find one that works
   */
  async findWorkingModel() {
    console.log('🔍 Testing multiple models to find one that works...');
    
    const modelsToTest = [
      // WORKING MODELS (tested and confirmed with 200 OK responses!)
      'facebook/bart-large-mnli', // Zero-shot classification
      'sshleifer/distilbart-cnn-12-6', // Text summarization
      'deepset/roberta-base-squad2', // Question answering
      'nlptown/bert-base-multilingual-uncased-sentiment', // Sentiment analysis
      'Helsinki-NLP/opus-mt-en-es', // English to Spanish translation
      'Helsinki-NLP/opus-mt-en-fr', // English to French translation
      'Helsinki-NLP/opus-mt-en-ru', // English to Russian translation
      'dslim/bert-base-NER', // Named entity recognition
      'sentence-transformers/all-MiniLM-L6-v2' // Sentence similarity
    ];
    
    for (const model of modelsToTest) {
      try {
        console.log(`🧪 Testing model: ${model}`);
        const testUrl = `${this.baseUrl}/${model}`;
        
        const response = await fetch(testUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: 'Hello',
            parameters: {
              max_length: 10,
              temperature: 0.7,
              do_sample: true,
              return_full_text: false
            }
          })
        });
        
        console.log(`📥 ${model} response:`, response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${model} works!`, data);
          // Update the working model
          this.models.textGeneration = model;
          console.log(`🔄 Updated working model to: ${model}`);
          return { success: true, workingModel: model, data };
        } else if (response.status === 503) {
          console.log(`⏳ ${model} is loading...`);
          // Wait a bit and try again
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const retryResponse = await fetch(testUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              inputs: 'Hello',
              parameters: {
                max_length: 10,
                temperature: 0.7,
                do_sample: true,
                return_full_text: false
              }
            })
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            console.log(`✅ ${model} works after loading!`, retryData);
            // Update the working model
            this.models.textGeneration = model;
            console.log(`🔄 Updated working model to: ${model}`);
            return { success: true, workingModel: model, data: retryData };
          }
        }
      } catch (error) {
        console.error(`❌ ${model} test error:`, error);
      }
    }
    
    console.log('❌ No working models found');
    return { success: false, error: 'All models failed' };
  }

  /**
   * Get status of all 11 working models
   */
  async getModelStatus() {
    console.log('📊 Getting status of all 11 working models...');
    
    const status = {
      total: this.models.fallbacks.length,
      working: 0,
      failed: 0,
      models: []
    };
    
    for (const model of this.models.fallbacks) {
      try {
        const url = `${this.baseUrl}/${model}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        });
        
        const modelStatus = {
          name: model,
          status: response.status,
          working: response.ok || response.status === 503, // 503 means loading
          lastChecked: new Date().toISOString()
        };
        
        if (modelStatus.working) {
          status.working++;
        } else {
          status.failed++;
        }
        
        status.models.push(modelStatus);
        
      } catch (error) {
        status.failed++;
        status.models.push({
          name: model,
          status: 'ERROR',
          working: false,
          error: error.message,
          lastChecked: new Date().toISOString()
        });
      }
    }
    
    console.log(`📊 Model Status: ${status.working}/${status.total} models working`);
    return status;
  }

  /**
   * Test different endpoint formats to find working ones
   */
  async testEndpointFormats() {
    console.log('🔍 Testing different endpoint formats...');
    
    const testModels = ['gpt2', 'distilgpt2'];
    const testEndpoints = [
      'https://api-inference.huggingface.co/models',
      'https://api-inference.huggingface.co',
      'https://huggingface.co/api/models'
    ];
    
    for (const endpoint of testEndpoints) {
      for (const model of testModels) {
        try {
          const testUrl = `${endpoint}/${model}`;
          console.log(`🧪 Testing: ${testUrl}`);
          
          const response = await fetch(testUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`
            }
          });
          
          console.log(`📥 ${testUrl}: ${response.status} ${response.statusText}`);
          
          if (response.ok) {
            console.log(`✅ Working endpoint found: ${testUrl}`);
            this.baseUrl = endpoint;
            return { success: true, workingEndpoint: endpoint, workingModel: model };
          }
        } catch (error) {
          console.error(`❌ ${endpoint}/${model} error:`, error);
        }
      }
    }
    
    console.log('❌ No working endpoints found');
    return { success: false, error: 'All endpoints failed' };
  }

  /**
   * NEW: Finance embeddings analysis using FinLang/finance-embeddings-investopedia
   * Perfect for Home Hub financial management features
   */
  async analyzeFinanceEmbeddings(text, comparisonTexts = []) {
    if (!this.apiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    const cacheKey = `finance_${text}_${comparisonTexts.join('_')}`;
    const cached = this.getCachedResponse(cacheKey);
    if (cached) return cached;

    await this.enforceRateLimit();

    try {
      const requestBody = {
        inputs: {
          source_sentence: text,
          sentences: comparisonTexts.length > 0 ? comparisonTexts : [
            "This is a financial investment",
            "This is a personal expense",
            "This is a business transaction"
          ]
        }
      };

      // Use advanced parameters: caching enabled, smart retry for 503 errors
      const response = await this.smartRequest(
        `${this.baseUrl}/${this.models.financeEmbeddings}`, 
        requestBody, 
        true
      );

      if (!response.ok) {
        throw new Error(`Finance embeddings API failed: ${response.status}`);
      }

      const data = await response.json();
      const result = {
        sourceText: text,
        comparisons: comparisonTexts,
        similarityScores: data,
        analysis: this.interpretFinanceEmbeddings(data, comparisonTexts)
      };
      
      this.setCachedResponse(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Finance embeddings analysis failed:', error);
      return { error: 'Finance analysis unavailable', fallback: 'neutral' };
    }
  }

  /**
   * NEW: Advanced fill-mask completion using prithivida/Splade_PP_en_v2
   * Uses SPLADE++ technology for better word prediction
   */
  async completeWithFillMask(text, maskToken = '[MASK]') {
    if (!this.apiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    if (!text.includes(maskToken)) {
      text = text + ' ' + maskToken;
    }

    const cacheKey = `fillmask_${text}`;
    const cached = this.getCachedResponse(cacheKey);
    if (cached) return cached;

    await this.enforceRateLimit();

    try {
      const requestBody = { inputs: text };

      // Use advanced parameters: caching enabled, smart retry for 503 errors
      const response = await this.smartRequest(
        `${this.baseUrl}/${this.models.advancedFillMask}`, 
        requestBody, 
        true
      );

      if (!response.ok) {
        throw new Error(`Fill-mask API failed: ${response.status}`);
      }

      const data = await response.json();
      const result = {
        originalText: text,
        completions: data,
        topCompletion: data[0] || null,
        suggestions: data.slice(0, 5).map(item => ({
          text: item.sequence,
          confidence: item.score,
          token: item.token_str
        }))
      };
      
      this.setCachedResponse(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Fill-mask completion failed:', error);
      return { error: 'Text completion unavailable', fallback: text.replace(maskToken, '...') };
    }
  }

  /**
   * Helper method to interpret finance embedding results
   */
  interpretFinanceEmbeddings(scores, comparisonTexts) {
    if (!Array.isArray(scores) || scores.length === 0) {
      return 'Unable to analyze financial context';
    }

    const maxScore = Math.max(...scores);
    const maxIndex = scores.indexOf(maxScore);
    const bestMatch = comparisonTexts[maxIndex] || 'Unknown category';

    if (maxScore > 0.8) {
      return `Strong match with: ${bestMatch} (${(maxScore * 100).toFixed(1)}% confidence)`;
    } else if (maxScore > 0.6) {
      return `Moderate match with: ${bestMatch} (${(maxScore * 100).toFixed(1)}% confidence)`;
    } else {
      return `Weak match with: ${bestMatch} (${(maxScore * 100).toFixed(1)}% confidence)`;
    }
  }
}

// Export singleton instance
export default new HuggingFaceService();
