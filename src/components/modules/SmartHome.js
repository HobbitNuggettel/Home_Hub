import React, { useState, useEffect } from 'react';
import { Home, Lightbulb, Thermostat, Lock, Camera, Speaker, Wifi, Zap, Settings, Plus, Edit, Trash2, Power, Volume2, Eye, Shield, Clock, Calendar, Sun, Moon, Smartphone, Tablet, Monitor, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import hybridStorage from '../../firebase/hybridStorage';

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

    // Load real data from Firebase
  useEffect(() => {
      const loadSmartHomeData = async () => {
          if (!currentUser) {
              setDevices([]);
              setAutomations([]);
              setEnergyUsage(0);
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
                  console.error('Failed to load smart home devices:', devicesResponse.error);
                  setDevices([]);
              }

              if (automationsResponse.success) {
                  setAutomations(automationsResponse.data || []);
              } else {
                  console.error('Failed to load smart home automations:', automationsResponse.error);
                  setAutomations([]);
              }
          } catch (error) {
              console.error('Error loading smart home data:', error);
              setDevices([]);
              setAutomations([]);
              setEnergyUsage(0);
          } finally {
              setIsLoading(false);
          }
      };

      loadSmartHomeData();
  }, [currentUser]);

    // Show loading state while authentication is being determined
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading smart home data...</p>
                </div>
            </div>
        );
    }

  const handleAddDevice = () => {
    if (!deviceForm.name || !deviceForm.type || !deviceForm.room) return;
    
    const newDevice = {
      id: Date.now(),
      ...deviceForm,
      lastSeen: new Date().toISOString(),
        energyUsage: 0
    };
    
    setDevices([...devices, newDevice]);
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
      setShowAddDevice(false);
  };

    const handleEditDevice = (device) => {
        setEditingDevice(device);
        setDeviceForm(device);
        setShowAddDevice(true);
    };

    const handleUpdateDevice = () => {
        if (!editingDevice) return;
    
      const updatedDevices = devices.map(device => 
        device.id === editingDevice.id ? { ...device, ...deviceForm } : device
    );
    setDevices(updatedDevices);
      setEditingDevice(null);
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
      setShowAddDevice(false);
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
      setShowAddAutomation(false);
  };

    const handleEditAutomation = (automation) => {
        setEditingAutomation(automation);
        setAutomationForm(automation);
        setShowAddAutomation(true);
  };

    const handleUpdateAutomation = () => {
        if (!editingAutomation) return;

      const updatedAutomations = automations.map(automation =>
          automation.id === editingAutomation.id ? { ...automation, ...automationForm } : automation
    );
      setAutomations(updatedAutomations);
      setEditingAutomation(null);
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
    setShowAddAutomation(false);
  };

    const handleDeleteAutomation = (automationId) => {
        setAutomations(automations.filter(automation => automation.id !== automationId));
    };

    const toggleDevicePower = (deviceId) => {
        const updatedDevices = devices.map(device =>
            device.id === deviceId ? { ...device, power: !device.power } : device
        );
        setDevices(updatedDevices);
  };

    const toggleAutomation = (automationId) => {
        const updatedAutomations = automations.map(automation =>
            automation.id === automationId ? { ...automation, enabled: !automation.enabled } : automation
        );
        setAutomations(updatedAutomations);
  };

    const filteredDevices = devices.filter(device => {
        const roomMatch = selectedRoom === 'all' || device.room === selectedRoom;
        const typeMatch = selectedType === 'all' || device.type === selectedType;
        return roomMatch && typeMatch;
    });

    const getDeviceIcon = (type) => {
    switch (type) {
        case 'Lighting': return <Lightbulb className="w-5 h-5" />;
        case 'Climate': return <Thermostat className="w-5 h-5" />;
        case 'Security': return <Shield className="w-5 h-5" />;
        case 'Entertainment': return <Speaker className="w-5 h-5" />;
        case 'Appliances': return <Home className="w-5 h-5" />;
        case 'Sensors': return <Eye className="w-5 h-5" />;
        case 'Cameras': return <Camera className="w-5 h-5" />;
        case 'Speakers': return <Volume2 className="w-5 h-5" />;
        default: return <Home className="w-5 h-5" />;
    }
  };

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
                  <div className="flex items-center justify-between">
            <div>
                          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                              <Home className="w-8 h-8 text-blue-600" />
                              Smart Home Control
              </h1>
                          <p className="text-gray-600 dark:text-gray-400 mt-2">
                              Manage your smart devices and automations
              </p>
            </div>
                      <div className="flex items-center gap-4">
                          <div className="text-right">
                              <p className="text-sm text-gray-500 dark:text-gray-400">System Status</p>
                              <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${systemStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                  <span className="text-sm font-medium capitalize">{systemStatus}</span>
                              </div>
                          </div>
                          <div className="text-right">
                              <p className="text-sm text-gray-500 dark:text-gray-400">Energy Usage</p>
                              <p className="text-lg font-semibold text-blue-600">{energyUsage.toFixed(1)} kWh</p>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                          <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Devices</p>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">{devices.length}</p>
                          </div>
                          <Home className="w-8 h-8 text-blue-600" />
                      </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                          <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Online Devices</p>
                              <p className="text-2xl font-bold text-green-600">{devices.filter(d => d.status === 'online').length}</p>
                          </div>
                          <Wifi className="w-8 h-8 text-green-600" />
                      </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                          <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Automations</p>
                              <p className="text-2xl font-bold text-purple-600">{automations.filter(a => a.enabled).length}</p>
                          </div>
                          <Settings className="w-8 h-8 text-purple-600" />
                      </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                          <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Energy Usage</p>
                              <p className="text-2xl font-bold text-orange-600">{energyUsage.toFixed(1)} kWh</p>
                          </div>
                          <Zap className="w-8 h-8 text-orange-600" />
                      </div>
                  </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex flex-wrap items-center gap-4">
                      <select
                          value={selectedRoom}
                          onChange={(e) => setSelectedRoom(e.target.value)}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                          <option value="all">All Rooms</option>
                          {rooms.map(room => (
                              <option key={room} value={room}>{room}</option>
                          ))}
                      </select>

                      <select
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                          <option value="all">All Types</option>
                          {deviceTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                          ))}
                      </select>
                  </div>

                  <div className="flex items-center gap-3">
                      <button
                          onClick={() => setShowAddAutomation(true)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                      >
                          <Settings className="w-4 h-4" />
                          Add Automation
                      </button>
                      <button
                          onClick={() => setShowAddDevice(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                          <Plus className="w-4 h-4" />
                          Add Device
                      </button>
          </div>
        </div>

        {/* Devices Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {filteredDevices.map(device => (
                      <div key={device.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                          {getDeviceIcon(device.type)}
                          <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">{device.name}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{device.room}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-2">
                          <button
                              onClick={() => handleEditDevice(device)}
                              className="p-1 text-gray-400 hover:text-blue-600"
                          >
                              <Edit className="w-4 h-4" />
                          </button>
                          <button
                              onClick={() => handleDeleteDevice(device.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                          >
                              <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                  </div>

                  <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                          <span className={`text-sm font-medium ${device.status === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                              {device.status}
                          </span>
                      </div>
                      <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Power</span>
                          <button
                              onClick={() => toggleDevicePower(device.id)}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${device.power
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                  }`}
                          >
                              {device.power ? 'ON' : 'OFF'}
                          </button>
                      </div>
                      {device.energyUsage && (
                          <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Energy</span>
                              <span className="text-sm font-medium">{device.energyUsage} kWh</span>
                  </div>
                      )}
                  </div>
              </div>
          ))}
        </div>

        {/* Automations */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Automations</h2>
                  <div className="space-y-4">
            {automations.map(automation => (
                <div key={automation.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => toggleAutomation(automation.id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${automation.enabled 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                }`}
                        >
                            {automation.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{automation.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{automation.description}</p>
                  </div>
                </div>
                    <div className="flex items-center gap-2">
                  <button
                            onClick={() => handleEditAutomation(automation)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                  >
                            <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAutomation(automation.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                  >
                            <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

              {/* Add Device Modal */}
        {showAddDevice && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              {editingDevice ? 'Edit Device' : 'Add New Device'}
                          </h3>
                          <div className="space-y-4">
                              <input
                                  type="text"
                                  placeholder="Device Name"
                                  value={deviceForm.name}
                                  onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <select
                                  value={deviceForm.type}
                                  onChange={(e) => setDeviceForm({ ...deviceForm, type: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                  <option value="">Select Type</option>
                                  {deviceTypes.map(type => (
                                      <option key={type} value={type}>{type}</option>
                                  ))}
                              </select>
                              <select
                                  value={deviceForm.room}
                                  onChange={(e) => setDeviceForm({ ...deviceForm, room: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                  <option value="">Select Room</option>
                                  {rooms.map(room => (
                                      <option key={room} value={room}>{room}</option>
                                  ))}
                              </select>
                              <input
                                  type="text"
                                  placeholder="Brand"
                                  value={deviceForm.brand}
                                  onChange={(e) => setDeviceForm({ ...deviceForm, brand: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <input
                                  type="text"
                                  placeholder="Model"
                                  value={deviceForm.model}
                                  onChange={(e) => setDeviceForm({ ...deviceForm, model: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                          </div>
                          <div className="flex justify-end gap-3 mt-6">
                              <button
                                  onClick={() => {
                                      setShowAddDevice(false);
                                      setEditingDevice(null);
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
                                  }}
                                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                              >
                                  Cancel
                              </button>
                              <button
                                  onClick={editingDevice ? handleUpdateDevice : handleAddDevice}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                              >
                                  {editingDevice ? 'Update' : 'Add'} Device
                              </button>
              </div>
            </div>
          </div>
        )}

              {/* Add Automation Modal */}
        {showAddAutomation && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              {editingAutomation ? 'Edit Automation' : 'Add New Automation'}
                          </h3>
                          <div className="space-y-4">
                              <input
                                  type="text"
                                  placeholder="Automation Name"
                                  value={automationForm.name}
                                  onChange={(e) => setAutomationForm({ ...automationForm, name: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <textarea
                                  placeholder="Description"
                                  value={automationForm.description}
                                  onChange={(e) => setAutomationForm({ ...automationForm, description: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  rows="3"
                              />
                              <select
                                  value={automationForm.trigger}
                                  onChange={(e) => setAutomationForm({ ...automationForm, trigger: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                  <option value="time">Time</option>
                                  <option value="manual">Manual</option>
                                  <option value="sensor">Sensor</option>
                              </select>
                              <input
                                  type="text"
                                  placeholder="Trigger Value"
                                  value={automationForm.triggerValue}
                                  onChange={(e) => setAutomationForm({ ...automationForm, triggerValue: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                          </div>
                          <div className="flex justify-end gap-3 mt-6">
                              <button
                                  onClick={() => {
                                      setShowAddAutomation(false);
                                      setEditingAutomation(null);
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
                                  }}
                                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                              >
                                  Cancel
                              </button>
                              <button
                                  onClick={editingAutomation ? handleUpdateAutomation : handleAddAutomation}
                                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                              >
                                  {editingAutomation ? 'Update' : 'Add'} Automation
                              </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartHome;
