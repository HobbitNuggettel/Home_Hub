class BiometricAuthService {
  constructor() {
    this.isSupported = this.checkSupport();
    this.publicKeyCredential = null;
  }

  // Check if WebAuthn is supported
  checkSupport() {
    return (
      typeof window !== 'undefined' &&
      window.PublicKeyCredential &&
      window.navigator.credentials &&
      window.navigator.credentials.create &&
      window.navigator.credentials.get
    );
  }

  // Check if biometric authentication is available
  async isAvailable() {
    if (!this.isSupported) return false;

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch (error) {
      return false;
    }
  }

  // Register biometric credential
  async register(userId, userName, displayName) {
    if (!this.isSupported) {
      throw new Error('Biometric authentication is not supported');
    }

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialCreationOptions = {
        challenge: challenge,
        rp: {
          name: 'Home Hub',
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: userName,
          displayName: displayName,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: 60000,
        attestation: 'direct',
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      });

      this.publicKeyCredential = credential;
      return credential;
    } catch (error) {
      throw new Error(`Biometric registration failed: ${error.message}`);
    }
  }

  // Authenticate with biometric
  async authenticate(credentialId) {
    if (!this.isSupported) {
      throw new Error('Biometric authentication is not supported');
    }

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions = {
        challenge: challenge,
        allowCredentials: [
          {
            id: credentialId,
            type: 'public-key',
            transports: ['internal'],
          },
        ],
        timeout: 60000,
        userVerification: 'required',
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      return assertion;
    } catch (error) {
      throw new Error(`Biometric authentication failed: ${error.message}`);
    }
  }

  // Store biometric credential
  async storeCredential(credential, userId) {
    try {
      const credentialData = {
        id: Array.from(new Uint8Array(credential.rawId)),
        publicKey: Array.from(new Uint8Array(credential.response.publicKey)),
        userId: userId,
        createdAt: Date.now(),
      };

      localStorage.setItem('homeHub_biometric_credential', JSON.stringify(credentialData));
      return true;
    } catch (error) {
      throw new Error(`Failed to store biometric credential: ${error.message}`);
    }
  }

  // Get stored biometric credential
  getStoredCredential() {
    try {
      const stored = localStorage.getItem('homeHub_biometric_credential');
      if (!stored) return null;

      const credentialData = JSON.parse(stored);
      return {
        id: new Uint8Array(credentialData.id),
        publicKey: new Uint8Array(credentialData.publicKey),
        userId: credentialData.userId,
        createdAt: credentialData.createdAt,
      };
    } catch (error) {
      return null;
    }
  }

  // Remove stored biometric credential
  removeStoredCredential() {
    localStorage.removeItem('homeHub_biometric_credential');
  }

  // Check if biometric is enrolled
  isEnrolled() {
    return this.getStoredCredential() !== null;
  }

  // Quick biometric login
  async quickLogin() {
    const storedCredential = this.getStoredCredential();
    if (!storedCredential) {
      throw new Error('No biometric credential found');
    }

    try {
      const assertion = await this.authenticate(storedCredential.id);
      return {
        success: true,
        userId: storedCredential.userId,
        assertion: assertion,
      };
    } catch (error) {
      throw new Error(`Quick login failed: ${error.message}`);
    }
  }

  // Get biometric status
  getStatus() {
    return {
      isSupported: this.isSupported,
      isAvailable: this.isAvailable(),
      isEnrolled: this.isEnrolled(),
    };
  }

  // Setup biometric for user
  async setupBiometric(userId, userName, displayName) {
    try {
      const credential = await this.register(userId, userName, displayName);
      await this.storeCredential(credential, userId);
      return {
        success: true,
        credential: credential,
      };
    } catch (error) {
      throw new Error(`Biometric setup failed: ${error.message}`);
    }
  }

  // Disable biometric authentication
  disableBiometric() {
    this.removeStoredCredential();
    this.publicKeyCredential = null;
  }

  // Get available authenticators
  async getAvailableAuthenticators() {
    if (!this.isSupported) return [];

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available ? ['fingerprint', 'face', 'voice'] : [];
    } catch (error) {
      return [];
    }
  }

  // Check if specific authenticator is available
  async isAuthenticatorAvailable(type) {
    const available = await this.getAvailableAuthenticators();
    return available.includes(type);
  }

  // Get biometric authentication info
  getInfo() {
    return {
      isSupported: this.isSupported,
      isAvailable: this.isAvailable(),
      isEnrolled: this.isEnrolled(),
      availableAuthenticators: this.getAvailableAuthenticators(),
    };
  }
}

export default new BiometricAuthService();





