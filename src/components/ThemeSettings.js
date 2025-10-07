import React, { useState, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext.js';
import {
  Palette,
  Download,
  Upload,
  RefreshCw,
  Wand2,
  Settings,
  Eye,
  EyeOff,
  Check,
  X,
  Save,
  RotateCcw
} from 'lucide-react';
import ColorPicker from './ColorPicker.js';
import ThemePreview from './ThemePreview.js';

const ThemeSettings = () => {
  const {
    themeMode,
    isDarkMode,
    colors,
    customColors,
    isCustomTheme,
    updateThemeMode,
    setCustomTheme,
    resetToDefaultTheme,
    exportTheme,
    importTheme,
    getThemePresets
  } = useTheme();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [selectedColorType, setSelectedColorType] = useState('primary');
  const [tempColors, setTempColors] = useState(colors);
  const [isEditing, setIsEditing] = useState(false);

  const colorTypes = [
    { key: 'primary', label: 'Primary', description: 'Main brand color for buttons and highlights' },
    { key: 'secondary', label: 'Secondary', description: 'Secondary brand color for accents' },
    { key: 'accent', label: 'Accent', description: 'Accent color for special elements' },
    { key: 'background', label: 'Background', description: 'Main background color' },
    { key: 'surface', label: 'Surface', description: 'Card and panel background color' },
    { key: 'text', label: 'Text', description: 'Primary text color' },
    { key: 'textSecondary', label: 'Text Secondary', description: 'Secondary text color' },
    { key: 'border', label: 'Border', description: 'Border and divider color' },
    { key: 'success', label: 'Success', description: 'Success state color' },
    { key: 'warning', label: 'Warning', description: 'Warning state color' },
    { key: 'error', label: 'Error', description: 'Error state color' },
    { key: 'info', label: 'Info', description: 'Info state color' }
  ];

  const handleColorChange = useCallback((colorType, newColor) => {
    setTempColors(prev => ({
      ...prev,
      [colorType]: newColor
    }));
  }, []);

  const handleSaveChanges = useCallback(() => {
    setCustomTheme(tempColors);
    setIsEditing(false);
  }, [tempColors, setCustomTheme]);

  const handleCancelChanges = useCallback(() => {
    setTempColors(colors);
    setIsEditing(false);
  }, [colors]);

  const handleResetToDefault = useCallback(() => {
    resetToDefaultTheme();
    setTempColors(colors);
    setIsEditing(false);
  }, [resetToDefaultTheme, colors]);

  const handleExportTheme = useCallback(() => {
    const themeData = exportTheme();
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'home-hub-theme.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [exportTheme]);

  const handleImportTheme = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const success = importTheme(e.target.result);
        if (success) {
          setTempColors(colors);
          // eslint-disable-next-line no-alert
          alert('Theme imported successfully!');
        } else {
          // eslint-disable-next-line no-alert
          alert('Failed to import theme. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  }, [importTheme, colors]);

  const handlePresetApply = useCallback((presetName) => {
    const presets = getThemePresets();
    if (presets[presetName]) {
      setCustomTheme(presets[presetName]);
      setTempColors(presets[presetName]);
    }
  }, [getThemePresets, setCustomTheme]);

  const openColorPicker = useCallback((colorType) => {
    setSelectedColorType(colorType);
    setShowColorPicker(true);
  }, []);

  const applyColorFromPicker = useCallback((color) => {
    handleColorChange(selectedColorType, color);
    setShowColorPicker(false);
  }, [selectedColorType, handleColorChange]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
              <Palette className="w-10 h-10" />
              Theme Customization
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Customize your Home Hub experience with personalized colors and themes.
              Create your perfect visual identity and make the app truly yours.
            </p>
          </div>

          {/* Theme Mode Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Theme Mode
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { mode: 'light', label: 'Light Mode', description: 'Clean and bright interface' },
                { mode: 'dark', label: 'Dark Mode', description: 'Easy on the eyes in low light' },
                { mode: 'system', label: 'System', description: 'Follows your device preference' }
              ].map(({ mode, label, description }) => (
                <button
                  key={mode}
                  onClick={() => updateThemeMode(mode)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${themeMode === mode
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</div>
                  {themeMode === mode && (
                    <Check className="w-5 h-5 text-blue-500 mt-2" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Color Customization */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Color Customization
              </h2>
              <div className="flex gap-2">
                {isEditing && (
                  <>
                    <button
                      onClick={handleSaveChanges}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelChanges}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                )}
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Colors
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {colorTypes.map(({ key, label, description }) => (
                <div key={key} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">{label}</h3>
                    {isEditing && (
                      <button
                        onClick={() => openColorPicker(key)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Open color picker"
                      >
                        <Palette className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: isEditing ? tempColors[key] : colors[key] }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-mono text-gray-600 dark:text-gray-400">
                        {isEditing ? tempColors[key] : colors[key]}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Presets */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Theme Presets</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleExportTheme}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <label className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportTheme}
                    className="hidden"
                  />
                </label>
                {isCustomTheme && (
                  <button
                    onClick={handleResetToDefault}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(getThemePresets()).map(([name, themeColors]) => (
                <button
                  key={name}
                  onClick={() => handlePresetApply(name)}
                  className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: themeColors.primary }}></div>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: themeColors.secondary }}></div>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: themeColors.accent }}></div>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Click to apply</p>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Preview */}
          {showPreview && <ThemePreview />}

          {/* Color Picker Modal */}
          {showColorPicker && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Pick {selectedColorType} Color
                    </h3>
                    <button
                      onClick={() => setShowColorPicker(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <ColorPicker onColorSelect={applyColorFromPicker} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;