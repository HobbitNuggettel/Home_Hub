/**
 * Imgur Service for Image Uploads
 * Free Tier: 1,250 uploads/day
 * File size: Up to 10MB
 * Storage: Unlimited
 */

// import { firebaseAnalyticsService } from '../firebase.js';

class ImgurService {
  constructor() {
    this.clientId = process.env.REACT_APP_IMGUR_CLIENT_ID;
    this.apiUrl = 'https://api.imgur.com/3';
    this.uploadEndpoint = '/image';
    this.albumEndpoint = '/album';
    this.accountEndpoint = '/account/me';
    
    // Rate limiting
    this.dailyLimit = 1250;
    this.dailyUploads = 0;
    this.lastReset = new Date().toDateString();
    
    // Initialize from localStorage
    this.initializeFromStorage();
    
    // Check if service is configured
    this.isConfigured = !!this.clientId;
    
    if (!this.isConfigured) {
      console.warn('Imgur service not configured. Set REACT_APP_IMGUR_CLIENT_ID in environment variables.');
    }
  }

  // Initialize from localStorage
  initializeFromStorage() {
    try {
      const stored = localStorage.getItem('imgur_service_data');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.lastReset === this.lastReset) {
          this.dailyUploads = data.dailyUploads || 0;
        } else {
          // Reset daily counter
          this.dailyUploads = 0;
          this.saveToStorage();
        }
      }
    } catch (error) {
      console.error('Failed to initialize Imgur service from storage:', error);
    }
  }

  // Save to localStorage
  saveToStorage() {
    try {
      localStorage.setItem('imgur_service_data', JSON.stringify({
        dailyUploads: this.dailyUploads,
        lastReset: this.lastReset
      }));
    } catch (error) {
      console.error('Failed to save Imgur service data:', error);
    }
  }

  // Check if upload is allowed
  canUpload() {
    return this.isConfigured && this.dailyUploads < this.dailyLimit;
  }

  // Get remaining uploads
  getRemainingUploads() {
    return Math.max(0, this.dailyLimit - this.dailyUploads);
  }

  // Get usage statistics
  getUsageStats() {
    const percentage = (this.dailyUploads / this.dailyLimit) * 100;
    return {
      dailyUploads: this.dailyUploads,
      dailyLimit: this.dailyLimit,
      remaining: this.getRemainingUploads(),
      percentage: Math.min(percentage, 100),
      lastReset: this.lastReset,
      isConfigured: this.isConfigured
    };
  }

  // Upload image to Imgur with privacy controls
  async uploadImage(imageFile, options = {}) {
    try {
      // Check if service is configured
      if (!this.isConfigured) {
        throw new Error('Imgur service not configured. Please set REACT_APP_IMGUR_CLIENT_ID.');
      }

      // Check daily limit
      if (!this.canUpload()) {
        throw new Error(`Daily upload limit reached (${this.dailyLimit}). Please try again tomorrow.`);
      }

      // Validate file
      const validation = this.validateImageFile(imageFile);
      if (!validation.error) {
        throw new Error(validation.error);
      }

      // Prepare upload data
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // Add optional parameters
      if (options.title) formData.append('title', options.title);
      if (options.description) formData.append('description', options.description);
      if (options.album) formData.append('album', options.album);
      if (options.name) formData.append('name', options.name);
      
      // Privacy controls
      if (options.private) {
        // Note: Imgur doesn't have true private mode, but we can make it less discoverable
        formData.append('title', options.title || 'Image'); // Generic title
        formData.append('description', options.description || ''); // Minimal description
      }
      
      // Security options
      if (options.secure) {
        // Use HTTPS URLs only
        formData.append('secure', '1');
      }

      // Upload to Imgur
      const response = await fetch(`${this.apiUrl}${this.uploadEndpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Client-ID ${this.clientId}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.data?.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.data?.error || 'Upload failed');
      }

      // Increment daily counter
      this.dailyUploads++;
      this.saveToStorage();

      // Log analytics
      // firebaseAnalyticsService.logEvent('imgur_upload_success', {
      //   image_size: imageFile.size,
      //   image_type: imageFile.type,
      //   daily_uploads: this.dailyUploads,
      //   remaining_uploads: this.getRemainingUploads(),
      //   private: options.private || false
      // });

      // Return success response
      return {
        success: true,
        data: {
          id: result.data.id,
          title: result.data.title,
          description: result.data.description,
          type: result.data.type,
          animated: result.data.animated,
          width: result.data.width,
          height: result.data.height,
          size: result.data.size,
          views: result.data.views,
          bandwidth: result.data.bandwidth,
          vote: result.data.vote,
          favorite: result.data.favorite,
          nsfw: result.data.nsfw,
          section: result.data.section,
          account_url: result.data.account_url,
          account_id: result.data.account_id,
          is_ad: result.data.is_ad,
          in_most_viral: result.data.in_most_viral,
          has_sound: result.data.has_sound,
          tags: result.data.tags,
          ad_type: result.data.ad_type,
          ad_url: result.data.ad_url,
          edited: result.data.edited,
          in_gallery: result.data.in_gallery,
          link: result.data.link,
          comment_count: result.data.comment_count,
          favorite_count: result.data.favorite_count,
          ups: result.data.ups,
          downs: result.data.downs,
          points: result.data.points,
          score: result.data.score,
          is_album: result.data.is_album,
          deletehash: result.data.deletehash,
          name: result.data.name,
          datetime: result.data.datetime
        },
        message: 'Image uploaded successfully to Imgur!',
        usage: this.getUsageStats(),
        privacy: {
          public: true, // Imgur images are always publicly accessible
          searchable: true, // Can be discovered in gallery
          deletable: true, // Can be deleted using deletehash
          warning: options.private ? 'Note: Imgur images are always publicly accessible. Use deletehash to remove after use.' : null
        }
      };

    } catch (error) {
      console.error('Imgur upload failed:', error);
      
      // Log analytics
      // firebaseAnalyticsService.logEvent('imgur_upload_error', {
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

      // Check if we can upload all images
      if (this.dailyUploads + imageFiles.length > this.dailyLimit) {
        throw new Error(`Cannot upload ${imageFiles.length} images. Only ${this.getRemainingUploads()} uploads remaining today.`);
      }

      const results = [];
      const errors = [];

      // Upload images sequentially to avoid rate limiting
      for (let i = 0; i < imageFiles.length; i++) {
        try {
          const result = await this.uploadImage(imageFiles[i], {
            ...options,
            title: options.title ? `${options.title} (${i + 1})` : undefined
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

  // Create album and upload images
  async createAlbumAndUpload(images, albumOptions = {}) {
    try {
      if (!this.isConfigured) {
        throw new Error('Imgur service not configured');
      }

      // First, upload all images
      const uploadResult = await this.uploadMultipleImages(images, albumOptions);
      
      if (!uploadResult.success || uploadResult.results.length === 0) {
        return uploadResult;
      }

      // Create album with uploaded images
      const albumData = {
        title: albumOptions.title || 'Home Hub Album',
        description: albumOptions.description || 'Images uploaded from Home Hub',
        privacy: albumOptions.privacy || 'public',
        layout: albumOptions.layout || 'blog',
        cover: uploadResult.results[0].data.id
      };

      const albumResponse = await fetch(`${this.apiUrl}${this.albumEndpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Client-ID ${this.clientId}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(albumData)
      });

      if (!albumResponse.ok) {
        const errorData = await albumResponse.json();
        throw new Error(errorData.data?.error || 'Failed to create album');
      }

      const albumResult = await albumResponse.json();

      return {
        success: true,
        album: albumResult.data,
        images: uploadResult.results,
        message: 'Album created and images uploaded successfully!',
        usage: this.getUsageStats()
      };

    } catch (error) {
      console.error('Album creation failed:', error);
      return {
        success: false,
        error: error.message,
        code: error.code || 'ALBUM_CREATION_FAILED',
        usage: this.getUsageStats()
      };
    }
  }

  // Delete image from Imgur
  async deleteImage(deleteHash) {
    try {
      if (!this.isConfigured) {
        throw new Error('Imgur service not configured');
      }

      const response = await fetch(`${this.apiUrl}/image/${deleteHash}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Client-ID ${this.clientId}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.data?.error || 'Failed to delete image');
      }

      // Log analytics
      // firebaseAnalyticsService.logEvent('imgur_delete_success', {
      //   delete_hash: deleteHash
      // });

      return {
        success: true,
        message: 'Image deleted successfully from Imgur!'
      };

    } catch (error) {
      console.error('Image deletion failed:', error);
      
      // firebaseAnalyticsService.logEvent('imgur_delete_error', {
      //   error: error.message,
      //   delete_hash: deleteHash
      // });

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
        throw new Error('Imgur service not configured');
      }

      const response = await fetch(`${this.apiUrl}${this.accountEndpoint}`, {
        headers: {
          'Authorization': `Client-ID ${this.clientId}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.data?.error || 'Failed to get account info');
      }

      const result = await response.json();

      return {
        success: true,
        data: result.data,
        message: 'Account information retrieved successfully!'
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
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { 
        isValid: false, 
        error: `File type not supported. Allowed: ${allowedTypes.join(', ')}` 
      };
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
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
      service: 'Imgur Image Service',
      status: this.isConfigured ? 'configured' : 'not_configured',
      configured: this.isConfigured,
      dailyLimit: this.dailyLimit,
      dailyUploads: this.dailyUploads,
      remaining: this.getRemainingUploads(),
      lastReset: this.lastReset,
      features: [
        'Image upload (up to 10MB)',
        'Multiple image upload',
        'Album creation',
        'Image deletion',
        'Rate limiting',
        'Usage tracking',
        'Analytics integration'
      ]
    };
  }

  // Reset daily counters (for testing)
  resetDailyCounters() {
    this.dailyUploads = 0;
    this.lastReset = new Date().toDateString();
    this.saveToStorage();
    
    console.log('Imgur daily counters reset');
    return this.getUsageStats();
  }
}

// Create and export singleton instance
export const imgurService = new ImgurService();

// Export individual functions for backward compatibility
export const {
  uploadImage,
  uploadMultipleImages,
  createAlbumAndUpload,
  deleteImage,
  getAccountInfo,
  getUsageStats,
  getServiceStatus,
  canUpload,
  resetDailyCounters
} = imgurService;

export default imgurService;
