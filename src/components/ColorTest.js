import React, { useState } from 'react';

const ColorTest = () => {
  const [testColor, setTestColor] = useState('#3b82f6');
  const [sidebarBg, setSidebarBg] = useState('#1e40af');
  const [textColor, setTextColor] = useState('#ffffff');

  const applyTestColor = () => {
    // Apply the color to CSS custom property
    document.documentElement.style.setProperty('--color-primary', testColor);
    
    // Show what happened
    console.log(`Applied primary color: ${testColor}`);
    console.log('Navigation buttons should now use this color!');
  };

  const applySidebarColors = () => {
    // Apply sidebar background and text colors
    document.documentElement.style.setProperty('--color-surface', sidebarBg);
    document.documentElement.style.setProperty('--color-text', textColor);
    
    // Also update text colors for sidebar specifically
    document.documentElement.style.setProperty('--text-primary', textColor);
    document.documentElement.style.setProperty('--text-secondary', textColor);
    
    console.log(`Applied sidebar background: ${sidebarBg}`);
    console.log(`Applied text color: ${textColor}`);
  };

  const resetColors = () => {
    // Reset to default colors
    document.documentElement.style.setProperty('--color-primary', '#3b82f6');
    document.documentElement.style.setProperty('--color-surface', '#1e40af');
    document.documentElement.style.setProperty('--color-text', '#ffffff');
    document.documentElement.style.setProperty('--text-primary', '#ffffff');
    document.documentElement.style.setProperty('--text-secondary', '#ffffff');
    
    // Reset sidebar elements directly
    const sidebarElements = document.querySelectorAll('.sidebar-item-button, .sidebar-text, .sidebar-icon');
    sidebarElements.forEach(element => {
      element.style.color = '';
    });
    
    setTestColor('#3b82f6');
    setSidebarBg('#1e40af');
    setTextColor('#ffffff');
    
    console.log('Reset to default colors');
  };

  const testColors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' }
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🎨 Theme Customizer</h2>
      
      {/* Primary Color Controls */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-blue-800">🔵 Active Button Colors</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Button Color:</label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={testColor}
              onChange={(e) => setTestColor(e.target.value)}
              className="w-16 h-10 border rounded"
            />
            <span className="font-mono text-sm">{testColor}</span>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium mb-2">Quick Colors:</h4>
          <div className="flex gap-2 flex-wrap">
            {testColors.map((color) => (
              <button
                key={color.name}
                onClick={() => setTestColor(color.value)}
                className="px-3 py-1 rounded text-white text-sm"
                style={{ backgroundColor: color.value }}
              >
                {color.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={applyTestColor}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Apply to Buttons
        </button>
      </div>

      {/* Sidebar Background Controls */}
      <div className="mb-6 p-4 bg-purple-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-purple-800">🎨 Navigation Panel Colors</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Sidebar Background:</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={sidebarBg}
                onChange={(e) => setSidebarBg(e.target.value)}
                className="w-16 h-10 border rounded"
              />
              <span className="font-mono text-sm">{sidebarBg}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sidebar Text Color:</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-16 h-10 border rounded"
              />
              <span className="font-mono text-sm">{textColor}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium mb-2">Quick Sidebar Themes:</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setSidebarBg('#1e40af');
                setTextColor('#ffffff');
              }}
              className="px-3 py-2 rounded text-white text-sm"
              style={{ backgroundColor: '#1e40af' }}
            >
              Dark Blue
            </button>
            <button
              onClick={() => {
                setSidebarBg('#374151');
                setTextColor('#ffffff');
              }}
              className="px-3 py-2 rounded text-white text-sm"
              style={{ backgroundColor: '#374151' }}
            >
              Dark Gray
            </button>
            <button
              onClick={() => {
                setSidebarBg('#7c3aed');
                setTextColor('#ffffff');
              }}
              className="px-3 py-2 rounded text-white text-sm"
              style={{ backgroundColor: '#7c3aed' }}
            >
              Purple
            </button>
            <button
              onClick={() => {
                setSidebarBg('#059669');
                setTextColor('#ffffff');
              }}
              className="px-3 py-2 rounded text-white text-sm"
              style={{ backgroundColor: '#059669' }}
            >
              Green
            </button>
          </div>
        </div>

        <button
          onClick={applySidebarColors}
          className="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Apply to Sidebar
        </button>
      </div>

      {/* Reset Button */}
      <div className="flex gap-4">
        <button
          onClick={resetColors}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reset All Colors
        </button>
      </div>

      <div className="mt-4 p-3 bg-gray-100 rounded">
        <h4 className="font-medium mb-2">What you can change:</h4>
        <ul className="text-sm space-y-1">
          <li>• <strong>Primary Color:</strong> Button backgrounds, active states</li>
          <li>• <strong>Sidebar Background:</strong> Entire navigation panel background</li>
          <li>• <strong>Text Color:</strong> All text in the sidebar</li>
          <li>• <strong>Real-time updates:</strong> See changes instantly!</li>
        </ul>
      </div>
    </div>
  );
};

export default ColorTest;
