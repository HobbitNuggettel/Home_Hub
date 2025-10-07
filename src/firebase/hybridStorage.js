/**
 * Hybrid Firebase Storage Service
 * Optimized for Firebase Free Tier (Spark Plan)
 * 
 * Strategy:
 * - Core data in Firestore (FREE)
 * - Small images as base64 in Firestore (FREE)
 * - Large files via external services (Imgur, Cloudinary)
 * - Smart compression and optimization
 */

import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  writeBatch,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './config.js';
import { firebaseAnalyticsService } from './analytics.js';

// Free tier limits and thresholds
const FREE_TIER_LIMITS = {
  FIRESTORE_STORAGE: 1024 * 1024 * 1024, // 1 GiB
  DAILY_READS: 50000,
  DAILY_WRITES: 20000,
  MAX_BASE64_IMAGE_SIZE: 500000, // 500KB for base64 storage
  MAX_DOCUMENT_SIZE: 1048576, // 1MB per document
  BATCH_SIZE: 500
};

// External service configurations
const EXTERNAL_SERVICES = {
  IMGUR: {
    API_URL: 'https://api.imgur.com/3/image',
    CLIENT_ID: process.env.REACT_APP_IMGUR_CLIENT_ID,
    DAILY_LIMIT: 1250
  },
  CLOUDINARY: {
    CLOUD_NAME: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.REACT_APP_CLOUDINARY_API_KEY,
    UPLOAD_PRESET: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
    MONTHLY_LIMIT: 25 * 1024 * 1024 * 1024 // 25GB
  }
};

class HybridFirebaseStorage {
  constructor() {
    this.dailyOperations = {
      reads: 0,
      writes: 0,
      lastReset: new Date().toDateString()
    };
    
    this.compressionQuality = 0.8;
    this.maxRetries = 3;
    
    this.initializeOperationTracking();
  }

  // Initialize operation tracking for free tier monitoring
  async initializeOperationTracking() {
    try {
      const today = new Date().toDateString();
      const stored = localStorage.getItem('firebase_operations');
      
      if (stored) {
        const operations = JSON.parse(stored);
        if (operations.lastReset === today) {
          this.dailyOperations = operations;
        } else {
          // Reset daily counters
          this.dailyOperations = {
            reads: 0,
            writes: 0,
            lastReset: today
          };
          localStorage.setItem('firebase_operations', JSON.stringify(this.dailyOperations));
        }
      }
    } catch (error) {
      console.error('Failed to initialize operation tracking:', error);
    }
  }

  // Track operations for free tier monitoring
  trackOperation(type, count = 1) {
    this.dailyOperations[type] += count;
    localStorage.setItem('firebase_operations', JSON.stringify(this.dailyOperations));
    
    // Log analytics
    firebaseAnalyticsService.logEvent('firebase_operation', {
      operation_type: type,
      operation_count: count,
      daily_reads: this.dailyOperations.reads,
      daily_writes: this.dailyOperations.writes
    });
  }

  // Fallback to local storage when Firebase fails
  getLocalStorageFallback(dataType, userId) {
    try {
      const key = `fallback_${dataType}_${userId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading fallback data for ${dataType}:`, error);
      return [];
    }
  }

  // Save to local storage as fallback
  saveLocalStorageFallback(dataType, userId, data) {
    try {
      const key = `fallback_${dataType}_${userId}`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving fallback data for ${dataType}:`, error);
    }
  }

  // Check if operation is within free tier limits
  canPerformOperation(type, count = 1) {
    const limits = {
      reads: FREE_TIER_LIMITS.DAILY_READS,
      writes: FREE_TIER_LIMITS.DAILY_WRITES
    };
    
    return (this.dailyOperations[type] + count) <= limits[type];
  }

  // Get current usage statistics
  getUsageStats() {
    const readPercentage = (this.dailyOperations.reads / FREE_TIER_LIMITS.DAILY_READS) * 100;
    const writePercentage = (this.dailyOperations.writes / FREE_TIER_LIMITS.DAILY_WRITES) * 100;
    
    return {
      reads: {
        used: this.dailyOperations.reads,
        limit: FREE_TIER_LIMITS.DAILY_READS,
        percentage: Math.min(readPercentage, 100),
        remaining: Math.max(0, FREE_TIER_LIMITS.DAILY_READS - this.dailyOperations.reads)
      },
      writes: {
        used: this.dailyOperations.writes,
        limit: FREE_TIER_LIMITS.DAILY_WRITES,
        percentage: Math.min(writePercentage, 100),
        remaining: Math.max(0, FREE_TIER_LIMITS.DAILY_WRITES - this.dailyOperations.writes)
      },
      lastReset: this.dailyOperations.lastReset
    };
  }

  // User Data Management
  async createUserProfile(userId, profileData) {
    try {
      if (!this.canPerformOperation('writes', 1)) {
        throw new Error('Daily write limit exceeded. Please try again tomorrow.');
      }

      const userRef = doc(db, 'users', userId);
      const userData = {
        profile: {
          ...profileData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        inventory: {},
        recipes: {},
        expenses: {},
        shoppingLists: {},
        households: {},
        settings: {
          theme: 'system',
          notifications: true,
          privacy: 'private'
        },
        usage: {
          totalItems: 0,
          totalRecipes: 0,
          totalExpenses: 0,
          storageUsed: 0
        }
      };

      await setDoc(userRef, userData);
      this.trackOperation('writes', 1);

      return {
        success: true,
        userId,
        message: 'User profile created successfully!'
      };
    } catch (error) {
      console.error('Failed to create user profile:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  async getUserProfile(userId) {
    try {
      if (!this.canPerformOperation('reads', 1)) {
        throw new Error('Daily read limit exceeded. Please try again tomorrow.');
      }

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      this.trackOperation('reads', 1);

      if (userDoc.exists()) {
        return {
          success: true,
          data: { id: userDoc.id, ...userDoc.data() },
          message: 'User profile retrieved successfully!'
        };
      } else {
        return {
          success: false,
          error: 'User profile not found',
          code: 'not-found'
        };
      }
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  async updateUserProfile(userId, updates) {
    try {
      if (!this.canPerformOperation('writes', 1)) {
        throw new Error('Daily write limit exceeded. Please try again tomorrow.');
      }

      const userRef = doc(db, 'users', userId);
      const updateData = {};
      
      // Create proper update paths for nested profile data
      Object.keys(updates).forEach(key => {
        updateData[`profile.${key}`] = updates[key];
      });
      updateData['profile.updatedAt'] = serverTimestamp();

      await updateDoc(userRef, updateData);
      this.trackOperation('writes', 1);

      return {
        success: true,
        message: 'User profile updated successfully!'
      };
    } catch (error) {
      console.error('Failed to update user profile:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Inventory Management
  async addInventoryItem(userId, itemData) {
    try {
      if (!this.canPerformOperation('writes', 1)) {
        throw new Error('Daily write limit exceeded. Please try again tomorrow.');
      }

      const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const userRef = doc(db, 'users', userId);
      
      // Handle image if present
      let processedImageData = null;
      if (itemData.image) {
        const imageResult = await this.handleImageUpload(itemData.image);
        if (imageResult.success) {
          processedImageData = imageResult.data;
        }
      }

      const item = {
        ...itemData,
        id: itemId,
        image: processedImageData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(userRef, {
        [`inventory.${itemId}`]: item,
        'usage.totalItems': arrayUnion(itemId),
        'profile.updatedAt': serverTimestamp()
      });
      this.trackOperation('writes', 1);

      // Save to fallback storage
      this.saveLocalStorageFallback('inventory', userId, [item]);

      return {
        success: true,
        itemId,
        item,
        message: 'Inventory item added successfully!'
      };
    } catch (error) {
      console.error('Failed to add inventory item:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  async getInventoryItems(userId, options = {}) {
    try {
      if (!this.canPerformOperation('reads', 1)) {
        throw new Error('Daily read limit exceeded. Please try again tomorrow.');
      }

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      this.trackOperation('reads', 1);

      if (!userDoc.exists()) {
        return {
          success: false,
          error: 'User not found',
          code: 'not-found'
        };
      }

      const userData = userDoc.data();
      let items = Object.values(userData.inventory || {});

      // Apply filters
      if (options.category) {
        items = items.filter(item => item.category === options.category);
      }

      if (options.location) {
        items = items.filter(item => item.location === options.location);
      }

      if (options.search) {
        const searchTerm = options.search.toLowerCase();
        items = items.filter(item => 
          item.name.toLowerCase().includes(searchTerm) ||
          item.description?.toLowerCase().includes(searchTerm)
        );
      }

      // Apply sorting
      if (options.sortBy) {
        items.sort((a, b) => {
          const aValue = a[options.sortBy];
          const bValue = b[options.sortBy];
          
          if (options.sortOrder === 'desc') {
            return bValue > aValue ? 1 : -1;
          }
          return aValue > bValue ? 1 : -1;
        });
      }

      // Apply pagination
      if (options.limit) {
        const start = options.offset || 0;
        items = items.slice(start, start + options.limit);
      }

      return {
        success: true,
        data: items,
        total: items.length,
        message: 'Inventory items retrieved successfully!'
      };
    } catch (error) {
      console.error('Failed to get inventory items:', error);
      
      // Try fallback to local storage
      try {
        const fallbackItems = this.getLocalStorageFallback('inventory', userId);
        console.log('Using fallback data for inventory items');
        return {
          success: true,
          data: fallbackItems,
          total: fallbackItems.length,
          fallback: true,
          message: 'Inventory items retrieved from local storage (Firebase unavailable)'
        };
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return {
          success: false,
          error: error.message,
          code: error.code
        };
      }
    }
  }

  // Recipe Management
  async addRecipe(userId, recipeData) {
    try {
      if (!this.canPerformOperation('writes', 1)) {
        throw new Error('Daily write limit exceeded. Please try again tomorrow.');
      }

      const recipeId = `recipe_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const userRef = doc(db, 'users', userId);
      
      // Handle recipe image if present
      let processedImageData = null;
      if (recipeData.image) {
        const imageResult = await this.handleImageUpload(recipeData.image);
        if (imageResult.success) {
          processedImageData = imageResult.data;
        }
      }

      const recipe = {
        ...recipeData,
        id: recipeId,
        image: processedImageData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(userRef, {
        [`recipes.${recipeId}`]: recipe,
        'usage.totalRecipes': arrayUnion(recipeId),
        'profile.updatedAt': serverTimestamp()
      });
      this.trackOperation('writes', 1);

      return {
        success: true,
        recipeId,
        recipe,
        message: 'Recipe added successfully!'
      };
    } catch (error) {
      console.error('Failed to add recipe:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Expense Management
  async addExpense(userId, expenseData) {
    try {
      if (!this.canPerformOperation('writes', 1)) {
        throw new Error('Daily write limit exceeded. Please try again tomorrow.');
      }

      const expenseId = `expense_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const userRef = doc(db, 'users', userId);
      
      // Handle receipt image if present
      let processedReceiptData = null;
      if (expenseData.receipt) {
        const imageResult = await this.handleImageUpload(expenseData.receipt);
        if (imageResult.success) {
          processedReceiptData = imageResult.data;
        }
      }

      const expense = {
        ...expenseData,
        id: expenseId,
        receipt: processedReceiptData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(userRef, {
        [`expenses.${expenseId}`]: expense,
        'usage.totalExpenses': arrayUnion(expenseId),
        'profile.updatedAt': serverTimestamp()
      });
      this.trackOperation('writes', 1);

      return {
        success: true,
        expenseId,
        expense,
        message: 'Expense added successfully!'
      };
    } catch (error) {
      console.error('Failed to add expense:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Smart Image Handling
  async handleImageUpload(imageFile) {
    try {
      // Check file size and determine storage strategy
      const fileSize = imageFile.size;
      
      if (fileSize <= FREE_TIER_LIMITS.MAX_BASE64_IMAGE_SIZE) {
        // Store as base64 in Firestore (FREE)
        return await this.storeImageAsBase64(imageFile);
      } else {
        // Use external service for large files
        return await this.uploadToExternalService(imageFile);
      }
    } catch (error) {
      console.error('Failed to handle image upload:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  async storeImageAsBase64(imageFile) {
    try {
      // Compress image if needed
      const compressedFile = await this.compressImage(imageFile, this.compressionQuality);
      
      // Convert to base64
      const base64Data = await this.convertToBase64(compressedFile);
      
      return {
        success: true,
        data: {
          type: 'base64',
          data: base64Data,
          size: compressedFile.size,
          originalSize: imageFile.size,
          mimeType: compressedFile.type
        },
        message: 'Image stored as base64 successfully!'
      };
    } catch (error) {
      console.error('Failed to store image as base64:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  async uploadToExternalService(imageFile) {
    try {
      // Try Imgur first (1,250 uploads/day free)
      if (EXTERNAL_SERVICES.IMGUR.CLIENT_ID) {
        const imgurResult = await this.uploadToImgur(imageFile);
        if (imgurResult.success) {
          return imgurResult;
        }
      }

      // Try Cloudinary as fallback (25GB free)
      if (EXTERNAL_SERVICES.CLOUDINARY.CLOUD_NAME) {
        const cloudinaryResult = await this.uploadToCloudinary(imageFile);
        if (cloudinaryResult.success) {
          return cloudinaryResult;
        }
      }

      // If all external services fail, compress and store as base64
      console.warn('External services failed, falling back to base64 storage');
      return await this.storeImageAsBase64(imageFile);
    } catch (error) {
      console.error('Failed to upload to external service:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  async uploadToImgur(imageFile) {
    try {
      const base64Data = await this.convertToBase64(imageFile);
      const base64Image = base64Data.split(',')[1]; // Remove data:image/...;base64, prefix

      const response = await fetch(EXTERNAL_SERVICES.IMGUR.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Client-ID ${EXTERNAL_SERVICES.IMGUR.CLIENT_ID}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: base64Image,
          type: 'base64'
        })
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          data: {
            type: 'imgur',
            url: result.data.link,
            deleteHash: result.data.deletehash,
            size: imageFile.size,
            mimeType: imageFile.type
          },
          message: 'Image uploaded to Imgur successfully!'
        };
      } else {
        throw new Error(result.data.error || 'Imgur upload failed');
      }
    } catch (error) {
      console.error('Imgur upload failed:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  async uploadToCloudinary(imageFile) {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', EXTERNAL_SERVICES.CLOUDINARY.UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${EXTERNAL_SERVICES.CLOUDINARY.CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      const result = await response.json();

      if (result.secure_url) {
        return {
          success: true,
          data: {
            type: 'cloudinary',
            url: result.secure_url,
            publicId: result.public_id,
            size: result.bytes,
            mimeType: imageFile.type
          },
          message: 'Image uploaded to Cloudinary successfully!'
        };
      } else {
        throw new Error(result.error?.message || 'Cloudinary upload failed');
      }
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Image Processing Utilities
  async compressImage(file, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1920x1080)
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

  async convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Household Management
  async createHousehold(userId, householdData) {
    try {
      if (!this.canPerformOperation('writes', 2)) { // User doc + household doc
        throw new Error('Daily write limit exceeded. Please try again tomorrow.');
      }

      const householdId = `household_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Create household document
      const householdRef = doc(db, 'households', householdId);
      const household = {
        ...householdData,
        id: householdId,
        owner: userId,
        members: [userId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(householdRef, household);
      this.trackOperation('writes', 1);

      // Update user's household list
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`households.${householdId}`]: {
          id: householdId,
          name: householdData.name,
          role: 'owner',
          joinedAt: serverTimestamp()
        },
        'profile.updatedAt': serverTimestamp()
      });
      this.trackOperation('writes', 1);

      return {
        success: true,
        householdId,
        household,
        message: 'Household created successfully!'
      };
    } catch (error) {
      console.error('Failed to create household:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Data Export/Import
  async exportUserData(userId) {
    try {
      if (!this.canPerformOperation('reads', 1)) {
        throw new Error('Daily read limit exceeded. Please try again tomorrow.');
      }

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      this.trackOperation('reads', 1);

      if (!userDoc.exists()) {
        return {
          success: false,
          error: 'User not found',
          code: 'not-found'
        };
      }

      const userData = userDoc.data();
      
      return {
        success: true,
        data: {
          exportDate: new Date().toISOString(),
          userId,
          profile: userData.profile,
          inventory: userData.inventory,
          recipes: userData.recipes,
          expenses: userData.expenses,
          shoppingLists: userData.shoppingLists,
          settings: userData.settings,
          usage: userData.usage
        },
        message: 'User data exported successfully!'
      };
    } catch (error) {
      console.error('Failed to export user data:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Cleanup and Optimization
  async optimizeUserData(userId) {
    try {
      const userDoc = await this.getUserProfile(userId);
      if (!userDoc.success) {
        return userDoc;
      }

      const userData = userDoc.data;
      const optimizations = [];

      // Check for large base64 images that could be moved to external services
      const checkAndOptimizeImages = (items, type) => {
        Object.values(items || {}).forEach(item => {
          if (item.image && item.image.type === 'base64' && item.image.size > FREE_TIER_LIMITS.MAX_BASE64_IMAGE_SIZE) {
            optimizations.push({
              type: 'large_base64_image',
              item: item.id,
              category: type,
              size: item.image.size,
              recommendation: 'Move to external service'
            });
          }
        });
      };

      checkAndOptimizeImages(userData.inventory, 'inventory');
      checkAndOptimizeImages(userData.recipes, 'recipes');
      checkAndOptimizeImages(userData.expenses, 'expenses');

      return {
        success: true,
        optimizations,
        usage: this.getUsageStats(),
        message: 'User data optimization analysis completed!'
      };
    } catch (error) {
      console.error('Failed to optimize user data:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Get inventory categories
  async getInventoryCategories(userId) {
    try {
      if (!this.canPerformOperation('reads', 1)) {
        return {
          success: false,
          error: 'Daily read limit exceeded',
          code: 'LIMIT_EXCEEDED'
        };
      }

      const docRef = doc(db, 'users', userId, 'inventory', 'categories');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        this.trackOperation('reads', 1);
        return {
          success: true,
          data: docSnap.data(),
          message: 'Inventory categories retrieved successfully!'
        };
      } else {
        // Return default categories
        const defaultCategories = ['Electronics', 'Kitchen', 'Bathroom', 'Bedroom', 'Living Room', 'Garage', 'Office', 'Garden', 'Clothing', 'Books', 'Tools', 'Food'];
        return {
          success: true,
          data: defaultCategories,
          message: 'Using default inventory categories'
        };
      }
    } catch (error) {
      console.error('Failed to get inventory categories:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Get spending budgets
  async getSpendingBudgets(userId) {
    try {
      if (!this.canPerformOperation('reads', 1)) {
        return {
          success: false,
          error: 'Daily read limit exceeded',
          code: 'LIMIT_EXCEEDED'
        };
      }

      const budgetsRef = collection(db, 'users', userId, 'spending', 'budgets');
      const budgetsSnap = await getDocs(budgetsRef);
      const budgets = budgetsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.trackOperation('reads', 1);
      return {
        success: true,
        data: budgets,
        total: budgets.length,
        message: 'Spending budgets retrieved successfully!'
      };
    } catch (error) {
      console.error('Failed to get spending budgets:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Get data alerts
  async getDataAlerts(userId) {
    try {
      if (!this.canPerformOperation('reads', 1)) {
        return {
          success: false,
          error: 'Daily read limit exceeded',
          code: 'LIMIT_EXCEEDED'
        };
      }

      const alertsRef = collection(db, 'users', userId, 'analytics', 'alerts');
      const alertsSnap = await getDocs(alertsRef);
      const alerts = alertsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.trackOperation('reads', 1);
      return {
        success: true,
        data: alerts,
        total: alerts.length,
        message: 'Data alerts retrieved successfully!'
      };
    } catch (error) {
      console.error('Failed to get data alerts:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Get data insights
  async getDataInsights(userId) {
    try {
      if (!this.canPerformOperation('reads', 1)) {
        return {
          success: false,
          error: 'Daily read limit exceeded',
          code: 'LIMIT_EXCEEDED'
        };
      }

      const insightsRef = collection(db, 'users', userId, 'analytics', 'insights');
      const insightsSnap = await getDocs(insightsRef);
      const insights = insightsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.trackOperation('reads', 1);
      return {
        success: true,
        data: insights,
        total: insights.length,
        message: 'Data insights retrieved successfully!'
      };
    } catch (error) {
      console.error('Failed to get data insights:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Get data reports
  async getDataReports(userId) {
    try {
      if (!this.canPerformOperation('reads', 1)) {
        return {
          success: false,
          error: 'Daily read limit exceeded',
          code: 'LIMIT_EXCEEDED'
        };
      }

      const reportsRef = collection(db, 'users', userId, 'analytics', 'reports');
      const reportsSnap = await getDocs(reportsRef);
      const reports = reportsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.trackOperation('reads', 1);
      return {
        success: true,
        data: reports,
        total: reports.length,
        message: 'Data reports retrieved successfully!'
      };
    } catch (error) {
      console.error('Failed to get data reports:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Service Status and Health
  getServiceStatus() {
    const usage = this.getUsageStats();
    
    return {
      service: 'Hybrid Firebase Storage',
      status: 'active',
      freeTier: {
        limits: FREE_TIER_LIMITS,
        usage: usage,
        warnings: [
          usage.reads.percentage > 80 ? 'High read usage detected' : null,
          usage.writes.percentage > 80 ? 'High write usage detected' : null
        ].filter(Boolean)
      },
      externalServices: {
        imgur: {
          configured: !!EXTERNAL_SERVICES.IMGUR.CLIENT_ID,
          dailyLimit: EXTERNAL_SERVICES.IMGUR.DAILY_LIMIT
        },
        cloudinary: {
          configured: !!EXTERNAL_SERVICES.CLOUDINARY.CLOUD_NAME,
          monthlyLimit: EXTERNAL_SERVICES.CLOUDINARY.MONTHLY_LIMIT
        }
      },
      features: [
        'Free tier optimization',
        'Smart image handling',
        'Base64 storage for small images',
        'External service integration',
        'Operation tracking',
        'Data compression',
        'Usage analytics'
      ]
    };
  }

  // Smart Home Integration Methods
  async getSmartHomeDevices(userId) {
    try {
      if (!this.canPerformOperation('reads', 1)) {
        return {
          success: false,
          error: 'Daily read limit exceeded',
          code: 'LIMIT_EXCEEDED'
        };
      }

      const devicesRef = collection(db, 'users', userId, 'smartHome', 'devices');
      const devicesSnap = await getDocs(devicesRef);
      const devices = devicesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.trackOperation('reads', 1);
      return {
        success: true,
        data: devices
      };
    } catch (error) {
      console.error('Error getting smart home devices:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  async getSmartHomeAutomations(userId) {
    try {
      if (!this.canPerformOperation('reads', 1)) {
        return {
          success: false,
          error: 'Daily read limit exceeded',
          code: 'LIMIT_EXCEEDED'
        };
      }

      const automationsRef = collection(db, 'users', userId, 'smartHome', 'automations');
      const automationsSnap = await getDocs(automationsRef);
      const automations = automationsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.trackOperation('reads', 1);
      return {
        success: true,
        data: automations
      };
    } catch (error) {
      console.error('Error getting smart home automations:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  async addSmartHomeDevice(userId, deviceData) {
    try {
      if (!this.canPerformOperation('writes', 1)) {
        return {
          success: false,
          error: 'Daily write limit exceeded',
          code: 'LIMIT_EXCEEDED'
        };
      }

      const devicesRef = collection(db, 'users', userId, 'smartHome', 'devices');
      const docRef = await addDoc(devicesRef, {
        ...deviceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      this.trackOperation('writes', 1);
      return {
        success: true,
        data: { id: docRef.id, ...deviceData }
      };
    } catch (error) {
      console.error('Error adding smart home device:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateSmartHomeDevice(userId, deviceId, deviceData) {
    try {
      if (!this.canPerformOperation('writes', 1)) {
        return {
          success: false,
          error: 'Daily write limit exceeded',
          code: 'LIMIT_EXCEEDED'
        };
      }

      const deviceRef = doc(db, 'users', userId, 'smartHome', 'devices', deviceId);
      await updateDoc(deviceRef, {
        ...deviceData,
        updatedAt: serverTimestamp()
      });

      this.trackOperation('writes', 1);
      return {
        success: true,
        data: { id: deviceId, ...deviceData }
      };
    } catch (error) {
      console.error('Error updating smart home device:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteSmartHomeDevice(userId, deviceId) {
    try {
      if (!this.canPerformOperation('writes', 1)) {
        return {
          success: false,
          error: 'Daily write limit exceeded',
          code: 'LIMIT_EXCEEDED'
        };
      }

      const deviceRef = doc(db, 'users', userId, 'smartHome', 'devices', deviceId);
      await deleteDoc(deviceRef);

      this.trackOperation('writes', 1);
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting smart home device:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async addSmartHomeAutomation(userId, automationData) {
    try {
      if (!this.canPerformOperation('writes', 1)) {
        return {
          success: false,
          error: 'Daily write limit exceeded',
          code: 'LIMIT_EXCEEDED'
        };
      }

      const automationsRef = collection(db, 'users', userId, 'smartHome', 'automations');
      const docRef = await addDoc(automationsRef, {
        ...automationData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      this.trackOperation('writes', 1);
      return {
        success: true,
        data: { id: docRef.id, ...automationData }
      };
    } catch (error) {
      console.error('Error adding smart home automation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateSmartHomeAutomation(userId, automationId, automationData) {
    try {
      if (!this.canPerformOperation('writes', 1)) {
        return {
          success: false,
          error: 'Daily write limit exceeded',
          code: 'LIMIT_EXCEEDED'
        };
      }

      const automationRef = doc(db, 'users', userId, 'smartHome', 'automations', automationId);
      await updateDoc(automationRef, {
        ...automationData,
        updatedAt: serverTimestamp()
      });

      this.trackOperation('writes', 1);
      return {
        success: true,
        data: { id: automationId, ...automationData }
      };
    } catch (error) {
      console.error('Error updating smart home automation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteSmartHomeAutomation(userId, automationId) {
    try {
      if (!this.canPerformOperation('writes', 1)) {
        return {
          success: false,
          error: 'Daily write limit exceeded',
          code: 'LIMIT_EXCEEDED'
        };
      }

      const automationRef = doc(db, 'users', userId, 'smartHome', 'automations', automationId);
      await deleteDoc(automationRef);

      this.trackOperation('writes', 1);
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting smart home automation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create and export singleton instance
export const hybridFirebaseStorage = new HybridFirebaseStorage();

// Export individual functions for backward compatibility
export const {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  addInventoryItem,
  getInventoryItems,
  getInventoryCategories,
  getSpendingBudgets,
  getDataAlerts,
  getDataInsights,
  getDataReports,
  addRecipe,
  addExpense,
  handleImageUpload,
  createHousehold,
  exportUserData,
  optimizeUserData,
  getUsageStats,
  getServiceStatus
} = hybridFirebaseStorage;

export default hybridFirebaseStorage;
