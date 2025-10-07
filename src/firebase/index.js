// Firebase Services Index - TEMPORARILY DISABLED
// This file provides a unified interface for all Firebase services

// Core Firebase Configuration
export { default as firebaseApp } from './config.js';
export { auth, db, storage, analytics } from './config.js';

// Authentication Services
export { default as firebaseAuthService } from './auth.js';

// Firestore Services - DISABLED
// export { default as firestoreService } from './firestore.js';

// Storage Services - DISABLED
// export { default as firebaseStorageService } from './storage.js';

// Analytics Services - DISABLED
// export { default as firebaseAnalyticsService } from './analytics.js';

// Hybrid Storage Services - DISABLED
// export { default as hybridFirebaseStorage } from './hybridStorage.js';
// export {
//   createUserProfile,
//   getUserProfile,
//   getInventoryItems,
//   handleImageUpload,
//   exportUserData,
//   optimizeUserData,
//   getUsageStats
// } from './hybridStorage.js';

// User Data Structure Templates - DISABLED
// export { default as userDataStructure } from './userDataStructure.js';
// export {
//   USER_DATA_TEMPLATES,
//   VALIDATION_RULES,
//   DataOptimizer,
//   createDefaultUserData,
//   createInventoryItem,
//   createRecipe,
//   createExpense,
//   createShoppingList,
//   createHousehold
// } from './userDataStructure.js';

// Image Compression Service - DISABLED
// export { default as imageCompressionService } from '../services/ImageCompressionService.js';
// export {
//   compressImageAfterCapture,
//   compressMultipleImages,
//   generateThumbnail,
//   getOptimalCompressionSettings,
//   getServiceStatus
// } from '../services/ImageCompressionService.js';

// Unified Firebase Service Class - DISABLED
// class FirebaseService {
//   constructor() {
//     this.auth = firebaseAuthService;
//     this.storage = firebaseStorageService;
//     this.analytics = firebaseAnalyticsService;
//     this.hybridStorage = hybridFirebaseStorage;
//     
//     this.isInitialized = false;
//     this.initializationPromise = null;
//   }

//   // Initialize all Firebase services
//   async initialize() {
//     if (this.isInitialized) {
//       return { success: true, message: 'Firebase already initialized' };
//     }

//     if (this.initializationPromise) {
//       return this.initializationPromise;
//     }

//     this.initializationPromise = this.performInitialization();
//     return this.initializationPromise;
//   }

//   async performInitialization() {
//     try {
//       // Initialize analytics
//       await this.analytics.initializeAnalytics();
//       
//       // Set initialization flag
//       this.isInitialized = true;
//       
//       return {
//         success: true,
//         message: 'All Firebase services initialized successfully!',
//         services: {
//           auth: true,
//           firestore: true,
//           storage: true,
//           analytics: true
//         }
//       };
    // } catch (error) {
    //   console.error('Firebase initialization failed:', error);
    //   return {
    //     success: false,
    //     error: error.message,
    //     code: error.code
    //   };
    // }
  // }

  // // Check if all services are ready
  // isReady() {
  //   return this.isInitialized;
  // }

  // // Get service status
  // getServiceStatus() {
  //   return {
  //     auth: this.auth.isAuthenticated ? 'ready' : 'initializing',
  //     firestore: 'ready',
  //     storage: 'ready',
  //     analytics: this.analytics.isAnalyticsEnabled() ? 'enabled' : 'disabled',
  //     hybridStorage: 'ready',
  //     overall: this.isInitialized ? 'ready' : 'initializing'
  //   };
  // }

  // // Cleanup all services
  // cleanup() {
  //   try {
  //     // Cleanup storage uploads
  //     this.storage.cleanup();
      
  //     // Remove all firestore listeners
  //     this.firestore.removeAllListeners();
      
  //     // Clear analytics data
  //     this.analytics.clearCustomEvents();
  //     this.analytics.clearUserProperties();
      
  //     this.isInitialized = false;
  //     this.initializationPromise = null;
      
  //     return {
  //       success: true,
  //       message: 'All Firebase services cleaned up successfully!'
  //     };
  //   } catch (error) {
  //     console.error('Firebase cleanup failed:', error);
  //     return {
  //       success: false,
  //       error: error.message,
  //       code: error.code
  //     };
  //   }
  // }

  // // Health check for all services
  // async healthCheck() {
  //   const results = {
  //     auth: { status: 'unknown', details: null },
  //     firebaseStorageService: 'ready',
  //     analytics: { status: 'unknown', details: null },
  //     hybridStorage: { status: 'unknown', details: null }
  //   };

  //   try {
  //     // Check auth service
  //     results.auth.status = this.auth.isAuthenticated() ? 'authenticated' : 'unauthenticated';
  //     results.auth.details = this.auth.getCurrentUser();
  //   } catch (error) {
  //     results.auth.status = 'error';
  //     results.auth.details = error.message;
  //   }

  //   try {
  //     // Check firestore service (try a simple operation)
  //     const testResult = await this.firestore.documentExists('_health_check', 'test');
  //     results.firestore.status = testResult ? 'healthy' : 'error';
  //     results.firestore.details = testResult;
  //   } catch (error) {
  //     results.firestore.status = 'error';
  //     results.firestore.details = error.message;
  //   }

  //   try {
  //     // Check storage service
  //     results.storage.status = 'healthy';
  //     results.storage.details = 'Storage service ready';
  //   } catch (error) {
  //     results.storage.status = 'error';
  //     results.storage.details = error.message;
  //   }

  //   try {
  //     // Check analytics service
  //     results.analytics.status = this.analytics.isAnalyticsEnabled() ? 'enabled' : 'disabled';
  //     results.analytics.details = this.analytics.getUserProperties();
  //   } catch (error) {
      // results.analytics.status = 'error';
      // results.analytics.details = error.message;
    // }

    // try {
    //   // Check hybrid storage service
    //   const hybridStatus = this.hybridStorage.getServiceStatus();
    //   results.hybridStorage.status = 'healthy';
    //   results.hybridStorage.details = hybridStatus;
    // } catch (error) {
    //   results.hybridStorage.status = 'error';
    //   results.hybridStorage.details = error.message;
    // }

    // const overallStatus = Object.values(results).every(r => r.status !== 'error') ? 'healthy' : 'degraded';

    // return {
    //   overall: overallStatus,
    //   timestamp: new Date().toISOString(),
    //   services: results
    // };
  // }
// }

// // Create and export singleton instance - DISABLED
// export const firebaseService = new FirebaseService();

// // Export the unified service as default - DISABLED
// export default firebaseService;

// // Convenience exports for common operations - DISABLED
// export const {
//   auth: firebaseAuth,
//   firestore: firebaseFirestore,
//   storage: firebaseStorage,
//   analytics: firebaseAnalytics
// } = firebaseService;
