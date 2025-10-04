/**
 * Sound Notification Service - Provides different audio cues for various scenarios
 * Created: 2025-01-29
 */

class SoundNotificationService {
  constructor() {
    this.audioContext = null;
    this.isEnabled = true;
    this.volume = 0.7;
    this.soundSettings = {
      // Task completion sounds
      taskComplete: { frequency: 800, duration: 200, type: 'success' },
      workComplete: { frequency: 1000, duration: 500, type: 'celebration' },
      
      // Approval/confirmation sounds
      approvalNeeded: { frequency: 600, duration: 300, type: 'attention' },
      userApproval: { frequency: 900, duration: 250, type: 'confirmation' },
      
      // Error/warning sounds
      error: { frequency: 300, duration: 400, type: 'error' },
      warning: { frequency: 500, duration: 300, type: 'warning' },
      
      // Development workflow sounds
      serverRestart: { frequency: 700, duration: 150, type: 'system' },
      buildComplete: { frequency: 1200, duration: 300, type: 'success' },
      testPass: { frequency: 1000, duration: 100, type: 'success' },
      testFail: { frequency: 400, duration: 200, type: 'error' },
      
      // Feature-specific sounds
      inventoryAlert: { frequency: 600, duration: 250, type: 'alert' },
      budgetAlert: { frequency: 500, duration: 300, type: 'warning' },
      recipeSuggestion: { frequency: 800, duration: 200, type: 'info' },
      maintenanceReminder: { frequency: 400, duration: 400, type: 'reminder' },
      
      // System sounds
      notification: { frequency: 600, duration: 150, type: 'info' },
      connectionLost: { frequency: 200, duration: 500, type: 'error' },
      connectionRestored: { frequency: 1000, duration: 200, type: 'success' }
    };
    
    this.initAudioContext();
  }

  // Initialize Web Audio API context
  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported, falling back to simple beep');
      this.audioContext = null;
    }
  }

  // Generate different types of sounds
  generateSound(type, frequency, duration, volume = this.volume) {
    if (!this.isEnabled) return;

    // Resume audio context if suspended (required by some browsers)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    if (this.audioContext) {
      this.generateWebAudioSound(type, frequency, duration, volume);
    } else {
      this.generateSimpleBeep(frequency, duration, volume);
    }
  }

  // Generate sound using Web Audio API
  generateWebAudioSound(type, frequency, duration, volume) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Configure oscillator based on sound type
    switch (type) {
      case 'success':
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.2, this.audioContext.currentTime + duration * 0.5);
        break;
      case 'error':
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.8, this.audioContext.currentTime + duration * 0.5);
        break;
      case 'warning':
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(frequency * 1.1, this.audioContext.currentTime + duration * 0.3);
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime + duration * 0.6);
        break;
      case 'celebration':
        // Ascending chord
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, this.audioContext.currentTime + duration * 0.3);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 2, this.audioContext.currentTime + duration * 0.7);
        break;
      case 'attention':
        // Double beep
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(0, this.audioContext.currentTime + duration * 0.3);
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime + duration * 0.4);
        break;
      case 'confirmation':
        // Quick double beep
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(0, this.audioContext.currentTime + duration * 0.2);
        oscillator.frequency.setValueAtTime(frequency * 1.2, this.audioContext.currentTime + duration * 0.3);
        break;
      case 'system':
        // System-like beep
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(frequency * 0.7, this.audioContext.currentTime + duration);
        break;
      case 'alert':
        // Urgent alert pattern
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(frequency * 1.3, this.audioContext.currentTime + duration * 0.2);
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime + duration * 0.4);
        oscillator.frequency.setValueAtTime(frequency * 1.3, this.audioContext.currentTime + duration * 0.6);
        break;
      case 'reminder':
        // Gentle reminder tone
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.1, this.audioContext.currentTime + duration * 0.5);
        oscillator.frequency.exponentialRampToValueAtTime(frequency, this.audioContext.currentTime + duration);
        break;
      case 'info':
      default:
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        break;
    }
    
    // Configure gain (volume) with fade in/out
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Fallback simple beep for browsers without Web Audio API
  generateSimpleBeep(frequency, duration, volume) {
    // Create a simple audio element with data URL
    const sampleRate = 44100;
    const numSamples = Math.floor(sampleRate * duration / 1000);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);
    
    // Generate sine wave
    for (let i = 0; i < numSamples; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * volume * 32767;
      view.setInt16(44 + i * 2, sample, true);
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().then(() => {
      setTimeout(() => URL.revokeObjectURL(url), duration);
    });
  }

  // Play specific sound types
  playTaskComplete() {
    const sound = this.soundSettings.taskComplete;
    this.generateSound(sound.type, sound.frequency, sound.duration);
  }

  playWorkComplete() {
    const sound = this.soundSettings.workComplete;
    this.generateSound(sound.type, sound.frequency, sound.duration);
  }

  playApprovalNeeded() {
    const sound = this.soundSettings.approvalNeeded;
    this.generateSound(sound.type, sound.frequency, sound.duration);
  }

  playUserApproval() {
    const sound = this.soundSettings.userApproval;
    this.generateSound(sound.type, sound.frequency, sound.duration);
  }

  playError() {
    const sound = this.soundSettings.error;
    this.generateSound(sound.type, sound.frequency, sound.duration);
  }

  playWarning() {
    const sound = this.soundSettings.warning;
    this.generateSound(sound.type, sound.frequency, sound.duration);
  }

  playServerRestart() {
    const sound = this.soundSettings.serverRestart;
    this.generateSound(sound.type, sound.frequency, sound.duration);
  }

  playBuildComplete() {
    const sound = this.soundSettings.buildComplete;
    this.generateSound(sound.type, sound.frequency, sound.duration);
  }

  playTestPass() {
    const sound = this.soundSettings.testPass;
    this.generateSound(sound.type, sound.frequency, sound.duration);
  }

  playTestFail() {
    const sound = this.soundSettings.testFail;
    this.generateSound(sound.type, sound.frequency, sound.duration);
  }

  playInventoryAlert() {
    const sound = this.soundSettings.inventoryAlert;
    this.generateSound(sound.type, sound.frequency, sound.duration);
  }

  playBudgetAlert() {
    const sound = this.soundSettings.budgetAlert;
    this.generateSound(sound.type, sound.frequency, sound.duration);
  }

  playRecipeSuggestion() {
    const sound = this.soundSettings.recipeSuggestion;
    this.generateSound(sound.type, sound.frequency, sound.duration);
  }

  playMaintenanceReminder() {
    const sound = this.soundSettings.maintenanceReminder;
    this.generateSound(sound.type, sound.frequency, sound.duration);
  }

  playNotification() {
    const sound = this.soundSettings.notification;
    this.generateSound(sound.type, sound.frequency, sound.duration);
  }

  playConnectionLost() {
    const sound = this.soundSettings.connectionLost;
    this.generateSound(sound.type, sound.frequency, sound.duration);
  }

  playConnectionRestored() {
    const sound = this.soundSettings.connectionRestored;
    this.generateSound(sound.type, sound.frequency, sound.duration);
  }

  // Custom sound with parameters
  playCustomSound(frequency, duration, type = 'info', volume = this.volume) {
    this.generateSound(type, frequency, duration, volume);
  }

  // Sound sequence for complex notifications
  playSoundSequence(sounds) {
    let delay = 0;
    sounds.forEach((sound, index) => {
      setTimeout(() => {
        if (typeof sound === 'string' && this.soundSettings[sound]) {
          const soundConfig = this.soundSettings[sound];
          this.generateSound(soundConfig.type, soundConfig.frequency, soundConfig.duration);
        } else if (typeof sound === 'object') {
          this.generateSound(sound.type, sound.frequency, sound.duration, sound.volume);
        }
      }, delay);
      delay += (sound.duration || 200) + 50; // Add small gap between sounds
    });
  }

  // Settings management
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  updateSoundSetting(soundName, newSettings) {
    if (this.soundSettings[soundName]) {
      this.soundSettings[soundName] = { ...this.soundSettings[soundName], ...newSettings };
    }
  }

  getSettings() {
    return {
      isEnabled: this.isEnabled,
      volume: this.volume,
      soundSettings: this.soundSettings,
      audioContextSupported: !!this.audioContext
    };
  }

  // Test all sounds
  testAllSounds() {
    const sounds = Object.keys(this.soundSettings);
    let delay = 0;
    
    sounds.forEach((soundName, index) => {
      setTimeout(() => {
        const sound = this.soundSettings[soundName];
        this.generateSound(sound.type, sound.frequency, sound.duration);
        console.log(`Playing: ${soundName}`);
      }, delay);
      delay += sound.duration + 200;
    });
  }
}

export default new SoundNotificationService();





