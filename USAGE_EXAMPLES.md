# 🚀 Home Hub - Usage Examples & API Reference

## 📋 **Quick Start**

### **1. Basic Setup**
```javascript
import { 
  hybridFirebaseStorage, 
  imageManagementService,
  imgurService,
  cloudinaryService 
} from './src/services';

// Check service status
const status = await imageManagementService.healthCheck();
console.log('All services status:', status);
```

### **2. Environment Check**
```javascript
// Verify all services are configured
const imgurStatus = imgurService.getServiceStatus();
const cloudinaryStatus = cloudinaryService.getServiceStatus();
const firebaseStatus = hybridFirebaseStorage.getServiceStatus();

console.log('Imgur:', imgurStatus.configured);
console.log('Cloudinary:', cloudinaryStatus.configured);
console.log('Firebase:', firebaseStatus.status);
```

---

## 🖼️ **Image Management Examples**

### **1. Single Image Upload**
```javascript
// Upload with automatic routing
const fileInput = document.getElementById('imageInput');
const file = fileInput.files[0];

const result = await imageManagementService.uploadImage(file, {
  title: 'My Home Photo',
  description: 'Living room setup',
  tags: ['home', 'interior']
});

if (result.success) {
  console.log('Upload successful!');
  console.log('Strategy used:', result.strategy);
  console.log('Service:', result.service);
  console.log('Image data:', result.data);
} else {
  console.error('Upload failed:', result.error);
}
```

### **2. Multiple Image Upload**
```javascript
// Upload multiple images with intelligent routing
const fileList = document.getElementById('imageInput').files;
const files = Array.from(fileList);

const results = await imageManagementService.uploadMultipleImages(files, {
  folder: 'home_photos',
  tags: ['home', 'batch_upload']
});

console.log(`Uploaded ${results.successful}/${results.total} images`);
console.log('Strategy breakdown:', results.strategyBreakdown);

// Process results
results.results.forEach((result, index) => {
  console.log(`Image ${index + 1}:`, {
    strategy: result.strategy,
    service: result.service,
    url: result.data.url || result.data.data
  });
});
```

### **3. Get Optimal Storage Strategy**
```javascript
// Check best storage option before upload
const file = document.getElementById('imageInput').files[0];
const strategy = imageManagementService.getOptimalStorageStrategy(file);

console.log('Recommended strategy:', strategy.strategy);
console.log('Reason:', strategy.reason);
console.log('Service:', strategy.service);
console.log('Cost:', strategy.cost);
```

---

## 🔥 **Firebase Hybrid Storage Examples**

### **1. User Profile Management**
```javascript
// Create user profile
const userId = 'user123';
const profileData = {
  displayName: 'John Smith',
  email: 'john@example.com',
  phoneNumber: '+1234567890'
};

const result = await hybridFirebaseStorage.createUserProfile(userId, profileData);

if (result.success) {
  console.log('Profile created:', result.userId);
} else {
  console.error('Profile creation failed:', result.error);
}

// Get user profile
const profile = await hybridFirebaseStorage.getUserProfile(userId);
console.log('User profile:', profile.data);

// Update profile
const updateResult = await hybridFirebaseStorage.updateUserProfile(userId, {
  displayName: 'John Doe',
  phoneNumber: '+1987654321'
});
```

### **2. Inventory Management**
```javascript
// Add inventory item with image
const itemData = {
  name: 'Coffee Maker',
  description: 'Automatic coffee machine',
  category: 'Kitchen Appliances',
  quantity: 1,
  price: 89.99,
  location: 'Kitchen',
  image: imageFile // File object
};

const itemResult = await hybridFirebaseStorage.addInventoryItem(userId, itemData);

if (itemResult.success) {
  console.log('Item added:', itemResult.itemId);
  console.log('Image stored as:', itemResult.item.image.type);
} else {
  console.error('Item addition failed:', itemResult.error);
}

// Get inventory items with filters
const inventory = await hybridFirebaseStorage.getInventoryItems(userId, {
  category: 'Kitchen Appliances',
  search: 'coffee',
  sortBy: 'name',
  sortOrder: 'asc'
});

console.log('Inventory items:', inventory.data);
```

### **3. Recipe Management**
```javascript
// Add recipe with image
const recipeData = {
  name: 'Chocolate Chip Cookies',
  description: 'Classic homemade cookies',
  cuisine: 'American',
  category: 'dessert',
  difficulty: 'easy',
  prepTime: 15,
  cookTime: 12,
  servings: 24,
  ingredients: [
    { name: 'Flour', amount: 2.25, unit: 'cups' },
    { name: 'Butter', amount: 1, unit: 'cup' },
    { name: 'Chocolate Chips', amount: 2, unit: 'cups' }
  ],
  instructions: [
    { step: 1, instruction: 'Preheat oven to 375°F', duration: 0 },
    { step: 2, instruction: 'Mix dry ingredients', duration: 5 },
    { step: 3, instruction: 'Bake for 10-12 minutes', duration: 12 }
  ],
  image: recipeImageFile
};

const recipeResult = await hybridFirebaseStorage.addRecipe(userId, recipeData);
console.log('Recipe added:', recipeResult.recipeId);
```

### **4. Expense Tracking**
```javascript
// Add expense with receipt
const expenseData = {
  description: 'Grocery Shopping',
  amount: 156.78,
  category: 'Food & Dining',
  subcategory: 'Groceries',
  date: new Date(),
  merchant: 'Whole Foods Market',
  location: '123 Main St',
  paymentMethod: 'Credit Card',
  receipt: receiptImageFile
};

const expenseResult = await hybridFirebaseStorage.addExpense(userId, expenseData);
console.log('Expense added:', expenseResult.expenseId);
```

### **5. Household Management**
```javascript
// Create household
const householdData = {
  name: 'Smith Family',
  description: 'Our family home',
  address: {
    street: '123 Oak Street',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    country: 'USA'
  }
};

const householdResult = await hybridFirebaseStorage.createHousehold(userId, householdData);
console.log('Household created:', householdResult.householdId);
```

---

## 🖼️ **Imgur Service Examples**

### **1. Direct Imgur Upload**
```javascript
// Upload single image
const result = await imgurService.uploadImage(imageFile, {
  title: 'Home Photo',
  description: 'Beautiful living room',
  tags: ['home', 'interior', 'design']
});

if (result.success) {
  console.log('Imgur URL:', result.data.link);
  console.log('Delete hash:', result.data.deletehash);
  console.log('Remaining uploads today:', result.usage.remaining);
} else {
  console.error('Imgur upload failed:', result.error);
}
```

### **2. Multiple Image Upload**
```javascript
// Upload multiple images
const results = await imgurService.uploadMultipleImages(imageFiles, {
  title: 'Home Collection',
  description: 'Multiple home photos'
});

console.log(`Uploaded ${results.successful}/${results.total} images`);
results.results.forEach(result => {
  console.log('Image URL:', result.data.link);
});
```

### **3. Album Creation**
```javascript
// Create album and upload images
const albumResult = await imgurService.createAlbumAndUpload(imageFiles, {
  title: 'Home Tour',
  description: 'Complete home photo tour',
  privacy: 'public'
});

console.log('Album created:', albumResult.album.link);
console.log('Images in album:', albumResult.images.length);
```

### **4. Usage Monitoring**
```javascript
// Check Imgur usage
const usage = imgurService.getUsageStats();
console.log('Daily uploads:', usage.dailyUploads);
console.log('Daily limit:', usage.dailyLimit);
console.log('Remaining:', usage.remaining);
console.log('Percentage used:', usage.percentage);

// Check if can upload
if (imgurService.canUpload()) {
  console.log('Can upload to Imgur');
} else {
  console.log('Daily limit reached');
}
```

---

## ☁️ **Cloudinary Service Examples**

### **1. Direct Cloudinary Upload**
```javascript
// Upload with transformations
const result = await cloudinaryService.uploadImage(imageFile, {
  folder: 'home_photos',
  tags: ['home', 'interior'],
  transformations: {
    width: 800,
    height: 600,
    crop: 'fill',
    quality: 'auto'
  }
});

if (result.success) {
  console.log('Cloudinary URL:', result.data.secure_url);
  console.log('Public ID:', result.data.public_id);
  console.log('File size:', result.data.bytes);
} else {
  console.error('Cloudinary upload failed:', result.error);
}
```

### **2. Image Transformations**
```javascript
// Create transformed image
const transformResult = await cloudinaryService.createTransformedImage(
  'home_photos/room_123',
  {
    width: 300,
    height: 200,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'webp'
  }
);

console.log('Transformed URL:', transformResult.data.transformed_url);
```

### **3. Multiple Image Upload**
```javascript
// Upload multiple images with folder organization
const results = await cloudinaryService.uploadMultipleImages(imageFiles, {
  folder: 'home_photos/batch_2024',
  tags: ['home', 'batch_upload'],
  transformations: {
    quality: 'auto',
    fetch_format: 'auto'
  }
});

console.log(`Uploaded ${results.successful}/${results.total} images`);
```

### **4. Usage Monitoring**
```javascript
// Check Cloudinary usage
const usage = cloudinaryService.getUsageStats();
console.log('Storage used:', usage.storage.used);
console.log('Storage limit:', usage.storage.limit);
console.log('Storage remaining:', usage.storage.remaining);
console.log('Bandwidth used:', usage.bandwidth.used);

// Check if can upload
if (cloudinaryService.canUpload(fileSize)) {
  console.log('Can upload to Cloudinary');
} else {
  console.log('Storage limit exceeded');
}
```

---

## 📊 **Analytics & Monitoring Examples**

### **1. Firebase Analytics Events**
```javascript
import { firebaseAnalyticsService } from './src/firebase';

// Log custom events
firebaseAnalyticsService.logEvent('image_upload', {
  service: 'imgur',
  file_size: file.size,
  file_type: file.type,
  user_id: userId
});

firebaseAnalyticsService.logEvent('inventory_item_added', {
  category: 'Electronics',
  price_range: '100-500',
  has_image: true
});

firebaseAnalyticsService.logEvent('recipe_viewed', {
  cuisine: 'Italian',
  difficulty: 'medium',
  cooking_time: '30-60'
});
```

### **2. Service Health Monitoring**
```javascript
// Comprehensive health check
const health = await imageManagementService.healthCheck();
console.log('Overall status:', health.overall);

Object.entries(health.services).forEach(([service, status]) => {
  console.log(`${service}: ${status.status}`);
  if (status.details) {
    console.log('  Details:', status.details);
  }
});
```

### **3. Usage Statistics**
```javascript
// Get all service usage stats
const usage = imageManagementService.getUsageStats();

console.log('Imgur Usage:', usage.imgur);
console.log('Cloudinary Usage:', usage.cloudinary);
console.log('Base64 Usage:', usage.base64);

// Firebase usage
const firebaseUsage = hybridFirebaseStorage.getUsageStats();
console.log('Firebase Reads:', firebaseUsage.reads);
console.log('Firebase Writes:', firebaseUsage.writes);
```

---

## 🔐 **Authentication Examples**

### **1. User Registration & Login**
```javascript
import { firebaseAuthService } from './src/firebase';

// Sign up with email/password
const signUpResult = await firebaseAuthService.signUpWithEmail(
  'user@example.com',
  'password123'
);

if (signUpResult.success) {
  console.log('User created:', signUpResult.user.uid);
  
  // Create user profile
  await hybridFirebaseStorage.createUserProfile(signUpResult.user.uid, {
    displayName: 'John Smith',
    email: 'user@example.com'
  });
}

// Sign in
const signInResult = await firebaseAuthService.signInWithEmail(
  'user@example.com',
  'password123'
);

if (signInResult.success) {
  console.log('User signed in:', signInResult.user.uid);
}
```

### **2. OAuth Authentication**
```javascript
// Google OAuth
const googleResult = await firebaseAuthService.signInWithGoogle();
if (googleResult.success) {
  console.log('Google sign-in successful');
}

// Facebook OAuth
const facebookResult = await firebaseAuthService.signInWithFacebook();
if (facebookResult.success) {
  console.log('Facebook sign-in successful');
}

// GitHub OAuth
const githubResult = await firebaseAuthService.signInWithGitHub();
if (githubResult.success) {
  console.log('GitHub sign-in successful');
}
```

### **3. User Profile Management**
```javascript
// Get current user
const currentUser = firebaseAuthService.getCurrentUser();
if (currentUser) {
  console.log('Current user:', currentUser.email);
  
  // Update profile
  await hybridFirebaseStorage.updateUserProfile(currentUser.uid, {
    displayName: 'John Doe',
    phoneNumber: '+1234567890'
  });
}

// Sign out
await firebaseAuthService.signOut();
console.log('User signed out');
```

---

## 🧠 **AI Services Examples**

### **1. AI Vision Service**
```javascript
import { aiVisionService } from './src/services/AIVisionService';

// Analyze image with multiple providers
const visionResult = await aiVisionService.analyzeImage(imageFile, {
  task: 'image-classification',
  providers: ['huggingface', 'gemini'],
  options: {
    maxLabels: 5,
    confidence: 0.7
  }
});

console.log('Vision analysis:', visionResult);
```

### **2. AI Chat Service**
```javascript
import { firebaseChatService } from './src/services/FirebaseChatService';

// Start conversation
const conversation = await firebaseChatService.startConversation(userId, {
  title: 'Home Organization Help',
  context: 'Need help organizing my home'
});

// Send message
const message = await firebaseChatService.sendMessage(conversation.id, {
  content: 'How can I organize my kitchen better?',
  type: 'user'
});

// Get AI response
const aiResponse = await firebaseChatService.getAIResponse(conversation.id, {
  provider: 'gemini',
  context: 'Kitchen organization expert'
});
```

---

## 📱 **PWA & Offline Examples**

### **1. Service Worker Registration**
```javascript
// Check if service worker is supported
if ('serviceWorker' in navigator) {
  // Register service worker
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('SW registered:', registration);
    })
    .catch(error => {
      console.log('SW registration failed:', error);
    });
}
```

### **2. Offline Data Handling**
```javascript
// Check online status
if (navigator.onLine) {
  console.log('Online - sync data');
  // Sync any offline data
} else {
  console.log('Offline - use cached data');
  // Use cached data from IndexedDB
}

// Listen for online/offline events
window.addEventListener('online', () => {
  console.log('Back online - syncing data');
  // Sync offline data
});

window.addEventListener('offline', () => {
  console.log('Gone offline - caching data');
  // Cache current data
});
```

---

## 🔧 **Advanced Usage Patterns**

### **1. Batch Operations**
```javascript
// Batch upload with progress tracking
const batchUpload = async (files, options = {}) => {
  const total = files.length;
  let completed = 0;
  
  const results = [];
  
  for (const file of files) {
    try {
      const result = await imageManagementService.uploadImage(file, options);
      results.push(result);
      completed++;
      
      // Update progress
      const progress = (completed / total) * 100;
      console.log(`Progress: ${progress.toFixed(1)}%`);
      
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
    }
  }
  
  return results;
};

// Usage
const batchResults = await batchUpload(imageFiles, {
  folder: 'home_photos',
  tags: ['batch_upload']
});
```

### **2. Error Handling & Retry**
```javascript
// Retry mechanism with exponential backoff
const retryOperation = async (operation, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Usage
const result = await retryOperation(async () => {
  return await imageManagementService.uploadImage(file);
});
```

### **3. Service Fallback Chain**
```javascript
// Intelligent fallback for image uploads
const uploadWithFallback = async (file, options = {}) => {
  // Try optimal strategy first
  const strategy = imageManagementService.getOptimalStorageStrategy(file);
  
  try {
    return await imageManagementService.uploadImage(file, options);
  } catch (error) {
    console.log(`Primary strategy failed: ${strategy.strategy}`);
    
    // Force base64 fallback
    console.log('Falling back to base64 storage...');
    return await imageManagementService.uploadToBase64(file, options);
  }
};
```

---

## 📊 **Performance Monitoring**

### **1. Upload Performance Tracking**
```javascript
// Track upload performance
const trackUploadPerformance = async (file, options = {}) => {
  const startTime = performance.now();
  
  try {
    const result = await imageManagementService.uploadImage(file, options);
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Log performance metrics
    firebaseAnalyticsService.logEvent('upload_performance', {
      file_size: file.size,
      strategy: result.strategy,
      service: result.service,
      duration_ms: Math.round(duration),
      success: true
    });
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    firebaseAnalyticsService.logEvent('upload_performance', {
      file_size: file.size,
      strategy: 'failed',
      duration_ms: Math.round(duration),
      success: false,
      error: error.message
    });
    
    throw error;
  }
};
```

### **2. Service Health Dashboard**
```javascript
// Create service health dashboard
const createHealthDashboard = async () => {
  const health = await imageManagementService.healthCheck();
  const usage = imageManagementService.getUsageStats();
  
  return {
    timestamp: new Date().toISOString(),
    overall: health.overall,
    services: health.services,
    usage: usage,
    recommendations: generateRecommendations(health, usage)
  };
};

const generateRecommendations = (health, usage) => {
  const recommendations = [];
  
  // Check Imgur usage
  if (usage.imgur.percentage > 80) {
    recommendations.push('Imgur daily limit nearly reached - consider Cloudinary for remaining uploads');
  }
  
  // Check Cloudinary storage
  if (usage.cloudinary.storage.percentage > 80) {
    recommendations.push('Cloudinary storage nearly full - consider cleanup or upgrade');
  }
  
  // Check Firebase usage
  if (usage.firebase?.reads?.percentage > 80) {
    recommendations.push('Firebase read limit nearly reached - optimize queries');
  }
  
  return recommendations;
};
```

---

## 🎯 **Best Practices**

### **1. Image Optimization**
```javascript
// Always compress images before upload
const optimizeImage = async (file) => {
  if (file.size > 1024 * 1024) { // 1MB
    return await imageManagementService.compressImage(file, 0.8);
  }
  return file;
};

// Use appropriate formats
const getOptimalFormat = (file) => {
  if (file.type === 'image/png' && file.size > 500 * 1024) {
    return 'webp'; // Convert large PNGs to WebP
  }
  return file.type;
};
```

### **2. Error Handling**
```javascript
// Comprehensive error handling
const handleUploadError = (error, file) => {
  if (error.code === 'DAILY_LIMIT_EXCEEDED') {
    // Fallback to alternative service
    return uploadToAlternativeService(file);
  } else if (error.code === 'FILE_TOO_LARGE') {
    // Compress and retry
    return compressAndRetry(file);
  } else {
    // Log and show user-friendly message
    console.error('Upload failed:', error);
    throw new Error('Upload failed. Please try again.');
  }
};
```

### **3. Resource Management**
```javascript
// Clean up resources
const cleanupResources = async () => {
  // Clear local storage if needed
  if (localStorage.getItem('imgur_service_data')) {
    const data = JSON.parse(localStorage.getItem('imgur_service_data'));
    const lastReset = new Date(data.lastReset);
    const currentMonth = new Date().getMonth();
    
    if (lastReset.getMonth() !== currentMonth) {
      localStorage.removeItem('imgur_service_data');
    }
  }
  
  // Clear any cached data
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(name => caches.delete(name))
    );
  }
};
```

---

## 🚀 **Production Deployment Checklist**

### **1. Environment Configuration**
```bash
# Production .env file
REACT_APP_FIREBASE_API_KEY=prod_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_IMGUR_CLIENT_ID=prod_imgur_key
REACT_APP_CLOUDINARY_CLOUD_NAME=prod_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=prod_preset
REACT_APP_HUGGINGFACE_API_KEY=prod_hf_key
REACT_APP_GEMINI_API_KEY=prod_gemini_key
```

### **2. Security Rules**
```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Firebase functions
firebase deploy --only functions
```

### **3. Performance Monitoring**
```javascript
// Enable performance monitoring
import { getPerformance } from 'firebase/performance';

const perf = getPerformance();
const trace = perf.trace('image_upload');
trace.start();

// ... upload operation ...

trace.stop();
```

---

**🎉 You're now ready to build amazing features with Home Hub!**

This comprehensive setup provides:
- 🖼️ **Smart image management** with automatic routing
- 🔥 **Firebase optimization** for free tier
- 📊 **Real-time monitoring** and analytics
- 🔐 **Multi-provider authentication**
- 🧠 **AI integration** capabilities
- 📱 **PWA features** for mobile experience

Start building and let me know if you need help with any specific implementation! 🚀
