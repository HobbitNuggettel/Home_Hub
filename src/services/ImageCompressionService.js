/**
 * Image Compression Service
 * Automatically compresses images after capture for optimal storage and performance
 * 
 * Features:
 * - Smart compression based on image type and size
 * - Multiple quality levels for different use cases
 * - Automatic format optimization (WebP when possible)
 * - Metadata preservation and cleanup
 * - Compression analytics and reporting
 */

class ImageCompressionService {
  constructor() {
    // Compression quality presets
    this.qualityPresets = {
      thumbnail: 0.6,      // 60% - for thumbnails and previews
      low: 0.7,            // 70% - for web display
      medium: 0.8,         // 80% - for general use (default)
      high: 0.9,           // 90% - for high quality needs
      original: 1.0        // 100% - no compression
    };

    // Size thresholds for different compression levels
    this.sizeThresholds = {
      tiny: 100 * 1024,        // 100KB - minimal compression
      small: 500 * 1024,       // 500KB - light compression
      medium: 2 * 1024 * 1024, // 2MB - moderate compression
      large: 5 * 1024 * 1024,  // 5MB - heavy compression
      huge: 10 * 1024 * 1024   // 10MB - maximum compression
    };

    // Maximum dimensions for different use cases
    this.dimensionLimits = {
      thumbnail: { width: 150, height: 150 },
      small: { width: 300, height: 300 },
      medium: { width: 800, height: 800 },
      large: { width: 1200, height: 1200 },
      original: { width: 1920, height: 1080 }
    };

    // Supported formats and their optimal settings
    this.formatSettings = {
      'image/jpeg': {
        quality: 0.8,
        format: 'jpeg',
        progressive: true
      },
      'image/png': {
        quality: 0.9,
        format: 'png',
        lossless: true
      },
      'image/webp': {
        quality: 0.8,
        format: 'webp',
        modern: true
      },
      'image/heic': {
        quality: 0.8,
        format: 'jpeg', // Convert HEIC to JPEG
        modern: false
      }
    };
  }

  // Main compression function - called immediately after image capture
  async compressImageAfterCapture(imageFile, options = {}) {
    try {
      console.log('🖼️ Starting automatic image compression...');
      console.log(`   Original size: ${(imageFile.size / (1024 * 1024)).toFixed(2)}MB`);
      console.log(`   Original type: ${imageFile.type}`);
      console.log(`   Original dimensions: ${await this.getImageDimensions(imageFile)}`);

      // Determine optimal compression settings based on image and use case
      const compressionSettings = this.getOptimalCompressionSettings(imageFile, options);
      
      // Apply compression
      const compressedFile = await this.applyCompression(imageFile, compressionSettings);
      
      // Generate thumbnail if requested
      let thumbnailFile = null;
      if (options.generateThumbnail !== false) {
        thumbnailFile = await this.generateThumbnail(compressedFile, options.thumbnailSize || 'small');
      }

      // Calculate compression statistics
      const compressionStats = this.calculateCompressionStats(imageFile, compressedFile, thumbnailFile);
      
      // Log compression results
      this.logCompressionResults(compressionStats);
      
      // Return compressed image with metadata
      return {
        success: true,
        original: {
          file: imageFile,
          size: imageFile.size,
          type: imageFile.type,
          dimensions: await this.getImageDimensions(imageFile)
        },
        compressed: {
          file: compressedFile,
          size: compressedFile.size,
          type: compressedFile.type,
          dimensions: await this.getImageDimensions(compressedFile),
          settings: compressionSettings
        },
        thumbnail: thumbnailFile ? {
          file: thumbnailFile,
          size: thumbnailFile.size,
          type: thumbnailFile.type,
          dimensions: await this.getImageDimensions(thumbnailFile)
        } : null,
        stats: compressionStats,
        recommendations: this.getStorageRecommendations(compressionStats)
      };

    } catch (error) {
      console.error('❌ Image compression failed:', error);
      
      // Return original file if compression fails
      return {
        success: false,
        error: error.message,
        original: { file: imageFile, size: imageFile.size, type: imageFile.type },
        compressed: { file: imageFile, size: imageFile.size, type: imageFile.type },
        thumbnail: null,
        stats: { compressionRatio: 1, sizeReduction: 0 },
        recommendations: ['Use original file due to compression failure']
      };
    }
  }

  // Determine optimal compression settings
  getOptimalCompressionSettings(imageFile, options = {}) {
    const fileSize = imageFile.size;
    const fileType = imageFile.type;
    const useCase = options.useCase || 'general';
    
    // Base quality on file size
    let quality = this.qualityPresets.medium;
    if (fileSize > this.sizeThresholds.huge) {
      quality = this.qualityPresets.low;
    } else if (fileSize > this.sizeThresholds.large) {
      quality = this.qualityPresets.medium;
    } else if (fileSize > this.sizeThresholds.medium) {
      quality = this.qualityPresets.high;
    } else if (fileSize > this.sizeThresholds.small) {
      quality = this.qualityPresets.high;
    }

    // Adjust quality based on use case
    switch (useCase) {
      case 'profile':
        quality = Math.min(quality, this.qualityPresets.high);
        break;
      case 'document':
        quality = Math.min(quality, this.qualityPresets.high);
        break;
      case 'social':
        quality = Math.min(quality, this.qualityPresets.medium);
        break;
      case 'storage':
        quality = Math.min(quality, this.qualityPresets.low);
        break;
      case 'web':
        quality = Math.min(quality, this.qualityPresets.medium);
        break;
    }

    // Determine optimal format
    let targetFormat = 'jpeg';
    if (fileType === 'image/png' && options.preserveTransparency) {
      targetFormat = 'png';
    } else if (this.supportsWebP() && options.optimizeFormat !== false) {
      targetFormat = 'webp';
    }

    // Determine dimensions
    let maxDimensions = this.dimensionLimits.medium;
    if (fileSize > this.sizeThresholds.huge) {
      maxDimensions = this.dimensionLimits.small;
    } else if (fileSize > this.sizeThresholds.large) {
      maxDimensions = this.dimensionLimits.medium;
    }

    return {
      quality,
      format: targetFormat,
      maxWidth: maxDimensions.width,
      maxHeight: maxDimensions.height,
      preserveMetadata: options.preserveMetadata !== false,
      progressive: targetFormat === 'jpeg',
      optimize: true
    };
  }

  // Apply compression with the determined settings
  async applyCompression(imageFile, settings) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        const maxWidth = settings.maxWidth;
        const maxHeight = settings.maxHeight;

        // Maintain aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Apply compression settings
        if (settings.optimize) {
          // Enable image smoothing for better quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Determine MIME type
        let mimeType = 'image/jpeg';
        if (settings.format === 'png') {
          mimeType = 'image/png';
        } else if (settings.format === 'webp') {
          mimeType = 'image/webp';
        }

        // Create compressed file
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob], this.generateCompressedFileName(imageFile.name, settings), {
            type: mimeType,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }, mimeType, settings.quality);
      };

      img.src = URL.createObjectURL(imageFile);
    });
  }

  // Generate thumbnail
  async generateThumbnail(imageFile, size = 'small') {
    const thumbnailSettings = {
      quality: this.qualityPresets.thumbnail,
      format: 'jpeg',
      maxWidth: this.dimensionLimits[size].width,
      maxHeight: this.dimensionLimits[size].height,
      preserveMetadata: false,
      progressive: false,
      optimize: true
    };

    return await this.applyCompression(imageFile, thumbnailSettings);
  }

  // Get image dimensions
  async getImageDimensions(imageFile) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(imageFile);
    });
  }

  // Check WebP support
  supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  // Generate compressed filename
  generateCompressedFileName(originalName, settings) {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const extension = settings.format === 'webp' ? 'webp' : 
                     settings.format === 'png' ? 'png' : 'jpg';
    
    return `${nameWithoutExt}_compressed_${Math.round(settings.quality * 100)}.${extension}`;
  }

  // Calculate compression statistics
  calculateCompressionStats(originalFile, compressedFile, thumbnailFile) {
    const originalSize = originalFile.size;
    const compressedSize = compressedFile.size;
    const thumbnailSize = thumbnailFile ? thumbnailFile.size : 0;

    const compressionRatio = compressedSize / originalSize;
    const sizeReduction = ((originalSize - compressedSize) / originalSize) * 100;
    const totalSize = compressedSize + thumbnailSize;
    const totalReduction = ((originalSize - totalSize) / originalSize) * 100;

    return {
      originalSize,
      compressedSize,
      thumbnailSize,
      totalSize,
      compressionRatio: compressionRatio.toFixed(3),
      sizeReduction: sizeReduction.toFixed(1),
      totalReduction: totalReduction.toFixed(1),
      savings: {
        bytes: originalSize - totalSize,
        megabytes: ((originalSize - totalSize) / (1024 * 1024)).toFixed(2),
        percentage: totalReduction.toFixed(1)
      }
    };
  }

  // Get storage recommendations based on compression results
  getStorageRecommendations(stats) {
    const recommendations = [];
    
    if (stats.totalSize <= 500 * 1024) { // 500KB
      recommendations.push('Use base64 storage in Firestore (FREE)');
    } else if (stats.totalSize <= 5 * 1024 * 1024) { // 5MB
      recommendations.push('Use Imgur (1,250 uploads/day FREE)');
    } else if (stats.totalSize <= 10 * 1024 * 1024) { // 10MB
      recommendations.push('Use Cloudinary (25GB/month FREE)');
    } else {
      recommendations.push('Consider further compression or splitting image');
    }

    if (stats.sizeReduction > 70) {
      recommendations.push('Excellent compression achieved!');
    } else if (stats.sizeReduction > 50) {
      recommendations.push('Good compression, consider quality settings');
    } else if (stats.sizeReduction < 20) {
      recommendations.push('Minimal compression, image may already be optimized');
    }

    return recommendations;
  }

  // Log compression results
  logCompressionResults(stats) {
    console.log('✅ Compression completed successfully!');
    console.log(`   Original: ${(stats.originalSize / (1024 * 1024)).toFixed(2)}MB`);
    console.log(`   Compressed: ${(stats.compressedSize / (1024 * 1024)).toFixed(2)}MB`);
    if (stats.thumbnailSize > 0) {
      console.log(`   Thumbnail: ${(stats.thumbnailSize / (1024 * 1024)).toFixed(2)}MB`);
    }
    console.log(`   Total reduction: ${stats.totalReduction}%`);
    console.log(`   Storage savings: ${stats.savings.megabytes}MB`);
    console.log(`   Recommendations: ${stats.recommendations.join(', ')}`);
  }

  // Batch compression for multiple images
  async compressMultipleImages(imageFiles, options = {}) {
    const results = [];
    const totalOriginalSize = imageFiles.reduce((sum, file) => sum + file.size, 0);
    let totalCompressedSize = 0;
    let totalThumbnailSize = 0;

    console.log(`🖼️ Starting batch compression of ${imageFiles.length} images...`);
    console.log(`   Total original size: ${(totalOriginalSize / (1024 * 1024)).toFixed(2)}MB`);

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      console.log(`   Processing image ${i + 1}/${imageFiles.length}: ${file.name}`);
      
      try {
        const result = await this.compressImageAfterCapture(file, options);
        results.push(result);
        
        if (result.success) {
          totalCompressedSize += result.compressed.file.size;
          if (result.thumbnail) {
            totalThumbnailSize += result.thumbnail.file.size;
          }
        }
      } catch (error) {
        console.error(`   Failed to compress ${file.name}:`, error);
        results.push({
          success: false,
          error: error.message,
          original: { file, size: file.size, type: file.type },
          compressed: { file, size: file.size, type: file.type },
          thumbnail: null,
          stats: { compressionRatio: 1, sizeReduction: 0 }
        });
      }
    }

    const batchStats = {
      totalImages: imageFiles.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalOriginalSize,
      totalCompressedSize,
      totalThumbnailSize,
      totalSize: totalCompressedSize + totalThumbnailSize,
      totalReduction: ((totalOriginalSize - (totalCompressedSize + totalThumbnailSize)) / totalOriginalSize) * 100
    };

    console.log('🎉 Batch compression completed!');
    console.log(`   Success: ${batchStats.successful}/${batchStats.totalImages}`);
    console.log(`   Total reduction: ${batchStats.totalReduction.toFixed(1)}%`);
    console.log(`   Storage savings: ${((totalOriginalSize - batchStats.totalSize) / (1024 * 1024)).toFixed(2)}MB`);

    return {
      results,
      stats: batchStats
    };
  }

  // Get service status
  getServiceStatus() {
    return {
      service: 'Image Compression Service',
      status: 'active',
      qualityPresets: this.qualityPresets,
      sizeThresholds: this.sizeThresholds,
      dimensionLimits: this.dimensionLimits,
      formatSettings: this.formatSettings,
      features: [
        'Automatic compression after capture',
        'Smart quality optimization',
        'Multiple format support (JPEG, PNG, WebP)',
        'Thumbnail generation',
        'Batch processing',
        'Compression analytics',
        'Storage recommendations'
      ]
    };
  }
}

// Create and export singleton instance
export const imageCompressionService = new ImageCompressionService();

// Export individual functions for backward compatibility
export const {
  compressImageAfterCapture,
  compressMultipleImages,
  generateThumbnail,
  getOptimalCompressionSettings,
  getServiceStatus
} = imageCompressionService;

export default imageCompressionService;
