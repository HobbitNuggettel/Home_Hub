/**
 * Optimized User Data Structure for Firebase Free Tier
 * Implements the recommended data organization strategy
 */

import { serverTimestamp } from 'firebase/firestore';

// Data structure templates optimized for Firebase free tier
export const USER_DATA_TEMPLATES = {
  // Core user profile structure
  profile: {
    displayName: '',
    email: '',
    photoData: null, // Base64 for small images (<500KB)
    phoneNumber: '',
    dateOfBirth: null,
    preferences: {
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      currency: 'USD',
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      analytics: true
    },
    createdAt: null,
    updatedAt: null,
    lastLoginAt: null
  },

  // Inventory item structure
  inventoryItem: {
    id: '',
    name: '',
    description: '',
    category: '',
    subcategory: '',
    brand: '',
    model: '',
    quantity: 0,
    unit: 'pieces',
    price: 0,
    currency: 'USD',
    purchaseDate: null,
    expiryDate: null,
    location: '',
    room: '',
    shelf: '',
    barcode: '',
    sku: '',
    image: null, // Smart image handling
    thumbnail: null, // Compressed thumbnail
    tags: [],
    notes: '',
    status: 'active', // active, low, out, expired
    warranty: {
      duration: 0,
      unit: 'months',
      expiryDate: null,
      provider: ''
    },
    maintenance: {
      lastService: null,
      nextService: null,
      interval: 0,
      notes: ''
    },
    createdAt: null,
    updatedAt: null,
    createdBy: '',
    updatedBy: ''
  },

  // Recipe structure
  recipe: {
    id: '',
    name: '',
    description: '',
    cuisine: '',
    category: 'main', // appetizer, main, dessert, beverage, snack
    difficulty: 'medium', // easy, medium, hard
    prepTime: 0, // minutes
    cookTime: 0, // minutes
    totalTime: 0, // minutes
    servings: 4,
    calories: 0,
    image: null, // Smart image handling
    thumbnail: null,
    ingredients: [
      {
        name: '',
        amount: 0,
        unit: '',
        notes: ''
      }
    ],
    instructions: [
      {
        step: 1,
        instruction: '',
        duration: 0,
        temperature: null
      }
    ],
    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    },
    tags: [],
    dietary: [], // vegetarian, vegan, gluten-free, dairy-free, etc.
    source: '',
    sourceUrl: '',
    notes: '',
    rating: 0,
    reviews: [],
    favorites: 0,
    createdAt: null,
    updatedAt: null,
    createdBy: '',
    updatedBy: ''
  },

  // Expense structure
  expense: {
    id: '',
    description: '',
    amount: 0,
    currency: 'USD',
    category: '',
    subcategory: '',
    date: null,
    merchant: '',
    location: '',
    paymentMethod: '', // cash, card, transfer, etc.
    account: '',
    receipt: null, // Smart image handling
    thumbnail: null,
    tags: [],
    notes: '',
    recurring: {
      isRecurring: false,
      frequency: '', // daily, weekly, monthly, yearly
      interval: 1,
      endDate: null
    },
    budget: {
      budgetId: '',
      budgetCategory: ''
    },
    tax: {
      taxable: false,
      taxAmount: 0,
      taxRate: 0
    },
    status: 'completed', // pending, completed, cancelled
    createdAt: null,
    updatedAt: null,
    createdBy: '',
    updatedBy: ''
  },

  // Shopping list structure
  shoppingList: {
    id: '',
    name: '',
    description: '',
    status: 'active', // active, completed, archived
    priority: 'medium', // low, medium, high, urgent
    dueDate: null,
    store: '',
    estimatedTotal: 0,
    actualTotal: 0,
    currency: 'USD',
    items: [
      {
        id: '',
        name: '',
        category: '',
        quantity: 1,
        unit: 'pieces',
        estimatedPrice: 0,
        actualPrice: 0,
        notes: '',
        completed: false,
        addedBy: '',
        completedBy: '',
        addedAt: null,
        completedAt: null
      }
    ],
    tags: [],
    shared: {
      isShared: false,
      sharedWith: [],
      permissions: {} // userId: permission level
    },
    createdAt: null,
    updatedAt: null,
    createdBy: '',
    updatedBy: ''
  },

  // Budget structure
  budget: {
    id: '',
    name: '',
    description: '',
    period: 'monthly', // weekly, monthly, yearly, custom
    startDate: null,
    endDate: null,
    totalAmount: 0,
    currency: 'USD',
    categories: [
      {
        name: '',
        budgetAmount: 0,
        spentAmount: 0,
        remaining: 0,
        percentage: 0
      }
    ],
    status: 'active', // active, paused, completed
    alerts: {
      enabled: true,
      thresholds: [50, 80, 95], // percentage thresholds
      lastAlert: null
    },
    createdAt: null,
    updatedAt: null,
    createdBy: '',
    updatedBy: ''
  },

  // Household structure
  household: {
    id: '',
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    owner: '', // userId
    members: [], // array of userIds
    admins: [], // array of userIds with admin privileges
    invitations: [
      {
        email: '',
        role: 'member', // member, admin
        invitedBy: '',
        invitedAt: null,
        status: 'pending', // pending, accepted, declined, expired
        token: ''
      }
    ],
    settings: {
      visibility: 'private', // private, public
      joinRequests: false,
      dataSharing: {
        inventory: true,
        recipes: true,
        expenses: false,
        shoppingLists: true
      }
    },
    stats: {
      totalMembers: 0,
      totalInventoryItems: 0,
      totalRecipes: 0,
      totalExpenses: 0,
      totalShoppingLists: 0
    },
    createdAt: null,
    updatedAt: null
  },

  // User settings structure
  settings: {
    theme: 'system', // light, dark, system
    language: 'en',
    timezone: 'UTC',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h', // 12h, 24h
    notifications: {
      email: {
        enabled: true,
        frequency: 'immediate', // immediate, daily, weekly
        types: {
          reminders: true,
          updates: true,
          marketing: false
        }
      },
      push: {
        enabled: true,
        types: {
          reminders: true,
          updates: true,
          social: true
        }
      },
      sms: {
        enabled: false,
        types: {
          urgent: false,
          reminders: false
        }
      }
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      analytics: true,
      crashReports: true
    },
    backup: {
      enabled: true,
      frequency: 'weekly', // daily, weekly, monthly
      lastBackup: null,
      cloudProvider: 'firebase' // firebase, google-drive, dropbox
    },
    integrations: {
      googleCalendar: false,
      alexa: false,
      ifttt: false
    }
  },

  // Usage tracking structure
  usage: {
    totalItems: 0,
    totalRecipes: 0,
    totalExpenses: 0,
    totalShoppingLists: 0,
    totalHouseholds: 0,
    storageUsed: 0, // bytes
    storageLimit: 1073741824, // 1GB in bytes
    apiCalls: {
      daily: 0,
      monthly: 0,
      lastReset: null
    },
    features: {
      aiAssistant: 0,
      imageUploads: 0,
      dataExports: 0
    },
    lastActivity: null,
    createdAt: null,
    updatedAt: null
  }
};

// Data validation schemas
export const VALIDATION_RULES = {
  profile: {
    displayName: { required: true, maxLength: 100 },
    email: { required: true, format: 'email' },
    photoData: { maxSize: 500000 } // 500KB for base64
  },
  
  inventoryItem: {
    name: { required: true, maxLength: 100 },
    category: { required: true, maxLength: 50 },
    quantity: { required: true, min: 0 },
    price: { min: 0 },
    image: { maxSize: 500000 } // 500KB for base64
  },
  
  recipe: {
    name: { required: true, maxLength: 100 },
    ingredients: { required: true, minItems: 1 },
    instructions: { required: true, minItems: 1 },
    servings: { required: true, min: 1 },
    image: { maxSize: 500000 } // 500KB for base64
  },
  
  expense: {
    description: { required: true, maxLength: 200 },
    amount: { required: true, min: 0 },
    category: { required: true, maxLength: 50 },
    date: { required: true, format: 'date' },
    receipt: { maxSize: 500000 } // 500KB for base64
  },
  
  shoppingList: {
    name: { required: true, maxLength: 100 },
    items: { minItems: 1 }
  }
};

// Data size optimization utilities
export const DataOptimizer = {
  // Optimize data structure for Firestore
  optimizeForFirestore(data, type) {
    const optimized = { ...data };
    
    // Remove empty fields to save space
    Object.keys(optimized).forEach(key => {
      if (optimized[key] === null || optimized[key] === undefined || optimized[key] === '') {
        delete optimized[key];
      }
    });
    
    // Add timestamps
    optimized.updatedAt = serverTimestamp();
    if (!optimized.createdAt) {
      optimized.createdAt = serverTimestamp();
    }
    
    return optimized;
  },
  
  // Calculate approximate document size
  calculateDocumentSize(data) {
    const jsonString = JSON.stringify(data);
    return new Blob([jsonString]).size;
  },
  
  // Check if document exceeds Firestore limits
  validateDocumentSize(data) {
    const size = this.calculateDocumentSize(data);
    const maxSize = 1048576; // 1MB
    
    return {
      size,
      maxSize,
      isValid: size <= maxSize,
      percentage: (size / maxSize) * 100
    };
  },
  
  // Compress large text fields
  compressTextFields(data, fields = ['description', 'notes', 'instructions']) {
    const compressed = { ...data };
    
    fields.forEach(field => {
      if (compressed[field] && compressed[field].length > 1000) {
        // Simple compression - remove extra whitespace
        compressed[field] = compressed[field]
          .replace(/\s+/g, ' ')
          .trim();
      }
    });
    
    return compressed;
  }
};

// Default data factory
export const createDefaultUserData = (userId, profileData = {}) => {
  return {
    profile: {
      ...USER_DATA_TEMPLATES.profile,
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
      ...USER_DATA_TEMPLATES.settings,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    usage: {
      ...USER_DATA_TEMPLATES.usage,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  };
};

// Item factory functions
export const createInventoryItem = (itemData = {}) => {
  return DataOptimizer.optimizeForFirestore({
    ...USER_DATA_TEMPLATES.inventoryItem,
    ...itemData,
    id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }, 'inventory');
};

export const createRecipe = (recipeData = {}) => {
  return DataOptimizer.optimizeForFirestore({
    ...USER_DATA_TEMPLATES.recipe,
    ...recipeData,
    id: `recipe_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }, 'recipe');
};

export const createExpense = (expenseData = {}) => {
  return DataOptimizer.optimizeForFirestore({
    ...USER_DATA_TEMPLATES.expense,
    ...expenseData,
    id: `expense_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }, 'expense');
};

export const createShoppingList = (listData = {}) => {
  return DataOptimizer.optimizeForFirestore({
    ...USER_DATA_TEMPLATES.shoppingList,
    ...listData,
    id: `list_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }, 'shoppingList');
};

export const createHousehold = (householdData = {}) => {
  return DataOptimizer.optimizeForFirestore({
    ...USER_DATA_TEMPLATES.household,
    ...householdData,
    id: `household_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }, 'household');
};

// Export all utilities
export default {
  USER_DATA_TEMPLATES,
  VALIDATION_RULES,
  DataOptimizer,
  createDefaultUserData,
  createInventoryItem,
  createRecipe,
  createExpense,
  createShoppingList,
  createHousehold
};
