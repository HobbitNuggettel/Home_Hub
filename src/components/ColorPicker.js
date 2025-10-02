import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Palette, 
  Copy, 
  Check, 
  RotateCcw,
  Download,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ColorPicker = () => {
  const { isDarkMode } = useTheme();
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [hue, setHue] = useState(220);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [customColors, setCustomColors] = useState([]);
  const [colorHistory, setColorHistory] = useState([]);

  // Predefined color palettes (memoized for performance)
  const colorPalettes = useMemo(() => ({
    blue: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#312e81'],
    green: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'],
    purple: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'],
    red: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'],
    orange: ['#f97316', '#ea580c', '#dc2626', '#b91c1c', '#991b1b'],
    pink: ['#ec4899', '#db2777', '#be185d', '#9d174d', '#831843'],
    gray: ['#6b7280', '#4b5563', '#374151', '#1f2937', '#111827'],
    yellow: ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f']
  }), []);

  // Convert HSL to HEX (memoized for performance)
  const hslToHex = useCallback((h, s, l) => {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, h + 1/3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1/3);

    const toHex = (c) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }, []);

  // Convert HEX to HSL (memoized for performance)
  const hexToHsl = useCallback((hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }, []);

  // Handle HSL changes from sliders
  const handleHslChange = useCallback((newHue, newSaturation, newLightness) => {
    setHue(newHue);
    setSaturation(newSaturation);
    setLightness(newLightness);
    const hex = hslToHex(newHue, newSaturation, newLightness);
    setSelectedColor(hex);
  }, [hslToHex]);

  // Handle color changes from color picker or palette
  const handleColorChange = useCallback((newColor) => {
    setSelectedColor(newColor);
    const hsl = hexToHsl(newColor);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
  }, [hexToHsl]);

  // Copy color to clipboard (memoized for performance)
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(selectedColor);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy color:', err);
    }
  }, [selectedColor]);

  // Add to custom colors (memoized for performance)
  const addToCustomColors = useCallback(() => {
    if (!customColors.includes(selectedColor)) {
      setCustomColors(prev => [...prev, selectedColor]);
    }
  }, [selectedColor, customColors]);

  // Add to color history
  const addToHistory = useCallback(() => {
    if (!colorHistory.includes(selectedColor)) {
      setColorHistory(prev => [selectedColor, ...prev.slice(0, 9)]);
    }
  }, [selectedColor, colorHistory]);

  // Reset to default color
  const resetColor = useCallback(() => {
    handleColorChange('#3b82f6');
  }, [handleColorChange]);

  // Export custom colors
  const exportColors = useCallback(() => {
    const dataStr = JSON.stringify(customColors, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'custom-colors.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [customColors]);

  // Import custom colors
  const importColors = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const colors = JSON.parse(e.target.result);
          if (Array.isArray(colors)) {
            setCustomColors(colors);
          }
        } catch (err) {
          console.error('Failed to parse color file:', err);
        }
      };
      reader.readAsText(file);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Palette className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Color Picker</h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Test and experiment with different color schemes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Main Color Picker */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Color Picker
              </h2>

              {/* Current Color Display */}
              <div className="flex items-center gap-4 mb-6">
                <div 
                  className="w-20 h-20 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                  style={{ backgroundColor: selectedColor }}
                />
                <div>
                  <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
                    {selectedColor.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    HSL: {hue}°, {saturation}%, {lightness}%
                  </div>
                </div>
              </div>

              {/* HSL Sliders */}
              <div className="space-y-4 mb-6">
                {/* Hue Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hue: {hue}°
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={hue}
                      onChange={(e) => handleHslChange(parseInt(e.target.value), saturation, lightness)}
                      className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-purple-500 to-red-500 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                      }}
                    />
                  </div>
                </div>

                {/* Saturation Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Saturation: {saturation}%
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={saturation}
                      onChange={(e) => handleHslChange(hue, parseInt(e.target.value), lightness)}
                      className="w-full h-2 bg-gradient-to-r from-gray-400 to-current rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #9ca3af, ${hslToHex(hue, 100, lightness)})`
                      }}
                    />
                  </div>
                </div>

                {/* Lightness Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lightness: {lightness}%
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={lightness}
                      onChange={(e) => handleHslChange(hue, saturation, parseInt(e.target.value))}
                      className="w-full h-2 bg-gradient-to-r from-black via-current to-white rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #000000, ${hslToHex(hue, saturation, 50)}, #ffffff)`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={addToCustomColors}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Palette className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={addToHistory}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Palette className="w-4 h-4" />
                  Add to History
                </button>
                <button
                  onClick={resetColor}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>

            {/* Component Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Component Preview
              </h2>

              <div className="space-y-6">
                {/* Button Preview */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Button</h3>
                  <button
                    className="px-6 py-3 text-white font-medium rounded-lg transition-colors"
                    style={{ backgroundColor: selectedColor }}
                  >
                    Sample Button
                  </button>
                </div>

                {/* Card Preview */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card</h3>
                  <div
                    className="p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: selectedColor + '20',
                      borderColor: selectedColor + '40'
                    }}
                  >
                    <p className="text-gray-900 dark:text-white">Sample Card Content</p>
                  </div>
                </div>

                {/* Progress Bar Preview */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Progress Bar</h3>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        backgroundColor: selectedColor,
                        width: '75%'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Color Palettes */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Color Palettes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(colorPalettes).map(([name, colors]) => (
                <div key={name}>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 capitalize">
                    {name}
                  </h3>
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Custom Colors</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportColors}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <label className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={importColors}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {customColors.length > 0 ? (
              <div className="grid grid-cols-5 gap-2">
                {customColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className="w-12 h-12 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No custom colors saved yet. Use the &quot;Save&quot; button to add colors to your collection.
              </p>
            )}
          </div>

          {/* Color History */}
          {colorHistory.length > 0 && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Colors</h2>
              <div className="grid grid-cols-5 gap-2">
                {colorHistory.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className="w-12 h-12 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;