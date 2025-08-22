// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase Configuration
// For production, create a .env.local file with your Firebase credentials
// See .env.local.example for the required environment variables
// The fallback values below are for development only

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyB2qX3RI3a87OoyQvpHoiDf5DGrWcZyCJg",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "home-hub-app-18bcf.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "home-hub-app-18bcf",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "home-hub-app-18bcf.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "871477395581",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:871477395581:web:5eb3c4b3a255a0c0d83114",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-P88FF15LBT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app; 