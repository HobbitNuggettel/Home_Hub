import React from 'react';
import { Edit, Trash2, Power, Lock, Camera, Speaker, Thermometer, Lightbulb, Wifi, Battery, Home } from 'lucide-react';

export default function DeviceList({ devices, onEdit, onDelete, onToggle }) {
  if (devices.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <Home className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No devices found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Start building your smart home by adding your first device.
        </p>
      </div>
    );
  }

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'light': return <Lightbulb className="w-5 h-5" />;
      case 'thermostat': return <Thermometer className="w-5 h-5" />;
      case 'lock': return <Lock className="w-5 h-5" />;
      case 'camera': return <Camera className="w-5 h-5" />;
      case 'speaker': return <Speaker className="w-5 h-5" />;
      default: return <Wifi className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'offline': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getDeviceControls = (device) => {
    switch (device.type) {
      case 'light':
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggle(device.id, 'power', device.power === 'on' ? 'off' : 'on')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                device.power === 'on'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              <Power className="w-4 h-4" />
            </button>
            {device.power === 'on' && (
              <input
                type="range"
                min="0"
                max="100"
                value={device.brightness || 0}
                onChange={(e) => onToggle(device.id, 'brightness', parseInt(e.target.value))}
                className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            )}
          </div>
        );
      
      case 'thermostat':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {device.temperature}°F
            </span>
            <input
              type="range"
              min="60"
              max="80"
              value={device.targetTemp || 70}
              onChange={(e) => onToggle(device.id, 'temperature', parseInt(e.target.value))}
              className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
        );
      
      case 'lock':
        return (
          <button
            onClick={() => onToggle(device.id, 'lock', !device.locked)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              device.locked
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            {device.locked ? 'Locked' : 'Unlocked'}
          </button>
        );
      
      case 'camera':
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggle(device.id, 'recording', !device.recording)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                device.recording
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              <Camera className="w-4 h-4" />
              {device.recording ? 'Recording' : 'Not Recording'}
            </button>
          </div>
        );
      
      case 'speaker':
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggle(device.id, 'playing', !device.playing)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                device.playing
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {device.playing ? 'Playing' : 'Paused'}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={device.volume || 0}
              onChange={(e) => onToggle(device.id, 'volume', parseInt(e.target.value))}
              className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {devices.map((device) => (
        <div
          key={device.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
        >
          {/* Device Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
                  {getDeviceIcon(device.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {device.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {device.brand} • {device.room}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(device)}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title="Edit device"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(device.id)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Remove device"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Device Status */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                {device.status === 'online' ? 'Online' : 'Offline'}
              </span>
              {device.battery !== null && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Battery className="w-4 h-4 mr-1" />
                  {device.battery}%
                </div>
              )}
            </div>

            {/* Device Controls */}
            <div className="mb-4">
              {getDeviceControls(device)}
            </div>

            {/* Device Details */}
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>IP Address:</span>
                <span className="font-mono">{device.ipAddress}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Seen:</span>
                <span>{new Date(device.lastSeen).toLocaleString()}</span>
              </div>
              {device.type === 'light' && device.color && (
                <div className="flex justify-between items-center">
                  <span>Color:</span>
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300" style={{ backgroundColor: device.color }}></div>
                </div>
              )}
              {device.type === 'thermostat' && (
                <div className="flex justify-between">
                  <span>Humidity:</span>
                  <span>{device.humidity}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
