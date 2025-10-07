// Firebase configuration and exports
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:abcdef",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const realtimeDb = getDatabase(app);

export default app;

// Firebase Auth Service
export const firebaseAuthService = {
  signIn: (email, password) => {
    try {
      return auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.log('Firebase auth not available:', error.message);
      throw new Error('Firebase authentication not available');
    }
  },
  signUp: (email, password) => {
    try {
      return auth.createUserWithEmailAndPassword(email, password);
    } catch (error) {
      console.log('Firebase auth not available:', error.message);
      throw new Error('Firebase authentication not available');
    }
  },
  signOut: () => {
    try {
      return auth.signOut();
    } catch (error) {
      console.log('Firebase auth not available:', error.message);
      throw new Error('Firebase authentication not available');
    }
  },
  onAuthStateChange: (callback) => {
    try {
      return auth.onAuthStateChanged(callback);
    } catch (error) {
      console.log('Firebase auth not available:', error.message);
      throw new Error('Firebase authentication not available');
    }
  },
  getCurrentUser: () => {
    try {
      return auth.currentUser;
    } catch (error) {
      console.log('Firebase auth not available:', error.message);
      return null;
    }
  },
  sendPasswordResetEmail: (email) => {
    try {
      return auth.sendPasswordResetEmail(email);
    } catch (error) {
      console.log('Firebase auth not available:', error.message);
      throw new Error('Firebase authentication not available');
    }
  },
  updatePassword: (newPassword) => {
    try {
      return auth.currentUser?.updatePassword(newPassword);
    } catch (error) {
      console.log('Firebase auth not available:', error.message);
      throw new Error('Firebase authentication not available');
    }
  }
};
