// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2qX3RI3a87OoyQvpHoiDf5DGrWcZyCJg",
  authDomain: "home-hub-app-18bcf.firebaseapp.com",
  projectId: "home-hub-app-18bcf",
  storageBucket: "home-hub-app-18bcf.firebasestorage.app",
  messagingSenderId: "871477395581",
  appId: "1:871477395581:web:5eb3c4b3a255a0c0d83114",
  measurementId: "G-P88FF15LBT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app; 