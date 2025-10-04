import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';

const ProgressIndicator = ({ 
  steps, 
  currentStep, 
  completedSteps = [], 
  showLabels = true,
  orientation = 'horizontal', // horizontal or vertical
  size = 'md',
  color = 'blue',
  className = ''
}) => {
  const getColorClasses = (color) => {
    const colors = {
      blue: {
        active: 'text-blue-600 bg-blue-50 border-blue-200',
        completed: 'text-blue-600 bg-blue-100 border-blue-300',
        pending: 'text-gray-400 bg-gray-50 border-gray-200'
      },
      green: {
        active: 'text-green-600 bg-green-50 border-green-200',
        completed: 'text-green-600 bg-green-100 border-green-300',
        pending: 'text-gray-400 bg-gray-50 border-gray-200'
      },
      purple: {
        active: 'text-purple-600 bg-purple-50 border-purple-200',
        completed: 'text-purple-600 bg-purple-100 border-purple-300',
        pending: 'text-gray-400 bg-gray-50 border-gray-200'
      }
    };
    return colors[color] || colors.blue;
  };

  const getSizeClasses = (size) => {
    const sizes = {
      sm: {
        circle: 'w-6 h-6',
        text: 'text-xs',
        spacing: 'space-x-2'
      },
      md: {
        circle: 'w-8 h-8',
        text: 'text-sm',
        spacing: 'space-x-4'
      },
      lg: {
        circle: 'w-10 h-10',
        text: 'text-base',
        spacing: 'space-x-6'
      }
    };
    return sizes[size] || sizes.md;
  };

  const colorClasses = getColorClasses(color);
  const sizeClasses = getSizeClasses(size);

  const getStepStatus = (stepIndex) => {
    if (completedSteps.includes(stepIndex)) {
      return 'completed';
    } else if (stepIndex === currentStep) {
      return 'active';
    } else {
      return 'pending';
    }
  };

  const getStepIcon = (stepIndex, status) => {
    if (status === 'completed') {
      return <CheckCircle className="w-4 h-4" />;
    } else if (status === 'active') {
      return <Clock className="w-4 h-4" />;
    } else {
      return <Circle className="w-4 h-4" />;
    }
  };

  const getStepClasses = (status) => {
    switch (status) {
      case 'completed':
        return colorClasses.completed;
      case 'active':
        return colorClasses.active;
      default:
        return colorClasses.pending;
    }
  };

  if (orientation === 'vertical') {
    return (
      <div className={`flex flex-col ${sizeClasses.spacing} ${className}`}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const stepClasses = getStepClasses(status);
          
          return (
            <div key={`progress-step-${index}`} className="flex items-start">
              <div className={`flex items-center justify-center ${sizeClasses.circle} rounded-full border-2 ${stepClasses}`}>
                {getStepIcon(index, status)}
              </div>
              <div className="ml-4 flex-1">
                {showLabels && (
                  <div className="flex flex-col">
                    <h4 className={`font-medium ${status === 'active' ? 'text-gray-900' : status === 'completed' ? 'text-gray-700' : 'text-gray-500'}`}>
                      {step.title}
                    </h4>
                    {step.description && (
                      <p className={`text-sm ${status === 'active' ? 'text-gray-600' : 'text-gray-400'}`}>
                        {step.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex items-center ${sizeClasses.spacing} ${className}`}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const stepClasses = getStepClasses(status);
        const isLast = index === steps.length - 1;
        
        return (
          <React.Fragment key={`progress-fragment-${index}`}>
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center ${sizeClasses.circle} rounded-full border-2 ${stepClasses}`}>
                {getStepIcon(index, status)}
              </div>
              {showLabels && (
                <div className="mt-2 text-center">
                  <h4 className={`font-medium ${sizeClasses.text} ${status === 'active' ? 'text-gray-900' : status === 'completed' ? 'text-gray-700' : 'text-gray-500'}`}>
                    {step.title}
                  </h4>
                  {step.description && (
                    <p className={`text-xs ${status === 'active' ? 'text-gray-600' : 'text-gray-400'}`}>
                      {step.description}
                    </p>
                  )}
                </div>
              )}
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 ${status === 'completed' ? 'bg-blue-300' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Circular Progress Component
export const CircularProgress = ({ 
  progress, 
  size = 100, 
  strokeWidth = 8, 
  color = 'blue',
  showPercentage = true,
  className = ''
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getColor = (color) => {
    const colors = {
      blue: '#3B82F6',
      green: '#10B981',
      red: '#EF4444',
      purple: '#8B5CF6',
      yellow: '#F59E0B'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(color)}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-gray-700">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
};

// Step Progress Component
export const StepProgress = ({ 
  currentStep, 
  totalSteps, 
  showNumbers = true,
  color = 'blue',
  className = ''
}) => {
  const progress = (currentStep / totalSteps) * 100;
  
  const getColor = (color) => {
    const colors = {
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      red: 'bg-red-600',
      purple: 'bg-purple-600',
      yellow: 'bg-yellow-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round(progress)}% Complete
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getColor(color)}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// Multi-step Form Progress
export const MultiStepProgress = ({ 
  steps, 
  currentStep, 
  onStepClick,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isClickable = onStepClick && (isCompleted || isActive);
          
          return (
            <button
              key={`progress-button-${index}`}
              onClick={() => isClickable && onStepClick(index)}
              disabled={!isClickable}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isClickable ? 'hover:bg-gray-50' : 'cursor-not-allowed'
              } ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : isCompleted 
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-50 text-gray-500 border border-gray-200'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : isCompleted 
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-500'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-semibold">{index + 1}</span>
                )}
              </div>
              <span className="text-sm font-medium">{step.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

ProgressIndicator.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    icon: PropTypes.elementType
  })).isRequired,
  currentStep: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  completedSteps: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  showLabels: PropTypes.bool,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.oneOf(['blue', 'green', 'purple']),
  className: PropTypes.string
};

CircularProgress.propTypes = {
  progress: PropTypes.number.isRequired,
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
  showPercentage: PropTypes.bool,
  color: PropTypes.oneOf(['blue', 'green', 'red', 'purple']),
  className: PropTypes.string
};

StepProgress.propTypes = {
  progress: PropTypes.number.isRequired,
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  color: PropTypes.oneOf(['blue', 'green', 'red', 'purple']),
  className: PropTypes.string
};

MultiStepProgress.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string
  })).isRequired,
  currentStep: PropTypes.number.isRequired,
  onStepClick: PropTypes.func,
  isClickable: PropTypes.bool,
  className: PropTypes.string
};

export default ProgressIndicator;
