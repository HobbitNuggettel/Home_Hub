import React, { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  Smartphone, 
  Monitor, 
  Tablet,
  CheckCircle,
  Info
} from 'lucide-react';

const PWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Check if app is already installed
    const checkInstallation = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          window.navigator.standalone === true) {
        setIsInstalled(true);
      }
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Check installation status
    checkInstallation();

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setShowInstallPrompt(false);
        setDeferredPrompt(null);
      } else {
        console.log('User dismissed the install prompt');
      }
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
  };

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !deferredPrompt || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Download className="text-blue-600" size={20} />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Install Home Hub
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Add Home Hub to your home screen for quick access and offline functionality.
            </p>
            
            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
              <Smartphone size={14} />
              <span>Works on mobile & desktop</span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Install App
              </button>
              <button
                onClick={dismissPrompt}
                className="px-3 py-2 text-gray-500 text-sm font-medium rounded-md hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Not Now
              </button>
            </div>
          </div>
          
          <button
            onClick={dismissPrompt}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// PWA Status Component
export const PWAStatus = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasServiceWorker, setHasServiceWorker] = useState(false);

  useEffect(() => {
    const checkInstallation = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          window.navigator.standalone === true) {
        setIsInstalled(true);
      }
    };

    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        setHasServiceWorker(!!registration);
      }
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    checkInstallation();
    checkServiceWorker();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border">
      <h3 className="text-lg font-medium text-gray-900 mb-4">PWA Status</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Installation Status</span>
          <div className="flex items-center space-x-2">
            {isInstalled ? (
              <>
                <CheckCircle className="text-green-500" size={16} />
                <span className="text-sm text-green-600">Installed</span>
              </>
            ) : (
              <>
                <Info className="text-blue-500" size={16} />
                <span className="text-sm text-blue-600">Not Installed</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Service Worker</span>
          <div className="flex items-center space-x-2">
            {hasServiceWorker ? (
              <>
                <CheckCircle className="text-green-500" size={16} />
                <span className="text-sm text-green-600">Active</span>
              </>
            ) : (
              <>
                <Info className="text-blue-500" size={16} />
                <span className="text-sm text-blue-600">Not Active</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Connection Status</span>
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <>
                <CheckCircle className="text-green-500" size={16} />
                <span className="text-sm text-green-600">Online</span>
              </>
            ) : (
              <>
                <Info className="text-blue-500" size={16} />
                <span className="text-sm text-blue-600">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {!isInstalled && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> Install Home Hub as a PWA for the best experience! 
            Look for the install prompt or use your browser's menu.
          </p>
        </div>
      )}
      
      {isInstalled && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700">
            🎉 <strong>Great!</strong> Home Hub is installed as a PWA. 
            You can now use it offline and access it from your home screen.
          </p>
        </div>
      )}
    </div>
  );
};

// PWA Features Component
export const PWAFeatures = () => {
  const features = [
    {
      icon: Download,
      title: 'Installable',
      description: 'Add to home screen like a native app',
      color: 'blue'
    },
    {
      icon: Smartphone,
      title: 'Offline Support',
      description: 'Work without internet connection',
      color: 'green'
    },
    {
      icon: Monitor,
      title: 'Cross-Platform',
      description: 'Works on all devices and browsers',
      color: 'purple'
    },
    {
      icon: CheckCircle,
      title: 'Auto-Updates',
      description: 'Always get the latest version',
      color: 'orange'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border">
      <h3 className="text-lg font-medium text-gray-900 mb-4">PWA Features</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            orange: 'bg-orange-100 text-orange-600'
          };
          
          return (
            <div key={index} className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${colorClasses[feature.color]}`}>
                <IconComponent size={16} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">{feature.title}</h4>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Note:</strong> PWA features work best in modern browsers. 
          For the full experience, use Chrome, Edge, Firefox, or Safari.
        </p>
      </div>
    </div>
  );
};

export default PWAInstall; 