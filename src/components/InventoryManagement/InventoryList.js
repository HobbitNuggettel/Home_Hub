import React from 'react';
import { Package, Edit, Trash2, Eye } from 'lucide-react';

export default function InventoryList({ inventory, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Inventory List
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Inventory list component - to be implemented
      </p>
    </div>
  );
}
