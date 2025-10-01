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
import { useAuth } from '../../contexts/AuthContext';
import hybridStorage from '../../firebase/hybridStorage';
import DeviceList from './DeviceList';
import DeviceForm from './DeviceForm';
import AutomationRules from './AutomationRules';
import IntegrationStatus from './IntegrationStatus';
import SmartHomeDashboard from './SmartHomeDashboard';

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
    volume: 60,
    playing: false,
    room: 'Living Room',
    lastSeen: '2024-01-20T10:26:00Z',
    battery: null,
    ipAddress: '192.168.1.105'
  }
];

// Mock automation rules
const mockAutomationRules = [
  {
    id: '1',
    name: 'Morning Routine',
    description: 'Turn on lights and adjust thermostat at 7 AM',
    trigger: 'time',
    triggerValue: '07:00',
    actions: [
      { deviceId: '1', action: 'turnOn', value: 'on' },
      { deviceId: '2', action: 'setTemperature', value: 72 }
    ],
    status: 'active',
    lastExecuted: '2024-01-20T07:00:00Z'
  },
  {
    id: '2',
    name: 'Away Mode',
    description: 'Secure home when everyone leaves',
    trigger: 'location',
    triggerValue: 'away',
    actions: [
      { deviceId: '1', action: 'turnOff', value: 'off' },
      { deviceId: '3', action: 'lock', value: true },
      { deviceId: '4', action: 'startRecording', value: true }
    ],
    status: 'active',
    lastExecuted: '2024-01-20T09:15:00Z'
  },
  {
    id: '3',
    name: 'Night Mode',
    description: 'Dim lights and set security at 10 PM',
    trigger: 'time',
    triggerValue: '22:00',
    actions: [
      { deviceId: '1', action: 'setBrightness', value: 30 },
      { deviceId: '3', action: 'lock', value: true },
      { deviceId: '4', action: 'startRecording', value: true }
    ],
    status: 'active',
    lastExecuted: '2024-01-20T22:00:00Z'
  }
];

export default function IntegrationsAutomation() {
  const { currentUser } = useAuth();
  const [devices, setDevices] = useState([]);
  const [automationRules, setAutomationRules] = useState([]);
  const [showDeviceForm, setShowDeviceForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [viewMode, setViewMode] = useState('devices'); // 'devices', 'automation', 'dashboard', 'integrations'
  const [isLoading, setIsLoading] = useState(true);

  // Load smart home data from Firebase
  useEffect(() => {
    const loadSmartHomeData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [devicesResponse, automationsResponse] = await Promise.all([
          hybridStorage.getSmartHomeDevices(currentUser.uid),
          hybridStorage.getSmartHomeAutomations(currentUser.uid)
        ]);

        if (devicesResponse.success) {
          setDevices(devicesResponse.data || []);
        } else {
          console.error('Failed to load devices:', devicesResponse.error);
          setDevices([]);
        }

        if (automationsResponse.success) {
          setAutomationRules(automationsResponse.data || []);
        } else {
          console.error('Failed to load automations:', automationsResponse.error);
          setAutomationRules([]);
        }
      } catch (error) {
        console.error('Error loading smart home data:', error);
        setDevices([]);
        setAutomationRules([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSmartHomeData();
  }, [currentUser]);

  // Calculate summary statistics
  const totalDevices = devices.length;
  const onlineDevices = devices.filter(device => device.status === 'online').length;
  const offlineDevices = totalDevices - onlineDevices;
  const activeAutomations = automationRules.filter(rule => rule.status === 'active').length;

  // Filter devices based on search and filters
  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || device.type === selectedType;
    const matchesRoom = selectedRoom === 'all' || device.room === selectedRoom;
    return matchesSearch && matchesType && matchesRoom;
  });

  // Get unique types and rooms for filters
  const deviceTypes = ['all', ...new Set(devices.map(device => device.type))];
  const rooms = ['all', ...new Set(devices.map(device => device.room))];

  const handleAddDevice = async (deviceData) => {
    if (!currentUser) return;
    
    try {
      const response = await hybridStorage.addSmartHomeDevice(currentUser.uid, {
        ...deviceData,
        lastSeen: new Date().toISOString(),
        status: 'online'
      });
      
      if (response.success) {
        setDevices([...devices, response.data]);
        setShowDeviceForm(false);
        toast.success('Device added successfully!');
      } else {
        toast.error('Failed to add device: ' + response.error);
      }
    } catch (error) {
      console.error('Error adding device:', error);
      toast.error('Failed to add device');
    }
  };

  const handleEditDevice = async (deviceData) => {
    if (!currentUser) return;
    
    try {
      const response = await hybridStorage.updateSmartHomeDevice(currentUser.uid, deviceData.id, deviceData);
      
      if (response.success) {
        setDevices(devices.map(device => 
          device.id === deviceData.id ? response.data : device
        ));
        setEditingDevice(null);
        toast.success('Device updated successfully!');
      } else {
        toast.error('Failed to update device: ' + response.error);
      }
    } catch (error) {
      console.error('Error updating device:', error);
      toast.error('Failed to update device');
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!currentUser) return;
    
    try {
      const response = await hybridStorage.deleteSmartHomeDevice(currentUser.uid, deviceId);
      
      if (response.success) {
        setDevices(devices.filter(device => device.id !== deviceId));
        toast.success('Device deleted successfully!');
      } else {
        toast.error('Failed to delete device: ' + response.error);
      }
    } catch (error) {
      console.error('Error deleting device:', error);
      toast.error('Failed to delete device');
    }
  };

  const handleToggleDevice = (deviceId, action, value) => {
    setDevices(devices.map(device => {
      if (device.id === deviceId) {
        const updates = {};
        if (action === 'power') updates.power = value;
        if (action === 'brightness') updates.brightness = value;
        if (action === 'temperature') updates.targetTemp = value;
        if (action === 'lock') updates.locked = value;
        if (action === 'recording') updates.recording = value;
        if (action === 'motion') updates.motion = value;
        if (action === 'volume') updates.volume = value;
        if (action === 'playing') updates.playing = value;
        
        return { ...device, ...updates, lastSeen: new Date().toISOString() };
      }
      return device;
    }));
    toast.success('Device updated successfully!');
  };

  const handleToggleAutomation = (ruleId) => {
    setAutomationRules(automationRules.map(rule => 
      rule.id === ruleId ? { ...rule, status: rule.status === 'active' ? 'inactive' : 'active' } : rule
    ));
    toast.success('Automation rule updated successfully!');
  };

  const handleDeleteAutomation = (ruleId) => {
    setAutomationRules(automationRules.filter(rule => rule.id !== ruleId));
    toast.success('Automation rule deleted successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Smart Home Integration
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Manage your smart home devices and automation rules
              </p>
            </div>
            <button
              onClick={() => setShowDeviceForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Device
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Home className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Devices</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDevices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Online Devices</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{onlineDevices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Offline Devices</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{offlineDevices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Automations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeAutomations}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setViewMode('devices')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  viewMode === 'devices'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Devices
              </button>
              <button
                onClick={() => setViewMode('automation')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  viewMode === 'automation'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Automation
              </button>
              <button
                onClick={() => setViewMode('dashboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  viewMode === 'dashboard'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setViewMode('integrations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  viewMode === 'integrations'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Integrations
              </button>
            </nav>
          </div>
        </div>

        {/* Content Based on View Mode */}
        {viewMode === 'devices' && (
          <>
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search devices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {deviceTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {rooms.map(room => (
                    <option key={room} value={room}>
                      {room === 'all' ? 'All Rooms' : room}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Device List */}
            {isLoading ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading smart home devices...</p>
              </div>
            ) : filteredDevices.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Smart Home Devices</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchTerm || selectedType !== 'all' || selectedRoom !== 'all'
                    ? 'No devices match your current filters. Try adjusting your search criteria.'
                    : 'Get started by adding your first smart home device to begin automation.'
                  }
                </p>
                {!searchTerm && selectedType === 'all' && selectedRoom === 'all' && (
                  <button
                    onClick={() => setShowDeviceForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add First Device
                  </button>
                )}
              </div>
            ) : (
              <DeviceList
                devices={filteredDevices}
                onEdit={setEditingDevice}
                onDelete={handleDeleteDevice}
                onToggle={handleToggleDevice}
              />
            )}
          </>
        )}

        {viewMode === 'automation' && (
          <AutomationRules
            rules={automationRules}
            devices={devices}
            onToggle={handleToggleAutomation}
            onDelete={handleDeleteAutomation}
          />
        )}

        {viewMode === 'dashboard' && (
          <SmartHomeDashboard
            devices={devices}
            automationRules={automationRules}
          />
        )}

        {viewMode === 'integrations' && (
          <IntegrationStatus
            devices={devices}
            automationRules={automationRules}
          />
        )}

        {/* Device Form Modal */}
        {showDeviceForm && (
          <DeviceForm
            onSubmit={handleAddDevice}
            onCancel={() => setShowDeviceForm(false)}
            deviceTypes={deviceTypes.filter(type => type !== 'all')}
            rooms={rooms.filter(room => room !== 'all')}
          />
        )}

        {/* Edit Device Form Modal */}
        {editingDevice && (
          <DeviceForm
            device={editingDevice}
            onSubmit={handleEditDevice}
            onCancel={() => setEditingDevice(null)}
            deviceTypes={deviceTypes.filter(type => type !== 'all')}
            rooms={rooms.filter(room => room !== 'all')}
            isEditing={true}
          />
        )}
      </div>
    </div>
  );
}
