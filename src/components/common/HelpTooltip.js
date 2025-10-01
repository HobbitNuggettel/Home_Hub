import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

const HelpTooltip = ({ 
  content, 
  position = 'top', 
  children, 
  tour = null,
  step = 0,
  onNext = null,
  onPrev = null,
  onComplete = null
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = triggerRect.bottom + 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.left - tooltipRect.width - 8;
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.right + 8;
          break;
      }

      // Adjust if tooltip goes off screen
      if (left < 8) left = 8;
      if (left + tooltipRect.width > viewportWidth - 8) {
        left = viewportWidth - tooltipRect.width - 8;
      }
      if (top < 8) top = 8;
      if (top + tooltipRect.height > viewportHeight - 8) {
        top = viewportHeight - tooltipRect.height - 8;
      }

      setTooltipPosition({ top, left });
    }
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    if (!tour) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (!tour) {
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    if (tour) {
      setIsVisible(!isVisible);
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="inline-block"
      >
        {children}
        {tour && (
          <button className="ml-1 text-gray-400 hover:text-gray-600 transition-colors">
            <HelpCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-lg max-w-xs p-4"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          {/* Arrow */}
          <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
            position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
            position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
            position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
            'left-[-4px] top-1/2 -translate-y-1/2'
          }`} />

          {/* Content */}
          <div className="relative">
            {tour ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">
                    Step {step + 1} of {tour.steps.length}
                  </span>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-2">{tour.steps[step].title}</h3>
                  <p className="text-sm text-gray-300">{tour.steps[step].content}</p>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={onPrev}
                    disabled={step === 0}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Previous</span>
                  </button>

                  <div className="flex space-x-1">
                    {tour.steps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === step ? 'bg-white' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={step === tour.steps.length - 1 ? onComplete : onNext}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                  >
                    <span>{step === tour.steps.length - 1 ? 'Complete' : 'Next'}</span>
                    {step === tour.steps.length - 1 ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <ArrowRight className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm">{content}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Guided Tour Component
export const GuidedTour = ({ isOpen, onClose, tour }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const nextStep = () => {
    if (currentStep < tour.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    setIsCompleted(true);
    onClose();
  };

  if (!isOpen || !tour) return null;

  const currentStepData = tour.steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{tour.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{currentStepData.title}</h3>
            <p className="text-gray-600 text-sm">{currentStepData.content}</p>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-2">
              {tour.steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={currentStep === tour.steps.length - 1 ? completeTour : nextStep}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>{currentStep === tour.steps.length - 1 ? 'Complete' : 'Next'}</span>
              {currentStep === tour.steps.length - 1 ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpTooltip;
