import React from 'react';
import { Package, MapPin, Calendar, Edit, Trash2, Eye } from 'lucide-react';

const InventoryList = ({ 
  items = [], 
  selectedItems = [], 
  onEdit, 
  onDelete, 
  onView, 
  onToggleSelection, 
  viewMode = 'grid' 
}) => {
  // Handle empty state
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No inventory items found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding your first item.</p>
      </div>
    );
  }

  // Handle null/undefined items gracefully
  if (!Array.isArray(items)) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Invalid data format</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Please check your data source.</p>
      </div>
    );
  }

  const renderGridItem = (item) => (
    <div
      key={item.id}
      data-testid="inventory-item"
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
    >
      <div className="p-4">
        {/* Header with checkbox and icon */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => onToggleSelection(item.id)}
              aria-label={`Select ${item.name}`}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Package className="h-6 w-6 text-gray-400" />
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {item.category}
          </span>
        </div>

        {/* Item name */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {item.name}
        </h3>

        {/* Item details */}
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <span className="font-medium w-20">Category:</span>
            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded text-xs">
              {item.category}
            </span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium w-20">Quantity:</span>
            <span className="text-gray-900 dark:text-white font-semibold">
              {item.quantity}
            </span>
          </div>
          
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{item.location}</span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium w-20">Price:</span>
            <span className="text-gray-900 dark:text-white font-semibold">
              ${item.price?.toFixed(2) || '0.00'}
            </span>
          </div>
          
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{item.addedDate}</span>
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={() => onView(item.id)}
            aria-label={`View ${item.name}`}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onEdit(item.id)}
            aria-label={`Edit ${item.name}`}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onDelete(item.id)}
            aria-label={`Delete ${item.name}`}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderListItem = (item) => (
    <div
      key={item.id}
      data-testid="inventory-item"
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => onToggleSelection(item.id)}
              aria-label={`Select ${item.name}`}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            
            <div className="flex items-center space-x-3">
              <Package className="h-5 w-5 text-gray-400" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.category} • {item.location}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Qty: {item.quantity}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ${item.price?.toFixed(2) || '0.00'}
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => onView(item.id)}
                aria-label={`View ${item.name}`}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onEdit(item.id)}
                aria-label={`Edit ${item.name}`}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onDelete(item.id)}
                aria-label={`Delete ${item.name}`}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      data-testid="inventory-list"
      className={viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 sm:p-6 lg:p-8'
        : 'space-y-2 p-4 sm:p-6 lg:p-8'
      }
    >
      {items.map(item => 
        viewMode === 'grid' ? renderGridItem(item) : renderListItem(item)
      )}
    </div>
  );
};

export default InventoryList;
