import React from 'react';
import { useTheme } from '../contexts/ThemeContext.js';
import { 
  Home, 
  Package, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Settings,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

const ThemePreview = () => {
  const { colors, isCustomTheme } = useTheme();

  const previewComponents = [
    {
      name: 'Button',
      element: (
        <div className="space-y-2">
          <button 
            className="px-4 py-2 rounded-lg text-white font-medium transition-colors"
            style={{ backgroundColor: colors.primary }}
          >
            Primary Button
          </button>
          <button 
            className="px-4 py-2 rounded-lg text-white font-medium transition-colors"
            style={{ backgroundColor: colors.secondary }}
          >
            Secondary Button
          </button>
          <button 
            className="px-4 py-2 rounded-lg border-2 font-medium transition-colors"
            style={{ 
              backgroundColor: 'transparent',
              color: colors.primary,
              borderColor: colors.primary
            }}
          >
            Outline Button
          </button>
        </div>
      )
    },
    {
      name: 'Card',
      element: (
        <div 
          className="p-4 rounded-lg border shadow-sm"
          style={{ 
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text
          }}
        >
          <h3 className="font-semibold mb-2">Sample Card</h3>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            This is how your content will look with the selected theme.
          </p>
        </div>
      )
    },
    {
      name: 'Navigation',
      element: (
        <div 
          className="p-3 rounded-lg border"
          style={{ 
            backgroundColor: colors.surface,
            borderColor: colors.border
          }}
        >
          <div className="flex items-center space-x-4">
            <div 
              className="w-8 h-8 rounded flex items-center justify-center text-white"
              style={{ backgroundColor: colors.primary }}
            >
              <Home className="w-4 h-4" />
            </div>
            <div className="flex space-x-2">
              <span 
                className="px-3 py-1 rounded text-sm font-medium"
                style={{ 
                  backgroundColor: colors.primary,
                  color: 'white'
                }}
              >
                Home
              </span>
              <span 
                className="px-3 py-1 rounded text-sm"
                style={{ color: colors.textSecondary }}
              >
                Settings
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      name: 'Status Indicators',
      element: (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" style={{ color: colors.success }} />
            <span style={{ color: colors.text }}>Success message</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" style={{ color: colors.warning }} />
            <span style={{ color: colors.text }}>Warning message</span>
          </div>
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4" style={{ color: colors.info }} />
            <span style={{ color: colors.text }}>Info message</span>
          </div>
        </div>
      )
    },
    {
      name: 'Form Elements',
      element: (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Sample input"
            className="w-full px-3 py-2 rounded border-2 focus:outline-none"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text
            }}
          />
          <select
            className="w-full px-3 py-2 rounded border-2 focus:outline-none"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text
            }}
          >
            <option>Select option</option>
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        </div>
      )
    },
    {
      name: 'Progress & Stats',
      element: (
        <div className="space-y-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: colors.primary,
                width: '75%'
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div 
              className="p-2 rounded text-center"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="text-lg font-bold" style={{ color: colors.primary }}>42</div>
              <div className="text-xs" style={{ color: colors.textSecondary }}>Items</div>
            </div>
            <div 
              className="p-2 rounded text-center"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="text-lg font-bold" style={{ color: colors.secondary }}>12</div>
              <div className="text-xs" style={{ color: colors.textSecondary }}>Users</div>
            </div>
            <div 
              className="p-2 rounded text-center"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="text-lg font-bold" style={{ color: colors.accent }}>8</div>
              <div className="text-xs" style={{ color: colors.textSecondary }}>Active</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Theme Preview
        </h2>
        {isCustomTheme && (
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Custom Theme
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {previewComponents.map((component) => (
          <div key={component.name}>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {component.name}
            </h3>
            {component.element}
          </div>
        ))}
      </div>

      {/* Color Palette Display */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Current Color Palette
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(colors).map(([name, color]) => (
            <div key={name} className="text-center">
              <div 
                className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 mx-auto mb-2"
                style={{ backgroundColor: color }}
              />
              <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                {name}
              </div>
              <div className="text-xs font-mono text-gray-500 dark:text-gray-500">
                {color}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemePreview;





