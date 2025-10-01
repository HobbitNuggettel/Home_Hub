/**
 * Security Configuration
 * Centralized security settings and validation schemas
 */

// Common validation schemas
export const validationSchemas = {
  userProfile: {
    name: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/,
      message: 'Name must contain only letters and spaces'
    },
    email: {
      required: true,
      type: 'email',
      maxLength: 100
    },
    phone: {
      required: false,
      type: 'phone',
      maxLength: 20
    },
    bio: {
      required: false,
      type: 'string',
      maxLength: 500
    }
  },

  inventoryItem: {
    name: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    category: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 50
    },
    quantity: {
      required: true,
      type: 'number',
      min: 0,
      max: 999999
    },
    price: {
      required: false,
      type: 'number',
      min: 0,
      max: 999999.99
    },
    location: {
      required: false,
      type: 'string',
      maxLength: 100
    },
    notes: {
      required: false,
      type: 'string',
      maxLength: 500
    }
  },

  spendingRecord: {
    amount: {
      required: true,
      type: 'number',
      min: 0.01,
      max: 999999.99
    },
    category: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 50
    },
    description: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 200
    },
    date: {
      required: true,
      type: 'date'
    }
  },

  recipe: {
    title: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    description: {
      required: false,
      type: 'string',
      maxLength: 500
    },
    ingredients: {
      required: true,
      type: 'array',
      minLength: 1
    },
    instructions: {
      required: true,
      type: 'array',
      minLength: 1
    },
    prepTime: {
      required: false,
      type: 'number',
      min: 0,
      max: 1440 // 24 hours in minutes
    },
    cookTime: {
      required: false,
      type: 'number',
      min: 0,
      max: 1440
    }
  },

  login: {
    email: {
      required: true,
      type: 'email',
      maxLength: 100
    },
    password: {
      required: true,
      type: 'string',
      minLength: 8,
      maxLength: 128
    }
  },

  signup: {
    name: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/,
      message: 'Name must contain only letters and spaces'
    },
    email: {
      required: true,
      type: 'email',
      maxLength: 100
    },
    password: {
      required: true,
      type: 'string',
      minLength: 8,
      maxLength: 128
    },
    confirmPassword: {
      required: true,
      type: 'string',
      minLength: 8,
      maxLength: 128
    }
  }
};

// Security headers configuration
export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://firebaseapp.com https://*.firebaseapp.com wss://*.firebaseapp.com",
    "frame-src 'self' https://*.firebaseapp.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// Rate limiting configuration
export const rateLimitConfig = {
  api: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many API requests, please try again later.'
  },
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many authentication attempts, please try again later.'
  },
  form: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many form submissions, please try again later.'
  }
};

// Password requirements
export const passwordRequirements = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  forbiddenPatterns: [
    /password/i,
    /123456/i,
    /qwerty/i,
    /admin/i,
    /user/i
  ]
};

// File upload restrictions
export const fileUploadConfig = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/csv',
    'application/json'
  ],
  maxFiles: 10
};

// Session configuration
export const sessionConfig = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'strict'
};

// API endpoints that require special security
export const secureEndpoints = {
  auth: ['/api/auth/login', '/api/auth/signup', '/api/auth/logout'],
  admin: ['/api/admin/*'],
  sensitive: ['/api/users/profile', '/api/users/password']
};

// Security monitoring configuration
export const securityMonitoring = {
  logSuspiciousActivity: true,
  alertThresholds: {
    failedLogins: 5,
    suspiciousRequests: 10,
    rateLimitViolations: 3
  },
  alertChannels: ['console', 'email'] // In production, add more channels
};

export default {
  validationSchemas,
  securityHeaders,
  rateLimitConfig,
  passwordRequirements,
  fileUploadConfig,
  sessionConfig,
  secureEndpoints,
  securityMonitoring
};



