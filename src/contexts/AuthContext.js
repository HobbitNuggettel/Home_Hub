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

  // Sign in with Google
  async function signInWithGoogle() {
    try {
      if (firebaseAuthService && firebaseAuthService.signInWithGoogle) {
        const result = await firebaseAuthService.signInWithGoogle();
        return result;
      } else {
        throw new Error('Google sign-in not available');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  // Sign out
  async function logout() {
    try {
      // Clear local state
      setCurrentUser(null);
      setUserProfile(null);
      
      // Clear any stored tokens or data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userProfile');

      // Try to sign out from Firebase if available
      try {
        if (firebaseAuthService && firebaseAuthService.signOut) {
          await firebaseAuthService.signOut();
        }
      } catch (firebaseError) {
        console.log('Firebase logout failed, but local logout successful:', firebaseError.message);
      }

      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear local state
      setCurrentUser(null);
      setUserProfile(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userProfile');
      throw error;
    }
  }

  // Reset password
  async function resetPassword(email) {
    try {
      if (firebaseAuthService && firebaseAuthService.sendPasswordResetEmail) {
        return await firebaseAuthService.sendPasswordResetEmail(email);
      } else {
        throw new Error('Password reset not available');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  // Update user profile
  async function updateUserProfile(updates) {
    try {
      if (firebaseAuthService && firebaseAuthService.updateProfile) {
        await firebaseAuthService.updateProfile(updates);

        // Update local state
        setUserProfile(prev => ({ ...prev, ...updates }));

        return { success: true, message: 'Profile updated successfully' };
      } else {
        // Fallback: just update local state
        setUserProfile(prev => ({ ...prev, ...updates }));
        return { success: true, message: 'Profile updated locally' };
      }
    } catch (error) {
      console.error('Profile update error:', error);
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

  return React.createElement(
    AuthContext.Provider,
    { value: value },
    !loading && children
  );
}
