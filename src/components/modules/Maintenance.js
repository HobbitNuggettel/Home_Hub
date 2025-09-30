import React, { useState, useEffect } from 'react';
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
  DollarSign,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import hybridStorage from '../../firebase/hybridStorage';

export default function Maintenance() {
    const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
    const [maintenanceTasks, setMaintenanceTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [serviceRecords, setServiceRecords] = useState([]);
    const [showAddTask, setShowAddTask] = useState(false);
    const [showAddRecord, setShowAddRecord] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [editingRecord, setEditingRecord] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');

    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        status: 'pending',
        frequency: 'monthly',
      lastCompleted: '',
      nextDue: '',
      estimatedCost: 0,
      assignedTo: '',
      location: '',
      instructions: '',
      tools: [],
      parts: [],
      estimatedTime: '',
      notes: ''
  });

    const [recordForm, setRecordForm] = useState({
        title: '',
        category: '',
        serviceDate: '',
        serviceProvider: '',
        technician: '',
        cost: 0,
        description: '',
        workPerformed: '',
        recommendations: '',
        warranty: '',
        nextService: '',
        attachments: []
    });

    // Load real data from Firebase
    useEffect(() => {
        const loadMaintenanceData = async () => {
            if (!currentUser) {
                setMaintenanceTasks([]);
                setServiceRecords([]);
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

    // Show loading state while authentication is being determined
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading maintenance data...</p>
                </div>
            </div>
        );
    }

    const categories = [
        'HVAC', 'Plumbing', 'Electrical', 'Exterior', 'Interior', 'Safety', 'Appliances', 'Landscaping', 'Other'
    ];

    const priorities = ['low', 'medium', 'high', 'urgent'];
    const statuses = ['pending', 'in_progress', 'completed', 'overdue', 'cancelled'];
    const frequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'semi-annual', 'annual', 'as_needed'];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'HVAC': return <Thermometer className="w-5 h-5" />;
      case 'Plumbing': return <Droplets className="w-5 h-5" />;
        case 'Electrical': return <Zap className="w-5 h-5" />;
      case 'Exterior': return <Home className="w-5 h-5" />;
        case 'Interior': return <Home className="w-5 h-5" />;
      case 'Safety': return <Shield className="w-5 h-5" />;
        case 'Appliances': return <Wrench className="w-5 h-5" />;
        case 'Landscaping': return <Home className="w-5 h-5" />;
      default: return <Wrench className="w-5 h-5" />;
    }
  };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
            case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200';
            case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
            case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
        }
  };

    const getStatusColor = (status) => {
    switch (status) {
        case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
        case 'in_progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
        case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
        case 'overdue': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
        case 'cancelled': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
        default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const filteredTasks = maintenanceTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

      return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

    const handleAddTask = () => {
        if (!taskForm.title || !taskForm.category) return;
    
      const newTask = {
          id: Date.now(),
          ...taskForm,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
      };
    
      setMaintenanceTasks([...maintenanceTasks, newTask]);
      setTaskForm({
          title: '',
          description: '',
          category: '',
          priority: 'medium',
          status: 'pending',
          frequency: 'monthly',
          lastCompleted: '',
          nextDue: '',
          estimatedCost: 0,
          assignedTo: '',
          location: '',
          instructions: '',
          tools: [],
          parts: [],
          estimatedTime: '',
          notes: ''
      });
      setShowAddTask(false);
  };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setTaskForm(task);
        setShowAddTask(true);
  };

    const handleUpdateTask = () => {
        if (!editingTask) return;

        const updatedTasks = maintenanceTasks.map(task =>
            task.id === editingTask.id ? { ...task, ...taskForm, updatedAt: new Date().toISOString() } : task
        );
        setMaintenanceTasks(updatedTasks);
        setEditingTask(null);
        setTaskForm({
            title: '',
            description: '',
            category: '',
            priority: 'medium',
            status: 'pending',
            frequency: 'monthly',
            lastCompleted: '',
            nextDue: '',
            estimatedCost: 0,
            assignedTo: '',
            location: '',
            instructions: '',
            tools: [],
            parts: [],
            estimatedTime: '',
            notes: ''
        });
        setShowAddTask(false);
  };

    const handleDeleteTask = (taskId) => {
        setMaintenanceTasks(maintenanceTasks.filter(task => task.id !== taskId));
    };

    const handleAddRecord = () => {
        if (!recordForm.title || !recordForm.category) return;

        const newRecord = {
            id: Date.now(),
            ...recordForm,
            createdAt: new Date().toISOString()
        };

        setServiceRecords([...serviceRecords, newRecord]);
        setRecordForm({
            title: '',
            category: '',
            serviceDate: '',
            serviceProvider: '',
            technician: '',
            cost: 0,
            description: '',
            workPerformed: '',
            recommendations: '',
            warranty: '',
            nextService: '',
            attachments: []
        });
        setShowAddRecord(false);
    };

    const handleEditRecord = (record) => {
        setEditingRecord(record);
        setRecordForm(record);
        setShowAddRecord(true);
    };

    const handleUpdateRecord = () => {
        if (!editingRecord) return;

        const updatedRecords = serviceRecords.map(record =>
            record.id === editingRecord.id ? { ...record, ...recordForm } : record
        );
        setServiceRecords(updatedRecords);
        setEditingRecord(null);
        setRecordForm({
            title: '',
            category: '',
            serviceDate: '',
            serviceProvider: '',
            technician: '',
            cost: 0,
            description: '',
            workPerformed: '',
            recommendations: '',
            warranty: '',
            nextService: '',
            attachments: []
        });
        setShowAddRecord(false);
    };

    const handleDeleteRecord = (recordId) => {
        setServiceRecords(serviceRecords.filter(record => record.id !== recordId));
    };

    const stats = {
        totalTasks: maintenanceTasks.length,
        completedTasks: maintenanceTasks.filter(task => task.status === 'completed').length,
        overdueTasks: maintenanceTasks.filter(task => task.status === 'overdue').length,
        pendingTasks: maintenanceTasks.filter(task => task.status === 'pending').length,
        totalCost: maintenanceTasks.reduce((sum, task) => sum + (task.actualCost || 0), 0),
        totalRecords: serviceRecords.length,
        totalServiceCost: serviceRecords.reduce((sum, record) => sum + (record.cost || 0), 0)
    };

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Wrench className="w-8 h-8 text-blue-600" />
                              Maintenance Management
              </h1>
                          <p className="text-gray-600 dark:text-gray-400 mt-2">
                              Track and manage home maintenance tasks and service records
              </p>
            </div>
                      <div className="flex items-center gap-3">
              <button
                              onClick={() => setShowAddRecord(true)}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                              <FileText className="w-4 h-4" />
                Add Service Record
              </button>
              <button
                onClick={() => setShowAddTask(true)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                          <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTasks}</p>
              </div>
                          <Wrench className="w-8 h-8 text-blue-600" />
            </div>
          </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                          <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                              <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
              </div>
                          <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                          <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                              <p className="text-2xl font-bold text-red-600">{stats.overdueTasks}</p>
              </div>
                          <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                          <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</p>
                              <p className="text-2xl font-bold text-orange-600">${stats.totalCost.toFixed(2)}</p>
              </div>
                          <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
              <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
                      <nav className="-mb-px flex space-x-8">
              {[
                              { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
                              { id: 'tasks', name: 'Tasks', icon: Wrench },
                              { id: 'records', name: 'Service Records', icon: FileText }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                      <tab.icon className="w-4 h-4" />
                      {tab.name}
                </button>
              ))}
            </nav>
          </div>
              </div>

              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Status</h3>
                              <div className="space-y-3">
                                  {statuses.map(status => {
                                      const count = maintenanceTasks.filter(task => task.status === status).length;
                                      const percentage = stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0;
                                      return (
                                          <div key={status} className="flex items-center justify-between">
                                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">{status}</span>
                                              <div className="flex items-center gap-2">
                                                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                      <div
                                                          className="bg-blue-600 h-2 rounded-full"
                                                          style={{ width: `${percentage}%` }}
                                                      ></div>
                                                  </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                            </div>
                        </div>
                      );
                  })}
                              </div>
                          </div>

                          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
                              <div className="space-y-3">
                                  {categories.map(category => {
                                      const count = maintenanceTasks.filter(task => task.category === category).length;
                                      const percentage = stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0;
                                      return (
                                          <div key={category} className="flex items-center justify-between">
                                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{category}</span>
                                              <div className="flex items-center gap-2">
                                                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                      <div
                                                          className="bg-green-600 h-2 rounded-full"
                                                          style={{ width: `${percentage}%` }}
                                                      ></div>
                                                  </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                            </div>
                        </div>
                      );
                  })}
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* Tasks Tab */}
              {activeTab === 'tasks' && (
                  <div className="space-y-6">
                      {/* Filters */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="relative">
                                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                  <input
                                      type="text"
                                      placeholder="Search tasks..."
                                      value={searchTerm}
                                      onChange={(e) => setSearchTerm(e.target.value)}
                                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                </div>

                              <select
                                  value={filterCategory}
                                  onChange={(e) => setFilterCategory(e.target.value)}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                  <option value="all">All Categories</option>
                                  {categories.map(category => (
                                      <option key={category} value={category}>{category}</option>
                                  ))}
                              </select>

                              <select
                                  value={filterStatus}
                                  onChange={(e) => setFilterStatus(e.target.value)}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                  <option value="all">All Status</option>
                                  {statuses.map(status => (
                                      <option key={status} value={status}>{status}</option>
                                  ))}
                              </select>

                              <select
                                  value={filterPriority}
                                  onChange={(e) => setFilterPriority(e.target.value)}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                  <option value="all">All Priorities</option>
                                  {priorities.map(priority => (
                                      <option key={priority} value={priority}>{priority}</option>
                                  ))}
                              </select>
                          </div>
                      </div>

                      {/* Tasks List */}
                      <div className="space-y-4">
                          {filteredTasks.map(task => (
                              <div key={task.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                                  <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                              {getCategoryIcon(task.category)}
                              <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                          {task.priority}
                                      </span>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                          {task.status}
                                      </span>
                                  </div>
                                  <p className="text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
                                  <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                      <span className="flex items-center gap-1">
                                          <Calendar className="w-4 h-4" />
                                          Due: {task.nextDue || 'Not set'}
                                      </span>
                                      <span className="flex items-center gap-1">
                                          <Clock className="w-4 h-4" />
                                          {task.estimatedTime || 'Not set'}
                                      </span>
                                      <span className="flex items-center gap-1">
                                          <DollarSign className="w-4 h-4" />
                                          ${task.estimatedCost || 0}
                                      </span>
                                      {task.assignedTo && (
                                          <span className="flex items-center gap-1">
                                              <User className="w-4 h-4" />
                                              {task.assignedTo}
                                          </span>
                                      )}
                                  </div>
                              </div>
                          </div>
                          <div className="flex items-center gap-2">
                              <button
                                  onClick={() => handleEditTask(task)}
                                  className="p-2 text-gray-400 hover:text-blue-600"
                              >
                                  <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-2 text-gray-400 hover:text-red-600"
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

              {/* Service Records Tab */}
              {activeTab === 'records' && (
                  <div className="space-y-6">
                      <div className="space-y-4">
                          {serviceRecords.map(record => (
                              <div key={record.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                                  <div className="flex items-start justify-between">
                                      <div className="flex items-start gap-4">
                                          {getCategoryIcon(record.category)}
                                          <div className="flex-1">
                                              <div className="flex items-center gap-3 mb-2">
                                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{record.title}</h3>
                                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                      {record.category}
                                                  </span>
                                              </div>
                                              <p className="text-gray-600 dark:text-gray-400 mb-3">{record.description}</p>
                                              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                                  <span className="flex items-center gap-1">
                                                      <Calendar className="w-4 h-4" />
                                                      {record.serviceDate}
                                                  </span>
                                                  <span className="flex items-center gap-1">
                                                      <User className="w-4 h-4" />
                                                      {record.technician}
                                                  </span>
                                                  <span className="flex items-center gap-1">
                                                      <DollarSign className="w-4 h-4" />
                                                      ${record.cost}
                                                  </span>
                                              </div>
                              </div>
                          </div>
                          <div className="flex items-center gap-2">
                              <button
                                  onClick={() => handleEditRecord(record)}
                                  className="p-2 text-gray-400 hover:text-blue-600"
                              >
                                  <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                  onClick={() => handleDeleteRecord(record.id)}
                                  className="p-2 text-gray-400 hover:text-red-600"
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

              {/* Add Task Modal */}
              {showAddTask && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              {editingTask ? 'Edit Task' : 'Add New Task'}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input
                                  type="text"
                                  placeholder="Task Title"
                                  value={taskForm.title}
                                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <select
                                  value={taskForm.category}
                                  onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                  <option value="">Select Category</option>
                                  {categories.map(category => (
                                      <option key={category} value={category}>{category}</option>
                                  ))}
                              </select>
                              <select
                                  value={taskForm.priority}
                                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                  {priorities.map(priority => (
                                      <option key={priority} value={priority}>{priority}</option>
                                  ))}
                              </select>
                              <select
                                  value={taskForm.status}
                                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                  {statuses.map(status => (
                                      <option key={status} value={status}>{status}</option>
                                  ))}
                              </select>
                              <select
                                  value={taskForm.frequency}
                                  onChange={(e) => setTaskForm({ ...taskForm, frequency: e.target.value })}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                  {frequencies.map(frequency => (
                                      <option key={frequency} value={frequency}>{frequency}</option>
                  ))}
                              </select>
                              <input
                                  type="text"
                                  placeholder="Assigned To"
                                  value={taskForm.assignedTo}
                                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <input
                                  type="text"
                                  placeholder="Location"
                                  value={taskForm.location}
                                  onChange={(e) => setTaskForm({ ...taskForm, location: e.target.value })}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <input
                                  type="number"
                                  placeholder="Estimated Cost"
                                  value={taskForm.estimatedCost}
                                  onChange={(e) => setTaskForm({ ...taskForm, estimatedCost: parseFloat(e.target.value) || 0 })}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <input
                                  type="text"
                                  placeholder="Estimated Time"
                                  value={taskForm.estimatedTime}
                                  onChange={(e) => setTaskForm({ ...taskForm, estimatedTime: e.target.value })}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <input
                                  type="date"
                                  placeholder="Last Completed"
                                  value={taskForm.lastCompleted}
                                  onChange={(e) => setTaskForm({ ...taskForm, lastCompleted: e.target.value })}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <input
                                  type="date"
                                  placeholder="Next Due"
                                  value={taskForm.nextDue}
                                  onChange={(e) => setTaskForm({ ...taskForm, nextDue: e.target.value })}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                          </div>
                          <textarea
                              placeholder="Description"
                              value={taskForm.description}
                              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                              className="w-full mt-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              rows="3"
                          />
                          <textarea
                              placeholder="Instructions"
                              value={taskForm.instructions}
                              onChange={(e) => setTaskForm({ ...taskForm, instructions: e.target.value })}
                              className="w-full mt-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              rows="3"
                          />
                          <textarea
                              placeholder="Notes"
                              value={taskForm.notes}
                              onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
                              className="w-full mt-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              rows="2"
                          />
                          <div className="flex justify-end gap-3 mt-6">
                              <button
                                  onClick={() => {
                                      setShowAddTask(false);
                                      setEditingTask(null);
                                      setTaskForm({
                                          title: '',
                                          description: '',
                                          category: '',
                                          priority: 'medium',
                                          status: 'pending',
                                          frequency: 'monthly',
                                          lastCompleted: '',
                                          nextDue: '',
                                          estimatedCost: 0,
                                          assignedTo: '',
                                          location: '',
                                          instructions: '',
                                          tools: [],
                                          parts: [],
                                          estimatedTime: '',
                                          notes: ''
                                      });
                                  }}
                                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                              >
                                  Cancel
                              </button>
                              <button
                                  onClick={editingTask ? handleUpdateTask : handleAddTask}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                              >
                                  {editingTask ? 'Update' : 'Add'} Task
                              </button>
                          </div>
                      </div>
                  </div>
              )}

              {/* Add Service Record Modal */}
              {showAddRecord && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              {editingRecord ? 'Edit Service Record' : 'Add New Service Record'}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input
                                  type="text"
                                  placeholder="Service Title"
                                  value={recordForm.title}
                                  onChange={(e) => setRecordForm({ ...recordForm, title: e.target.value })}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <select
                                  value={recordForm.category}
                                  onChange={(e) => setRecordForm({ ...recordForm, category: e.target.value })}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                  <option value="">Select Category</option>
                                  {categories.map(category => (
                                      <option key={category} value={category}>{category}</option>
                                  ))}
                              </select>
                              <input
                                  type="date"
                                  placeholder="Service Date"
                                  value={recordForm.serviceDate}
                                  onChange={(e) => setRecordForm({ ...recordForm, serviceDate: e.target.value })}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <input
                                  type="text"
                                  placeholder="Service Provider"
                                  value={recordForm.serviceProvider}
                                  onChange={(e) => setRecordForm({ ...recordForm, serviceProvider: e.target.value })}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <input
                                  type="text"
                                  placeholder="Technician"
                                  value={recordForm.technician}
                                  onChange={(e) => setRecordForm({ ...recordForm, technician: e.target.value })}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <input
                                  type="number"
                                  placeholder="Cost"
                                  value={recordForm.cost}
                                  onChange={(e) => setRecordForm({ ...recordForm, cost: parseFloat(e.target.value) || 0 })}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <input
                                  type="text"
                                  placeholder="Warranty"
                                  value={recordForm.warranty}
                                  onChange={(e) => setRecordForm({ ...recordForm, warranty: e.target.value })}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <input
                                  type="date"
                                  placeholder="Next Service"
                                  value={recordForm.nextService}
                                  onChange={(e) => setRecordForm({ ...recordForm, nextService: e.target.value })}
                                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                          </div>
                          <textarea
                              placeholder="Description"
                              value={recordForm.description}
                              onChange={(e) => setRecordForm({ ...recordForm, description: e.target.value })}
                              className="w-full mt-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              rows="3"
                          />
                          <textarea
                              placeholder="Work Performed"
                              value={recordForm.workPerformed}
                              onChange={(e) => setRecordForm({ ...recordForm, workPerformed: e.target.value })}
                              className="w-full mt-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              rows="3"
                          />
                          <textarea
                              placeholder="Recommendations"
                              value={recordForm.recommendations}
                              onChange={(e) => setRecordForm({ ...recordForm, recommendations: e.target.value })}
                              className="w-full mt-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              rows="2"
                          />
                          <div className="flex justify-end gap-3 mt-6">
                              <button
                                  onClick={() => {
                                      setShowAddRecord(false);
                                      setEditingRecord(null);
                                      setRecordForm({
                                          title: '',
                                          category: '',
                                          serviceDate: '',
                                          serviceProvider: '',
                                          technician: '',
                                          cost: 0,
                                          description: '',
                                          workPerformed: '',
                                          recommendations: '',
                                          warranty: '',
                                          nextService: '',
                                          attachments: []
                                      });
                                  }}
                                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                              >
                                  Cancel
                              </button>
                              <button
                                  onClick={editingRecord ? handleUpdateRecord : handleAddRecord}
                                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                              >
                                  {editingRecord ? 'Update' : 'Add'} Record
                              </button>
                          </div>
                      </div>
                  </div>
              )}
      </div>
    </div>
  );
}
