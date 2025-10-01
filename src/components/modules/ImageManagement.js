import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image, 
  FileDown, 
  Cloud, 
  Download, 
  Trash2, 
  Eye, 
  Settings,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  FolderOpen,
  HardDrive,
  BarChart3,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function ImageManagement() {
  const [activeTab, setActiveTab] = useState('upload');
  const [images, setImages] = useState([
    {
      id: 1,
      name: 'family-photo-2024.jpg',
      originalSize: '8.2 MB',
      compressedSize: '1.8 MB',
      compression: '78%',
      format: 'JPEG',
      dimensions: '4000x3000',
      storage: 'Cloudinary',
      category: 'Family',
      tags: ['family', '2024', 'vacation'],
      uploadDate: '2024-12-20',
      status: 'compressed',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMCA0MEg3MFY2MEgzMFY0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTM1IDQ1SDY1VjU1SDM1VjQ1WiIgZmlsbD0iIzY2NzM4NyIvPgo8L3N2Zz4K'
    },
    {
      id: 2,
      name: 'home-renovation.jpg',
      originalSize: '12.5 MB',
      compressedSize: '2.1 MB',
      compression: '83%',
      format: 'JPEG',
      dimensions: '5000x3750',
      storage: 'Imgur',
      category: 'Home',
      tags: ['renovation', 'before', 'kitchen'],
      uploadDate: '2024-12-18',
      status: 'compressed',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg4MFY4MEgyMFYyMFoiIGZpbGw9IiNGRkMxMDciLz4KPHBhdGggZD0iTTMwIDMwSDcwVjUwSDMwVjMwWiIgZmlsbD0iIzY2NzM4NyIvPgo8L3N2Zz4K'
    },
    {
      id: 3,
      name: 'recipe-card.jpg',
      originalSize: '3.8 MB',
      compressedSize: '0.9 MB',
      compression: '76%',
      format: 'JPEG',
      dimensions: '2000x1500',
      storage: 'Base64',
      category: 'Recipes',
      tags: ['recipe', 'food', 'cooking'],
      uploadDate: '2024-12-15',
      status: 'compressed',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg4MFY4MEgyMFYyMFoiIGZpbGw9IiNGRkYyQ0MiLz4KPHBhdGggZD0iTTMwIDMwSDcwVjUwSDMwVjMwWiIgZmlsbD0iIzY2NzM4NyIvPgo8L3N2Zz4K'
    },
    {
      id: 4,
      name: 'inventory-item.png',
      originalSize: '2.1 MB',
      compressedSize: '0.5 MB',
      compression: '76%',
      format: 'PNG',
      dimensions: '1500x1000',
      storage: 'Base64',
      category: 'Inventory',
      tags: ['inventory', 'electronics', 'warranty'],
      uploadDate: '2024-12-12',
      status: 'compressed',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg4MFY4MEgyMFYyMFoiIGZpbGw9IiM4QjVGRkYiLz4KPHBhdGggZD0iTTMwIDMwSDcwVjUwSDMwVjMwWiIgZmlsbD0iIzY2NzM4NyIvPgo8L3N2Zz4K'
    }
  ]);

  const [uploadSettings, setUploadSettings] = useState({
    autoCompress: true,
    targetQuality: 80,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'auto',
    generateThumbnails: true,
    storageService: 'auto'
  });

  const [storageStats, setStorageStats] = useState({
    totalImages: 4,
    totalOriginalSize: '26.6 MB',
    totalCompressedSize: '5.3 MB',
    totalSavings: '21.3 MB',
    averageCompression: '80%',
    cloudinaryUsage: '15.2 MB',
    imgurUsage: '8.1 MB',
    base64Usage: '3.3 MB'
  });

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const fileInputRef = useRef(null);

  const categories = ['all', 'family', 'home', 'recipes', 'inventory', 'documents'];
  const storageServices = ['auto', 'base64', 'imgur', 'cloudinary'];

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    // Simulate file processing
    files.forEach(file => {
      const newImage = {
        id: Date.now() + Math.random(),
        name: file.name,
        originalSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        compressedSize: `${(file.size / (1024 * 1024) * 0.2).toFixed(1)} MB`,
        compression: '80%',
        format: file.name.split('.').pop().toUpperCase(),
        dimensions: 'Unknown',
        storage: 'Processing...',
        category: 'Uncategorized',
        tags: [],
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'processing',
        thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg4MFY4MEgyMFYyMFoiIGZpbGw9IiNGRkYyQ0MiLz4KPHBhdGggZD0iTTMwIDMwSDcwVjUwSDMwVjMwWiIgZmlsbD0iIzY2NzM4NyIvPgo8L3N2Zz4K'
      };
      setImages(prev => [newImage, ...prev]);
    });
    setShowUploadModal(false);
  };

  const deleteImage = (imageId) => {
    setImages(images.filter(img => img.id !== imageId));
  };

  const downloadImage = (image) => {
    // Simulate download
    console.log(`Downloading ${image.name}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'compressed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'processing': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-100/20';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStorageIcon = (storage) => {
    switch (storage) {
      case 'Cloudinary': return <Cloud className="w-4 h-4" />;
      case 'Imgur': return <Image className="w-4 h-4" />;
      case 'Base64': return <HardDrive className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const filteredImages = images.filter(image => {
    const matchesSearch = image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || image.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Upload className="w-8 h-8 text-pink-600" />
                Image Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Smart image compression, storage optimization, and intelligent organization
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSettingsModal(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Upload Images
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
                <Image className="w-6 h-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Images</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{storageStats.totalImages}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Across all categories
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <FileDown className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage Saved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{storageStats.totalSavings}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {storageStats.averageCompression} compression
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Cloud className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cloud Storage</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{storageStats.cloudinaryUsage}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Cloudinary usage
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Auto-Compression</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">Active</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Smart optimization
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'upload', label: 'Upload & Compress', count: 0 },
                { id: 'library', label: 'Image Library', count: images.length },
                { id: 'storage', label: 'Storage Analytics', count: 0 },
                { id: 'settings', label: 'Compression Settings', count: 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-pink-500 text-pink-600'
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
            {/* Upload & Compress Tab */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Smart Image Upload</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Upload images and let our AI automatically compress and optimize them for optimal storage
                  </p>
                  
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 bg-gray-50 dark:bg-gray-700">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Drop images here or click to browse</h4>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Supports JPEG, PNG, WebP • Max 50MB per image
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
                    >
                      Choose Images
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg inline-block mb-3">
                    <FileDown className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Auto-Compression</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Intelligent compression that maintains quality while reducing file size
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg inline-block mb-3">
                        <Cloud className="w-8 h-8 text-green-600" />
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Smart Storage</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Automatically routes images to optimal storage service
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg inline-block mb-3">
                        <Zap className="w-8 h-8 text-purple-600" />
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Instant Processing</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Fast processing with real-time compression preview
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Image Library Tab */}
            {activeTab === 'library' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Image Library</h3>
                  <div className="flex gap-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${
                          viewMode === 'grid' 
                            ? 'bg-pink-100 text-pink-600' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${
                          viewMode === 'list' 
                            ? 'bg-pink-100 text-pink-600' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search images by name or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Images Grid/List */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredImages.map((image) => (
                      <div key={image.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="relative mb-3">
                          <img
                            src={image.thumbnail}
                            alt={image.name}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div className="absolute top-2 right-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(image.status)}`}>
                              {image.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">{image.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            {getStorageIcon(image.storage)}
                            <span>{image.storage}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Original: {image.originalSize}</span>
                            <span className="text-green-600 font-medium">{image.compression}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => downloadImage(image)}
                              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              <Download className="w-4 h-4 inline mr-1" />
                              Download
                            </button>
                            <button
                              onClick={() => deleteImage(image.id)}
                              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredImages.map((image) => (
                      <div key={image.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-4">
                          <img
                            src={image.thumbnail}
                            alt={image.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">{image.name}</h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(image.status)}`}>
                                {image.status}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Format: {image.format}</span>
                              <span>Dimensions: {image.dimensions}</span>
                              <span>Category: {image.category}</span>
                              <span>Upload: {image.uploadDate}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm mt-1">
                              <span className="text-gray-500">Original: {image.originalSize}</span>
                              <span className="text-green-600 font-medium">Compressed: {image.compressedSize}</span>
                              <span className="text-blue-600 font-medium">Savings: {image.compression}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => downloadImage(image)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Download className="w-4 h-4 inline mr-1" />
                              Download
                            </button>
                            <button
                              onClick={() => deleteImage(image.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Storage Analytics Tab */}
            {activeTab === 'storage' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Storage Analytics</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Monitor your storage usage across different services and optimize costs
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Storage Breakdown */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Storage by Service</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Cloud className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-700 dark:text-gray-300">Cloudinary</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{storageStats.cloudinaryUsage}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Image className="w-5 h-5 text-green-600" />
                          <span className="text-gray-700 dark:text-gray-300">Imgur</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{storageStats.imgurUsage}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <HardDrive className="w-5 h-5 text-purple-600" />
                          <span className="text-gray-700 dark:text-gray-300">Base64 (Local)</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{storageStats.base64Usage}</span>
                      </div>
                    </div>
                  </div>

                  {/* Compression Stats */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Compression Performance</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Total Original Size</span>
                        <span className="font-medium text-gray-900 dark:text-white">{storageStats.totalOriginalSize}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Total Compressed Size</span>
                        <span className="font-medium text-gray-900 dark:text-white">{storageStats.totalCompressedSize}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Total Savings</span>
                        <span className="font-medium text-green-600">{storageStats.totalSavings}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Average Compression</span>
                        <span className="font-medium text-blue-600">{storageStats.averageCompression}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Usage Charts */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Usage Trends</h4>
                  <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="w-16 h-16 mx-auto mb-2" />
                      <p>Usage analytics charts coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Compression Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Compression Settings</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Configure how your images are automatically compressed and stored
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Settings */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Auto-Compression</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={uploadSettings.autoCompress}
                            onChange={(e) => setUploadSettings(prev => ({ ...prev, autoCompress: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Target Quality: {uploadSettings.targetQuality}%
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={uploadSettings.targetQuality}
                          onChange={(e) => setUploadSettings(prev => ({ ...prev, targetQuality: parseInt(e.target.value) }))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Max Width: {uploadSettings.maxWidth}px
                        </label>
                        <input
                          type="range"
                          min="800"
                          max="4000"
                          step="100"
                          value={uploadSettings.maxWidth}
                          onChange={(e) => setUploadSettings(prev => ({ ...prev, maxWidth: parseInt(e.target.value) }))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Advanced Settings</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Output Format
                        </label>
                        <select
                          value={uploadSettings.format}
                          onChange={(e) => setUploadSettings(prev => ({ ...prev, format: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="auto">Auto (Best Quality)</option>
                          <option value="jpeg">JPEG (Best Compression)</option>
                          <option value="webp">WebP (Modern Format)</option>
                          <option value="png">PNG (Lossless)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Storage Service
                        </label>
                        <select
                          value={uploadSettings.storageService}
                          onChange={(e) => setUploadSettings(prev => ({ ...prev, storageService: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          {storageServices.map(service => (
                            <option key={service} value={service}>
                              {service === 'auto' ? 'Auto (Smart Routing)' : service.charAt(0).toUpperCase() + service.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Generate Thumbnails</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={uploadSettings.generateThumbnails}
                            onChange={(e) => setUploadSettings(prev => ({ ...prev, generateThumbnails: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="text-center">
                  <button className="px-8 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium">
                    Save Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upload Images</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">Drop images here or click to browse</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Choose Files
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
