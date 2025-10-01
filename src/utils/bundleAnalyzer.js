/**
 * Bundle Analyzer Utility
 * Helps analyze and optimize bundle size
 */

// Bundle size thresholds
const BUNDLE_THRESHOLDS = {
  WARNING: 500 * 1024, // 500KB
  ERROR: 1000 * 1024,  // 1MB
  CRITICAL: 2000 * 1024 // 2MB
};

// Component size recommendations
const COMPONENT_RECOMMENDATIONS = {
  'AdvancedAnalytics': {
    maxSize: 50 * 1024, // 50KB
    suggestions: ['Consider code splitting', 'Lazy load charts', 'Optimize data processing']
  },
  'Home': {
    maxSize: 30 * 1024, // 30KB
    suggestions: ['Split dashboard sections', 'Lazy load widgets', 'Optimize animations']
  },
  'Inventory': {
    maxSize: 40 * 1024, // 40KB
    suggestions: ['Virtualize large lists', 'Lazy load images', 'Optimize filtering']
  }
};

class BundleAnalyzer {
  constructor() {
    this.bundleData = {};
    this.componentSizes = {};
    this.analysisResults = [];
  }

  // Analyze bundle size
  analyzeBundleSize(bundleData) {
    this.bundleData = bundleData;
    this.analysisResults = [];

    // Check overall bundle size
    const totalSize = this.calculateTotalSize(bundleData);
    this.analysisResults.push({
      type: 'bundle',
      size: totalSize,
      status: this.getSizeStatus(totalSize),
      recommendations: this.getBundleRecommendations(totalSize)
    });

    // Analyze individual chunks
    if (bundleData.chunks) {
      bundleData.chunks.forEach(chunk => {
        this.analyzeChunk(chunk);
      });
    }

    return this.analysisResults;
  }

  // Calculate total bundle size
  calculateTotalSize(bundleData) {
    if (bundleData.chunks) {
      return bundleData.chunks.reduce((total, chunk) => total + chunk.size, 0);
    }
    return 0;
  }

  // Get size status
  getSizeStatus(size) {
    if (size >= BUNDLE_THRESHOLDS.CRITICAL) return 'critical';
    if (size >= BUNDLE_THRESHOLDS.ERROR) return 'error';
    if (size >= BUNDLE_THRESHOLDS.WARNING) return 'warning';
    return 'good';
  }

  // Get bundle recommendations
  getBundleRecommendations(size) {
    const recommendations = [];

    if (size >= BUNDLE_THRESHOLDS.CRITICAL) {
      recommendations.push('Bundle size is critical. Implement aggressive code splitting.');
      recommendations.push('Consider removing unused dependencies.');
      recommendations.push('Use dynamic imports for large components.');
    } else if (size >= BUNDLE_THRESHOLDS.ERROR) {
      recommendations.push('Bundle size is too large. Implement code splitting.');
      recommendations.push('Lazy load non-critical components.');
    } else if (size >= BUNDLE_THRESHOLDS.WARNING) {
      recommendations.push('Bundle size is approaching limits. Consider optimization.');
    }

    return recommendations;
  }

  // Analyze individual chunk
  analyzeChunk(chunk) {
    const status = this.getSizeStatus(chunk.size);
    
    this.analysisResults.push({
      type: 'chunk',
      name: chunk.name,
      size: chunk.size,
      status,
      recommendations: this.getChunkRecommendations(chunk)
    });
  }

  // Get chunk recommendations
  getChunkRecommendations(chunk) {
    const recommendations = [];

    if (chunk.size > 200 * 1024) { // 200KB
      recommendations.push(`Chunk ${chunk.name} is large. Consider splitting.`);
    }

    if (chunk.modules && chunk.modules.length > 50) {
      recommendations.push(`Chunk ${chunk.name} has many modules. Consider consolidation.`);
    }

    return recommendations;
  }

  // Analyze component size
  analyzeComponentSize(componentName, size) {
    this.componentSizes[componentName] = size;
    
    const recommendation = COMPONENT_RECOMMENDATIONS[componentName];
    if (recommendation && size > recommendation.maxSize) {
      return {
        component: componentName,
        size,
        status: 'warning',
        recommendations: recommendation.suggestions
      };
    }

    return {
      component: componentName,
      size,
      status: 'good',
      recommendations: []
    };
  }

  // Generate optimization report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.getSummary(),
      recommendations: this.getOverallRecommendations(),
      components: Object.keys(this.componentSizes).map(name => ({
        name,
        size: this.componentSizes[name],
        ...this.analyzeComponentSize(name, this.componentSizes[name])
      }))
    };

    return report;
  }

  // Get summary
  getSummary() {
    const totalSize = this.calculateTotalSize(this.bundleData);
    const criticalIssues = this.analysisResults.filter(r => r.status === 'critical').length;
    const warnings = this.analysisResults.filter(r => r.status === 'warning').length;

    return {
      totalSize,
      status: this.getSizeStatus(totalSize),
      criticalIssues,
      warnings,
      totalChunks: this.bundleData.chunks ? this.bundleData.chunks.length : 0
    };
  }

  // Get overall recommendations
  getOverallRecommendations() {
    const recommendations = [];

    // Bundle size recommendations
    const totalSize = this.calculateTotalSize(this.bundleData);
    recommendations.push(...this.getBundleRecommendations(totalSize));

    // Component-specific recommendations
    Object.keys(this.componentSizes).forEach(component => {
      const analysis = this.analyzeComponentSize(component, this.componentSizes[component]);
      if (analysis.recommendations.length > 0) {
        recommendations.push(`${component}: ${analysis.recommendations.join(', ')}`);
      }
    });

    return recommendations;
  }

  // Get optimization suggestions
  getOptimizationSuggestions() {
    return [
      {
        category: 'Code Splitting',
        suggestions: [
          'Use React.lazy() for route-based splitting',
          'Implement component-level lazy loading',
          'Split vendor and app bundles'
        ]
      },
      {
        category: 'Bundle Optimization',
        suggestions: [
          'Remove unused dependencies',
          'Use tree shaking for ES modules',
          'Optimize images and assets',
          'Use compression (gzip/brotli)'
        ]
      },
      {
        category: 'Runtime Optimization',
        suggestions: [
          'Implement virtual scrolling for large lists',
          'Use React.memo() for expensive components',
          'Optimize re-renders with useMemo/useCallback',
          'Implement progressive loading'
        ]
      }
    ];
  }
}

// Create singleton instance
const bundleAnalyzer = new BundleAnalyzer();

export default bundleAnalyzer;
