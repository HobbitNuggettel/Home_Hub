/**
 * PWA Install Prompt Component
 * Handles PWA installation prompts and user experience
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Download, X, Smartphone, Monitor, CheckCircle } from 'lucide-react';
import { 
  isAppInstallable, 
  isAppInstalled, 
  showInstallPrompt,
  updateApp 
} from '../../utils/serviceWorker';

const PWAInstallPrompt = ({ 
  onInstall,
  onDismiss,
  className = '',
  showOnMobile = true,
  showOnDesktop = false
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Check if app is already installed
  useEffect(() => {
    const checkInstallation = () => {
      const installed = isAppInstalled();
      setIsInstalled(installed);
    };

    checkInstallation();
  }, []);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Check if we should show the prompt based on device type
      const isMobile = window.innerWidth <= 768;
      if ((isMobile && showOnMobile) || (!isMobile && showOnDesktop)) {
        setIsVisible(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
      if (onInstall) {
        onInstall();
      }
    };

    // Listen for service worker updates
    const handleServiceWorkerUpdate = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('sw-update-available', handleServiceWorkerUpdate);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('sw-update-available', handleServiceWorkerUpdate);
    };
  }, [onInstall, showOnMobile, showOnDesktop]);

  // Handle install button click
  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setIsVisible(false);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  // Handle update button click
  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateApp();
      setUpdateAvailable(false);
    } catch (error) {
      console.error('Error during update:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle dismiss
  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  // Don't show if already installed or not installable
  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Install Home Hub
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Install this app on your device for a better experience. You can access it from your home screen.
            </p>
            
            <div className="flex items-center space-x-4 mt-3">
              <button
                onClick={handleInstall}
                disabled={!isInstallable}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Install</span>
              </button>
              
              <button
                onClick={handleDismiss}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            aria-label="Dismiss install prompt"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Update notification component
export const PWAUpdateNotification = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setIsVisible(true);
    };

    window.addEventListener('sw-update-available', handleUpdateAvailable);
    return () => {
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateApp();
      setIsVisible(false);
    } catch (error) {
      console.error('Error during update:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Update Available
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              A new version of Home Hub is available. Update now for the latest features.
            </p>
            
            <div className="flex items-center space-x-2 mt-3">
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-xs font-medium transition-colors"
              >
                <Download className="h-3 w-3" />
                <span>{isUpdating ? 'Updating...' : 'Update'}</span>
              </button>
              
              <button
                onClick={handleDismiss}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs font-medium transition-colors"
              >
                Later
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            aria-label="Dismiss update notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// PWA status indicator
export const PWAStatusIndicator = ({ className = '' }) => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const checkInstallation = () => {
      setIsInstalled(isAppInstalled());
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    checkInstallation();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isInstalled) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
        <Smartphone className="h-3 w-3" />
        <span>PWA</span>
      </div>
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
    </div>
  );
};

PWAInstallPrompt.propTypes = {
  onInstall: PropTypes.func,
  onDismiss: PropTypes.func,
  className: PropTypes.string,
  showOnMobile: PropTypes.bool,
  showOnDesktop: PropTypes.bool
};

export default PWAInstallPrompt;



