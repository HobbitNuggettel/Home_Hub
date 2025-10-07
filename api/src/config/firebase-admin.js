const admin = require('firebase-admin');

let firebaseApp = null;

// Production Firebase Admin Configuration
const initializeFirebaseAdmin = () => {
  try {
    // Check if Firebase is already initialized
    if (firebaseApp) {
      return firebaseApp;
    }

    // Check for environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (!projectId || !privateKey || !clientEmail) {
      console.log('🔄 Firebase Admin: Using demo mode (no credentials provided)');
      return createMockFirebaseAdmin();
    }

    // Initialize with real credentials
    const serviceAccount = {
      projectId,
      privateKey: privateKey.replace(/\\n/g, '\n'),
      clientEmail
    };

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return firebaseApp;

  } catch (error) {
    console.log('🔄 Firebase Admin: Falling back to demo mode');
    console.log('Error:', error.message);
    return createMockFirebaseAdmin();
  }
};

// Mock Firebase Admin for development/demo
const createMockFirebaseAdmin = () => {
  console.log('🎭 Creating mock Firebase Admin for development');
  
  return {
    auth: () => ({
      verifyIdToken: async (token) => ({ uid: 'demo-user', email: 'demo@example.com' }),
      createUser: async (userData) => ({ uid: 'demo-user', ...userData }),
      updateUser: async (uid, userData) => ({ uid, ...userData }),
      deleteUser: async (uid) => ({ uid }),
      listUsers: async () => ({ users: [] })
    }),
    firestore: () => ({
      collection: (name) => ({
        doc: (id) => ({
          get: async () => ({ exists: false, data: () => null }),
          set: async (data) => ({ id, ...data }),
          update: async (data) => ({ id, ...data }),
          delete: async () => ({ id })
        }),
        add: async (data) => ({ id: 'demo-id', ...data }),
        where: () => ({
          get: async () => ({ docs: [] })
        })
      })
    }),
    storage: () => ({
      bucket: () => ({
        file: (name) => ({
          getSignedUrl: async () => ['https://demo-url.com'],
          delete: async () => [{}]
        })
      })
    })
  };
};

module.exports = {
  initializeFirebaseAdmin,
  getFirebaseApp: () => firebaseApp
};
