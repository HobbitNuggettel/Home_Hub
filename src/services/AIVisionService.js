import { firebaseStorageService } from '../firebase';
// import { firebaseAnalyticsService } from '../firebase';

// AI Vision Service Class
class AIVisionService {
  constructor() {
    this.providers = {
      huggingface: null,
      gemini: null,
      openai: null
    };
    
    this.supportedImageFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'];
    this.maxImageSize = 10 * 1024 * 1024; // 10MB
    this.processingQueue = [];
    this.isProcessing = false;
    
    this.initializeProviders();
  }

  // Initialize AI providers
  async initializeProviders() {
    try {
      // Initialize HuggingFace provider
      if (process.env.REACT_APP_HUGGINGFACE_API_KEY) {
        const { HuggingFaceService } = await import('./HuggingFaceService');
        this.providers.huggingface = new HuggingFaceService();
      }

      // Initialize Gemini provider
      if (process.env.REACT_APP_GEMINI_API_KEY) {
        const { GeminiService } = await import('./GeminiService');
        this.providers.gemini = new GeminiService();
      }

      // Initialize OpenAI provider (if available)
      if (process.env.REACT_APP_OPENAI_API_KEY) {
        // OpenAI integration would go here
        console.log('OpenAI provider not yet implemented');
      }

      console.log('AI Vision Service initialized with providers:', Object.keys(this.providers).filter(key => this.providers[key]));
    } catch (error) {
      console.error('Failed to initialize AI Vision Service providers:', error);
    }
  }

  // Main image processing method
  async processImage(imageFile, options = {}) {
    try {
      // Validate image file
      const validation = this.validateImageFile(imageFile);
      if (!validation.isValid) {
        throw new Error(`Image validation failed: ${validation.errors.join(', ')}`);
      }

      // Upload image to Firebase Storage
      const uploadResult = await this.uploadImageToStorage(imageFile);
      if (!uploadResult.success) {
        throw new Error(`Failed to upload image: ${uploadResult.error}`);
      }

      // Process image with AI
      const processingOptions = {
        task: options.task || 'auto',
        provider: options.provider || 'auto',
        language: options.language || 'en',
        confidence: options.confidence || 0.7,
        maxResults: options.maxResults || 10,
        ...options
      };

      const aiResult = await this.analyzeImageWithAI(uploadResult.downloadURL, processingOptions);
      
      // Log analytics
      firebaseAnalyticsService.logEvent('ai_vision_image_processed', {
        image_size: imageFile.size,
        image_type: imageFile.type,
        task: processingOptions.task,
        provider: aiResult.provider,
        processing_time: aiResult.processingTime,
        success: aiResult.success
      });

      return {
        success: true,
        imageUrl: uploadResult.downloadURL,
        analysis: aiResult,
        metadata: {
          originalFile: imageFile.name,
          fileSize: imageFile.size,
          uploadTime: new Date().toISOString(),
          processingOptions
        }
      };
    } catch (error) {
      console.error('Image processing failed:', error);
      
      // Log error analytics
      firebaseAnalyticsService.logError(error, {
        service: 'ai_vision',
        operation: 'process_image',
        imageFile: imageFile?.name
      });

      return {
        success: false,
        error: error.message,
        code: error.code || 'unknown_error'
      };
    }
  }

  // Image validation
  validateImageFile(file) {
    const errors = [];

    // Check file type
    if (!file.type.startsWith('image/')) {
      errors.push('File must be an image');
    }

    // Check file size
    if (file.size > this.maxImageSize) {
      errors.push(`File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(this.maxImageSize)})`);
    }

    // Check file extension
    const extension = file.name.split('.').pop().toLowerCase();
    if (!this.supportedImageFormats.includes(extension)) {
      errors.push(`File extension '${extension}' is not supported. Supported formats: ${this.supportedImageFormats.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Upload image to Firebase Storage
  async uploadImageToStorage(imageFile) {
    try {
      const result = await firebaseStorageService.uploadImage(imageFile, 'ai-vision', {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        format: 'webp'
      });

      return result;
    } catch (error) {
      console.error('Failed to upload image to storage:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Analyze image with AI
  async analyzeImageWithAI(imageUrl, options) {
    const startTime = Date.now();
    let result = null;
    let provider = null;

    try {
      // Determine provider
      if (options.provider === 'auto') {
        provider = await this.selectBestProvider(options.task);
      } else {
        provider = options.provider;
      }

      // Process with selected provider
      switch (provider) {
        case 'huggingface':
          result = await this.processWithHuggingFace(imageUrl, options);
          break;
        case 'gemini':
          result = await this.processWithGemini(imageUrl, options);
          break;
        default:
          throw new Error(`Unsupported AI provider: ${provider}`);
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        provider,
        result,
        processingTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`AI analysis failed with provider ${provider}:`, error);
      
      // Try fallback provider
      if (provider !== 'huggingface' && this.providers.huggingface) {
        try {
          console.log('Trying HuggingFace as fallback provider...');
          result = await this.processWithHuggingFace(imageUrl, options);
          provider = 'huggingface';
          
          const processingTime = Date.now() - startTime;
          return {
            success: true,
            provider: `${provider} (fallback)`,
            result,
            processingTime,
            timestamp: new Date().toISOString()
          };
        } catch (fallbackError) {
          console.error('Fallback provider also failed:', fallbackError);
        }
      }

      throw error;
    }
  }

  // Select best provider based on task
  async selectBestProvider(task) {
    const providerCapabilities = {
      'object-detection': ['huggingface', 'gemini'],
      'image-classification': ['huggingface', 'gemini'],
      'text-extraction': ['gemini', 'huggingface'],
      'document-analysis': ['gemini', 'huggingface'],
      'face-detection': ['huggingface', 'gemini'],
      'image-description': ['gemini', 'huggingface'],
      'auto': ['gemini', 'huggingface']
    };

    const availableProviders = providerCapabilities[task] || providerCapabilities.auto;
    
    // Check which providers are actually available
    for (const provider of availableProviders) {
      if (this.providers[provider]) {
        return provider;
      }
    }

    throw new Error('No AI providers available');
  }

  // Process with HuggingFace
  async processWithHuggingFace(imageUrl, options) {
    if (!this.providers.huggingface) {
      throw new Error('HuggingFace provider not available');
    }

    const task = this.mapTaskToHuggingFaceTask(options.task);
    
    try {
      const result = await this.providers.huggingface.processImage(imageUrl, {
        task,
        confidence: options.confidence,
        maxResults: options.maxResults
      });

      return this.formatHuggingFaceResult(result, task);
    } catch (error) {
      console.error('HuggingFace processing failed:', error);
      throw error;
    }
  }

  // Process with Gemini
  async processWithGemini(imageUrl, options) {
    if (!this.providers.gemini) {
      throw new Error('Gemini provider not available');
    }

    try {
      const prompt = this.generateGeminiPrompt(options.task, options.language);
      
      const result = await this.providers.gemini.analyzeImage(imageUrl, prompt, {
        maxTokens: 1000,
        temperature: 0.3,
        topP: 0.8,
        topK: 40
      });

      return this.formatGeminiResult(result, options.task);
    } catch (error) {
      console.error('Gemini processing failed:', error);
      throw error;
    }
  }

  // Map generic tasks to HuggingFace specific tasks
  mapTaskToHuggingFaceTask(task) {
    const taskMapping = {
      'object-detection': 'object-detection',
      'image-classification': 'image-classification',
      'text-extraction': 'text-extraction',
      'document-analysis': 'document-question-answering',
      'face-detection': 'face-detection',
      'image-description': 'image-to-text',
      'auto': 'image-classification'
    };

    return taskMapping[task] || 'image-classification';
  }

  // Generate Gemini prompts based on task
  generateGeminiPrompt(task, language = 'en') {
    const prompts = {
      'object-detection': `Analyze this image and identify all visible objects. For each object, provide:
1. Object name
2. Location in the image (top-left, center, bottom-right, etc.)
3. Confidence level (high/medium/low)
4. Any notable characteristics

Respond in ${language} language.`,
      
      'image-classification': `Classify this image into appropriate categories. Consider:
1. Main subject/theme
2. Setting/environment
3. Style/artistic elements
4. Mood/atmosphere
5. Technical aspects (lighting, composition, etc.)

Provide 3-5 relevant categories with confidence levels. Respond in ${language} language.`,
      
      'text-extraction': `Extract all visible text from this image. Include:
1. Main text content
2. Any labels or captions
3. Numbers or codes
4. Text location and orientation
5. Text quality/clarity assessment

Respond in ${language} language.`,
      
      'document-analysis': `Analyze this document image and provide:
1. Document type
2. Key information extracted
3. Important fields or data points
4. Document quality assessment
5. Any notable features or issues

Respond in ${language} language.`,
      
      'face-detection': `Analyze this image for human faces. For each face detected, provide:
1. Face location
2. Approximate age range
3. Gender (if discernible)
4. Facial expressions
5. Any notable features

Respond in ${language} language.`,
      
      'image-description': `Provide a detailed description of this image in ${language} language. Include:
1. Main subjects and objects
2. Setting and environment
3. Actions or activities
4. Colors and visual elements
5. Overall mood or atmosphere
6. Any interesting or unusual details`,
      
      'auto': `Analyze this image comprehensively and provide:
1. Main content description
2. Object identification
3. Text extraction (if any)
4. Overall context and purpose
5. Key visual elements

Respond in ${language} language.`
    };

    return prompts[task] || prompts.auto;
  }

  // Format HuggingFace results
  formatHuggingFaceResult(result, task) {
    switch (task) {
      case 'object-detection':
        return {
          type: 'object-detection',
          objects: result.map(item => ({
            label: item.label,
            confidence: item.score,
            boundingBox: item.box,
            category: item.category
          })),
          totalObjects: result.length
        };
      
      case 'image-classification':
        return {
          type: 'image-classification',
          classifications: result.map(item => ({
            label: item.label,
            confidence: item.score,
            category: item.category
          })),
          topClassification: result[0]
        };
      
      case 'text-extraction':
        return {
          type: 'text-extraction',
          text: result.text || result.generated_text,
          confidence: result.confidence || 1.0
        };
      
      default:
        return {
          type: 'general-analysis',
          result,
          raw: true
        };
    }
  }

  // Format Gemini results
  formatGeminiResult(result, task) {
    try {
      // Parse Gemini response
      const response = result.response || result.text || result;
      
      return {
        type: task,
        analysis: response,
        confidence: 0.9, // Gemini doesn't provide confidence scores
        provider: 'gemini'
      };
    } catch (error) {
      console.error('Failed to format Gemini result:', error);
      return {
        type: task,
        analysis: result,
        confidence: 0.9,
        provider: 'gemini',
        raw: true
      };
    }
  }

  // Batch image processing
  async processBatchImages(imageFiles, options = {}) {
    const results = [];
    const batchSize = options.batchSize || 3;
    
    for (let i = 0; i < imageFiles.length; i += batchSize) {
      const batch = imageFiles.slice(i, i + batchSize);
      const batchPromises = batch.map(file => this.processImage(file, options));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Add delay between batches to avoid rate limiting
        if (i + batchSize < imageFiles.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
        // Add error results for failed batch
        batch.forEach(() => {
          results.push({
            success: false,
            error: error.message,
            code: 'batch_failed'
          });
        });
      }
    }
    
    return results;
  }

  // Utility methods
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get service status
  getServiceStatus() {
    return {
      providers: Object.keys(this.providers).filter(key => this.providers[key]),
      isProcessing: this.isProcessing,
      queueLength: this.processingQueue.length,
      supportedFormats: this.supportedImageFormats,
      maxImageSize: this.maxImageSize
    };
  }

  // Cleanup
  cleanup() {
    this.processingQueue = [];
    this.isProcessing = false;
  }
}

// Create and export singleton instance
export const aiVisionService = new AIVisionService();

// Export individual functions for backward compatibility
export const {
  processImage,
  processBatchImages,
  validateImageFile,
  getServiceStatus,
  cleanup
} = aiVisionService;

export default aiVisionService;
