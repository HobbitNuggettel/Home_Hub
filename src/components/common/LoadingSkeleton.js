import React from 'react';

const LoadingSkeleton = ({ type = 'default', className = '' }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg loading-skeleton"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton w-3/4"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton w-5/6"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton w-4/6"></div>
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div className={`space-y-3 ${className}`}>
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full loading-skeleton mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton w-2/3"></div>
                </div>
                <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton"></div>
              </div>
            ))}
          </div>
        );
      
      case 'table':
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton w-1/4"></div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton mr-3"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton w-32"></div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton w-20"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton w-16"></div>
                      <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'form':
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
            <div className="space-y-6">
              <div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton w-1/3 mb-2"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton w-1/4 mb-2"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton"></div>
              </div>
              <div className="flex justify-end space-x-3">
                <div className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton"></div>
                <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton"></div>
              </div>
            </div>
          </div>
        );
      
      case 'dashboard':
        return (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg loading-skeleton mr-3"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton mb-2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton w-4/5"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton w-3/5"></div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'spinner':
        return (
          <div className={`flex items-center justify-center ${className}`}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        );
      
      case 'dots':
        return (
          <div className={`flex items-center justify-center space-x-2 ${className}`}>
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"
                style={{ animationDelay: `${index * 0.2}s` }}
              ></div>
            ))}
          </div>
        );
      
      default:
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded loading-skeleton w-4/6"></div>
            </div>
          </div>
        );
    }
  };

  return renderSkeleton();
};

export default LoadingSkeleton;
