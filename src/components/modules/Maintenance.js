import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Wrench, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Trash2,
  Filter,
  Search,
  BarChart3,
  Settings,
  Home,
  Car,
  Droplets,
  Zap,
  Shield,
  Thermometer,
  Lightbulb,
  Camera,
  FileText,
  Download,
  Share2,
  Bell,
  Star,
  TrendingUp,
  CalendarDays,
  Repeat,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import hybridStorage from '../../firebase/hybridStorage';

export default function Maintenance() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceRecords, setServiceRecords] = useState([]);

  // Load maintenance data from Firebase
  useEffect(() => {
    const loadMaintenanceData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const [tasksResponse, recordsResponse] = await Promise.all([
          hybridStorage.getMaintenanceTasks(currentUser.uid),
          hybridStorage.getServiceRecords(currentUser.uid)
        ]);

        if (tasksResponse.success) {
          setMaintenanceTasks(tasksResponse.data || []);
        } else {
          console.error('Failed to load maintenance tasks:', tasksResponse.error);
          setMaintenanceTasks([]);
        }

        if (recordsResponse.success) {
          setServiceRecords(recordsResponse.data || []);
        } else {
          console.error('Failed to load service records:', recordsResponse.error);
          setServiceRecords([]);
        }
      } catch (error) {
        console.error('Error loading maintenance data:', error);
        setMaintenanceTasks([]);
        setServiceRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMaintenanceData();
  }, [currentUser]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading maintenance data...</p>
        </div>
      </div>
    );
  }


  const [categories] = useState([
    'HVAC', 'Plumbing', 'Electrical', 'Appliances', 'Exterior', 'Interior', 'Safety', 'Landscaping', 'Roofing', 'Foundation'
  ]);

  const [priorities] = useState(['low', 'medium', 'high', 'critical']);
  const [statuses] = useState(['pending', 'scheduled', 'in-progress', 'completed', 'overdue', 'cancelled']);
  const [frequencies] = useState(['daily', 'weekly', 'monthly', 'quarterly', 'semi-annual', 'annual', 'as-needed']);

  const [filters, setFilters] = useState({
    category: 'all',
    priority: 'all',
    status: 'all',
    assignedTo: 'all'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'scheduled': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'in-progress': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'HVAC': return <Thermometer className="w-5 h-5" />;
      case 'Plumbing': return <Droplets className="w-5 h-5" />;
      case 'Electrical': return <Zap className="w-5 h-5" />;
      case 'Appliances': return <Home className="w-5 h-5" />;
      case 'Exterior': return <Home className="w-5 h-5" />;
      case 'Safety': return <Shield className="w-5 h-5" />;
      case 'Landscaping': return <Home className="w-5 h-5" />;
      case 'Roofing': return <Home className="w-5 h-5" />;
      case 'Foundation': return <Home className="w-5 h-5" />;
      default: return <Wrench className="w-5 h-5" />;
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueStatus = (dueDate, status) => {
    if (status === 'completed') return 'completed';
    const daysUntil = getDaysUntilDue(dueDate);
    if (daysUntil < 0) return 'overdue';
    if (daysUntil <= 7) return 'urgent';
    if (daysUntil <= 30) return 'soon';
    return 'future';
  };

  const getDueStatusColor = (status) => {
    switch (status) {
      case 'overdue': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'urgent': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'soon': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'future': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'completed': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const filteredTasks = maintenanceTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filters.category === 'all' || task.category === filters.category;
    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
    const matchesStatus = filters.status === 'all' || task.status === filters.status;
    const matchesAssigned = filters.assignedTo === 'all' || task.assignedTo === filters.assignedTo;
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus && matchesAssigned;
  });

  const getDashboardStats = () => {
    const total = maintenanceTasks.length;
    const completed = maintenanceTasks.filter(t => t.status === 'completed').length;
    const pending = maintenanceTasks.filter(t => t.status === 'pending').length;
    const overdue = maintenanceTasks.filter(t => t.status === 'overdue').length;
    const critical = maintenanceTasks.filter(t => t.priority === 'critical').length;
    const high = maintenanceTasks.filter(t => t.priority === 'high').length;
    
    const totalCost = maintenanceTasks.reduce((sum, task) => sum + (task.actualCost || 0), 0);
    const totalTime = maintenanceTasks.reduce((sum, task) => sum + (task.actualTime || 0), 0);
    
    return { total, completed, pending, overdue, critical, high, totalCost, totalTime };
  };

  const markTaskComplete = (taskId) => {
    setMaintenanceTasks(tasks => tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: 'completed', completionDate: new Date().toISOString().split('T')[0] }
        : task
    ));
  };

  const deleteTask = (taskId) => {
    setMaintenanceTasks(tasks => tasks.filter(task => task.id !== taskId));
  };

  const stats = getDashboardStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Wrench className="w-8 h-8 text-blue-600" />
                Home Maintenance Scheduler
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Track maintenance tasks, schedules, and service records for your home
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddService(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Service Record
              </button>
              <button
                onClick={() => setShowAddTask(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {stats.completed} completed, {stats.pending} pending
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overdue}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {stats.critical} critical priority
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {stats.totalTime.toFixed(1)} hours spent
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalCost}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              This year
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'dashboard', label: 'Dashboard', count: 0 },
                { id: 'tasks', label: 'Maintenance Tasks', count: maintenanceTasks.length },
                { id: 'schedule', label: 'Schedule', count: 0 },
                { id: 'services', label: 'Service Records', count: serviceRecords.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white py-0.5 px-2.5 rounded-full text-xs font-medium">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Maintenance Overview</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Get a quick overview of your home maintenance status
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Upcoming Tasks */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Upcoming Tasks (Next 30 Days)
                    </h4>
                    <div className="space-y-3">
                      {maintenanceTasks
                        .filter(task => {
                          const daysUntil = getDaysUntilDue(task.nextDue);
                          return daysUntil >= 0 && daysUntil <= 30 && task.status !== 'completed';
                        })
                        .sort((a, b) => getDaysUntilDue(a.nextDue) - getDaysUntilDue(b.nextDue))
                        .slice(0, 5)
                        .map(task => (
                          <div key={task.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getCategoryIcon(task.category)}
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-white">{task.title}</h5>
                                <p className="text-sm text-gray-500">Due: {task.nextDue}</p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDueStatusColor(getDueStatus(task.nextDue, task.status))}`}>
                              {getDueStatus(task.nextDue, task.status)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Overdue Tasks */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Overdue Tasks
                    </h4>
                    <div className="space-y-3">
                      {maintenanceTasks
                        .filter(task => getDueStatus(task.nextDue, task.status) === 'overdue')
                        .slice(0, 5)
                        .map(task => (
                          <div key={task.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getCategoryIcon(task.category)}
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-white">{task.title}</h5>
                                <p className="text-sm text-red-500">Overdue by {Math.abs(getDaysUntilDue(task.nextDue))} days</p>
                              </div>
                            </div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-red-600 bg-red-100 dark:bg-red-900/20">
                              Overdue
                            </span>
                          </div>
                        ))}
                      {maintenanceTasks.filter(task => getDueStatus(task.nextDue, task.status) === 'overdue').length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                          <p>No overdue tasks! Great job staying on top of maintenance.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Maintenance Calendar Preview */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-blue-600" />
                    This Month&apos;s Schedule
                  </h4>
                  <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Calendar className="w-16 h-16 mx-auto mb-2" />
                      <p>Calendar view coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Maintenance Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Maintenance Tasks</h3>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Priorities</option>
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</option>
                    ))}
                  </select>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Statuses</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {/* Tasks List */}
                <div className="space-y-4">
                  {filteredTasks.map((task) => (
                    <div key={task.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-white dark:bg-gray-600 rounded-lg">
                            {getCategoryIcon(task.category)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white">{task.title}</h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {task.status}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDueStatusColor(getDueStatus(task.nextDue, task.status))}`}>
                                {getDueStatus(task.nextDue, task.status)}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                              <div>
                                <span className="text-gray-500">Category:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white">{task.category}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Location:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white">{task.location}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Assigned to:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white">{task.assignedTo}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Frequency:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white">{task.frequency}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                              <div>
                                <span className="text-gray-500">Next due:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white">{task.nextDue}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Estimated cost:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white">${task.estimatedCost}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Estimated time:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white">{task.estimatedTime}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Last completed:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white">{task.lastCompleted || 'Never'}</span>
                              </div>
                            </div>

                            {task.instructions && (
                              <div className="mb-3">
                                <h5 className="font-medium text-gray-900 dark:text-white mb-1">Instructions:</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{task.instructions}</p>
                              </div>
                            )}

                            <div className="flex items-center space-x-2">
                              {task.tools.length > 0 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-600">
                                  Tools: {task.tools.join(', ')}
                                </span>
                              )}
                              {task.parts.length > 0 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-600">
                                  Parts: {task.parts.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {task.status !== 'completed' && (
                            <button
                              onClick={() => markTaskComplete(task.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4 inline mr-1" />
                              Complete
                            </button>
                          )}
                          <button
                            onClick={() => setEditingTask(task)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Edit3 className="w-4 h-4 inline mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 inline mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Maintenance Schedule</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    View your maintenance tasks organized by timeline
                  </p>
                </div>

                <div className="space-y-6">
                  {/* This Week */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      This Week
                    </h4>
                    <div className="space-y-3">
                      {maintenanceTasks
                        .filter(task => {
                          const daysUntil = getDaysUntilDue(task.nextDue);
                          return daysUntil >= 0 && daysUntil <= 7 && task.status !== 'completed';
                        })
                        .sort((a, b) => getDaysUntilDue(a.nextDue) - getDaysUntilDue(b.nextDue))
                        .map(task => (
                          <div key={task.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getCategoryIcon(task.category)}
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-white">{task.title}</h5>
                                <p className="text-sm text-gray-500">Due: {task.nextDue}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDueStatusColor(getDueStatus(task.nextDue, task.status))}`}>
                                {getDueStatus(task.nextDue, task.status)}
                              </span>
                              <button
                                onClick={() => markTaskComplete(task.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                              >
                                Complete
                              </button>
                            </div>
                          </div>
                        ))}
                      {maintenanceTasks.filter(task => {
                        const daysUntil = getDaysUntilDue(task.nextDue);
                        return daysUntil >= 0 && daysUntil <= 7 && task.status !== 'completed';
                      }).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                          <p>No tasks due this week!</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* This Month */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      This Month
                    </h4>
                    <div className="space-y-3">
                      {maintenanceTasks
                        .filter(task => {
                          const daysUntil = getDaysUntilDue(task.nextDue);
                          return daysUntil > 7 && daysUntil <= 30 && task.status !== 'completed';
                        })
                        .sort((a, b) => getDaysUntilDue(a.nextDue) - getDaysUntilDue(b.nextDue))
                        .map(task => (
                          <div key={task.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getCategoryIcon(task.category)}
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-white">{task.title}</h5>
                                <p className="text-sm text-gray-500">Due: {task.nextDue}</p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDueStatusColor(getDueStatus(task.nextDue, task.status))}`}>
                              {getDueStatus(task.nextDue, task.status)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Service Records Tab */}
            {activeTab === 'services' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Service Records</h3>
                </div>

                <div className="space-y-4">
                  {serviceRecords.map((record) => (
                    <div key={record.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">{record.title}</h4>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-600">
                              {record.category}
                            </span>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={`star-${record.id}-${i}`}
                                  className={`w-4 h-4 ${i < record.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-500">Service Date:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">{record.serviceDate}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Provider:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">{record.serviceProvider}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Technician:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">{record.technician}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Cost:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">${record.cost}</span>
                            </div>
                          </div>

                          <div className="mb-3">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-1">Description:</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{record.description}</p>
                          </div>

                          <div className="mb-3">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-1">Work Performed:</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{record.workPerformed}</p>
                          </div>

                          {record.recommendations && (
                            <div className="mb-3">
                              <h5 className="font-medium text-gray-900 dark:text-white mb-1">Recommendations:</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{record.recommendations}</p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Warranty:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">{record.warranty}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Next Service:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">{record.nextService}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Contact:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">{record.contact}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Invoice:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">{record.invoice}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <Download className="w-4 h-4 inline mr-1" />
                            Download
                          </button>
                          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            <Share2 className="w-4 h-4 inline mr-1" />
                            Share
                          </button>
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
    </div>
  );
}

Maintenance.propTypes = {
  className: PropTypes.string
};
