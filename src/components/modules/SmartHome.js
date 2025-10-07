import React, { useState, useEffect } from 'react';
import { Home, Lightbulb, Thermostat, Lock, Camera, Speaker, Wifi, Zap, Settings, Plus, Edit, Trash2, Power, Volume2, Eye, Shield, Clock, Calendar, Sun, Moon, Smartphone, Tablet, Monitor, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';
import hybridStorage from '../../firebase/hybridStorage.js';

const SmartHome = () => {
  const { currentUser } = useAuth();
  const [devices, setDevices] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rooms, setRooms] = useState([
    'Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Office', 'Garage', 'Garden', 'Basement'
  ]);
  const [deviceTypes, setDeviceTypes] = useState([
    'Lighting', 'Climate', 'Security', 'Entertainment', 'Appliances', 'Sensors', 'Cameras', 'Speakers'
  ]);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showAddAutomation, setShowAddAutomation] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [editingAutomation, setEditingAutomation] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [systemStatus, setSystemStatus] = useState('online');
  const [energyUsage, setEnergyUsage] = useState(0);
  
  const [deviceForm, setDeviceForm] = useState({
    name: '',
    type: '',
    room: '',
    brand: '',
    model: '',
    ipAddress: '',
    macAddress: '',
    status: 'offline',
    power: false,
    settings: {}
  });

  const [automationForm, setAutomationForm] = useState({
    name: '',
    description: '',
    trigger: 'time',
    triggerValue: '',
    conditions: [],
    actions: [],
    enabled: true,
    schedule: {
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      startTime: '08:00',
      endTime: '22:00'
    }
  });

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
          // Calculate total energy usage
          const totalEnergy = (devicesResponse.data || []).reduce((sum, device) => sum + (device.energyUsage || 0), 0);
          setEnergyUsage(totalEnergy);
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
      } catch (error) {
        console.error('Error loading smart home data:', error);
        setDevices([]);
        setAutomations([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSmartHomeData();
  }, [currentUser]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading smart home devices...</p>
        </div>
      </div>
    );
  }

  const handleAddDevice = async () => {
    if (!deviceForm.name || !deviceForm.type || !deviceForm.room) return;
    
    const newDevice = {
      id: Date.now(),
      ...deviceForm,
      lastSeen: new Date().toISOString(),
      energyUsage: Math.random() * 20 + 1
    };
    
    setDevices([...devices, newDevice]);
    resetDeviceForm();
  };

  const handleEditDevice = () => {
    if (!editingDevice || !deviceForm.name || !deviceForm.type || !deviceForm.room) return;
    
    const updatedDevices = devices.map(device =>
      device.id === editingDevice.id
        ? { ...device, ...deviceForm }
        : device
    );
    
    setDevices(updatedDevices);
    resetDeviceForm();
  };

  const handleDeleteDevice = (deviceId) => {
    setDevices(devices.filter(device => device.id !== deviceId));
  };

  const handleAddAutomation = () => {
    if (!automationForm.name || !automationForm.trigger) return;
    
    const newAutomation = {
      id: Date.now(),
      ...automationForm,
      lastTriggered: null,
      executionCount: 0
    };
    
    setAutomations([...automations, newAutomation]);
    resetAutomationForm();
  };

  const handleEditAutomation = () => {
    if (!editingAutomation || !automationForm.name || !automationForm.trigger) return;
    
    const updatedAutomations = automations.map(automation =>
      automation.id === editingAutomation.id
        ? { ...automation, ...automationForm }
        : automation
    );
    
    setAutomations(updatedAutomations);
    resetAutomationForm();
  };

  const handleDeleteAutomation = (automationId) => {
    setAutomations(automations.filter(automation => automation.id !== automationId));
  };

  const toggleDevicePower = (deviceId) => {
    setDevices(prev =>
      prev.map(device =>
        device.id === deviceId
          ? { ...device, power: !device.power }
          : device
      )
    );
  };

  const toggleAutomation = (automationId) => {
    setAutomations(prev =>
      prev.map(automation =>
        automation.id === automationId
          ? { ...automation, enabled: !automation.enabled }
          : automation
      )
    );
  };

  const resetDeviceForm = () => {
    setDeviceForm({
      name: '',
      type: '',
      room: '',
      brand: '',
      model: '',
      ipAddress: '',
      macAddress: '',
      status: 'offline',
      power: false,
      settings: {}
    });
    setEditingDevice(null);
    setShowAddDevice(false);
  };

  const resetAutomationForm = () => {
    setAutomationForm({
      name: '',
      description: '',
      trigger: 'time',
      triggerValue: '',
      conditions: [],
      actions: [],
      enabled: true,
      schedule: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        startTime: '08:00',
        endTime: '22:00'
      }
    });
    setEditingAutomation(null);
    setShowAddAutomation(false);
  };

  const filteredDevices = devices.filter(device => {
    const matchesRoom = selectedRoom === 'all' || device.room === selectedRoom;
    const matchesType = selectedType === 'all' || device.type === selectedType;
    return matchesRoom && matchesType;
  });

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'Lighting': return Lightbulb;
      case 'Climate': return Thermostat;
      case 'Security': return Lock;
      case 'Cameras': return Camera;
      case 'Entertainment': return Speaker;
      case 'Appliances': return Home;
      case 'Sensors': return Eye;
      case 'Speakers': return Speaker;
      default: return Home;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'connecting': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeviceTypeColor = (type) => {
    switch (type) {
      case 'Lighting': return 'bg-yellow-100 text-yellow-800';
      case 'Climate': return 'bg-blue-100 text-blue-800';
      case 'Security': return 'bg-red-100 text-red-800';
      case 'Cameras': return 'bg-purple-100 text-purple-800';
      case 'Entertainment': return 'bg-green-100 text-green-800';
      case 'Appliances': return 'bg-gray-100 text-gray-800';
      case 'Sensors': return 'bg-indigo-100 text-indigo-800';
      case 'Speakers': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Home className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Smart Home Integration
              </h1>
              <p className="text-lg text-gray-600">
                Control and automate your smart home devices
              </p>
            </div>
          </div>
          
          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${systemStatus === 'online' ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Wifi className={`h-6 w-6 ${systemStatus === 'online' ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">System Status</p>
                  <p className={`text-xl font-bold ${systemStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                    {systemStatus === 'online' ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Home className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Devices</p>
                  <p className="text-xl font-bold text-gray-900">{devices.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Energy Usage</p>
                  <p className="text-xl font-bold text-gray-900">{energyUsage.toFixed(1)} kWh</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Automations</p>
                  <p className="text-xl font-bold text-gray-900">{automations.length}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex gap-2">
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Rooms</option>
                {rooms.map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
              
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {deviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddDevice(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Device
              </button>
              
              <button
                onClick={() => setShowAddAutomation(true)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Automation
              </button>
            </div>
          </div>
        </div>

        {/* Devices Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Smart Devices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevices.map(device => {
              const DeviceIcon = getDeviceIcon(device.type);
              return (
                <div key={device.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Device Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${getDeviceTypeColor(device.type).replace('bg-', 'bg-').replace('text-', 'text-')}`}>
                          <DeviceIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{device.name}</h3>
                          <p className="text-sm text-gray-500">{device.room}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(device.status)}`}>
                          {device.status}
                        </span>
                        <button
                          onClick={() => toggleDevicePower(device.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            device.power
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Device Info */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Brand:</span>
                        <span className="text-gray-900">{device.brand}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Model:</span>
                        <span className="text-gray-900">{device.model}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">IP Address:</span>
                        <span className="text-gray-900 font-mono">{device.ipAddress}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Energy Usage:</span>
                        <span className="text-gray-900">{device.energyUsage.toFixed(1)} kWh</span>
                      </div>
                    </div>
                    
                    {/* Device Controls */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingDevice(device);
                          setDeviceForm(device);
                          setShowAddDevice(true);
                        }}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDevice(device.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Automations */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Automations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {automations.map(automation => (
              <div key={automation.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{automation.name}</h3>
                    <p className="text-sm text-gray-500">{automation.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAutomation(automation.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        automation.enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {automation.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Trigger:</span>
                    <span className="text-gray-900 capitalize">{automation.trigger}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Triggered:</span>
                    <span className="text-gray-900">
                      {automation.lastTriggered 
                        ? new Date(automation.lastTriggered).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Executions:</span>
                    <span className="text-gray-900">{automation.executionCount}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingAutomation(automation);
                      setAutomationForm(automation);
                      setShowAddAutomation(true);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAutomation(automation.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add/Edit Device Modal */}
        {showAddDevice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingDevice ? 'Edit Device' : 'Add New Device'}
                  </h2>
                  <button
                    onClick={resetDeviceForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); editingDevice ? handleEditDevice() : handleAddDevice(); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Device Name *
                      </label>
                      <input
                        type="text"
                        value={deviceForm.name}
                        onChange={(e) => setDeviceForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Device Type *
                      </label>
                      <select
                        value={deviceForm.type}
                        onChange={(e) => setDeviceForm(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Type</option>
                        {deviceTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room *
                      </label>
                      <select
                        value={deviceForm.room}
                        onChange={(e) => setDeviceForm(prev => ({ ...prev, room: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Room</option>
                        {rooms.map(room => (
                          <option key={room} value={room}>{room}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand
                      </label>
                      <input
                        type="text"
                        value={deviceForm.brand}
                        onChange={(e) => setDeviceForm(prev => ({ ...prev, brand: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model
                      </label>
                      <input
                        type="text"
                        value={deviceForm.model}
                        onChange={(e) => setDeviceForm(prev => ({ ...prev, model: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IP Address
                      </label>
                      <input
                        type="text"
                        value={deviceForm.ipAddress}
                        onChange={(e) => setDeviceForm(prev => ({ ...prev, ipAddress: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="192.168.1.100"
                      />
                    </div>
                  </div>
                  
                  {/* Form Actions */}
                  <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={resetDeviceForm}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingDevice ? 'Update Device' : 'Add Device'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Automation Modal */}
        {showAddAutomation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingAutomation ? 'Edit Automation' : 'Add New Automation'}
                  </h2>
                  <button
                    onClick={resetAutomationForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); editingAutomation ? handleEditAutomation() : handleAddAutomation(); }}>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Automation Name *
                      </label>
                      <input
                        type="text"
                        value={automationForm.name}
                        onChange={(e) => setAutomationForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={automationForm.description}
                        onChange={(e) => setAutomationForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trigger Type *
                        </label>
                        <select
                          value={automationForm.trigger}
                          onChange={(e) => setAutomationForm(prev => ({ ...prev, trigger: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        >
                          <option value="time">Time</option>
                          <option value="presence">Presence</option>
                          <option value="motion">Motion</option>
                          <option value="manual">Manual</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trigger Value
                        </label>
                        <input
                          type="text"
                          value={automationForm.triggerValue}
                          onChange={(e) => setAutomationForm(prev => ({ ...prev, triggerValue: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="07:00 or away"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enabled
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={automationForm.enabled}
                          onChange={(e) => setAutomationForm(prev => ({ ...prev, enabled: e.target.checked }))}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enable this automation</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Form Actions */}
                  <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={resetAutomationForm}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {editingAutomation ? 'Update Automation' : 'Add Automation'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartHome;
