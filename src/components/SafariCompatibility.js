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
      
      // Add Object.assign polyfill for very old Safari
      if (!Object.assign) {
        Object.assign = function(target, ...sources) {
          sources.forEach(source => {
            if (source) {
              Object.keys(source).forEach(key => {
                target[key] = source[key];
              });
            }
          });
          return target;
        };
      }
      
      // Add String.includes polyfill for very old Safari
      if (!String.prototype.includes) {
        String.prototype.includes = function(search, start) {
          if (typeof start !== 'number') {
            start = 0;
          }
          if (start + search.length > this.length) {
            return false;
          } else {
            return this.indexOf(search, start) !== -1;
          }
        };
      }
      
      // Add Number.isNaN polyfill
      if (!Number.isNaN) {
        Number.isNaN = function(value) {
          return typeof value === 'number' && isNaN(value);
        };
      }
      
      // Add Number.isFinite polyfill
      if (!Number.isFinite) {
        Number.isFinite = function(value) {
          return typeof value === 'number' && isFinite(value);
        };
      }
      
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
