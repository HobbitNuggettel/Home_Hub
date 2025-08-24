import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  GoogleAuthProvider
} from 'firebase/auth';
import { firebaseAuthService } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Sign up with email and password
  async function signup(email, password, displayName) {
    try {
      const result = await firebaseAuthService.signUpWithEmail(email, password, displayName);
      
      // Create user document in Firestore - temporarily disabled
      // await firestoreService.createDocument('users', result.user.uid, {
      //   uid: result.user.uid,
      //   email: result.user.email,
      //   displayName: displayName,
      //   createdAt: new Date().toISOString(),
      //   role: 'user',
      //   preferences: {
      //     theme: 'light',
      //     notifications: true
      //   }
      // });
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Sign in with email and password
  function login(email, password) {
    return firebaseAuthService.signInWithEmail(email, password);
  }

  // Sign in with Google - TEMPORARILY DISABLED
  async function signInWithGoogle() {
    try {
      // const result = await firebaseAuthService.signInWithGoogle();

      // // Check if user document exists, if not create one
      // const userDoc = await firestoreService.getDocument('users', result.user.uid);
      // if (!userDoc) {
      //   await firestoreService.createDocument('users', result.user.uid, {
      //     uid: result.user.uid,
      //     email: result.user.email,
      //     displayName: result.user.displayName,
      //     photoURL: result.user.photoURL,
      //     createdAt: new Date().toISOString(),
      //     role: 'user',
      //     preferences: {
      //       theme: 'light',
      //       notifications: true
      //     }
      //   });
      // }
      
      // return result;
      console.log('Google signin temporarily disabled');
      throw new Error('Firebase services temporarily disabled');
    } catch (error) {
      throw error;
    }
  }

  // Sign out - TEMPORARILY DISABLED
  function logout() {
    // return firebaseAuthService.signOut();
    console.log('Logout temporarily disabled');
    throw new Error('Firebase services temporarily disabled');
  }

  // Reset password - TEMPORARILY DISABLED
  function resetPassword(email) {
    // return firebaseAuthService.sendPasswordResetEmail(email);
    console.log('Password reset temporarily disabled');
    throw new Error('Firebase services temporarily disabled');
  }

  // Update user profile - TEMPORARILY DISABLED
  async function updateUserProfile(updates) {
    try {
      // await firebaseAuthService.updateProfile(updates);
      
      // // Update Firestore document
      // if (firebaseAuthService.getCurrentUser()) {
      //   await firestoreService.updateDocument('users', firebaseAuthService.getCurrentUser().uid, updates);
      // }
      console.log('Profile update temporarily disabled');
      throw new Error('Firebase services temporarily disabled');
    } catch (error) {
      throw error;
    }
  }

  // Get user profile from Firestore - TEMPORARILY DISABLED
  async function fetchUserProfile(uid) {
    try {
      // const userDoc = await firestoreService.getDocument('users', uid);
      // return userDoc;
      console.log('Profile fetch temporarily disabled');
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChange(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile from Firestore - temporarily disabled
        // const profile = await fetchUserProfile(user.uid);
        // setUserProfile(profile);
        setUserProfile({ displayName: user.displayName, email: user.email });
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    resetPassword,
    signInWithGoogle,
    updateUserProfile,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
