const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      return admin.apps[0];
    }

    // Initialize with service account (we'll use environment variables)
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE || 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID || 'home-hub-app-18bcf',
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    };

    // Initialize the app
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://home-hub-app-18bcf-default-rtdb.firebaseio.com',
      projectId: process.env.FIREBASE_PROJECT_ID || 'home-hub-app-18bcf'
    });

    console.log('🔥 Firebase Admin SDK initialized successfully');
    return app;
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error.message);
    
    // Fallback to mock mode for development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Falling back to mock Firebase mode for development');
      return createMockFirebaseAdmin();
    }
    
    throw error;
  }
};

// Mock Firebase Admin for development when credentials aren't available
const createMockFirebaseAdmin = () => {
  console.log('🎭 Creating mock Firebase Admin for development');
  
  return {
    auth: () => ({
      verifyIdToken: async (token) => {
        // Mock token verification
        if (token === 'mock-admin-token') {
          return {
            uid: 'mock-admin-uid',
            email: 'admin@homehub.com',
            role: 'admin'
          };
        }
        if (token === 'mock-user-token') {
          return {
            uid: 'mock-user-uid',
            email: 'user@homehub.com',
            role: 'user'
          };
        }
        throw new Error('Invalid token');
      }
    }),
    database: () => ({
      ref: (path) => ({
        once: async () => ({ val: () => null }),
        set: async (data) => ({ key: 'mock-key' }),
        update: async (data) => ({ key: 'mock-key' }),
        remove: async () => ({ key: 'mock-key' })
      })
    }),
    firestore: () => ({
      collection: (name) => ({
        doc: (id) => ({
          get: async () => ({ exists: false, data: () => null }),
          set: async (data) => ({ id: 'mock-id' }),
          update: async (data) => ({ id: 'mock-id' }),
          delete: async () => ({ id: 'mock-id' })
        })
      })
    })
  };
};

// Export the initialized Firebase Admin instance
const firebaseAdmin = initializeFirebaseAdmin();

module.exports = {
  firebaseAdmin,
  admin,
  initializeFirebaseAdmin
};
