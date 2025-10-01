import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid, List, Camera, Package } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import ItemForm from '../components/ItemForm';
import MultiItemForm from '../components/MultiItemForm';
import BarcodeScanner from '../components/BarcodeScanner';
import { ActivityFeed, NotificationCenter, RealTimeStatus } from '../components/RealTimeCollaboration';
import toast from 'react-hot-toast';

const InventoryPage = () => {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showMultiItemForm, setShowMultiItemForm] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Load items from localStorage on component mount
  useEffect(() => {
    const savedItems = localStorage.getItem('homeHubItems');
    if (savedItems && savedItems !== '[]') {
      setItems(JSON.parse(savedItems));
    } else {
      // Set initial mock data if no saved items exist or if it's an empty array
      const mockItems = [
        // Food - Dairy
        {
          id: '1',
          name: 'Milk',
          quantity: 1,
          measurementUnit: 'Gallon',
          category: 'Food',
          subcategory: 'Dairy',
          location: 'Fridge Door',
          purchaseDate: '2024-01-15',
          expirationDate: '2024-01-22',
          originalPrice: 4.99,
          currentValue: 4.99,
          shared: true,
          picture: null,
          notes: 'Organic whole milk'
        },
        {
          id: '2',
          name: 'Greek Yogurt',
          quantity: 2,
          measurementUnit: 'Pcs',
          category: 'Food',
          subcategory: 'Dairy',
          location: 'Fridge Shelf 2',
          purchaseDate: '2024-01-16',
          expirationDate: '2024-01-25',
          originalPrice: 3.49,
          currentValue: 3.49,
          shared: true,
          picture: null,
          notes: 'Plain Greek yogurt'
        },
        // Food - Produce
        {
          id: '3',
          name: 'Apples',
          quantity: 6,
          measurementUnit: 'Pcs',
          category: 'Food',
          subcategory: 'Produce',
          location: 'Fruit Bowl',
          purchaseDate: '2024-01-17',
          expirationDate: '2024-01-24',
          originalPrice: 5.99,
          currentValue: 5.99,
          shared: true,
          picture: null,
          notes: 'Gala apples'
        },
        {
          id: '4',
          name: 'Bananas',
          quantity: 8,
          measurementUnit: 'Pcs',
          category: 'Food',
          subcategory: 'Produce',
          location: 'Fruit Bowl',
          purchaseDate: '2024-01-18',
          expirationDate: '2024-01-23',
          originalPrice: 2.49,
          currentValue: 2.49,
          shared: true,
          picture: null,
          notes: 'Organic bananas'
        },
        // Food - Pantry
        {
          id: '5',
          name: 'Canned Tomatoes',
          quantity: 4,
          measurementUnit: 'Cans',
          category: 'Food',
          subcategory: 'Pantry',
          location: 'Pantry Shelf 1',
          purchaseDate: '2024-01-10',
          expirationDate: '2026-01-10',
          originalPrice: 1.99,
          currentValue: 1.99,
          shared: true,
          picture: null,
          notes: 'Crushed tomatoes for cooking'
        },
        {
          id: '6',
          name: 'Pasta',
          quantity: 3,
          measurementUnit: 'Boxes',
          category: 'Food',
          subcategory: 'Pantry',
          location: 'Pantry Shelf 2',
          purchaseDate: '2024-01-12',
          expirationDate: '2025-01-12',
          originalPrice: 2.49,
          currentValue: 2.49,
          shared: true,
          picture: null,
          notes: 'Spaghetti and penne'
        },
        // Household - Cleaning
        {
          id: '7',
          name: 'Laundry Detergent',
          quantity: 2,
          measurementUnit: 'Bottles',
          category: 'Household',
          subcategory: 'Cleaning',
          location: 'Laundry Room',
          purchaseDate: '2024-01-08',
          originalPrice: 12.99,
          currentValue: 12.99,
          shared: true,
          picture: null,
          notes: 'Tide liquid detergent'
        },
        {
          id: '8',
          name: 'Dish Soap',
          quantity: 1,
          measurementUnit: 'Bottles',
          category: 'Household',
          subcategory: 'Cleaning',
          location: 'Kitchen Sink',
          purchaseDate: '2024-01-14',
          originalPrice: 3.99,
          currentValue: 3.99,
          shared: true,
          picture: null,
          notes: 'Dawn dish soap'
        },
        // Electronics
        {
          id: '9',
          name: 'Bluetooth Speaker',
          quantity: 1,
          measurementUnit: 'Pcs',
          category: 'Electronics',
          subcategory: 'Audio',
          location: 'Living Room',
          purchaseDate: '2023-12-20',
          warrantyDate: '2025-12-20',
          originalPrice: 79.99,
          currentValue: 79.99,
          shared: false,
          picture: null,
          notes: 'JBL Flip 6 speaker'
        },
        {
          id: '10',
          name: 'Phone Charger',
          quantity: 2,
          measurementUnit: 'Pcs',
          category: 'Electronics',
          subcategory: 'Cables',
          location: 'Bedroom',
          purchaseDate: '2024-01-05',
          originalPrice: 19.99,
          currentValue: 19.99,
          shared: false,
          picture: null,
          notes: 'USB-C fast charging cables'
        },
        // Tools
        {
          id: '11',
          name: 'Screwdriver Set',
          quantity: 1,
          measurementUnit: 'Set',
          category: 'Tools',
          subcategory: 'Hand Tools',
          location: 'Garage',
          purchaseDate: '2023-11-15',
          originalPrice: 24.99,
          currentValue: 24.99,
          shared: true,
          picture: null,
          notes: 'Phillips and flathead set'
        },
        {
          id: '12',
          name: 'Drill',
          quantity: 1,
          measurementUnit: 'Pcs',
          category: 'Tools',
          subcategory: 'Power Tools',
          location: 'Garage',
          purchaseDate: '2023-10-20',
          warrantyDate: '2026-10-20',
          originalPrice: 89.99,
          currentValue: 89.99,
          shared: true,
          picture: null,
          notes: 'DeWalt cordless drill'
        },
        // Garden
        {
          id: '13',
          name: 'Garden Hose',
          quantity: 1,
          measurementUnit: 'Pcs',
          category: 'Garden',
          subcategory: 'Outdoor',
          location: 'Backyard',
          purchaseDate: '2024-01-09',
          warrantyDate: '2025-01-09',
          originalPrice: 35.00,
          currentValue: 35.00,
          shared: true,
          picture: null,
          notes: '50ft expandable hose'
        },
        // Clothing
        {
          id: '14',
          name: 'Winter Jacket',
          quantity: 1,
          measurementUnit: 'Pcs',
          category: 'Clothing',
          subcategory: 'Men',
          location: 'Hall Closet',
          purchaseDate: '2023-12-15',
          originalPrice: 89.99,
          currentValue: 89.99,
          shared: false,
          picture: null,
          notes: 'North Face jacket'
        },
        {
          id: '15',
          name: 'Running Shoes',
          quantity: 1,
          measurementUnit: 'Pcs',
          category: 'Clothing',
          subcategory: 'Men',
          location: 'Shoe Rack',
          purchaseDate: '2024-01-11',
          originalPrice: 129.99,
          currentValue: 129.99,
          shared: false,
          picture: null,
          notes: 'Nike Air Max'
        },
        // Beverages
        {
          id: '16',
          name: 'Coffee Beans',
          quantity: 2,
          measurementUnit: 'Bags',
          category: 'Food',
          subcategory: 'Beverages',
          location: 'Pantry Shelf 3',
          purchaseDate: '2024-01-16',
          expirationDate: '2024-03-16',
          originalPrice: 14.99,
          currentValue: 14.99,
          shared: true,
          picture: null,
          notes: 'Starbucks whole bean coffee'
        },
        {
          id: '17',
          name: 'Orange Juice',
          quantity: 1,
          measurementUnit: 'Gallon',
          category: 'Food',
          subcategory: 'Beverages',
          location: 'Fridge Door',
          purchaseDate: '2024-01-17',
          expirationDate: '2024-01-24',
          originalPrice: 5.49,
          currentValue: 5.49,
          shared: true,
          picture: null,
          notes: 'Tropicana orange juice'
        },
        // Snacks
        {
          id: '18',
          name: 'Chips',
          quantity: 3,
          measurementUnit: 'Bags',
          category: 'Food',
          subcategory: 'Snacks',
          location: 'Pantry Shelf 4',
          purchaseDate: '2024-01-18',
          expirationDate: '2024-02-18',
          originalPrice: 3.99,
          currentValue: 3.99,
          shared: true,
          picture: null,
          notes: 'Doritos nacho cheese'
        },
        {
          id: '19',
          name: 'Granola Bars',
          quantity: 2,
          measurementUnit: 'Boxes',
          category: 'Food',
          subcategory: 'Snacks',
          location: 'Pantry Shelf 4',
          purchaseDate: '2024-01-19',
          expirationDate: '2024-04-19',
          originalPrice: 4.99,
          currentValue: 4.99,
          shared: true,
          picture: null,
          notes: 'Nature Valley bars'
        },
        // Health & Beauty
        {
          id: '20',
          name: 'Toothpaste',
          quantity: 2,
          measurementUnit: 'Tubes',
          category: 'Health & Beauty',
          subcategory: 'Oral Care',
          location: 'Bathroom Cabinet',
          purchaseDate: '2024-01-13',
          expirationDate: '2025-01-13',
          originalPrice: 3.99,
          currentValue: 3.99,
          shared: true,
          picture: null,
          notes: 'Colgate toothpaste'
        }
      ];
      setItems(mockItems);
      localStorage.setItem('homeHubItems', JSON.stringify(mockItems));
    }
  }, []);

  const handleAddItem = (newItem) => {
    const itemWithId = { ...newItem, id: Date.now().toString() };
    setItems(prev => [...prev, itemWithId]);
      setShowItemForm(false);
      toast.success('Item added successfully!');
  };

  const handleAddMultipleItems = (newItems) => {
    const itemsWithIds = newItems.map(item => ({ ...item, id: Date.now().toString() + Math.random() }));
    setItems(prev => [...prev, ...itemsWithIds]);
      setShowMultiItemForm(false);
      toast.success(`${newItems.length} items added successfully!`);
  };

  const handleBarcodeScan = (barcodeData) => {
    // Handle barcode scan data
    console.log('Barcode scanned:', barcodeData);
      setShowBarcodeScanner(false);
    toast.success('Barcode scanned successfully!');
  };

  // Temporary function to clear localStorage and reload mock data
  const clearAndReloadData = () => {
    localStorage.removeItem('homeHubItems');
    window.location.reload();
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(items.map(item => item.category)))];

  const getItemCard = (item) => (
    <div key={item.id} className="bg-white rounded-lg shadow-md p-4 border">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
          <p className="text-sm text-gray-600">
            {item.quantity} {item.measurementUnit}
          </p>
        </div>
        {item.picture && (
          <img
            src={item.picture}
            alt={item.name}
            className="w-16 h-16 object-cover rounded-lg ml-3"
          />
        )}
      </div>
      
      <div className="space-y-1 text-sm text-gray-600">
        <p><span className="font-medium">Category:</span> {item.category} → {item.subcategory}</p>
        {item.location && <p><span className="font-medium">Location:</span> {item.location}</p>}
        {item.expirationDate && (
          <p className={new Date(item.expirationDate) < new Date() ? 'text-red-600' : ''}>
            <span className="font-medium">Expires:</span> {new Date(item.expirationDate).toLocaleDateString()}
          </p>
        )}
        {item.originalPrice && (
          <p><span className="font-medium">Price:</span> ${item.originalPrice}</p>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t">
        <span className={`text-xs px-2 py-1 rounded-full ${
          item.shared ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {item.shared ? 'Shared' : 'Personal'}
        </span>
        <div className="flex space-x-2">
          <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
          <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <Navigation currentPath={location.pathname} />
      
      {/* Action Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center space-x-3">
            <RealTimeStatus />
            <NotificationCenter />
          </div>
          
          <div className="flex flex-wrap items-center space-x-3">
              <button
                onClick={clearAndReloadData}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
              >
                Reset Data
              </button>
              <button
                onClick={() => setShowBarcodeScanner(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                <Camera size={16} />
                <span>Scan</span>
              </button>
              <button
                onClick={() => setShowMultiItemForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
              >
              <Plus size={16} />
              <span>Add Multiple</span>
              </button>
              <button
                onClick={() => setShowItemForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                <Plus size={16} />
                <span>Add Item</span>
              </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
              <div className="flex items-center space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Grid size={20} />
            </button>
          </div>
        </div>
      </div>

            {/* Items Display */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading items...</p>
              </div>
            ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
                  <Package size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters'
                    : 'Add your first item to get started'
              }
            </p>
          </div>
        ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
                {filteredItems.map(getItemCard)}
          </div>
        )}
          </div>

          {/* Sidebar - Activity Feed */}
          <div className="lg:col-span-1">
            <ActivityFeed />
          </div>
        </div>

        {/* Debug Information */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Debug Information:</h3>
          <p className="text-sm text-gray-600">Total Items: {items.length}</p>
          <p className="text-sm text-gray-600">Filtered Items: {filteredItems.length}</p>
          <p className="text-sm text-gray-600">Search Term: "{searchTerm}"</p>
          <p className="text-sm text-gray-600">Selected Category: {selectedCategory}</p>
          <p className="text-sm text-gray-600">View Mode: {viewMode}</p>
        </div>
      </div>

      {/* Modals */}
      {showItemForm && (
          <ItemForm
          onAdd={handleAddItem}
          onClose={() => setShowItemForm(false)}
          />
      )}

      {showMultiItemForm && (
          <MultiItemForm
          onAdd={handleAddMultipleItems}
          onClose={() => setShowMultiItemForm(false)}
          />
      )}

      {showBarcodeScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}
    </div>
  );
};

export default InventoryPage; 