import React, { useState, useEffect } from 'react';
import { useDevTools } from '../contexts/DevToolsContext';
import { 
  Bug, 
  Settings, 
  Eye, 
  EyeOff, 
  Activity, 
  Network, 
  RefreshCw, 
  X,
  Code,
  Database,
  Zap
} from 'lucide-react';

const DevTools = () => {
  const { 
    isDevMode, 
    showDevTools, 
    devToolsConfig, 
    toggleDevTools, 
    updateDevToolsConfig 
  } = useDevTools();

  // Debug logging
  console.log('🔧 DevTools render:', { isDevMode, showDevTools, devToolsConfig });

  // Safety check - prevent crashes
  if (!devToolsConfig) {
    console.warn('🔧 DevTools: devToolsConfig is undefined, using defaults');
    return null;
  }

  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0
  });

  const [networkLogs, setNetworkLogs] = useState([]);

  // Performance monitoring
  useEffect(() => {
    if (devToolsConfig.showPerformanceMetrics) {
      const interval = setInterval(() => {
        if (performance.memory) {
          setPerformanceMetrics({
            renderTime: performance.now(),
            memoryUsage: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            componentCount: document.querySelectorAll('[data-component]').length
          });
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [devToolsConfig.showPerformanceMetrics]);

  // Network logging
  useEffect(() => {
    if (devToolsConfig.showNetworkLogs) {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const startTime = performance.now();
        try {
          const response = await originalFetch(...args);
          const endTime = performance.now();
          setNetworkLogs(prev => [...prev.slice(-9), {
            url: typeof args[0] === 'string' ? args[0] : args[0]?.url || 'Unknown',
            method: args[1]?.method || 'GET',
            status: response.status,
            time: Math.round(endTime - startTime),
            timestamp: new Date().toLocaleTimeString()
          }]);
          return response;
        } catch (error) {
          setNetworkLogs(prev => [...prev.slice(-9), {
            url: typeof args[0] === 'string' ? args[0] : args[0]?.url || 'Unknown',
            method: args[1]?.method || 'GET',
            status: 'ERROR',
            time: 0,
            timestamp: new Date().toLocaleTimeString(),
            error: error.message
          }]);
          throw error;
        }
      };

      return () => {
        window.fetch = originalFetch;
      };
    }
  }, [devToolsConfig.showNetworkLogs]);

  // Always show a small indicator when dev mode is enabled
  if (!isDevMode) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg z-50 text-xs">
        🚀 Dev Mode Active
      </div>
    );
  }

  if (!showDevTools) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg z-50 text-xs cursor-pointer" onClick={toggleDevTools}>
        🔧 Click to Show Dev Tools
      </div>
    );
  }

  try {
    return (
      <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-2">
          <Bug className="w-5 h-5 text-red-500" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Dev Tools</span>
        </div>
        <button
          onClick={toggleDevTools}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3 max-h-80 overflow-y-auto">
        {/* Configuration Toggles */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Debug Features
          </h4>
          
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={devToolsConfig.showStateDebug}
              onChange={(e) => updateDevToolsConfig('showStateDebug', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">State Debug</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={devToolsConfig.showInstanceTracking}
              onChange={(e) => updateDevToolsConfig('showInstanceTracking', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">Instance Tracking</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={devToolsConfig.showPerformanceMetrics}
              onChange={(e) => updateDevToolsConfig('showPerformanceMetrics', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">Performance Metrics</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={devToolsConfig.showNetworkLogs}
              onChange={(e) => updateDevToolsConfig('showNetworkLogs', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">Network Logs</span>
          </label>
        </div>

        {/* State Debug */}
        {devToolsConfig.showStateDebug && (
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
            <h5 className="text-xs font-medium text-purple-800 dark:text-purple-200 mb-2 flex items-center">
              <Activity className="w-3 h-3 mr-1" />
              State Debug
            </h5>
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-purple-600 dark:text-purple-400">Dev Mode:</span>
                  <span className={`ml-1 px-1 rounded text-xs ${
                    isDevMode ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isDevMode ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div>
                  <span className="text-purple-600 dark:text-purple-400">Dev Tools:</span>
                  <span className={`ml-1 px-1 rounded text-xs ${
                    showDevTools ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {showDevTools ? 'VISIBLE' : 'HIDDEN'}
                  </span>
                </div>
              </div>
              <div className="p-2 bg-white dark:bg-gray-700 rounded border">
                <div className="text-purple-600 dark:text-purple-400 mb-1">Active Config:</div>
                <div className="space-y-1">
                  {Object.entries(devToolsConfig).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                      <span className={`px-1 rounded text-xs ${
                        value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {value ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {devToolsConfig.showPerformanceMetrics && (
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <h5 className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center">
              <Activity className="w-3 h-3 mr-1" />
              Performance
            </h5>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-blue-600 dark:text-blue-400">Memory:</span>
                <span className="ml-1 text-blue-800 dark:text-blue-200">{performanceMetrics.memoryUsage}MB</span>
              </div>
              <div>
                <span className="text-blue-600 dark:text-blue-400">Components:</span>
                <span className="ml-1 text-blue-800 dark:text-blue-200">{performanceMetrics.componentCount}</span>
              </div>
              <div>
                <span className="text-blue-600 dark:text-blue-400">Render:</span>
                <span className="ml-1 text-blue-800 dark:text-blue-200">{performanceMetrics.renderTime.toFixed(0)}ms</span>
              </div>
            </div>
          </div>
        )}

        {/* Network Logs */}
        {devToolsConfig.showNetworkLogs && (
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
            <h5 className="text-xs font-medium text-green-800 dark:text-green-200 mb-2 flex items-center">
              <Network className="w-3 h-3 mr-1" />
              Network ({networkLogs.length})
            </h5>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {networkLogs.map((log, index) => (
                <div key={index} className="text-xs p-1 bg-white dark:bg-gray-700 rounded">
                  <div className="flex justify-between">
                    <span className="text-green-600 dark:text-green-400">{log.method}</span>
                    <span className={`text-xs px-1 rounded ${
                      log.status === 'ERROR' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 truncate">{log.url}</div>
                  <div className="text-xs text-gray-500">{log.timestamp} ({log.time}ms)</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
          <h5 className="text-xs font-medium text-purple-800 dark:text-purple-200 mb-2 flex items-center">
            <Zap className="w-3 h-3 mr-1" />
            Quick Actions
          </h5>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => window.location.reload()}
              className="text-xs bg-purple-100 hover:bg-purple-200 dark:bg-purple-800 dark:hover:bg-purple-700 text-purple-800 dark:text-purple-200 px-2 py-1 rounded flex items-center justify-center"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Reload
            </button>
            <button
              onClick={() => localStorage.clear()}
              className="text-xs bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-800 dark:text-red-200 px-2 py-1 rounded flex items-center justify-center"
            >
              <Database className="w-3 h-3 mr-1" />
              Clear Storage
            </button>
            <button
              onClick={async () => {
                try {
                  console.log('🧪 Testing Hybrid AI Services...');
                  const { HybridAIService } = await import('../services/HybridAIService');
                  const result = await HybridAIService.testAllServices();
                  console.log('✅ API Test Result:', result);
                  alert(`API Test Results:\n\nHuggingFace: ${result.huggingface?.success ? '✅ Working' : '❌ Failed'}\nGemini: ${result.gemini?.success ? '✅ Working' : '❌ Failed'}`);
                } catch (error) {
                  console.error('❌ API Test Error:', error);
                  alert('API Test Failed: ' + error.message);
                }
              }}
              className="text-xs bg-green-100 hover:bg-green-200 dark:bg-green-800 dark:hover:bg-green-700 text-green-800 dark:text-green-200 px-2 py-1 rounded flex items-center justify-center col-span-2"
            >
              🧪 Test API
            </button>
          </div>
        </div>
      </div>
    </div>
    );
  } catch (error) {
    console.error('🔧 DevTools error:', error);
    return (
      <div className="fixed bottom-4 right-4 w-80 bg-red-100 border border-red-300 rounded-lg p-3 z-50">
        <div className="text-red-800 text-xs">
          <p className="font-bold">DevTools Error</p>
          <p>Something went wrong. Check console for details.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-2 py-1 bg-red-200 rounded text-xs"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

export default DevTools;
