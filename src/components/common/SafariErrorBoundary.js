import React from 'react';
import PropTypes from 'prop-types';

/**
 * Safari-specific Error Boundary
 * 
 * This component catches Safari-specific errors and provides fallbacks
 */
class SafariErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Check if this is a Safari-specific error
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isSafariError = error.message.includes('Optional chaining') || 
                         error.message.includes('QrCode') ||
                         error.message.includes('Cannot read property') ||
                         error.message.includes('undefined is not an object');
    
    if (isSafari && isSafariError) {
      return { hasError: true, isSafariError: true };
    }
    
    return { hasError: true, isSafariError: false };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    console.error('Safari Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.state.isSafariError) {
        return (
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
              <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                Safari Compatibility Issue
              </h1>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We detected a Safari-specific compatibility issue. Please try:
              </p>
              <ul className="text-left text-sm text-gray-600 dark:text-gray-400 mb-6">
                <li>• Update Safari to the latest version</li>
                <li>• Try using Chrome or Firefox instead</li>
                <li>• Clear your browser cache</li>
                <li>• Disable browser extensions temporarily</li>
              </ul>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reload Page
              </button>
            </div>
          </div>
        );
      }
      
      // Generic error fallback
      return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

SafariErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SafariErrorBoundary;
