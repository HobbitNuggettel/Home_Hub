import React from 'react';

const InventoryList = ({ items = [], onEdit, onDelete }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No inventory items found. Add some items to get started!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-600">Category: {item.category}</p>
              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
              {item.expiryDate && (
                <p className="text-sm text-gray-600">
                  Expires: {new Date(item.expiryDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(item)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryList;

