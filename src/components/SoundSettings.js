/**
 * Sound Settings Component - Allows users to customize sound notifications
 * Created: 2025-01-29
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Settings, Bell, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import SoundNotificationService from '../services/SoundNotificationService.js';
import NotificationService from '../services/NotificationService.js';

export default function SoundSettings() {
  const [soundSettings, setSoundSettings] = useState(SoundNotificationService.getSettings());
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSound, setSelectedSound] = useState(null);

  useEffect(() => {
    // Update settings when component mounts
    setSoundSettings(SoundNotificationService.getSettings());
  }, []);

  const handleVolumeChange = (volume) => {
    const newVolume = parseFloat(volume);
    SoundNotificationService.setVolume(newVolume);
    NotificationService.setSoundVolume(newVolume);
    setSoundSettings(prev => ({ ...prev, volume: newVolume }));
  };

  const handleToggleEnabled = () => {
    const newEnabled = !soundSettings.isEnabled;
    SoundNotificationService.setEnabled(newEnabled);
    NotificationService.setSoundEnabled(newEnabled);
    setSoundSettings(prev => ({ ...prev, isEnabled: newEnabled }));
  };

  const playSound = (soundName) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setSelectedSound(soundName);
    
    // Play the specific sound
    switch (soundName) {
      case 'taskComplete':
        SoundNotificationService.playTaskComplete();
        break;
      case 'workComplete':
        SoundNotificationService.playWorkComplete();
        break;
      case 'approvalNeeded':
        SoundNotificationService.playApprovalNeeded();
        break;
      case 'userApproval':
        SoundNotificationService.playUserApproval();
        break;
      case 'error':
        SoundNotificationService.playError();
        break;
      case 'warning':
        SoundNotificationService.playWarning();
        break;
      case 'serverRestart':
        SoundNotificationService.playServerRestart();
        break;
      case 'buildComplete':
        SoundNotificationService.playBuildComplete();
        break;
      case 'testPass':
        SoundNotificationService.playTestPass();
        break;
      case 'testFail':
        SoundNotificationService.playTestFail();
        break;
      case 'inventoryAlert':
        SoundNotificationService.playInventoryAlert();
        break;
      case 'budgetAlert':
        SoundNotificationService.playBudgetAlert();
        break;
      case 'recipeSuggestion':
        SoundNotificationService.playRecipeSuggestion();
        break;
      case 'maintenanceReminder':
        SoundNotificationService.playMaintenanceReminder();
        break;
      case 'notification':
        SoundNotificationService.playNotification();
        break;
      case 'connectionLost':
        SoundNotificationService.playConnectionLost();
        break;
      case 'connectionRestored':
        SoundNotificationService.playConnectionRestored();
        break;
      default:
        break;
    }
    
    // Reset playing state after sound duration
    setTimeout(() => {
      setIsPlaying(false);
      setSelectedSound(null);
    }, 1000);
  };

  const testAllSounds = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    SoundNotificationService.testAllSounds();
    setTimeout(() => {
      setIsPlaying(false);
    }, 5000);
  };

  const soundCategories = {
    'Development Workflow': [
      { key: 'taskComplete', name: 'Task Complete', description: 'When a single task is completed' },
      { key: 'workComplete', name: 'Work Complete', description: 'When all work is finished' },
      { key: 'approvalNeeded', name: 'Approval Needed', description: 'When user approval is required' },
      { key: 'userApproval', name: 'User Approval', description: 'When user gives approval' },
      { key: 'serverRestart', name: 'Server Restart', description: 'When server is restarting' },
      { key: 'buildComplete', name: 'Build Complete', description: 'When build process finishes' },
      { key: 'testPass', name: 'Test Pass', description: 'When tests pass' },
      { key: 'testFail', name: 'Test Fail', description: 'When tests fail' }
    ],
    'System Notifications': [
      { key: 'notification', name: 'General Notification', description: 'Default notification sound' },
      { key: 'error', name: 'Error', description: 'When an error occurs' },
      { key: 'warning', name: 'Warning', description: 'When a warning is shown' },
      { key: 'connectionLost', name: 'Connection Lost', description: 'When connection is lost' },
      { key: 'connectionRestored', name: 'Connection Restored', description: 'When connection is restored' }
    ],
    'Feature Alerts': [
      { key: 'inventoryAlert', name: 'Inventory Alert', description: 'When inventory items are low' },
      { key: 'budgetAlert', name: 'Budget Alert', description: 'When budget limits are exceeded' },
      { key: 'recipeSuggestion', name: 'Recipe Suggestion', description: 'When recipes are suggested' },
      { key: 'maintenanceReminder', name: 'Maintenance Reminder', description: 'When maintenance is due' }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Sound Settings</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={testAllSounds}
            disabled={isPlaying || !soundSettings.isEnabled}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-4 w-4" />
            <span>Test All Sounds</span>
          </button>
        </div>
      </div>

      {/* Global Settings */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Global Settings</h2>
        
        <div className="space-y-4">
          {/* Enable/Disable Sounds */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {soundSettings.isEnabled ? (
                <Volume2 className="h-5 w-5 text-green-600" />
              ) : (
                <VolumeX className="h-5 w-5 text-red-600" />
              )}
              <span className="text-gray-700">Enable Sound Notifications</span>
            </div>
            <button
              onClick={handleToggleEnabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                soundSettings.isEnabled ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  soundSettings.isEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Volume</span>
              <span className="text-sm text-gray-500">{Math.round(soundSettings.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={soundSettings.volume}
              onChange={(e) => handleVolumeChange(e.target.value)}
              disabled={!soundSettings.isEnabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Audio Context Status */}
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Audio Engine: {soundSettings.audioContextSupported ? 'Web Audio API' : 'Fallback Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* Sound Categories */}
      <div className="space-y-6">
        {Object.entries(soundCategories).map(([categoryName, sounds]) => (
          <div key={categoryName} className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{categoryName}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sounds.map((sound) => (
                <div
                  key={sound.key}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{sound.name}</h4>
                      {sound.key === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                      {sound.key === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                      {sound.key === 'taskComplete' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                    <p className="text-sm text-gray-600">{sound.description}</p>
                  </div>
                  <button
                    onClick={() => playSound(sound.key)}
                    disabled={isPlaying || !soundSettings.isEnabled}
                    className={`ml-4 p-2 rounded-lg transition-colors ${
                      selectedSound === sound.key
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Play className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Sound Settings */}
      <div className="mt-6 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Sound</h3>
        <p className="text-sm text-gray-600 mb-4">
          You can create custom sounds by calling the SoundNotificationService directly in your code:
        </p>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
          <div>{/* Play custom sound */}</div>
          <div>SoundNotificationService.playCustomSound(</div>
          <div className="ml-4">frequency: 800,    {/* Hz */}</div>
          <div className="ml-4">duration: 300,     {/* ms */}</div>
          <div className="ml-4">type: &apos;success&apos;,   {/* sound type */}</div>
          <div className="ml-4">volume: 0.7        {/* 0-1 */}</div>
          <div>);</div>
        </div>
      </div>
    </div>
  );
}
