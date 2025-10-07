import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, Package, DollarSign, MapPin, Calendar, FileText, Tag } from 'lucide-react';

// Zod schema for form validation
const inventoryItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(9999, 'Quantity must be less than 9999'),
  location: z.string().min(1, 'Location is required').max(100, 'Location must be less than 100 characters'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  expiryDate: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative').max(999999.99, 'Price must be less than $1,000,000'),
  barcode: z.string().optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  warranty: z.string().max(100, 'Warranty must be less than 100 characters').optional(),
  supplier: z.string().max(100, 'Supplier must be less than 100 characters').optional(),
  tags: z.string().max(200, 'Tags must be less than 200 characters').optional()
});

export default function InventoryItemForm({ 
  item = null, 
  categories = [], 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}) {
  const isEditing = !!item;
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch
  } = useForm({
    resolver: zodResolver(inventoryItemSchema),
    mode: 'onChange',
    defaultValues: item ? {
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      location: item.location,
      purchaseDate: item.purchaseDate,
      expiryDate: item.expiryDate || '',
      price: item.price,
      barcode: item.barcode || '',
      notes: item.notes || '',
      warranty: item.warranty || '',
      supplier: item.supplier || '',
      tags: item.tags ? item.tags.join(', ') : ''
    } : {
      name: '',
      category: '',
      quantity: 1,
      location: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      price: 0,
      barcode: '',
      notes: '',
      warranty: '',
      supplier: '',
      tags: ''
    }
  });

  const watchedTags = watch('tags');
  const tagCount = watchedTags ? watchedTags.split(',').filter(tag => tag.trim()).length : 0;

  const handleFormSubmit = (data) => {
    // Process tags
    const processedData = {
      ...data,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    };
    
    onSubmit(processedData);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Item' : 'Add New Item'}
            </h2>
            <p className="text-sm text-gray-600">
              {isEditing ? 'Update item information' : 'Enter item details below'}
            </p>
          </div>
        </div>
        <button
          onClick={handleCancel}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name *
            </label>
            <input
              {...register('name')}
              type="text"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter item name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              {...register('category')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.category ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              {...register('quantity', { valueAsNumber: true })}
              type="number"
              min="1"
              max="9999"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.quantity ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="1"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                {...register('location')}
                type="text"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.location ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Kitchen, Garage"
              />
            </div>
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                {...register('purchaseDate')}
                type="date"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.purchaseDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.purchaseDate && (
              <p className="mt-1 text-sm text-red-600">{errors.purchaseDate.message}</p>
            )}
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                {...register('expiryDate')}
                type="date"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Leave empty if no expiry date</p>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                {...register('price', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                max="999999.99"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.price ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>

          {/* Barcode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Barcode/QR Code
            </label>
            <input
              {...register('barcode')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional barcode or QR code"
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <textarea
                {...register('notes')}
                rows="3"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.notes ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Additional notes about the item..."
              />
            </div>
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input
                {...register('tags')}
                type="text"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.tags ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter tags separated by commas"
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              {errors.tags && (
                <p className="text-sm text-red-600">{errors.tags.message}</p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {tagCount} tag{tagCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Warranty & Supplier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warranty
              </label>
              <input
                {...register('warranty')}
                type="text"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.warranty ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., 2 years"
              />
              {errors.warranty && (
                <p className="mt-1 text-sm text-red-600">{errors.warranty.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier
              </label>
              <input
                {...register('supplier')}
                type="text"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.supplier ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Amazon, Local Store"
              />
              {errors.supplier && (
                <p className="mt-1 text-sm text-red-600">{errors.supplier.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : (isEditing ? 'Update Item' : 'Add Item')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

InventoryItemForm.propTypes = {
  item: PropTypes.object,
  categories: PropTypes.array,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool
};
