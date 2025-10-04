class ImageManagementService {
  constructor() {
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    this.compressionQuality = 0.8;
    this.thumbnailSize = 300;
  }

  // Validate image file
  validateImage(file) {
    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return { isValid: false, errors };
    }

    if (!this.allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not supported`);
    }

    if (file.size > this.maxFileSize) {
      errors.push(`File size ${file.size} exceeds maximum allowed size of ${this.maxFileSize}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Compress image
  async compressImage(file, quality = this.compressionQuality) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Generate thumbnail
  async generateThumbnail(file, size = this.thumbnailSize) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const { width, height } = img;
        const aspectRatio = width / height;

        let newWidth, newHeight;
        if (aspectRatio > 1) {
          newWidth = size;
          newHeight = size / aspectRatio;
        } else {
          newHeight = size;
          newWidth = size * aspectRatio;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to generate thumbnail'));
            }
          },
          'image/jpeg',
          0.8
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Upload image to cloud storage
  async uploadImage(file, options = {}) {
    const validation = this.validateImage(file);
    if (!validation.isValid) {
      throw new Error(`Image validation failed: ${validation.errors.join(', ')}`);
    }

    try {
      // Compress image if needed
      const compressedFile = await this.compressImage(file, options.quality);

      // Generate thumbnail
      const thumbnail = await this.generateThumbnail(compressedFile, options.thumbnailSize);

      // Upload to cloud storage (implement based on your storage provider)
      const uploadResult = await this.uploadToCloud(compressedFile, thumbnail, options);

      return {
        success: true,
        url: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        metadata: {
          originalSize: file.size,
          compressedSize: compressedFile.size,
          compressionRatio: ((file.size - compressedFile.size) / file.size) * 100,
          dimensions: await this.getImageDimensions(file),
        },
      };
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  // Upload to cloud storage (implement based on your provider)
  async uploadToCloud(file, thumbnail, options) {
  // This is a placeholder - implement based on your cloud storage provider
  // Examples: AWS S3, Cloudinary, Firebase Storage, etc.

    const formData = new FormData();
    formData.append('file', file);
    formData.append('thumbnail', thumbnail);
    formData.append('options', JSON.stringify(options));

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // Get image dimensions
  async getImageDimensions(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Delete image
  async deleteImage(imageId) {
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Image deletion failed: ${error.message}`);
    }
  }

  // Get image metadata
  async getImageMetadata(imageId) {
    try {
      const response = await fetch(`/api/images/${imageId}/metadata`);

      if (!response.ok) {
        throw new Error(`Failed to get metadata: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get image metadata: ${error.message}`);
    }
  }

  // Update image metadata
  async updateImageMetadata(imageId, metadata) {
    try {
      const response = await fetch(`/api/images/${imageId}/metadata`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to update image metadata: ${error.message}`);
    }
  }

  // Search images
  async searchImages(query, filters = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        ...filters,
      });

      const response = await fetch(`/api/images/search?${params}`);

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Image search failed: ${error.message}`);
    }
  }

  // Get image statistics
  async getImageStats() {
    try {
      const response = await fetch('/api/images/stats');

      if (!response.ok) {
        throw new Error(`Failed to get stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get image statistics: ${error.message}`);
    }
  }

  // Batch upload images
  async batchUploadImages(files, options = {}) {
    const results = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.uploadImage(files[i], options);
        results.push({
          index: i,
          filename: files[i].name,
          ...result,
        });
      } catch (error) {
        errors.push({
          index: i,
          filename: files[i].name,
          error: error.message,
        });
      }
    }

    return {
      results,
      errors,
      successCount: results.length,
      errorCount: errors.length,
    };
  }

  // Optimize image for web
  async optimizeForWeb(file, options = {}) {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'jpeg',
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to optimize image'));
            }
          },
          `image/${format}`,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Get service configuration
  getConfig() {
    return {
      maxFileSize: this.maxFileSize,
      allowedTypes: this.allowedTypes,
      compressionQuality: this.compressionQuality,
      thumbnailSize: this.thumbnailSize,
    };
  }

  // Update service configuration
  updateConfig(config) {
    if (config.maxFileSize) this.maxFileSize = config.maxFileSize;
    if (config.allowedTypes) this.allowedTypes = config.allowedTypes;
    if (config.compressionQuality) this.compressionQuality = config.compressionQuality;
    if (config.thumbnailSize) this.thumbnailSize = config.thumbnailSize;
  }
}

const imageManagementService = new ImageManagementService();
export default imageManagementService;
export { imageManagementService };