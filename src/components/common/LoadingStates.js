import React from 'react';
import PropTypes from 'prop-types';
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

// Spinner Component
export const Spinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };

  return (
    <div className="flex items-center justify-center">
      <Loader2 className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} />
    </div>
  );
};

// Loading Button Component
export const LoadingButton = ({ 
  loading = false, 
  children, 
  onClick, 
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${
        loading || disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={onClick}
      disabled={loading || disabled}
      {...props}
    >
      {loading && <Spinner size="sm" color="white" className="mr-2" />}
      {children}
    </button>
  );
};

// Loading Card Component
export const LoadingCard = ({ title, description, showProgress = false, progress = 0 }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Spinner size="md" color="blue" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      
      {showProgress && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

// Skeleton Loader Component
export const SkeletonLoader = ({ lines = 3, className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={`loading-skeleton-line-${index}`}
          className={`h-4 bg-gray-200 rounded mb-2 ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

// Status Indicator Component
export const StatusIndicator = ({ 
  status, 
  message, 
  showIcon = true,
  className = '' 
}) => {
  const statusConfig = {
    loading: {
      icon: Loader2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      animate: 'animate-spin'
    },
    success: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      animate: ''
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      animate: ''
    },
    warning: {
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      animate: ''
    }
  };

  const config = statusConfig[status] || statusConfig.loading;
  const Icon = config.icon;

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}>
      {showIcon && (
        <Icon className={`w-5 h-5 ${config.color} ${config.animate}`} />
      )}
      <span className={`text-sm font-medium ${config.color}`}>{message}</span>
    </div>
  );
};

// Progress Bar Component
export const ProgressBar = ({ 
  progress, 
  total = 100, 
  showPercentage = true,
  color = 'blue',
  size = 'md',
  className = '' 
}) => {
  const percentage = Math.min((progress / total) * 100, 100);

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600'
  };

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>{progress} / {total}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
};

// Shimmer Effect Component
export const ShimmerEffect = ({ className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-gray-200 rounded mb-2" />
      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );
};

// Pulse Animation Component
export const PulseAnimation = ({ children, className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {children}
    </div>
  );
};

// Bounce Animation Component
export const BounceAnimation = ({ children, className = '' }) => {
  return (
    <div className={`animate-bounce ${className}`}>
      {children}
    </div>
  );
};

// Fade In Animation Component
export const FadeInAnimation = ({ children, delay = 0, className = '' }) => {
  return (
    <div 
      className={`animate-fade-in ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// Slide In Animation Component
export const SlideInAnimation = ({ 
  children, 
  direction = 'left',
  delay = 0,
  className = '' 
}) => {
  const directionClasses = {
    left: 'animate-slide-in-left',
    right: 'animate-slide-in-right',
    up: 'animate-slide-in-up',
    down: 'animate-slide-in-down'
  };

  return (
    <div 
      className={`${directionClasses[direction]} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// Loading Overlay Component
export const LoadingOverlay = ({ 
  isVisible, 
  message = 'Loading...',
  progress = null,
  onCancel = null 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4">
        <div className="text-center">
          <Spinner size="xl" color="blue" className="mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{message}</h3>
          
          {progress !== null && (
            <ProgressBar 
              progress={progress} 
              className="mb-4" 
              showPercentage={true}
            />
          )}
          
          {onCancel && (
            <button
              onClick={onCancel}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default {
  Spinner,
  LoadingButton,
  LoadingCard,
  SkeletonLoader,
  StatusIndicator,
  ProgressBar,
  ShimmerEffect,
  PulseAnimation,
  BounceAnimation,
  FadeInAnimation,
  SlideInAnimation,
  LoadingOverlay
};

// PropTypes
Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['blue', 'green', 'red', 'gray', 'white'])
};

LoadingButton.propTypes = {
  loading: PropTypes.bool,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};

LoadingCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  showProgress: PropTypes.bool,
  progress: PropTypes.number
};

SkeletonLoader.propTypes = {
  lines: PropTypes.number,
  className: PropTypes.string
};

StatusIndicator.propTypes = {
  status: PropTypes.oneOf(['loading', 'success', 'error', 'warning']).isRequired,
  message: PropTypes.string,
  showSpinner: PropTypes.bool,
  className: PropTypes.string
};

ProgressBar.propTypes = {
  progress: PropTypes.number.isRequired,
  showPercentage: PropTypes.bool,
  color: PropTypes.oneOf(['blue', 'green', 'red', 'yellow', 'purple']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string
};

ShimmerEffect.propTypes = {
  className: PropTypes.string
};

PulseAnimation.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

BounceAnimation.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

FadeInAnimation.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
  className: PropTypes.string
};

SlideInAnimation.propTypes = {
  children: PropTypes.node.isRequired,
  direction: PropTypes.oneOf(['left', 'right', 'up', 'down']),
  delay: PropTypes.number,
  className: PropTypes.string
};

StatusIndicator.propTypes = {
  status: PropTypes.string.isRequired,
  message: PropTypes.string,
  showIcon: PropTypes.bool,
  className: PropTypes.string
};

ProgressBar.propTypes = {
  progress: PropTypes.number.isRequired,
  total: PropTypes.number,
  showPercentage: PropTypes.bool,
  color: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string
};

LoadingOverlay.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  message: PropTypes.string,
  progress: PropTypes.number,
  onCancel: PropTypes.func
};
