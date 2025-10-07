import { 
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
  uploadString,
  getBytes,
  getStream,
  StorageReference,
  UploadTask,
  UploadTaskSnapshot,
  ListResult,
  FullMetadata
} from 'firebase/storage';
import { storage } from './config.js';

// Firebase Storage Service Class
class FirebaseStorageService {
  constructor() {
    this.uploadTasks = new Map();
    this.defaultMetadata = {
      cacheControl: 'public, max-age=3600',
      contentType: 'application/octet-stream'
    };
  }

  // File References
  getStorageRef(path) {
    return ref(storage, path);
  }

  getFileRef(folder, filename) {
    const path = folder ? `${folder}/${filename}` : filename;
    return ref(storage, path);
  }

  // Basic File Operations
  async uploadFile(file, folder = '', metadata = {}) {
    try {
      const filename = this.generateUniqueFilename(file.name);
      const fileRef = this.getFileRef(folder, filename);
      
      const uploadMetadata = {
        ...this.defaultMetadata,
        ...metadata,
        contentType: file.type || this.defaultMetadata.contentType
      };
      
      const snapshot = await uploadBytes(fileRef, file, uploadMetadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        success: true,
        filename,
        path: snapshot.ref.fullPath,
        downloadURL,
        size: snapshot.metadata.size,
        contentType: snapshot.metadata.contentType,
        message: 'File uploaded successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  async uploadString(content, filename, folder = '', metadata = {}) {
    try {
      const fileRef = this.getFileRef(folder, filename);
      
      const uploadMetadata = {
        ...this.defaultMetadata,
        ...metadata,
        contentType: metadata.contentType || 'text/plain'
      };
      
      const snapshot = await uploadString(fileRef, content, 'raw', uploadMetadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        success: true,
        filename,
        path: snapshot.ref.fullPath,
        downloadURL,
        size: snapshot.metadata.size,
        contentType: snapshot.metadata.contentType,
        message: 'String uploaded successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Resumable Uploads
  startResumableUpload(file, folder = '', metadata = {}, onProgress = null) {
    try {
      const filename = this.generateUniqueFilename(file.name);
      const fileRef = this.getFileRef(folder, filename);
      
      const uploadMetadata = {
        ...this.defaultMetadata,
        ...metadata,
        contentType: file.type || this.defaultMetadata.contentType
      };
      
      const uploadTask = uploadBytesResumable(fileRef, file, uploadMetadata);
      const taskId = this.generateTaskId();
      
      this.uploadTasks.set(taskId, uploadTask);
      
      // Set up progress monitoring
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress({
              taskId,
              state: snapshot.state,
              progress,
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes
            });
          }
        },
        (error) => {
          console.error('Upload error:', error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            this.uploadTasks.delete(taskId);
            
            if (onProgress) {
              onProgress({
                taskId,
                state: 'completed',
                progress: 100,
                downloadURL,
                path: uploadTask.snapshot.ref.fullPath,
                size: uploadTask.snapshot.metadata.size
              });
            }
          } catch (error) {
            console.error('Error getting download URL:', error);
          }
        }
      );
      
      return {
        success: true,
        taskId,
        filename,
        path: fileRef.fullPath,
        message: 'Resumable upload started!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  pauseUpload(taskId) {
    const uploadTask = this.uploadTasks.get(taskId);
    if (uploadTask) {
      uploadTask.pause();
      return {
        success: true,
        message: 'Upload paused successfully!'
      };
    }
    return {
      success: false,
      error: 'Upload task not found'
    };
  }

  resumeUpload(taskId) {
    const uploadTask = this.uploadTasks.get(taskId);
    if (uploadTask) {
      uploadTask.resume();
      return {
        success: true,
        message: 'Upload resumed successfully!'
      };
    }
    return {
      success: false,
      error: 'Upload task not found'
    };
  }

  cancelUpload(taskId) {
    const uploadTask = this.uploadTasks.get(taskId);
    if (uploadTask) {
      uploadTask.cancel();
      this.uploadTasks.delete(taskId);
      return {
        success: true,
        message: 'Upload cancelled successfully!'
      };
    }
    return {
      success: false,
      error: 'Upload task not found'
    };
  }

  // File Download and Access
  async getDownloadURL(path) {
    try {
      const fileRef = this.getStorageRef(path);
      const downloadURL = await getDownloadURL(fileRef);
      
      return {
        success: true,
        downloadURL,
        message: 'Download URL retrieved successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  async downloadFile(path) {
    try {
      const fileRef = this.getStorageRef(path);
      const bytes = await getBytes(fileRef);
      
      return {
        success: true,
        data: bytes,
        size: bytes.length,
        message: 'File downloaded successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // File Management
  async deleteFile(path) {
    try {
      const fileRef = this.getStorageRef(path);
      await deleteObject(fileRef);
      
      return {
        success: true,
        message: 'File deleted successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  async deleteFolder(folderPath) {
    try {
      const folderRef = this.getStorageRef(folderPath);
      const result = await listAll(folderRef);
      
      // Delete all files in the folder
      const deletePromises = result.items.map(item => deleteObject(item));
      await Promise.all(deletePromises);
      
      // Delete all subfolders recursively
      const subfolderPromises = result.prefixes.map(prefix => 
        this.deleteFolder(prefix.fullPath)
      );
      await Promise.all(subfolderPromises);
      
      return {
        success: true,
        deletedFiles: result.items.length,
        deletedFolders: result.prefixes.length,
        message: 'Folder deleted successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  async listFiles(folderPath = '', maxResults = 1000) {
    try {
      const folderRef = this.getStorageRef(folderPath);
      const result = await listAll(folderRef);
      
      const files = result.items.slice(0, maxResults);
      const folders = result.prefixes.slice(0, maxResults);
      
      return {
        success: true,
        files: files.map(item => ({
          name: item.name,
          path: item.fullPath,
          type: 'file'
        })),
        folders: folders.map(prefix => ({
          name: prefix.name,
          path: prefix.fullPath,
          type: 'folder'
        })),
        totalFiles: result.items.length,
        totalFolders: result.prefixes.length,
        message: 'File list retrieved successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  async getFileMetadata(path) {
    try {
      const fileRef = this.getStorageRef(path);
      const metadata = await getMetadata(fileRef);
      
      return {
        success: true,
        metadata: {
          name: metadata.name,
          size: metadata.size,
          contentType: metadata.contentType,
          timeCreated: metadata.timeCreated,
          timeUpdated: metadata.updated,
          cacheControl: metadata.cacheControl,
          customMetadata: metadata.customMetadata
        },
        message: 'File metadata retrieved successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  async updateFileMetadata(path, metadata) {
    try {
      const fileRef = this.getStorageRef(path);
      await updateMetadata(fileRef, metadata);
      
      return {
        success: true,
        message: 'File metadata updated successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Image Processing and Optimization
  async uploadImage(file, folder = '', options = {}) {
    try {
      const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.8,
        format = 'webp',
        resize = true
      } = options;
      
      let processedFile = file;
      
      if (resize && file.type.startsWith('image/')) {
        processedFile = await this.resizeImage(file, maxWidth, maxHeight, quality, format);
      }
      
      const result = await this.uploadFile(processedFile, folder, {
        contentType: processedFile.type,
        customMetadata: {
          originalName: file.name,
          originalSize: file.size,
          processed: resize.toString(),
          maxWidth: maxWidth.toString(),
          maxHeight: maxHeight.toString(),
          quality: quality.toString(),
          format: format
        }
      });
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  async resizeImage(file, maxWidth, maxHeight, quality, format) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
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
        
        // Draw and resize image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          const resizedFile = new File([blob], file.name, {
            type: `image/${format}`,
            lastModified: Date.now()
          });
          resolve(resizedFile);
        }, `image/${format}`, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // File Validation
  validateFile(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = [],
      allowedExtensions = []
    } = options;
    
    const errors = [];
    
    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(maxSize)})`);
    }
    
    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type '${file.type}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    // Check file extension
    if (allowedExtensions.length > 0) {
      const extension = file.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        errors.push(`File extension '${extension}' is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Utility Methods
  generateUniqueFilename(originalName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    const nameWithoutExtension = originalName.substring(0, originalName.lastIndexOf('.'));
    
    return `${nameWithoutExtension}_${timestamp}_${random}.${extension}`;
  }

  generateTaskId() {
    return `upload_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }

  isImageFile(file) {
    return file.type.startsWith('image/');
  }

  isVideoFile(file) {
    return file.type.startsWith('video/');
  }

  isAudioFile(file) {
    return file.type.startsWith('audio/');
  }

  isDocumentFile(file) {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/html'
    ];
    return documentTypes.includes(file.type);
  }

  // Error Handling
  getStorageErrorMessage(errorCode) {
    const errorMessages = {
      'storage/unauthorized': 'You do not have permission to access this file.',
      'storage/canceled': 'The upload was canceled.',
      'storage/unknown': 'An unknown error occurred.',
      'storage/invalid-checksum': 'The file checksum is invalid.',
      'storage/retry-limit-exceeded': 'The retry limit was exceeded.',
      'storage/invalid-url': 'The URL is invalid.',
      'storage/invalid-argument': 'An invalid argument was provided.',
      'storage/no-default-bucket': 'No default bucket is configured.',
      'storage/cannot-slice-blob': 'The blob cannot be sliced.',
      'storage/server-file-wrong-size': 'The server file has the wrong size.',
      'storage/quota-exceeded': 'Storage quota exceeded.',
      'storage/unauthenticated': 'You must be authenticated to perform this operation.',
      'storage/retry-limit-exceeded': 'The retry limit was exceeded.',
      'storage/invalid-checksum': 'The file checksum is invalid.',
      'storage/canceled': 'The upload was canceled.',
      'storage/unknown': 'An unknown error occurred.'
    };
    
    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }

  // Cleanup
  cleanup() {
    // Cancel all ongoing uploads
    this.uploadTasks.forEach((uploadTask, taskId) => {
      uploadTask.cancel();
    });
    this.uploadTasks.clear();
  }
}

// Create and export singleton instance
export const firebaseStorageService = new FirebaseStorageService();

// Note: All methods are available through the firebaseStorageService instance

export default firebaseStorageService;
