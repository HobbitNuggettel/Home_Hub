/**
 * Image Management Service
 * Intelligent routing to optimal storage solution:
 * - Small images (<500KB) → Base64 in Firestore (FREE)
 * - Medium images (500KB-5MB) → Imgur (1,250/day free)
 * - Large images (5MB+) → Cloudinary (25GB/month free)
 * - Fallback to base64 if external services fail
 */

// import { firebaseAnalyticsService } from '../firebase';
import { imgurService } from './ImgurService';
import { cloudinaryService } from './CloudinaryService';
import { imageCompressionService } from './ImageCompressionService';

class ImageManagementService {
  constructor() {
    this.storageThresholds = {
      base64: 500 * 1024,        // 500KB - Store in Firestore
      imgur: 5 * 1024 * 1024,    // 5MB - Use Imgur
      cloudinary: 100 * 1024 * 1024 // 100MB - Use Cloudinary
    };
    
    this.compressionQuality = 0.8;
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    
    // Service availability
    this.services = {
      imgur: imgurService.isConfigured,
      cloudinary: cloudinaryService.isConfigured,
      base64: true // Always available
    };
    
    // Initialize service status
    this.updateServiceStatus();
  }

  // Update service status
  updateServiceStatus() {
    this.services = {
      imgur: imgurService.isConfigured,
      cloudinary: cloudinaryService.isConfigured,
      base64: true
    };
    
    // Log service availability for debugging
    console.log('🔍 Image Service Status:');
    console.log('  Imgur:', this.services.imgur ? '✅ Configured' : '❌ Not configured');
    console.log('  Cloudinary:', this.services.cloudinary ? '✅ Configured' : '❌ Not configured');
    console.log('  Base64:', '✅ Always available');
    
    if (!this.services.imgur && !this.services.cloudinary) {
      console.warn('⚠️  No external image services configured. All images will use base64 storage.');
      console.log('💡 To enable external services:');
      console.log('   - Set REACT_APP_IMGUR_CLIENT_ID for Imgur (1,250 uploads/day free)');
      console.log('   - Set REACT_APP_CLOUDINARY_CLOUD_NAME for Cloudinary (25GB/month free)');
      console.log('   - Create a .env file in your project root with these variables');
    }
  }

  // Get optimal storage strategy for an image
  getOptimalStorageStrategy(imageFile, privacyOptions = {}) {
    const fileSize = imageFile.size;
    const fileType = imageFile.type;
    const isPrivate = privacyOptions.private || false;
    
    // Check if image is too large for any service
    if (fileSize > this.storageThresholds.cloudinary) {
      return {
        strategy: 'compress_and_retry',
        reason: 'File too large for all services',
        recommendation: 'Compress image to under 100MB'
      };
    }

    // For private images, prioritize Cloudinary or base64
    if (isPrivate) {
      if (fileSize <= this.storageThresholds.base64) {
        return {
          strategy: 'base64',
          reason: 'Private image, optimal for Firestore (completely private)',
          service: 'firestore',
          cost: 'FREE',
          privacy: '100% private'
        };
      } else if (this.services.cloudinary && cloudinaryService.canUpload(fileSize)) {
        return {
          strategy: 'cloudinary',
          reason: 'Private image, Cloudinary supports private uploads',
          service: 'cloudinary',
          cost: 'FREE (25GB/month)',
          privacy: 'Private (not searchable)'
        };
      } else {
        return {
          strategy: 'base64',
          reason: 'Private image, Cloudinary unavailable, fallback to base64',
          service: 'firestore',
          cost: 'FREE',
          privacy: '100% private'
        };
      }
    }

    // For public images, use standard routing
    if (fileSize <= this.storageThresholds.base64) {
      return {
        strategy: 'base64',
        reason: 'Small file, optimal for Firestore',
        service: 'firestore',
        cost: 'FREE'
      };
    } else if (fileSize <= this.storageThresholds.imgur) {
      if (this.services.imgur && imgurService.canUpload()) {
        return {
          strategy: 'imgur',
          reason: 'Medium file, optimal for Imgur',
          service: 'imgur',
          cost: 'FREE (1,250/day)'
        };
      } else if (this.services.cloudinary && cloudinaryService.canUpload(fileSize)) {
        return {
          strategy: 'cloudinary',
          reason: 'Imgur unavailable, using Cloudinary',
          service: 'cloudinary',
          cost: 'FREE (25GB/month)'
        };
      } else {
        return {
          strategy: 'base64',
          reason: 'External services unavailable, fallback to base64',
          service: 'firestore',
          cost: 'FREE'
        };
      }
    } else {
      if (this.services.cloudinary && cloudinaryService.canUpload(fileSize)) {
        return {
          strategy: 'cloudinary',
          reason: 'Large file, optimal for Cloudinary',
          service: 'cloudinary',
          cost: 'FREE (25GB/month)'
        };
      } else {
        return {
          strategy: 'compress_and_retry',
          reason: 'Cloudinary unavailable for large files',
          recommendation: 'Compress image or try again later'
        };
      }
    }
  }

  // Upload image with intelligent routing and privacy controls
  async uploadImage(imageFile, options = {}) {
    try {
      console.log('🚀 Starting image upload process...');
      console.log(`   Original file: ${imageFile.name} (${(imageFile.size / (1024 * 1024)).toFixed(2)}MB)`);
      
      // STEP 1: Automatic compression after capture
      console.log('🖼️ Step 1: Compressing image after capture...');
      const compressionResult = await imageCompressionService.compressImageAfterCapture(imageFile, {
        useCase: options.useCase || 'general',
        generateThumbnail: options.generateThumbnail !== false,
        thumbnailSize: options.thumbnailSize || 'small',
        preserveTransparency: options.preserveTransparency || false,
        preserveMetadata: options.preserveMetadata || false,
        optimizeFormat: options.optimizeFormat !== false
      });

      if (!compressionResult.success) {
        console.warn('⚠️ Compression failed, using original file');
      }

      // Use compressed file for upload decisions
      const fileToUpload = compressionResult.success ? compressionResult.compressed.file : imageFile;
      const compressionStats = compressionResult.stats || { totalSize: imageFile.size };

      console.log(`   After compression: ${(fileToUpload.size / (1024 * 1024)).toFixed(2)}MB`);
      console.log(`   Compression savings: ${compressionStats.savings?.megabytes || 0}MB (${compressionStats.totalReduction || 0}%)`);

      // STEP 2: Get optimal storage strategy based on compressed file
      console.log('🎯 Step 2: Determining optimal storage strategy...');
      const strategy = this.getOptimalStorageStrategy(fileToUpload, options);
      
      console.log(`   Strategy: ${strategy.strategy}`);
      console.log(`   Service: ${strategy.service}`);
      console.log(`   Reason: ${strategy.reason}`);

      // Log strategy decision
      // firebaseAnalyticsService.logEvent('image_upload_strategy', {
      //   file_size: fileToUpload.size,
      //   file_type: fileToUpload.type,
      //   strategy: strategy.strategy,
      //   service: strategy.service,
      //   reason: strategy.reason,
      //   private: options.private || false,
      //   privacy_level: strategy.privacy || 'standard',
      //   compression_applied: compressionResult.success,
      //   compression_ratio: compressionStats.compressionRatio || 1,
      //   size_reduction: compressionStats.totalReduction || 0
      // });

      // STEP 3: Execute storage strategy
      console.log('💾 Step 3: Executing storage strategy...');
      let uploadResult;
      
      switch (strategy.strategy) {
        case 'base64':
          uploadResult = await this.uploadToBase64(fileToUpload, options);
          break;
        
        case 'imgur':
          uploadResult = await this.uploadToImgur(fileToUpload, options);
          break;
        
        case 'cloudinary':
          uploadResult = await this.uploadToCloudinary(fileToUpload, options);
          break;
        
        case 'compress_and_retry':
          uploadResult = await this.compressAndRetry(fileToUpload, options);
          break;
        
        default:
          throw new Error(`Unknown strategy: ${strategy.strategy}`);
      }

      // STEP 4: Enhance result with compression data
      if (uploadResult.success) {
        uploadResult.compression = {
          applied: compressionResult.success,
          originalSize: imageFile.size,
          compressedSize: fileToUpload.size,
          thumbnailSize: compressionResult.thumbnail?.file.size || 0,
          stats: compressionStats,
          recommendations: compressionResult.recommendations || []
        };

        // Add thumbnail if generated
        if (compressionResult.thumbnail) {
          uploadResult.thumbnail = {
            file: compressionResult.thumbnail.file,
            size: compressionResult.thumbnail.file.size,
            type: compressionResult.thumbnail.file.type,
            dimensions: compressionResult.thumbnail.dimensions
          };
        }

        console.log('✅ Upload completed successfully!');
        console.log(`   Final size: ${(fileToUpload.size / (1024 * 1024)).toFixed(2)}MB`);
        console.log(`   Total savings: ${compressionStats.savings?.megabytes || 0}MB`);
        console.log(`   Storage service: ${uploadResult.service}`);
      }

      return uploadResult;

    } catch (error) {
      console.error('❌ Image upload failed:', error);
      
      // Log error
      // firebaseAnalyticsService.logEvent('image_upload_error', {
      //   error: error.message,
      //   file_size: imageFile.size,
      //   file_type: imageFile.type,
      //   private: options.private || false
      // });

      return {
        success: false,
        error: error.message,
        code: error.code || 'UPLOAD_FAILED',
        strategy: 'failed'
      };
    }
  }

  // Upload to base64 (Firestore)
  async uploadToBase64(imageFile, options = {}) {
    try {
      // Compress image if needed
      let processedFile = imageFile;
      if (imageFile.size > this.storageThresholds.base64) {
        processedFile = await this.compressImage(imageFile, 0.6); // Higher compression
      }

      // Convert to base64
      const base64Data = await this.convertToBase64(processedFile);
      
      // Log success
      // firebaseAnalyticsService.logEvent('base64_upload_success', {
      //   original_size: imageFile.size,
      //   compressed_size: processedFile.size,
      //   compression_ratio: (imageFile.size / processedFile.size).toFixed(2)
      // });

      return {
        success: true,
        data: {
          type: 'base64',
          data: base64Data,
          size: processedFile.size,
          originalSize: imageFile.size,
          mimeType: processedFile.type,
          compressionRatio: (imageFile.size / processedFile.size).toFixed(2)
        },
        strategy: 'base64',
        service: 'firestore',
        message: 'Image stored as base64 in Firestore successfully!'
      };

    } catch (error) {
      console.error('Base64 upload failed:', error);
      throw error;
    }
  }


  // Upload to Imgur
  async uploadToImgur(imageFile, options = {}) {
    try {
      // Compress image if needed for Imgur
      let processedFile = imageFile;
      if (imageFile.size > this.storageThresholds.imgur) {
        processedFile = await this.compressImage(imageFile, 0.7);
      }

      const result = await imgurService.uploadImage(processedFile, options);
      
      if (result.success) {
        // Log success
        // firebaseAnalyticsService.logEvent('imgur_upload_success', {
        //   original_size: imageFile.size,
        //   processed_size: processedFile.size,
        //   compression_ratio: (imageFile.size / processedFile.size).toFixed(2)
        // });

        return {
          ...result,
          strategy: 'imgur',
          service: 'imgur',
          originalSize: imageFile.size,
          compressionRatio: (imageFile.size / processedFile.size).toFixed(2)
        };
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Imgur upload failed:', error);
      
      // Try fallback to base64
      console.log('Falling back to base64 storage...');
      return await this.uploadToBase64(imageFile, options);
    }
  }

  // Upload to Cloudinary
  async uploadToCloudinary(imageFile, options = {}) {
    try {
      // Compress image if needed for Cloudinary
      let processedFile = imageFile;
      if (imageFile.size > this.storageThresholds.cloudinary) {
        processedFile = await this.compressImage(imageFile, 0.5); // Higher compression for large files
      }

      const result = await cloudinaryService.uploadImage(processedFile, options);
      
      if (result.success) {
        // Log success
        // firebaseAnalyticsService.logEvent('cloudinary_upload_success', {
        //   original_size: imageFile.size,
        //   processed_size: processedFile.size,
        //   compression_ratio: (imageFile.size / processedFile.size).toFixed(2)
        // });

        return {
          ...result,
          strategy: 'cloudinary',
          service: 'cloudinary',
          originalSize: imageFile.size,
          compressionRatio: (imageFile.size / processedFile.size).toFixed(2)
        };
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      
      // Try fallback to Imgur
      if (this.services.imgur && imgurService.canUpload()) {
        console.log('Falling back to Imgur...');
        return await this.uploadToImgur(imageFile, options);
      }
      
      // Final fallback to base64
      console.log('Falling back to base64 storage...');
      return await this.uploadToBase64(imageFile, options);
    }
  }

  // Compress and retry upload
  async compressAndRetry(imageFile, options = {}) {
    try {
      // Try different compression levels
      const compressionLevels = [0.8, 0.6, 0.4, 0.2];
      
      for (const quality of compressionLevels) {
        const compressedFile = await this.compressImage(imageFile, quality);
        
        // Check if compressed file fits in any service
        const strategy = this.getOptimalStorageStrategy(compressedFile);
        
        if (strategy.strategy !== 'compress_and_retry') {
          console.log(`Compression successful with quality ${quality}, retrying upload...`);
          
          // Retry upload with compressed file
          const result = await this.uploadImage(compressedFile, options);
          
          if (result.success) {
            return {
              ...result,
              compressionApplied: true,
              compressionQuality: quality,
              originalSize: imageFile.size,
              compressedSize: compressedFile.size
            };
          }
        }
      }
      
      // If all compression levels fail, use base64 with maximum compression
      const maxCompressedFile = await this.compressImage(imageFile, 0.1);
      return await this.uploadToBase64(maxCompressedFile, options);

    } catch (error) {
      console.error('Compression and retry failed:', error);
      throw error;
    }
  }

  // Upload multiple images with intelligent routing
  async uploadMultipleImages(imageFiles, options = {}) {
    try {
      console.log(`🚀 Starting batch upload of ${imageFiles.length} images...`);
      
      // STEP 1: Batch compression for all images
      console.log('🖼️ Step 1: Batch compressing all images...');
      const compressionResults = await imageCompressionService.compressMultipleImages(imageFiles, {
        useCase: options.useCase || 'general',
        generateThumbnail: options.generateThumbnail !== false,
        thumbnailSize: options.thumbnailSize || 'small',
        preserveTransparency: options.preserveTransparency || false,
        preserveMetadata: options.preserveMetadata || false,
        optimizeFormat: options.optimizeFormat !== false
      });

      console.log(`   Compression completed: ${compressionResults.stats.successful}/${compressionResults.stats.totalImages} successful`);
      console.log(`   Total size reduction: ${compressionResults.stats.totalReduction.toFixed(1)}%`);
      console.log(`   Storage savings: ${((compressionResults.stats.totalOriginalSize - compressionResults.stats.totalSize) / (1024 * 1024)).toFixed(2)}MB`);

      // STEP 2: Group compressed images by optimal strategy
      const strategyGroups = {
        base64: [],
        imgur: [],
        cloudinary: [],
        compress: []
      };

      compressionResults.results.forEach((compressionResult, index) => {
        if (compressionResult.success) {
          const fileToUpload = compressionResult.compressed.file;
          const strategy = this.getOptimalStorageStrategy(fileToUpload, options);
          strategyGroups[strategy.strategy].push({ 
            file: fileToUpload, 
            index, 
            strategy,
            compressionResult 
          });
        } else {
          // If compression failed, use original file
          const strategy = this.getOptimalStorageStrategy(imageFiles[index], options);
          strategyGroups[strategy.strategy].push({ 
            file: imageFiles[index], 
            index, 
            strategy,
            compressionResult: null
          });
        }
      });

      // STEP 3: Process each group
      const results = [];
      const errors = [];
      
      for (const [strategy, files] of Object.entries(strategyGroups)) {
        if (files.length === 0) continue;

        console.log(`💾 Processing ${files.length} images with ${strategy} strategy...`);

        for (const { file, index, strategy: fileStrategy, compressionResult } of files) {
          try {
            const result = await this.uploadImage(file, options);
            
            if (result.success) {
              // Enhance result with compression data
              if (compressionResult) {
                result.compression = {
                  applied: true,
                  originalSize: compressionResult.original.file.size,
                  compressedSize: compressionResult.compressed.file.size,
                  thumbnailSize: compressionResult.thumbnail?.file.size || 0,
                  stats: compressionResult.stats,
                  recommendations: compressionResult.recommendations || []
                };

                if (compressionResult.thumbnail) {
                  result.thumbnail = {
                    file: compressionResult.thumbnail.file,
                    size: compressionResult.thumbnail.file.size,
                    type: compressionResult.thumbnail.file.type,
                    dimensions: compressionResult.thumbnail.dimensions
                  };
                }
              }

              results.push({ ...result, originalIndex: index });
            } else {
              errors.push({
                index,
                file: file.name,
                error: result.error,
                strategy: result.strategy
              });
            }

            // Small delay between uploads
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            errors.push({
              index,
              file: file.name,
              error: error.message,
              strategy: 'failed'
            });
          }
        }
      }

      // STEP 4: Calculate final statistics
      const finalStats = {
        total: imageFiles.length,
        successful: results.length,
        failed: errors.length,
        compression: compressionResults.stats,
        strategyBreakdown: Object.fromEntries(
          Object.entries(strategyGroups).map(([strategy, files]) => [
            strategy, 
            files.length
          ])
        )
      };

      console.log('🎉 Batch upload completed!');
      console.log(`   Success: ${finalStats.successful}/${finalStats.total}`);
      console.log(`   Compression savings: ${finalStats.compression.totalReduction.toFixed(1)}%`);
      console.log(`   Strategy breakdown:`, finalStats.strategyBreakdown);

      return {
        success: results.length > 0,
        results,
        errors,
        stats: finalStats,
        message: `Uploaded ${results.length}/${imageFiles.length} images successfully`,
        compression: compressionResults.stats
      };

    } catch (error) {
      console.error('❌ Multiple image upload failed:', error);
      return {
        success: false,
        error: error.message,
        code: error.code || 'MULTIPLE_UPLOAD_FAILED'
      };
    }
  }

  // Image compression utility
  async compressImage(file, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        const maxWidth = 1920;
        const maxHeight = 1080;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Convert file to base64
  async convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Get service status for all image services
  getServiceStatus() {
    this.updateServiceStatus();
    
    return {
      service: 'Image Management Service',
      status: 'active',
      strategies: {
        base64: {
          available: true,
          cost: 'FREE',
          maxSize: this.storageThresholds.base64,
          description: 'Store in Firestore as base64'
        },

        imgur: {
          available: this.services.imgur,
          cost: 'FREE (1,250/day)',
          maxSize: this.storageThresholds.imgur,
          description: 'External image hosting service',
          status: imgurService.getServiceStatus()
        },
        cloudinary: {
          available: this.services.cloudinary,
          cost: 'FREE (25GB/month)',
          maxSize: this.storageThresholds.cloudinary,
          description: 'Advanced image optimization service',
          status: cloudinaryService.getServiceStatus()
        }
      },
      thresholds: this.storageThresholds,
      features: [
        'Intelligent storage routing',
        'Automatic compression',
        'Fallback strategies',
        'Multiple image upload',
        'Service health monitoring',
        'Analytics integration'
      ]
    };
  }

  // Get usage statistics for all services
  getUsageStats() {
    return {
      imgur: imgurService.getUsageStats(),
      cloudinary: cloudinaryService.getUsageStats(),
      base64: {
        available: true,
        cost: 'FREE',
        description: 'Unlimited base64 storage in Firestore'
      }
    };
  }

  // Health check for all services
  async healthCheck() {
    const results = {
      base64: { status: 'healthy', details: 'Always available' },
      imgur: { status: 'unknown', details: null },
      cloudinary: { status: 'unknown', details: null }
    };



    try {
      if (this.services.imgur) {
        const imgurStatus = imgurService.getServiceStatus();
        results.imgur.status = imgurStatus.configured ? 'healthy' : 'unavailable';
        results.imgur.details = imgurStatus;
      } else {
        results.imgur.status = 'not_configured';
        results.imgur.details = 'Set REACT_APP_IMGUR_CLIENT_ID in environment variables';
      }
    } catch (error) {
      results.imgur.status = 'error';
      results.imgur.details = error.message;
    }

    try {
      if (this.services.cloudinary) {
        const cloudinaryStatus = cloudinaryService.getServiceStatus();
        results.cloudinary.status = cloudinaryStatus.configured ? 'healthy' : 'unavailable';
        results.cloudinary.details = cloudinaryStatus;
      } else {
        results.cloudinary.status = 'not_configured';
        results.cloudinary.details = 'Set REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET in environment variables';
      }
    } catch (error) {
      results.cloudinary.status = 'error';
      results.cloudinary.details = error.message;
    }

    const overallStatus = Object.values(results).every(r => r.status === 'healthy') ? 'healthy' : 'degraded';

    return {
      overall: overallStatus,
      services: results,
      timestamp: new Date().toISOString()
    };
  }

  // Diagnostic function to help troubleshoot configuration
  getConfigurationHelp() {
    const help = {
      imgur: {
        configured: this.services.imgur,
        required: ['REACT_APP_IMGUR_CLIENT_ID'],
        setup: {
          step1: 'Go to https://api.imgur.com/oauth2/addclient',
          step2: 'Application name: Home Hub',
          step3: 'Authorization type: OAuth 2 authorization with a callback URL',
          step4: 'Authorization callback URL: http://localhost:3000',
          step5: 'Application website: http://localhost:3000',
          step6: 'Click Submit and copy Client ID',
          step7: 'Add REACT_APP_IMGUR_CLIENT_ID=your_client_id to .env'
        },
        benefits: '1,250 uploads/day free, unlimited storage',
        troubleshooting: [
          'Make sure you\'re logged into Imgur',
          'Try simpler application name like "HomeHub"',
          'Verify your email address',
          'Wait 24 hours if account is new'
        ]
      },
      cloudinary: {
        configured: this.services.cloudinary,
        required: ['REACT_APP_CLOUDINARY_CLOUD_NAME', 'REACT_APP_CLOUDINARY_UPLOAD_PRESET'],
        setup: {
          step1: 'Go to https://cloudinary.com/users/register/free',
          step2: 'Sign up and verify email',
          step3: 'Note your Cloud Name from dashboard',
          step4: 'Go to Settings → Upload → Upload presets',
          step5: 'Click "Add upload preset"',
          step6: 'Set Preset name: home_hub_upload',
          step7: 'Set Signing Mode: Unsigned',
          step8: 'Add to .env: REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name',
          step9: 'Add to .env: REACT_APP_CLOUDINARY_UPLOAD_PRESET=home_hub_upload'
        },
        benefits: '25GB storage free, 25GB bandwidth/month',
        troubleshooting: [
          'Verify email address',
          'Check Cloud Name spelling',
          'Ensure upload preset is unsigned',
          'Wait for account activation'
        ]
      },
      base64: {
        configured: true,
        required: [],
        setup: {
          step1: 'No setup required - always available',
          step2: 'Images stored directly in Firestore',
          step3: 'Best for small images (<500KB)'
        },
        benefits: 'Always free, unlimited storage in Firestore',
        limitations: 'Limited to 500KB per image, increases Firestore usage'
      }
    };

    return help;
  }
}

// Create and export singleton instance
export const imageManagementService = new ImageManagementService();

// Note: All methods are available through the imageManagementService instance

export default imageManagementService;
