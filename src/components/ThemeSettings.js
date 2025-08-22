import React from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSettings = () => {
  const { themeMode, setThemeMode, isDarkMode } = useTheme();

  const themeOptions = [
    {
      id: 'light',
      name: 'Light',
      description: 'Always use light theme',
      icon: Sun,
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-900',
      iconColor: 'text-yellow-500'
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Always use dark theme',
      icon: Moon,
      bgColor: 'bg-gray-800',
      borderColor: 'border-gray-700',
      textColor: 'text-white',
      iconColor: 'text-blue-400'
    },
    {
      id: 'system',
      name: 'System',
      description: 'Follow system preference',
      icon: Monitor,
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300',
      textColor: 'text-gray-900',
      iconColor: 'text-gray-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Theme Settings</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Choose your preferred theme appearance
        </p>
      </div>

      {/* Current Theme Display */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Current Theme</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {themeMode === 'system' 
                ? `System (${isDarkMode ? 'Dark' : 'Light'})`
                : themeMode.charAt(0).toUpperCase() + themeMode.slice(1)
              }
            </p>
          </div>
          <div className={`p-2 rounded-lg ${
            themeMode === 'dark' ? 'bg-gray-800 text-blue-400' :
            themeMode === 'light' ? 'bg-white text-yellow-500' :
            'bg-gray-200 text-gray-600'
          }`}>
            {themeMode === 'dark' ? (
              <Moon className="w-5 h-5" />
            ) : themeMode === 'light' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Monitor className="w-5 h-5" />
            )}
          </div>
        </div>
      </div>

      {/* Theme Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = themeMode === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => setThemeMode(option.id)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : `${option.borderColor} ${option.bgColor} hover:border-gray-400 dark:hover:border-gray-600`
              }`}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              <div className="text-center">
                <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                  isSelected ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <Icon className={`w-6 h-6 ${option.iconColor}`} />
                </div>
                
                <h4 className={`font-medium mb-1 ${
                  isSelected ? 'text-blue-900 dark:text-blue-100' : option.textColor
                }`}>
                  {option.name}
                </h4>
                
                <p className={`text-sm ${
                  isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Theme Preview */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Theme Preview</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Light Preview */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Light Theme</h5>
            <p className="text-sm text-gray-600">This is how content looks in light mode</p>
            <div className="mt-3 p-2 bg-gray-100 rounded">
              <p className="text-xs text-gray-800">Sample content</p>
            </div>
          </div>
          
          {/* Dark Preview */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h5 className="font-medium text-white mb-2">Dark Theme</h5>
            <p className="text-sm text-gray-300">This is how content looks in dark mode</p>
            <div className="mt-3 p-2 bg-gray-700 rounded">
              <p className="text-xs text-gray-200">Sample content</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Monitor className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">System Theme</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              When "System" is selected, the app automatically follows your operating system's theme preference. 
              Change your system theme in your device settings to see the app update automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
