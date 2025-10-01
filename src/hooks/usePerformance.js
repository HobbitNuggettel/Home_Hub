import { useEffect, useRef, useCallback, useState } from 'react';
import performanceService from '../services/PerformanceService';

/**
 * Hook for monitoring component performance
 * @param {string} componentName - Name of the component being monitored
 * @param {object} options - Configuration options
 * @returns {object} Performance data and methods
 */
export const usePerformance = (componentName, options = {}) => {
  const startTime = useRef(null);
  const renderCount = useRef(0);
  const { trackRenders = true, trackMounts = true } = options;

  // Track component mount time
  useEffect(() => {
    if (trackMounts) {
      startTime.current = performance.now();
      renderCount.current = 0;
    }
  }, [trackMounts]);

  // Track render performance
  useEffect(() => {
    if (trackRenders && startTime.current) {
      const renderTime = performance.now() - startTime.current;
      performanceService.trackComponentRender(componentName, renderTime);
      renderCount.current++;
    }
  });

  // Get performance metrics for this component
  const getComponentMetrics = useCallback(() => {
    const allMetrics = performanceService.getMetrics();
    const componentTimes = allMetrics.componentRenderTimes[componentName] || [];
    return {
      renderCount: renderCount.current,
      averageRenderTime: componentTimes.length > 0 
        ? componentTimes.reduce((a, b) => a + b, 0) / componentTimes.length 
        : 0,
      lastRenderTime: componentTimes[componentTimes.length - 1] || 0,
      totalRenders: componentTimes.length
    };
  }, [componentName]);

  // Get performance recommendations
  const getRecommendations = useCallback(() => {
    return performanceService.getRecommendations().filter(rec => 
      rec.message.includes(componentName)
    );
  }, [componentName]);

  return {
    getComponentMetrics,
    getRecommendations,
    performanceScore: performanceService.calculatePerformanceScore()
  };
};

/**
 * Hook for monitoring page performance
 * @returns {object} Page performance data
 */
export const usePagePerformance = () => {
  const [metrics, setMetrics] = useState(performanceService.getMetrics());
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const unsubscribe = performanceService.subscribe((type, data) => {
      if (type === 'pageLoad' || type === 'memory' || type === 'network') {
        setMetrics(performanceService.getMetrics());
        setRecommendations(performanceService.getRecommendations());
      }
    });

    return unsubscribe;
  }, []);

  return {
    metrics,
    recommendations,
    performanceScore: performanceService.calculatePerformanceScore()
  };
};

export default usePerformance;
