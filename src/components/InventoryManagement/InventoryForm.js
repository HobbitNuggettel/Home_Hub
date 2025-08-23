import React from 'react';
import { X, Save } from 'lucide-react';

export default function InventoryForm({ 
  item = null, 
  onSubmit, 
  onCancel, 
  categories = [], 
  isEditing = false 
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Item' : 'Add New Item'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 text-center text-gray-600 dark:text-gray-400">
          Inventory form component - to be implemented
        </div>
      </div>
    </div>
  );
}
