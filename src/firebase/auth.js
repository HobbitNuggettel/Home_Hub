import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updatePassword,
  updateEmail,
  updateProfile,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  PhoneAuthProvider,
  RecaptchaVerifier,
  onAuthStateChanged,
  sendEmailVerification,
  verifyPasswordResetCode,
  applyActionCode,
  checkActionCode,
  linkWithCredential,
  unlink,
  fetchSignInMethodsForEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from './config';

// Authentication Service Class
class FirebaseAuthService {
  constructor() {
    this.currentUser = null;
    this.authStateListeners = new Set();
    this.providers = {
      google: new GoogleAuthProvider(),
      facebook: new FacebookAuthProvider(),
      twitter: new TwitterAuthProvider(),
      github: new GithubAuthProvider(),
      phone: new PhoneAuthProvider(auth)
    };
    
    // Initialize auth state listener
    this.initAuthStateListener();
  }

  // Initialize authentication state listener
  initAuthStateListener() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.notifyAuthStateListeners(user);
    });
  }

  // Add auth state change listener
  onAuthStateChange(callback) {
    this.authStateListeners.add(callback);
    return () => this.authStateListeners.delete(callback);
  }

  // Notify all auth state listeners
  notifyAuthStateListeners(user) {
    this.authStateListeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Auth state listener error:', error);
      }
    });
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Check if user email is verified
  isEmailVerified() {
    return this.currentUser?.emailVerified || false;
  }

  // Email/Password Authentication
  async signUpWithEmail(email, password, displayName = null) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      // Send email verification
      await this.sendEmailVerification();
      
      return {
        success: true,
        user: userCredential.user,
        message: 'Account created successfully! Please check your email for verification.'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  }

  async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: userCredential.user,
        message: 'Signed in successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  }

  async signOut() {
    try {
      await signOut(auth);
      return {
        success: true,
        message: 'Signed out successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  }

  // Social Authentication
  async signInWithGoogle() {
    try {
      const userCredential = await this.signInWithPopup(this.providers.google);
      return {
        success: true,
        user: userCredential.user,
        message: 'Signed in with Google successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  }

  async signInWithFacebook() {
    try {
      const userCredential = await this.signInWithPopup(this.providers.facebook);
      return {
        success: true,
        user: userCredential.user,
        message: 'Signed in with Facebook successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  }

  async signInWithTwitter() {
    try {
      const userCredential = await this.signInWithPopup(this.providers.twitter);
      return {
        success: true,
        user: userCredential.user,
        message: 'Signed in with Twitter successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  }

  async signInWithGithub() {
    try {
      const userCredential = await this.signInWithPopup(this.providers.github);
      return {
        success: true,
        user: userCredential.user,
        message: 'Signed in with GitHub successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  }

  // Phone Authentication
  async signInWithPhone(phoneNumber, appVerifier) {
    try {
      const confirmationResult = await this.providers.phone.verifyPhoneNumber(
        phoneNumber, 
        appVerifier
      );
      
      return {
        success: true,
        confirmationResult,
        message: 'Verification code sent to your phone!'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  }

  async confirmPhoneCode(confirmationResult, code) {
    try {
      const userCredential = await confirmationResult.confirm(code);
      return {
        success: true,
        user: userCredential.user,
        message: 'Phone number verified successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  }

  // Password Management
  async sendPasswordResetEmail(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Password reset email sent! Check your inbox.'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  }

  async confirmPasswordReset(code, newPassword) {
    try {
      await confirmPasswordReset(auth, code, newPassword);
      return {
        success: true,
        message: 'Password reset successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  }

  async updatePassword(newPassword) {
    try {
      if (!this.currentUser) {
        throw new Error('No user is currently signed in');
      }
      
      await updatePassword(this.currentUser, newPassword);
      return {
        success: true,
        message: 'Password updated successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  }

  // Profile Management
  async updateProfile(updates) {
    try {
      if (!this.currentUser) {
        throw new Error('No user is currently signed in');
      }
      
      await updateProfile(this.currentUser, updates);
      return {
        success: true,
        message: 'Profile updated successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  }

  async updateEmail(newEmail) {
    try {
      if (!this.currentUser) {
        throw new Error('No user is currently signed in');
      }
      
      await updateEmail(this.currentUser, newEmail);
      return {
        success: true,
        message: 'Email updated successfully! Please check your new email for verification.'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  }

  // Email Verification
  async sendEmailVerification() {
    try {
      if (!this.currentUser) {
        throw new Error('No user is currently signed in');
      }
      
      await sendEmailVerification(this.currentUser);
      return {
        success: true,
        message: 'Verification email sent! Check your inbox.'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  }

  // Account Linking
  async linkAccount(credential) {
    try {
      if (!this.currentUser) {
        throw new Error('No user is currently signed in');
      }
      
      await linkWithCredential(this.currentUser, credential);
      return {
        success: true,
        message: 'Account linked successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  }

  async unlinkAccount(providerId) {
    try {
      if (!this.currentUser) {
        throw new Error('No user is currently signed in');
      }
      
      await unlink(this.currentUser, providerId);
      return {
        success: true,
        message: 'Account unlinked successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  }

  // Account Management
  async deleteAccount(password) {
    try {
      if (!this.currentUser) {
        throw new Error('No user is currently signed in');
      }
      
      // Re-authenticate before deletion
      const credential = EmailAuthProvider.credential(
        this.currentUser.email,
        password
      );
      await reauthenticateWithCredential(this.currentUser, credential);
      
      await deleteUser(this.currentUser);
      return {
        success: true,
        message: 'Account deleted successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  }

  async reauthenticateUser(password) {
    try {
      if (!this.currentUser) {
        throw new Error('No user is currently signed in');
      }
      
      const credential = EmailAuthProvider.credential(
        this.currentUser.email,
        password
      );
      await reauthenticateWithCredential(this.currentUser, credential);
      
      return {
        success: true,
        message: 'Re-authentication successful!'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  }

  // Utility Methods
  async fetchSignInMethods(email) {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return {
        success: true,
        methods,
        message: 'Sign-in methods retrieved successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  }

  async isSignInWithEmailLink(link) {
    try {
      return isSignInWithEmailLink(auth, link);
    } catch (error) {
      return false;
    }
  }

  async signInWithEmailLink(email, link) {
    try {
      const userCredential = await signInWithEmailLink(auth, email, link);
      return {
        success: true,
        user: userCredential.user,
        message: 'Signed in with email link successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  }

  async sendSignInLinkToEmail(email, actionCodeSettings) {
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      return {
        success: true,
        message: 'Sign-in link sent to your email!'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getAuthErrorMessage(error.code),
        code: error.code
      };
    }
  }

  // Error Message Mapping
  getAuthErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-email': 'Invalid email address format.',
      'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/operation-not-allowed': 'This operation is not allowed.',
      'auth/invalid-verification-code': 'Invalid verification code.',
      'auth/invalid-verification-id': 'Invalid verification ID.',
      'auth/quota-exceeded': 'Quota exceeded. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed.',
      'auth/popup-blocked': 'Sign-in popup was blocked by the browser.',
      'auth/cancelled-popup-request': 'Sign-in popup request was cancelled.',
      'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in credentials.',
      'auth/requires-recent-login': 'This operation requires recent authentication. Please sign in again.',
      'auth/user-mismatch': 'The provided credentials do not correspond to the previously signed in user.',
      'auth/credential-already-in-use': 'This credential is already associated with a different user account.',
      'auth/invalid-credential': 'The provided credential is invalid.',
      'auth/operation-not-supported-in-this-environment': 'This operation is not supported in the current environment.',
      'auth/timeout': 'Operation timed out. Please try again.',
      'auth/network-request-failed': 'Network request failed. Please check your connection.',
      'auth/internal-error': 'An internal error occurred. Please try again.',
      'auth/invalid-app-credential': 'Invalid app credential.',
      'auth/invalid-user-token': 'Invalid user token.',
      'auth/invalid-tenant-id': 'Invalid tenant ID.',
      'auth/unauthorized-continue-uri': 'Unauthorized continue URI.',
      'auth/invalid-dynamic-link-domain': 'Invalid dynamic link domain.',
      'auth/argument-error': 'Invalid argument provided.',
      'auth/invalid-persistence-type': 'Invalid persistence type.',
      'auth/unsupported-persistence-type': 'Unsupported persistence type.',
      'auth/invalid-phone-number': 'Invalid phone number format.',
      'auth/missing-phone-number': 'Phone number is required.',
      'auth/quota-exceeded': 'Quota exceeded. Please try again later.',
      'auth/invalid-recaptcha-token': 'Invalid reCAPTCHA token.',
      'auth/missing-recaptcha-token': 'reCAPTCHA token is required.',
      'auth/invalid-recaptcha-action': 'Invalid reCAPTCHA action.',
      'auth/missing-recaptcha-action': 'reCAPTCHA action is required.',
      'auth/invalid-recaptcha-version': 'Invalid reCAPTCHA version.',
      'auth/missing-recaptcha-version': 'reCAPTCHA version is required.',
      'auth/invalid-recaptcha-secret': 'Invalid reCAPTCHA secret.',
      'auth/missing-recaptcha-secret': 'reCAPTCHA secret is required.',
      'auth/invalid-recaptcha-response': 'Invalid reCAPTCHA response.',
      'auth/missing-recaptcha-response': 'reCAPTCHA response is required.',
      'auth/invalid-recaptcha-site-key': 'Invalid reCAPTCHA site key.',
      'auth/missing-recaptcha-site-key': 'reCAPTCHA site key is required.',
      'auth/invalid-recaptcha-domain': 'Invalid reCAPTCHA domain.',
      'auth/missing-recaptcha-domain': 'reCAPTCHA domain is required.',
      'auth/invalid-recaptcha-size': 'Invalid reCAPTCHA size.',
      'auth/missing-recaptcha-size': 'reCAPTCHA size is required.',
      'auth/invalid-recaptcha-theme': 'Invalid reCAPTCHA theme.',
      'auth/missing-recaptcha-theme': 'reCAPTCHA theme is required.',
      'auth/invalid-recaptcha-type': 'Invalid reCAPTCHA type.',
      'auth/missing-recaptcha-type': 'reCAPTCHA type is required.',
      'auth/invalid-recaptcha-badge': 'Invalid reCAPTCHA badge.',
      'auth/missing-recaptcha-badge': 'reCAPTCHA badge is required.',
      'auth/invalid-recaptcha-action': 'Invalid reCAPTCHA action.',
      'auth/missing-recaptcha-action': 'reCAPTCHA action is required.',
      'auth/invalid-recaptcha-version': 'Invalid reCAPTCHA version.',
      'auth/missing-recaptcha-version': 'reCAPTCHA version is required.',
      'auth/invalid-recaptcha-secret': 'Invalid reCAPTCHA secret.',
      'auth/missing-recaptcha-secret': 'reCAPTCHA secret is required.',
      'auth/invalid-recaptcha-response': 'Invalid reCAPTCHA response.',
      'auth/missing-recaptcha-response': 'reCAPTCHA response is required.',
      'auth/invalid-recaptcha-site-key': 'Invalid reCAPTCHA site key.',
      'auth/missing-recaptcha-site-key': 'reCAPTCHA site key is required.',
      'auth/invalid-recaptcha-domain': 'Invalid reCAPTCHA domain.',
      'auth/missing-recaptcha-domain': 'reCAPTCHA domain is required.',
      'auth/invalid-recaptcha-size': 'Invalid reCAPTCHA size.',
      'auth/missing-recaptcha-size': 'reCAPTCHA size is required.',
      'auth/invalid-recaptcha-theme': 'Invalid reCAPTCHA theme.',
      'auth/missing-recaptcha-theme': 'reCAPTCHA theme is required.',
      'auth/invalid-recaptcha-type': 'Invalid reCAPTCHA type.',
      'auth/missing-recaptcha-type': 'reCAPTCHA type is required.',
      'auth/invalid-recaptcha-badge': 'Invalid reCAPTCHA badge.',
      'auth/missing-recaptcha-badge': 'reCAPTCHA badge is required.'
    };
    
    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }

  // Helper method for popup-based authentication
  async signInWithPopup(provider) {
    // This would need to be implemented with a popup window
    // For now, we'll use the redirect method
    throw new Error('Popup authentication not yet implemented. Use redirect method.');
  }
}

// Create and export singleton instance
export const firebaseAuthService = new FirebaseAuthService();

// Note: All methods are available through the firebaseAuthService instance

export default firebaseAuthService;
