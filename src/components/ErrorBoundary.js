import React from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      const fallback = this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen bg-red-50 dark:bg-red-900">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-4">Something went wrong</h2>
            <p className="text-red-600 dark:text-red-300 mb-4">
              We encountered an unexpected error. Don&apos;t worry, your data is safe.
            </p>
            {this.state.error && (
              <details className="text-left bg-red-100 dark:bg-red-800 p-4 rounded mb-4">
                <summary className="cursor-pointer font-semibold">Reference: {this.state.error.toString()}</summary>
                <pre className="mt-2 text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <p className="text-red-600 dark:text-red-300 mb-4">
              If this problem persists, please contact support.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              aria-label="Refresh the page to try again"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
      
      return fallback;
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node
};

export default ErrorBoundary;
