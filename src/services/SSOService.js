/**
 * SSO Service
 * Single Sign-On integration for enterprise authentication
 */

import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '../firebase/config';
import loggingService from './LoggingService';

class SSOService {
  constructor() {
    this.providers = {
      google: new GoogleAuthProvider(),
      microsoft: new OAuthProvider('microsoft.com'),
      apple: new OAuthProvider('apple.com'),
      github: new OAuthProvider('github.com'),
      linkedin: new OAuthProvider('linkedin.com')
    };
    
    this.configureProviders();
  }

  /**
   * Configure OAuth providers
   */
  configureProviders() {
    // Google provider configuration
    this.providers.google.addScope('email');
    this.providers.google.addScope('profile');
    
    // Microsoft provider configuration
    this.providers.microsoft.addScope('user.read');
    this.providers.microsoft.addScope('openid');
    this.providers.microsoft.addScope('email');
    this.providers.microsoft.addScope('profile');
    
    // Apple provider configuration
    this.providers.apple.addScope('email');
    this.providers.apple.addScope('name');
    
    // GitHub provider configuration
    this.providers.github.addScope('user:email');
    this.providers.github.addScope('read:user');
    
    // LinkedIn provider configuration
    this.providers.linkedin.addScope('r_liteprofile');
    this.providers.linkedin.addScope('r_emailaddress');
  }

  /**
   * Sign in with SSO provider
   */
  async signInWithProvider(providerName) {
    try {
      const provider = this.providers[providerName];
      if (!provider) {
        throw new Error(`Unsupported SSO provider: ${providerName}`);
      }

      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Extract additional user information
      const additionalUserInfo = result._tokenResponse;
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: providerName,
        providerId: additionalUserInfo?.providerId,
        accessToken: additionalUserInfo?.oauthAccessToken,
        refreshToken: additionalUserInfo?.oauthRefreshToken,
        expiresIn: additionalUserInfo?.expiresIn
      };

      // Log successful SSO sign-in
      loggingService.info('SSO sign-in successful', {
        provider: providerName,
        userId: user.uid,
        email: user.email
      });

      return {
        success: true,
        user: userData,
        credential: result.credential
      };
    } catch (error) {
      loggingService.error('SSO sign-in failed', {
        provider: providerName,
        error: error.message,
        code: error.code
      });

      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle() {
    return await this.signInWithProvider('google');
  }

  /**
   * Sign in with Microsoft
   */
  async signInWithMicrosoft() {
    return await this.signInWithProvider('microsoft');
  }

  /**
   * Sign in with Apple
   */
  async signInWithApple() {
    return await this.signInWithProvider('apple');
  }

  /**
   * Sign in with GitHub
   */
  async signInWithGitHub() {
    return await this.signInWithProvider('github');
  }

  /**
   * Sign in with LinkedIn
   */
  async signInWithLinkedIn() {
    return await this.signInWithProvider('linkedin');
  }

  /**
   * Sign in with custom OAuth provider
   */
  async signInWithCustomProvider(providerId, scopes = []) {
    try {
      const provider = new OAuthProvider(providerId);
      
      // Add custom scopes
      scopes.forEach(scope => provider.addScope(scope));
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: providerId,
        providerId: result._tokenResponse?.providerId,
        accessToken: result._tokenResponse?.oauthAccessToken,
        refreshToken: result._tokenResponse?.oauthRefreshToken,
        expiresIn: result._tokenResponse?.expiresIn
      };

      loggingService.info('Custom SSO sign-in successful', {
        provider: providerId,
        userId: user.uid,
        email: user.email
      });

      return {
        success: true,
        user: userData,
        credential: result.credential
      };
    } catch (error) {
      loggingService.error('Custom SSO sign-in failed', {
        provider: providerId,
        error: error.message,
        code: error.code
      });

      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Sign in with SAML
   */
  async signInWithSAML(samlResponse) {
    try {
      // This would typically involve server-side SAML processing
      // For now, we'll simulate the process
      const response = await fetch('/api/auth/saml', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ samlResponse })
      });

      const data = await response.json();
      
      if (data.success) {
        // Sign in with the custom token
        const credential = await signInWithCredential(auth, data.credential);
        
        loggingService.info('SAML sign-in successful', {
          userId: credential.user.uid,
          email: credential.user.email
        });

        return {
          success: true,
          user: credential.user,
          credential: data.credential
        };
      } else {
        throw new Error(data.error || 'SAML authentication failed');
      }
    } catch (error) {
      loggingService.error('SAML sign-in failed', {
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sign in with LDAP
   */
  async signInWithLDAP(username, password) {
    try {
      const response = await fetch('/api/auth/ldap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (data.success) {
        // Sign in with the custom token
        const credential = await signInWithCredential(auth, data.credential);
        
        loggingService.info('LDAP sign-in successful', {
          userId: credential.user.uid,
          username
        });

        return {
          success: true,
          user: credential.user,
          credential: data.credential
        };
      } else {
        throw new Error(data.error || 'LDAP authentication failed');
      }
    } catch (error) {
      loggingService.error('LDAP sign-in failed', {
        username,
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sign out from all SSO providers
   */
  async signOut() {
    try {
      await firebaseSignOut(auth);
      
      loggingService.info('SSO sign-out successful');
      
      return {
        success: true
      };
    } catch (error) {
      loggingService.error('SSO sign-out failed', {
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get available SSO providers
   */
  getAvailableProviders() {
    return Object.keys(this.providers).map(providerName => ({
      name: providerName,
      displayName: this.getProviderDisplayName(providerName),
      icon: this.getProviderIcon(providerName),
      enabled: this.isProviderEnabled(providerName)
    }));
  }

  /**
   * Get provider display name
   */
  getProviderDisplayName(providerName) {
    const displayNames = {
      google: 'Google',
      microsoft: 'Microsoft',
      apple: 'Apple',
      github: 'GitHub',
      linkedin: 'LinkedIn'
    };
    return displayNames[providerName] || providerName;
  }

  /**
   * Get provider icon
   */
  getProviderIcon(providerName) {
    const icons = {
      google: '🔵',
      microsoft: '🟦',
      apple: '🍎',
      github: '🐙',
      linkedin: '💼'
    };
    return icons[providerName] || '🔐';
  }

  /**
   * Check if provider is enabled
   */
  isProviderEnabled(providerName) {
    // This would typically check against configuration
    return true;
  }

  /**
   * Get SSO configuration
   */
  getSSOConfig() {
    return {
      providers: this.getAvailableProviders(),
      samlEnabled: process.env.REACT_APP_SAML_ENABLED === 'true',
      ldapEnabled: process.env.REACT_APP_LDAP_ENABLED === 'true',
      autoRedirect: process.env.REACT_APP_SSO_AUTO_REDIRECT === 'true'
    };
  }
}

const ssoService = new SSOService();
export default ssoService;
