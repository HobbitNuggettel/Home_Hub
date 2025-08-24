// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase Configuration
// For production, create a .env.local file with your Firebase credentials
// See FIREBASE_SETUP.md for detailed setup instructions
// CRITICAL: Never commit API keys to version control!

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Validate required environment variables
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(
    `⚠️ Missing Firebase environment variables: ${missingVars.join(', ')}\n` +
    '📋 Using demo configuration for development. Some features may not work.\n' +
    '🔧 To enable full functionality, create a .env.local file with your Firebase credentials.'
  );

  // Use demo configuration to prevent app crash
  const demoConfig = {
    apiKey: "demo-api-key",
    authDomain: "demo-project.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:demo-app-id",
    measurementId: "G-DEMO123"
  };

  // Override missing values with demo values
  missingVars.forEach(varName => {
    const key = varName.replace('REACT_APP_FIREBASE_', '').toLowerCase();
    if (key === 'api_key') firebaseConfig.apiKey = demoConfig.apiKey;
    if (key === 'auth_domain') firebaseConfig.authDomain = demoConfig.authDomain;
    if (key === 'project_id') firebaseConfig.projectId = demoConfig.projectId;
    if (key === 'storage_bucket') firebaseConfig.storageBucket = demoConfig.storageBucket;
    if (key === 'messaging_sender_id') firebaseConfig.messagingSenderId = demoConfig.messagingSenderId;
    if (key === 'app_id') firebaseConfig.appId = demoConfig.appId;
  });
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize analytics with error handling
let analytics;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.warn('⚠️ Analytics initialization failed (demo mode):', error.message);
  analytics = null;
}
export { analytics };

export default app; 