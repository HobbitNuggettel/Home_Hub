import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Smartphone, 
  Wifi, 
  Lightbulb, 
  Thermometer, 
  Lock, 
  Camera, 
  Speaker,
  Plus,
  Edit3,
  Trash2,
  Play,
  Pause,
  Settings,
  Power,
  Clock,
  Calendar,
  Sun,
  Moon,
  Home,
  Shield,
  Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import hybridStorage from '../../firebase/hybridStorage';

export default function Integrations() {
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const [activeTab, setActiveTab] = useState('devices');
  const [devices, setDevices] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showAddAutomation, setShowAddAutomation] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [editingAutomation, setEditingAutomation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load integrations data from Firebase
  useEffect(() => {
    const loadIntegrationsData = async () => {
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
          setAutomations(automationsResponse.data || []);
        } else {
          console.error('Failed to load automations:', automationsResponse.error);
          setAutomations([]);
        }

        // Generate integrations status based on available data
        const integrationsData = generateIntegrationsStatus(
          devicesResponse.success ? devicesResponse.data || [] : [],
          automationsResponse.success ? automationsResponse.data || [] : []
        );
        setIntegrations(integrationsData);
      } catch (error) {
        console.error('Error loading integrations data:', error);
        setDevices([]);
        setAutomations([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadIntegrationsData();
  }, [currentUser]);

  // Generate integrations status based on devices and automations
  const generateIntegrationsStatus = (devices, automations) => {
    const deviceCount = devices.length;
    const automationCount = automations.length;

    // Group devices by brand/type to determine integrations
    const deviceBrands = {};
    devices.forEach(device => {
      const brand = device.brand || 'Unknown';
      if (!deviceBrands[brand]) {
        deviceBrands[brand] = { count: 0, types: new Set() };
      }
      deviceBrands[brand].count++;
      deviceBrands[brand].types.add(device.type);
    });

    const integrations = [];

    // Create integration entries based on device brands
    Object.entries(deviceBrands).forEach(([brand, data], index) => {
      integrations.push({
        id: index + 1,
        name: brand,
        type: data.types.size > 1 ? 'ecosystem' : 'device',
        status: 'connected',
        lastSync: '5 minutes ago',
        devices: data.count,
        automations: Math.floor(automationCount * (data.count / deviceCount)) || 0
      });
    });

    // Add a general automation integration if there are automations but no specific brand
    if (automationCount > 0 && integrations.length === 0) {
      integrations.push({
        id: 1,
        name: 'Smart Home Automation',
        type: 'automation',
        status: 'connected',
        lastSync: '5 minutes ago',
        devices: deviceCount,
        automations: automationCount
      });
    }

    return integrations;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading integrations...</p>
        </div>
      </div>
    );
  }

  const deviceTypes = [
    { value: 'light', label: 'Smart Light', icon: Lightbulb },
    { value: 'thermostat', label: 'Thermostat', icon: Thermometer },
    { value: 'camera', label: 'Camera', icon: Camera },
    { value: 'lock', label: 'Smart Lock', icon: Lock },
    { value: 'speaker', label: 'Smart Speaker', icon: Speaker },
    { value: 'sensor', label: 'Sensor', icon: Activity }
  ];

  const triggerTypes = [
    { value: 'schedule', label: 'Schedule', icon: Clock },
    { value: 'geofence', label: 'Geofence', icon: Home },
    { value: 'motion', label: 'Motion', icon: Activity },
    { value: 'voice', label: 'Voice Command', icon: Speaker },
    { value: 'sensor', label: 'Sensor', icon: Thermometer }
  ];

  const getDeviceIcon = (type) => {
    const deviceType = deviceTypes.find(dt => dt.value === type);
    return deviceType ? deviceType.icon : Settings;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'offline': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'connecting': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getAutomationStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'inactive': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const toggleDevicePower = (deviceId) => {
    setDevices(devices.map(device => 
      device.id === deviceId 
        ? { ...device, power: device.power === 'on' ? 'off' : 'on' }
        : device
    ));
  };

  const toggleAutomation = (automationId) => {
    setAutomations(automations.map(automation => 
      automation.id === automationId 
        ? { ...automation, status: automation.status === 'active' ? 'inactive' : 'active' }
        : automation
    ));
  };

  const deleteDevice = (deviceId) => {
    setDevices(devices.filter(device => device.id !== deviceId));
  };

  const deleteAutomation = (automationId) => {
    setAutomations(automations.filter(automation => automation.id !== automationId));
  };

  const getDeviceStats = () => {
    const total = devices.length;
    const online = devices.filter(d => d.status === 'online').length;
    const offline = devices.filter(d => d.status === 'offline').length;
    const types = [...new Set(devices.map(d => d.type))].length;
    
    return { total, online, offline, types };
  };

  const getAutomationStats = () => {
    const total = automations.length;
    const active = automations.filter(a => a.status === 'active').length;
    const inactive = automations.filter(a => a.status === 'inactive').length;
    
    return { total, active, inactive };
  };

  const deviceStats = getDeviceStats();
  const automationStats = getAutomationStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Zap className="w-8 h-8 text-indigo-600" />
                Integrations & Automation
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your smart home devices, automation rules, and third-party integrations
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddDevice(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Device
              </button>
              <button
                onClick={() => setShowAddAutomation(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Add Automation
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Devices</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{deviceStats.total}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('online')}`}>
                {deviceStats.online} Online
              </span>
              <span className="ml-2 text-gray-500">{deviceStats.offline} Offline</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Automations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{automationStats.total}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAutomationStatusColor('active')}`}>
                {automationStats.active} Active
              </span>
              <span className="ml-2 text-gray-500">{automationStats.inactive} Inactive</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Wifi className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Integrations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{integrations.length}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400">{integrations.filter(i => i.status === 'connected').length} Connected</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Device Types</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{deviceStats.types}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Different categories
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'devices', label: 'Devices', count: devices.length },
                { id: 'automations', label: 'Automations', count: automations.length },
                { id: 'integrations', label: 'Integrations', count: integrations.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white py-0.5 px-2.5 rounded-full text-xs font-medium">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Devices Tab */}
            {activeTab === 'devices' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Smart Home Devices</h3>
                  <div className="flex gap-2">
                    <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>All Types</option>
                      {deviceTypes.map(type => (
                        <option key={type.value}>{type.label}</option>
                      ))}
                    </select>
                    <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>All Status</option>
                      <option>Online</option>
                      <option>Offline</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {devices.map((device) => {
                    const DeviceIcon = getDeviceIcon(device.type);
                    return (
                      <div key={device.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white dark:bg-gray-600 rounded-lg">
                              <DeviceIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">{device.name}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{device.brand} • {device.room}</p>
                              <div className="flex items-center mt-1">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                                  {device.status}
                                </span>
                                <span className="ml-2 text-xs text-gray-500">{device.lastSeen}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleDevicePower(device.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                device.power === 'on' 
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingDevice(device)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteDevice(device.id)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {device.type === 'light' && device.power === 'on' && (
                          <div className="mt-3 flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">Brightness:</span>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={device.brightness}
                                className="w-20"
                              />
                              <span className="text-sm text-gray-900 dark:text-white">{device.brightness}%</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">Color:</span>
                              <div 
                                className="w-6 h-6 rounded-full border-2 border-gray-300"
                                style={{ backgroundColor: device.color }}
                              />
                            </div>
                          </div>
                        )}

                        {device.type === 'thermostat' && (
                          <div className="mt-3 flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">Temperature:</span>
                              <span className="text-lg font-semibold text-gray-900 dark:text-white">{device.temperature}°F</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">Mode:</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{device.mode}</span>
                            </div>
                          </div>
                        )}

                        {device.automation && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center space-x-2">
                              <Zap className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm text-gray-500">Automation: {device.automation}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Automations Tab */}
            {activeTab === 'automations' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Automation Rules</h3>
                  <div className="flex gap-2">
                    <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>All Triggers</option>
                      {triggerTypes.map(type => (
                        <option key={type.value}>{type.label}</option>
                      ))}
                    </select>
                    <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>All Status</option>
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {automations.map((automation) => (
                    <div key={automation.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{automation.name}</h4>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAutomationStatusColor(automation.status)}`}>
                              {automation.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{automation.description}</p>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-500">Trigger: {automation.trigger} - {automation.triggerValue}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Smartphone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-500">Devices: {automation.devices.join(', ')}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-500">Last run: {automation.lastRun}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-500">Next run: {automation.nextRun}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => toggleAutomation(automation.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              automation.status === 'active' 
                                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {automation.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setEditingAutomation(automation)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteAutomation(automation.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Third-Party Integrations</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {integrations.map((integration) => (
                    <div key={integration.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-white dark:bg-gray-600 rounded-lg">
                            <Wifi className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{integration.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{integration.type.replace('-', ' ')}</p>
                            <div className="flex items-center mt-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                integration.status === 'connected' 
                                  ? 'text-green-600 bg-green-100 dark:bg-green-900/20' 
                                  : 'text-red-600 bg-red-100 dark:bg-red-900/20'
                              }`}>
                                {integration.status}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">Last sync: {integration.lastSync}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            <div>{integration.devices} devices</div>
                            <div>{integration.automations} automations</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Device Modal */}
      {showAddDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Device</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Living Room Light"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {deviceTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Philips Hue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Living Room"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddDevice(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Add Device
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Automation Modal */}
      {showAddAutomation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Automation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Automation Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Good Morning Routine"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Describe what this automation does..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trigger Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {triggerTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trigger Value</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., 07:00 or motion detected"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddAutomation(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Add Automation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
