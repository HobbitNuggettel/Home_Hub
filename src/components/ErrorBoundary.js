import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }
  
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Generate unique error ID for tracking
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo,
      errorId: errorId
    });
    
    // In production, you could send error to logging service here
    // logErrorToService(error, errorInfo, errorId);
  }
  
  handleReload = () => {
    window.location.reload();
  };
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          onReload={this.handleReload}
        />
      );
    }

    return this.props.children;
  }
}

// Separate functional component for the fallback UI to use hooks
function ErrorFallback({ error, errorInfo, errorId, onReload }) {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/'); // ✅ Use React Router navigation
  };
  
  const handleGoBack = () => {
    navigate(-1); // ✅ Use React Router navigation
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-900/20 dark:via-gray-900 dark:to-red-900/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Oops! Something went wrong
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          We encountered an unexpected error. Don't worry, your data is safe.
        </p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Error Details (Development)
            </summary>
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-xs font-mono text-gray-600 dark:text-gray-300 overflow-auto max-h-32">
              <div className="mb-2">
                <strong>Error:</strong> {error.toString()}
              </div>
              {errorInfo && (
                <div>
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap mt-1">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
              {errorId && (
                <div className="mt-2 text-gray-500 dark:text-gray-400">
                  Error ID: {errorId}
                </div>
              )}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onReload}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Page
          </button>

          <button
            onClick={handleGoHome}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Home
          </button>

          <button
            onClick={handleGoBack}
            className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>

        {/* Support Information */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            If this problem persists, please contact support
          </p>
          {errorId && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Reference: {errorId}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary(WrappedComponent, fallbackUI = null) {
  return function WithErrorBoundary(props) {
    return (
      <ErrorBoundary fallbackUI={fallbackUI}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

// Custom hook for error boundary context
export function useErrorBoundary() {
  const [error, setError] = React.useState(null);
  
  const handleError = React.useCallback((error) => {
    setError(error);
    console.error('Error caught by useErrorBoundary:', error);
  }, []);
  
  return { error, handleError };
}

export default ErrorBoundary;
