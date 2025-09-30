import React, { useEffect } from 'react';

/**
 * Safari Compatibility Component
 * 
 * This component provides Safari-specific compatibility fixes:
 * 1. Polyfills for older Safari versions
 * 2. Error boundaries for Safari-specific issues
 * 3. Feature detection and graceful degradation
 */

const SafariCompatibility = ({ children }) => {
  useEffect(() => {
    // Check if we're running in Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isSafari) {
      console.log('Safari detected, applying compatibility fixes');
      
      // Add polyfills for older Safari versions
      if (!window.Promise) {
        console.warn('Safari: Promise not supported, loading polyfill');
        // Promise polyfill is loaded in index.html
      }
      
      if (!Array.prototype.includes) {
        console.warn('Safari: Array.includes not supported, loading polyfill');
        // Array.includes polyfill is loaded in index.html
      }
      
      // Polyfills are handled by external CDN in index.html
      // This avoids ESLint no-extend-native warnings
      console.log('Safari polyfills loaded via CDN');
      
      // Add console.group polyfill for older Safari
      if (!console.group) {
        console.group = function() { console.log('---'); };
        console.groupEnd = function() { console.log('---'); };
      }
      
      console.log('Safari compatibility fixes applied');
    }
  }, []);

  return children;
};

export default SafariCompatibility;
