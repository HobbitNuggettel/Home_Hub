import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Zap, 
  Home, 
  Lightbulb, 
  Thermometer,
  Lock,
  Camera,
  Speaker,
  Wifi,
  Smartphone,
  Settings,
  Edit,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Bell,
  Shield,
  Cpu,
  Brain,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Sun,
  Moon,
  Cloud,
  Database
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock smart home devices
const mockDevices = [
  {
    id: '1',
    name: 'Living Room Light',
    type: 'light',
    brand: 'Philips Hue',
    status: 'online',
    power: 'on',
    brightness: 80,
    color: '#ffffff',
    room: 'Living Room',
    lastSeen: '2024-01-20T10:30:00Z',
    battery: null,
    ipAddress: '192.168.1.101'
  },
  {
    id: '2',
    name: 'Kitchen Thermostat',
    type: 'thermostat',
    brand: 'Nest',
    status: 'online',
    power: 'on',
    temperature: 72,
    targetTemp: 70,
    humidity: 45,
    room: 'Kitchen',
    lastSeen: '2024-01-20T10:29:00Z',
    battery: 85,
    ipAddress: '192.168.1.102'
  },
  {
    id: '3',
    name: 'Front Door Lock',
    type: 'lock',
    brand: 'August',
    status: 'online',
    power: 'on',
    locked: true,
    room: 'Entryway',
    lastSeen: '2024-01-20T10:28:00Z',
    battery: 92,
    ipAddress: '192.168.1.103'
  },
  {
    id: '4',
    name: 'Security Camera',
    type: 'camera',
    brand: 'Ring',
    status: 'online',
    power: 'on',
    recording: false,
    motion: false,
    room: 'Front Yard',
    lastSeen: '2024-01-20T10:27:00Z',
    battery: 78,
    ipAddress: '192.168.1.104'
  },
  {
    id: '5',
    name: 'Smart Speaker',
    type: 'speaker',
    brand: 'Amazon Echo',
    status: 'online',
    power: 'on',
    volume: 30,
    playing: false,
    room: 'Living Room',
    lastSeen: '2024-01-20T10:26:00Z',
    battery: null,
    ipAddress: '192.168.1.105'
  }
];

// Mock automation rules
const mockAutomations = [
  {
    id: '1',
    name: 'Good Morning',
    description: 'Wake up routine with lights and temperature',
    status: 'active',
    trigger: 'schedule',
    triggerValue: '07:00',
    conditions: [
      { type: 'time', value: '07:00', operator: 'equals' },
      { type: 'day', value: 'weekdays', operator: 'includes' }
    ],
    actions: [
      { deviceId: '1', action: 'turn_on', value: { brightness: 50, color: '#ffd700' } },
      { deviceId: '2', action: 'set_temperature', value: 72 },
      { deviceId: '5', action: 'play_music', value: 'morning_playlist' }
    ],
    lastTriggered: '2024-01-20T07:00:00Z',
    triggerCount: 15,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Good Night',
    description: 'Evening routine to secure the house',
    status: 'active',
    trigger: 'schedule',
    triggerValue: '22:00',
    conditions: [
      { type: 'time', value: '22:00', operator: 'equals' }
    ],
    actions: [
      { deviceId: '1', action: 'turn_off' },
      { deviceId: '3', action: 'lock' },
      { deviceId: '4', action: 'enable_motion' },
      { deviceId: '2', action: 'set_temperature', value: 68 }
    ],
    lastTriggered: '2024-01-19T22:00:00Z',
    triggerCount: 18,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Away Mode',
    description: 'Security mode when no one is home',
    status: 'active',
    trigger: 'location',
    triggerValue: 'away',
    conditions: [
      { type: 'location', value: 'away', operator: 'equals' }
    ],
    actions: [
      { deviceId: '1', action: 'turn_off' },
      { deviceId: '3', action: 'lock' },
      { deviceId: '4', action: 'enable_recording' },
      { deviceId: '2', action: 'set_temperature', value: 65 }
    ],
    lastTriggered: '2024-01-20T09:15:00Z',
    triggerCount: 5,
    createdAt: '2024-01-05T00:00:00Z'
  }
];

// Mock AI suggestions
const mockAISuggestions = [
  {
    id: '1',
    type: 'energy',
    title: 'Optimize Heating Schedule',
    description: 'Based on your usage patterns, you could save 15% on energy by adjusting your thermostat schedule.',
    impact: 'high',
    savings: '$45/month',
    implementation: 'easy',
    status: 'pending'
  },
  {
    id: '2',
    type: 'security',
    title: 'Enhanced Security Routine',
    description: 'Your security camera detected unusual activity patterns. Consider enabling motion alerts during quiet hours.',
    impact: 'medium',
    savings: 'Improved security',
    implementation: 'easy',
    status: 'pending'
  },
  {
    id: '3',
    type: 'comfort',
    title: 'Smart Lighting Adjustment',
    description: 'Your living room lights are often on during daylight hours. Consider adding daylight sensors.',
    impact: 'medium',
    savings: '$12/month',
    implementation: 'medium',
    status: 'pending'
  }
];

const deviceTypes = ['light', 'thermostat', 'lock', 'camera', 'speaker', 'sensor', 'switch'];
const rooms = ['Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Entryway', 'Front Yard', 'Backyard', 'Garage'];
const brands = ['Philips Hue', 'Nest', 'August', 'Ring', 'Amazon Echo', 'Samsung', 'Apple', 'Google'];

export default function IntegrationsAutomation() {
  const [devices, setDevices] = useState(mockDevices);
  const [automations, setAutomations] = useState(mockAutomations);
  const [aiSuggestions, setAISuggestions] = useState(mockAISuggestions);
  const [viewMode, setViewMode] = useState('devices'); // 'devices', 'automations', 'ai-suggestions'
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showAddAutomation, setShowAddAutomation] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [editingAutomation, setEditingAutomation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Filter devices based on search and filters
  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || device.type === selectedType;
    const matchesRoom = selectedRoom === 'all' || device.room === selectedRoom;
    const matchesStatus = selectedStatus === 'all' || device.status === selectedStatus;
    return matchesSearch && matchesType && matchesRoom && matchesStatus;
  });

  // Calculate device statistics
  const totalDevices = devices.length;
  const onlineDevices = devices.filter(device => device.status === 'online').length;
  const offlineDevices = devices.filter(device => device.status === 'offline').length;
  const activeAutomations = automations.filter(auto => auto.status === 'active').length;

  // Add new device
  const addDevice = (deviceData) => {
    const newDevice = {
      id: Date.now().toString(),
      ...deviceData,
      status: 'online',
      lastSeen: new Date().toISOString(),
      ipAddress: `192.168.1.${Math.floor(Math.random() * 100) + 100}`
    };
    setDevices([...devices, newDevice]);
    setShowAddDevice(false);
    toast.success('Device added successfully!');
  };

  // Update device
  const updateDevice = (id, updates) => {
    setDevices(devices.map(device => 
      device.id === id ? { ...device, ...updates } : device
    ));
    setEditingDevice(null);
    toast.success('Device updated successfully!');
  };

  // Delete device
  const deleteDevice = (id) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      setDevices(devices.filter(device => device.id !== id));
      toast.success('Device deleted successfully!');
    }
  };

  // Toggle device power
  const toggleDevicePower = (id) => {
    setDevices(devices.map(device => 
      device.id === id ? { ...device, power: device.power === 'on' ? 'off' : 'on' } : device
    ));
  };

  // Add new automation
  const addAutomation = (automationData) => {
    const newAutomation = {
      id: Date.now().toString(),
      ...automationData,
      status: 'active',
      lastTriggered: null,
      triggerCount: 0,
      createdAt: new Date().toISOString()
    };
    setAutomations([...automations, newAutomation]);
    setShowAddAutomation(false);
    toast.success('Automation created successfully!');
  };

  // Update automation
  const updateAutomation = (id, updates) => {
    setAutomations(automations.map(automation => 
      automation.id === id ? { ...automation, ...updates } : automation
    ));
    setEditingAutomation(null);
    toast.success('Automation updated successfully!');
  };

  // Delete automation
  const deleteAutomation = (id) => {
    if (window.confirm('Are you sure you want to delete this automation?')) {
      setAutomations(automations.filter(automation => automation.id !== id));
      toast.success('Automation deleted successfully!');
    }
  };

  // Toggle automation status
  const toggleAutomationStatus = (id) => {
    setAutomations(automations.map(automation => 
      automation.id === id ? { ...automation, status: automation.status === 'active' ? 'inactive' : 'active' } : automation
    ));
  };

  // Apply AI suggestion
  const applyAISuggestion = (id) => {
    setAISuggestions(aiSuggestions.map(suggestion => 
      suggestion.id === id ? { ...suggestion, status: 'applied' } : suggestion
    ));
    toast.success('AI suggestion applied!');
  };

  // Get device icon
  const getDeviceIcon = (type) => {
    switch (type) {
      case 'light': return Lightbulb;
      case 'thermostat': return Thermometer;
      case 'lock': return Lock;
      case 'camera': return Camera;
      case 'speaker': return Speaker;
      default: return Home;
    }
  };

  // Get device status color
  const getDeviceStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-red-600 bg-red-100';
      case 'error': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get automation trigger icon
  const getAutomationTriggerIcon = (trigger) => {
    switch (trigger) {
      case 'schedule': return Clock;
      case 'location': return Target;
      case 'motion': return AlertTriangle;
      case 'manual': return Settings;
      default: return Zap;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Integrations & Automation</h1>
              <p className="text-gray-600">Smart home integration, automation rules, and AI suggestions</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddAutomation(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Automation</span>
              </button>
              <button
                onClick={() => setShowAddDevice(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Device</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-1 mb-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setViewMode('devices')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'devices'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Home size={16} />
                <span>Devices</span>
              </div>
            </button>
            <button
              onClick={() => setViewMode('automations')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'automations'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Zap size={16} />
                <span>Automations</span>
              </div>
            </button>
            <button
              onClick={() => setViewMode('ai-suggestions')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'ai-suggestions'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Brain size={16} />
                <span>AI Suggestions</span>
              </div>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Home className="text-blue-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Devices</p>
                <p className="text-2xl font-bold text-gray-900">{totalDevices}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="text-green-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Online Devices</p>
                <p className="text-2xl font-bold text-gray-900">{onlineDevices}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Zap className="text-purple-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Automations</p>
                <p className="text-2xl font-bold text-gray-900">{activeAutomations}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Brain className="text-orange-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Suggestions</p>
                <p className="text-2xl font-bold text-gray-900">{aiSuggestions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'devices' && (
          <div>
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Devices</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by name, brand, or room..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Device Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    {deviceTypes.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Rooms</option>
                    {rooms.map(room => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedType('all');
                      setSelectedRoom('all');
                      setSelectedStatus('all');
                    }}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Devices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDevices.map(device => {
                const DeviceIcon = getDeviceIcon(device.type);
                return (
                  <div key={device.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <DeviceIcon className="text-blue-600" size={20} />
                            <h3 className="text-lg font-medium text-gray-900">{device.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600">{device.brand}</p>
                          <p className="text-sm text-gray-500">{device.room}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleDevicePower(device.id)}
                            className={`p-2 rounded-lg ${
                              device.power === 'on' 
                                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={`Turn ${device.power === 'on' ? 'off' : 'on'}`}
                          >
                            {device.power === 'on' ? <Play size={16} /> : <Pause size={16} />}
                          </button>
                          <button
                            onClick={() => setEditingDevice(device)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg"
                            title="Edit Device"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteDevice(device.id)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
                            title="Delete Device"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Device Status */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDeviceStatusColor(device.status)}`}>
                          {device.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          Last seen: {new Date(device.lastSeen).toLocaleTimeString()}
                        </span>
                      </div>

                      {/* Device Specific Info */}
                      {device.type === 'light' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Brightness:</span>
                            <span className="font-medium">{device.brightness}%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Color:</span>
                            <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: device.color }}></div>
                          </div>
                        </div>
                      )}

                      {device.type === 'thermostat' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Current:</span>
                            <span className="font-medium">{device.temperature}°F</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Target:</span>
                            <span className="font-medium">{device.targetTemp}°F</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Humidity:</span>
                            <span className="font-medium">{device.humidity}%</span>
                          </div>
                        </div>
                      )}

                      {device.type === 'lock' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Status:</span>
                            <span className={`font-medium ${device.locked ? 'text-red-600' : 'text-green-600'}`}>
                              {device.locked ? 'Locked' : 'Unlocked'}
                            </span>
                          </div>
                        </div>
                      )}

                      {device.type === 'camera' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Recording:</span>
                            <span className={`font-medium ${device.recording ? 'text-red-600' : 'text-green-600'}`}>
                              {device.recording ? 'On' : 'Off'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Motion:</span>
                            <span className={`font-medium ${device.motion ? 'text-red-600' : 'text-green-600'}`}>
                              {device.motion ? 'Detected' : 'None'}
                            </span>
                          </div>
                        </div>
                      )}

                      {device.type === 'speaker' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Volume:</span>
                            <span className="font-medium">{device.volume}%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Playing:</span>
                            <span className={`font-medium ${device.playing ? 'text-green-600' : 'text-gray-600'}`}>
                              {device.playing ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Battery Info */}
                      {device.battery !== null && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Battery:</span>
                            <span className={`font-medium ${
                              device.battery > 20 ? 'text-green-600' : 
                              device.battery > 10 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {device.battery}%
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Network Info */}
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          IP: {device.ipAddress}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'automations' && (
          <div>
            {/* Automations List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Automation Rules ({automations.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Automation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trigger</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Run</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {automations.map(automation => {
                      const TriggerIcon = getAutomationTriggerIcon(automation.trigger);
                      return (
                        <tr key={automation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{automation.name}</div>
                              <div className="text-sm text-gray-500">{automation.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <TriggerIcon size={16} className="text-blue-600" />
                              <span className="text-sm text-gray-900 capitalize">
                                {automation.trigger}: {automation.triggerValue}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              automation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {automation.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {automation.lastTriggered 
                              ? new Date(automation.lastTriggered).toLocaleString()
                              : 'Never'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => toggleAutomationStatus(automation.id)}
                                className={`p-2 rounded-lg ${
                                  automation.status === 'active'
                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                                }`}
                                title={automation.status === 'active' ? 'Deactivate' : 'Activate'}
                              >
                                {automation.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                              </button>
                              <button
                                onClick={() => setEditingAutomation(automation)}
                                className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg"
                                title="Edit Automation"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => deleteAutomation(automation.id)}
                                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
                                title="Delete Automation"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'ai-suggestions' && (
          <div>
            {/* AI Suggestions */}
            <div className="space-y-6">
              {aiSuggestions.map(suggestion => (
                <div key={suggestion.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Brain className="text-orange-600" size={20} />
                        <h3 className="text-lg font-medium text-gray-900">{suggestion.title}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          suggestion.impact === 'high' ? 'bg-red-100 text-red-800' :
                          suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {suggestion.impact} impact
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{suggestion.description}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span>Savings: {suggestion.savings}</span>
                        <span>Implementation: {suggestion.implementation}</span>
                        <span>Status: {suggestion.status}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {suggestion.status === 'pending' && (
                        <button
                          onClick={() => applyAISuggestion(suggestion.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Apply
                        </button>
                      )}
                      {suggestion.status === 'applied' && (
                        <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-800 bg-green-100 rounded-lg">
                          <CheckCircle size={16} className="mr-2" />
                          Applied
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Device Modal */}
      {(showAddDevice || editingDevice) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingDevice ? 'Edit Device' : 'Add New Device'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const deviceData = {
                  name: formData.get('name'),
                  type: formData.get('type'),
                  brand: formData.get('brand'),
                  room: formData.get('room')
                };
                
                if (editingDevice) {
                  updateDevice(editingDevice.id, deviceData);
                } else {
                  addDevice(deviceData);
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingDevice?.name || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                    <select
                      name="type"
                      defaultValue={editingDevice?.type || 'light'}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {deviceTypes.map(type => (
                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <select
                      name="brand"
                      defaultValue={editingDevice?.brand || 'Philips Hue'}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                    <select
                      name="room"
                      defaultValue={editingDevice?.room || 'Living Room'}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {rooms.map(room => (
                        <option key={room} value={room}>{room}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingDevice ? 'Update Device' : 'Add Device'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddDevice(false);
                      setEditingDevice(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Automation Modal */}
      {(showAddAutomation || editingAutomation) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingAutomation ? 'Edit Automation' : 'Create New Automation'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const automationData = {
                  name: formData.get('name'),
                  description: formData.get('description'),
                  trigger: formData.get('trigger'),
                  triggerValue: formData.get('triggerValue')
                };
                
                if (editingAutomation) {
                  updateAutomation(editingAutomation.id, automationData);
                } else {
                  addAutomation(automationData);
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Automation Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingAutomation?.name || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      defaultValue={editingAutomation?.description || ''}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Type</label>
                      <select
                        name="trigger"
                        defaultValue={editingAutomation?.trigger || 'schedule'}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="schedule">Schedule</option>
                        <option value="location">Location</option>
                        <option value="motion">Motion</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Value</label>
                      <input
                        type="text"
                        name="triggerValue"
                        defaultValue={editingAutomation?.triggerValue || ''}
                        placeholder="07:00, away, etc."
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    {editingAutomation ? 'Update Automation' : 'Create Automation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddAutomation(false);
                      setEditingAutomation(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Back to Home Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <a href="/" className="text-blue-600 hover:text-blue-800 underline">← Back to Home</a>
      </div>
    </div>
  );
} 