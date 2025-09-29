/**
 * Cloudinary Service for Image Uploads
 * Free Tier: 25GB storage, 25GB bandwidth/month
 * File size: Up to 100MB
 * Advanced transformations and optimization
 */

// import { firebaseAnalyticsService } from '../firebase';

class CloudinaryService {
  constructor() {
    this.cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    this.apiKey = process.env.REACT_APP_CLOUDINARY_API_KEY;
    this.uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    this.apiUrl = 'https://api.cloudinary.com/v1_1';
    
    // Free tier limits
    this.monthlyStorageLimit = 25 * 1024 * 1024 * 1024; // 25GB
    this.monthlyBandwidthLimit = 25 * 1024 * 1024 * 1024; // 25GB
    
    // Usage tracking
    this.monthlyUsage = {
      storage: 0,
      bandwidth: 0,
      uploads: 0,
      lastReset: new Date().getMonth()
    };
    
    // Initialize from localStorage
    this.initializeFromStorage();
    
    // Check if service is configured
    this.isConfigured = !!(this.cloudName && this.uploadPreset);
    
    if (!this.isConfigured) {
      console.warn('Cloudinary service not configured. Set REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET in environment variables.');
    }
  }

  // Initialize from localStorage
  initializeFromStorage() {
    try {
      const stored = localStorage.getItem('cloudinary_service_data');
      if (stored) {
        const data = JSON.parse(stored);
        const currentMonth = new Date().getMonth();
        
        if (data.lastReset === currentMonth) {
          this.monthlyUsage = data;
        } else {
          // Reset monthly counters
          this.monthlyUsage = {
            storage: 0,
            bandwidth: 0,
            uploads: 0,
            lastReset: currentMonth
          };
          this.saveToStorage();
        }
      }
    } catch (error) {
      console.error('Failed to initialize Cloudinary service from storage:', error);
    }
  }

  // Save to localStorage
  saveToStorage() {
    try {
      localStorage.setItem('cloudinary_service_data', JSON.stringify(this.monthlyUsage));
    } catch (error) {
      console.error('Failed to save Cloudinary service data:', error);
    }
  }

  // Check if upload is allowed
  canUpload(fileSize) {
    if (!this.isConfigured) return false;
    
    // Check storage limit
    if (this.monthlyUsage.storage + fileSize > this.monthlyStorageLimit) {
      return false;
    }
    
    return true;
  }

  // Get remaining storage
  getRemainingStorage() {
    return Math.max(0, this.monthlyStorageLimit - this.monthlyUsage.storage);
  }

  // Get remaining bandwidth
  getRemainingBandwidth() {
    return Math.max(0, this.monthlyBandwidthLimit - this.monthlyUsage.bandwidth);
  }

  // Get usage statistics
  getUsageStats() {
    const storagePercentage = (this.monthlyUsage.storage / this.monthlyStorageLimit) * 100;
    const bandwidthPercentage = (this.monthlyUsage.bandwidth / this.monthlyBandwidthLimit) * 100;
    
    return {
      storage: {
        used: this.monthlyUsage.storage,
        limit: this.monthlyStorageLimit,
        remaining: this.getRemainingStorage(),
        percentage: Math.min(storagePercentage, 100)
      },
      bandwidth: {
        used: this.monthlyUsage.bandwidth,
        limit: this.monthlyBandwidthLimit,
        remaining: this.getRemainingBandwidth(),
        percentage: Math.min(bandwidthPercentage, 100)
      },
      uploads: this.monthlyUsage.uploads,
      lastReset: this.monthlyUsage.lastReset,
      isConfigured: this.isConfigured
    };
  }

  // Upload image to Cloudinary with privacy controls
  async uploadImage(imageFile, options = {}) {
    try {
      // Check if service is configured
      if (!this.isConfigured) {
        throw new Error('Cloudinary service not configured. Please set REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET.');
      }

      // Check storage limit
      if (!this.canUpload(imageFile.size)) {
        throw new Error(`Storage limit exceeded. Cannot upload ${(imageFile.size / (1024 * 1024)).toFixed(2)}MB file.`);
      }

      // Validate file
      const validation = this.validateImageFile(imageFile);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Prepare upload data
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', this.uploadPreset);
      
      // Add optional parameters
      if (options.folder) formData.append('folder', options.folder);
      if (options.public_id) formData.append('public_id', options.public_id);
      if (options.tags) formData.append('tags', options.tags.join(','));
      if (options.context) formData.append('context', options.context);
      
      // Privacy controls
      if (options.private) {
        // Make image private (not publicly searchable)
        formData.append('access_mode', 'authenticated');
        formData.append('invalidate', '1'); // Clear CDN cache
      }
      
      // Security options
      if (options.secure) {
        formData.append('secure', '1'); // Force HTTPS
      }
      
      // Add transformation parameters
      if (options.transformations) {
        Object.entries(options.transformations).forEach(([key, value]) => {
          formData.append(`transformation[${key}]`, value);
        });
      }

      // Upload to Cloudinary
      const response = await fetch(`${this.apiUrl}/${this.cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Update usage statistics
      this.monthlyUsage.storage += result.bytes;
      this.monthlyUsage.uploads++;
      this.saveToStorage();

      // Log analytics
      // firebaseAnalyticsService.logEvent('cloudinary_upload_success', {
      //   image_size: imageFile.size,
      //   image_type: imageFile.type,
      //   cloudinary_bytes: result.bytes,
      //   monthly_storage: this.monthlyUsage.storage,
      //   monthly_uploads: this.monthlyUsage.uploads,
      //   private: options.private || false
      // });

      // Return success response
      return {
        success: true,
        data: {
          public_id: result.public_id,
          secure_url: result.secure_url,
          url: result.url,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          resource_type: result.resource_type,
          created_at: result.created_at,
          tags: result.tags,
          context: result.context,
          version: result.version,
          signature: result.signature,
          etag: result.etag,
          placeholder: result.placeholder,
          original_filename: result.original_filename,
          api_key: result.api_key,
          // Privacy information
          private: options.private || false,
          access_mode: result.access_mode || 'public'
        },
        message: 'Image uploaded successfully to Cloudinary!',
        usage: this.getUsageStats(),
        privacy: {
          public: !options.private,
          searchable: !options.private,
          cdn_cached: !options.private
        }
      };

    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      
      // Log analytics
      // firebaseAnalyticsService.logEvent('cloudinary_upload_error', {
      //   error: error.message,
      //   image_size: imageFile?.size,
      //   image_type: imageFile?.type
      // });

      return {
        success: false,
        error: error.message,
        code: error.code || 'UPLOAD_FAILED',
        usage: this.getUsageStats()
      };
    }
  }

  // Upload multiple images
  async uploadMultipleImages(imageFiles, options = {}) {
    try {
      if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
        throw new Error('No images provided');
      }

      // Calculate total size and check storage limit
      const totalSize = imageFiles.reduce((sum, file) => sum + file.size, 0);
      if (!this.canUpload(totalSize)) {
        throw new Error(`Storage limit exceeded. Cannot upload ${(totalSize / (1024 * 1024)).toFixed(2)}MB total.`);
      }

      const results = [];
      const errors = [];

      // Upload images sequentially
      for (let i = 0; i < imageFiles.length; i++) {
        try {
          const result = await this.uploadImage(imageFiles[i], {
            ...options,
            folder: options.folder ? `${options.folder}/batch_${Date.now()}` : undefined,
            public_id: options.public_id ? `${options.public_id}_${i + 1}` : undefined
          });
          
          if (result.success) {
            results.push(result);
          } else {
            errors.push({
              index: i,
              file: imageFiles[i].name,
              error: result.error
            });
          }

          // Small delay between uploads
          if (i < imageFiles.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          errors.push({
            index: i,
            file: imageFiles[i].name,
            error: error.message
          });
        }
      }

      return {
        success: results.length > 0,
        results,
        errors,
        total: imageFiles.length,
        successful: results.length,
        failed: errors.length,
        message: `Uploaded ${results.length}/${imageFiles.length} images successfully`,
        usage: this.getUsageStats()
      };

    } catch (error) {
      console.error('Multiple image upload failed:', error);
      return {
        success: false,
        error: error.message,
        code: error.code || 'MULTIPLE_UPLOAD_FAILED',
        usage: this.getUsageStats()
      };
    }
  }

  // Create image with transformations
  async createTransformedImage(publicId, transformations = {}) {
    try {
      if (!this.isConfigured) {
        throw new Error('Cloudinary service not configured');
      }

      // Build transformation URL
      const transformParams = Object.entries(transformations)
        .map(([key, value]) => `${key}_${value}`)
        .join('/');

      const transformedUrl = `${this.apiUrl}/${this.cloudName}/image/upload/${transformParams}/${publicId}`;

      return {
        success: true,
        data: {
          original_public_id: publicId,
          transformed_url: transformedUrl,
          transformations: transformations
        },
        message: 'Transformed image URL generated successfully!'
      };

    } catch (error) {
      console.error('Image transformation failed:', error);
      return {
        success: false,
        error: error.message,
        code: error.code || 'TRANSFORMATION_FAILED'
      };
    }
  }

  // Delete image from Cloudinary
  async deleteImage(publicId) {
    try {
      if (!this.isConfigured) {
        throw new Error('Cloudinary service not configured');
      }

      // Note: Cloudinary free tier doesn't support deletion via API
      // This would require a paid plan
      console.warn('Image deletion not supported in free tier. Consider upgrading to a paid plan.');

      return {
        success: false,
        error: 'Image deletion not supported in free tier',
        code: 'FREE_TIER_LIMITATION',
        recommendation: 'Upgrade to a paid plan for deletion capabilities'
      };

    } catch (error) {
      console.error('Image deletion failed:', error);
      return {
        success: false,
        error: error.message,
        code: error.code || 'DELETE_FAILED'
      };
    }
  }

  // Get account information
  async getAccountInfo() {
    try {
      if (!this.isConfigured) {
        throw new Error('Cloudinary service not configured');
      }

      // Note: Account info requires API key and secret (paid feature)
      console.warn('Account info not available in free tier. Consider upgrading to a paid plan.');

      return {
        success: false,
        error: 'Account info not available in free tier',
        code: 'FREE_TIER_LIMITATION',
        recommendation: 'Upgrade to a paid plan for account information'
      };

    } catch (error) {
      console.error('Failed to get account info:', error);
      return {
        success: false,
        error: error.message,
        code: error.code || 'ACCOUNT_INFO_FAILED'
      };
    }
  }

  // Validate image file
  validateImageFile(file) {
    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return { 
        isValid: false, 
        error: `File type not supported. Allowed: ${allowedTypes.join(', ')}` 
      };
    }

    // Check file size (100MB limit for Cloudinary)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return { 
        isValid: false, 
        error: `File too large. Maximum size: ${(maxSize / (1024 * 1024)).toFixed(1)}MB` 
      };
    }

    return { isValid: true };
  }

  // Get service status
  getServiceStatus() {
    return {
      service: 'Cloudinary Image Service',
      status: this.isConfigured ? 'configured' : 'not_configured',
      configured: this.isConfigured,
      monthlyStorageLimit: this.monthlyStorageLimit,
      monthlyBandwidthLimit: this.monthlyBandwidthLimit,
      usage: this.getUsageStats(),
      features: [
        'Image upload (up to 100MB)',
        'Multiple image upload',
        'Image transformations',
        'Advanced optimization',
        '25GB free storage',
        '25GB free bandwidth/month',
        'Usage tracking',
        'Analytics integration'
      ],
      limitations: [
        'No image deletion in free tier',
        'No account info in free tier',
        'Requires paid plan for advanced features'
      ]
    };
  }

  // Reset monthly counters (for testing)
  resetMonthlyCounters() {
    this.monthlyUsage = {
      storage: 0,
      bandwidth: 0,
      uploads: 0,
      lastReset: new Date().getMonth()
    };
    this.saveToStorage();
    
    console.log('Cloudinary monthly counters reset');
    return this.getUsageStats();
  }

  // Get transformation presets
  getTransformationPresets() {
    return {
      thumbnail: {
        width: 150,
        height: 150,
        crop: 'fill',
        quality: 'auto'
      },
      medium: {
        width: 300,
        height: 300,
        crop: 'limit',
        quality: 'auto'
      },
      large: {
        width: 800,
        height: 800,
        crop: 'limit',
        quality: 'auto'
      },
      optimized: {
        quality: 'auto',
        fetch_format: 'auto',
        strip: true
      },
      webp: {
        fetch_format: 'webp',
        quality: 'auto'
      }
    };
  }
}

// Create and export singleton instance
export const cloudinaryService = new CloudinaryService();

// Export individual functions for backward compatibility
export const {
  uploadImage,
  uploadMultipleImages,
  createTransformedImage,
  deleteImage,
  getAccountInfo,
  getUsageStats,
  getServiceStatus,
  canUpload,
  resetMonthlyCounters,
  getTransformationPresets
} = cloudinaryService;

export default cloudinaryService;
