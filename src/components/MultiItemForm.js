import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { Camera, Upload, X, Plus, Minus, Scan, Trash2 } from 'lucide-react';

const MultiItemForm = ({ onSubmit, onCancel, onBarcodeScan }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addMethod, setAddMethod] = useState('quick'); // 'quick' or 'batch'
  const [batchItems, setBatchItems] = useState([{ id: 1 }]);
  
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    defaultValues: {
      shared: true,
      measurementUnit: 'Pcs',
      category: 'Food',
      subcategory: 'Dairy',
      totalQuantity: 1
    }
  });

  const watchedCategory = watch('category');
  const watchedTotalQuantity = watch('totalQuantity');

  const categories = {
    'Food': ['Dairy', 'Produce', 'Pantry', 'Frozen', 'Beverages', 'Snacks'],
    'Electronics': ['Audio', 'Computing', 'Mobile', 'Gaming', 'Kitchen Appliances'],
    'Cleaning': ['Kitchen Cleaners', 'Bathroom Cleaners', 'Laundry', 'General'],
    'Personal Care': ['Hair Care', 'Skin Care', 'Oral Care', 'Feminine Care'],
    'Home & Garden': ['Tools', 'Furniture', 'Decor', 'Outdoor'],
    'Clothing': ['Men', 'Women', 'Children', 'Accessories'],
    'Other': ['Miscellaneous']
  };

  const measurementUnits = [
    'Pcs', 'Lbs', 'Kg', 'Gallon', 'Liter', 'Oz', 'Ml', 'Box', 'Pack', 'Roll', 'Bottle', 'Can'
  ];

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
  };

  const handleBarcodeScan = (barcode) => {
    setValue('barcode', barcode);
  };

  const addBatchItem = () => {
    const newId = Math.max(...batchItems.map(item => item.id)) + 1;
    setBatchItems([...batchItems, { id: newId }]);
  };

  const removeBatchItem = (id) => {
    if (batchItems.length > 1) {
      setBatchItems(batchItems.filter(item => item.id !== id));
    }
  };

  const onSubmitForm = async (data) => {
    setIsSubmitting(true);
    try {
      if (addMethod === 'quick') {
        // Quick Add: Create multiple identical items
        const baseItem = {
          ...data,
          picture: imagePreview,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const items = [];
        for (let i = 0; i < parseInt(data.totalQuantity); i++) {
          items.push({
            ...baseItem,
            id: `${Date.now()}-${i}`
          });
        }
        
        await onSubmit(items);
      } else {
        // Batch Entry: Create different items
        const items = batchItems.map((item, index) => ({
          id: `${Date.now()}-${index}`,
          name: data[`item${item.id}Name`] || '',
          quantity: parseFloat(data[`item${item.id}Quantity`]) || 1,
          measurementUnit: data[`item${item.id}Unit`] || 'Pcs',
          category: data[`item${item.id}Category`] || 'Food',
          subcategory: data[`item${item.id}Subcategory`] || 'Dairy',
          location: data[`item${item.id}Location`] || '',
          purchaseDate: data[`item${item.id}PurchaseDate`] || '',
          expirationDate: data[`item${item.id}ExpirationDate`] || '',
          originalPrice: parseFloat(data[`item${item.id}Price`]) || 0,
          currentValue: parseFloat(data[`item${item.id}Value`]) || 0,
          barcode: data[`item${item.id}Barcode`] || '',
          warrantyDate: data[`item${item.id}WarrantyDate`] || '',
          productLink: data[`item${item.id}Link`] || '',
          notes: data[`item${item.id}Notes`] || '',
          picture: imagePreview,
          shared: data.shared,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })).filter(item => item.name.trim() !== ''); // Only add items with names

        await onSubmit(items);
      }
      
      reset();
      setImagePreview(null);
      setBatchItems([{ id: 1 }]);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBatchItem = (item) => (
    <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-800">Item {item.id}</h4>
        {batchItems.length > 1 && (
          <button
            type="button"
            onClick={() => removeBatchItem(item.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Item Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Item Name *
        </label>
        <input
          type="text"
          {...register(`item${item.id}Name`, { required: 'Item name is required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Apples, Milk, Canned Tomatoes"
        />
      </div>

      {/* Quantity and Unit */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            step="0.01"
            {...register(`item${item.id}Quantity`)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit
          </label>
          <select
            {...register(`item${item.id}Unit`)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {measurementUnits.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category and Subcategory */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            {...register(`item${item.id}Category`)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.keys(categories).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subcategory
          </label>
          <select
            {...register(`item${item.id}Subcategory`)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories[watchedCategory]?.map(subcategory => (
              <option key={subcategory} value={subcategory}>{subcategory}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Location and Expiration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            {...register(`item${item.id}Location`)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Fridge, Pantry"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiration Date
          </label>
          <input
            type="date"
            {...register(`item${item.id}ExpirationDate`)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Price and Value */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <input
            type="number"
            step="0.01"
            {...register(`item${item.id}Price`)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Value
          </label>
          <input
            type="number"
            step="0.01"
            {...register(`item${item.id}Value`)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Barcode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Barcode
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            {...register(`item${item.id}Barcode`)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Scan or enter barcode"
          />
          <button
            type="button"
            onClick={() => onBarcodeScan && onBarcodeScan()}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center space-x-2"
          >
            <Scan size={16} />
            <span>Scan</span>
          </button>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          {...register(`item${item.id}Notes`)}
          rows="2"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Any additional information..."
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Add Multiple Items
        </h2>
        
        {/* Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose Method:
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="quick"
                checked={addMethod === 'quick'}
                onChange={(e) => setAddMethod(e.target.value)}
                className="text-blue-600"
              />
              <span className="text-sm font-medium">Quick Add (Identical Items)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="batch"
                checked={addMethod === 'batch'}
                onChange={(e) => setAddMethod(e.target.value)}
                className="text-blue-600"
              />
              <span className="text-sm font-medium">Batch Entry (Different Items)</span>
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {addMethod === 'quick' ? (
            // Quick Add Section
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  Add multiple identical items with the same details.
                </p>
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Item name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Canned Tomatoes, Paper Towels"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Total Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Quantity *
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      const current = parseInt(watchedTotalQuantity) || 1;
                      if (current > 1) {
                        const event = { target: { value: current - 1 } };
                        register('totalQuantity').onChange(event);
                      }
                    }}
                    className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    {...register('totalQuantity', { 
                      required: 'Total quantity is required',
                      min: { value: 1, message: 'Quantity must be at least 1' },
                      max: { value: 100, message: 'Quantity cannot exceed 100' }
                    })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const current = parseInt(watchedTotalQuantity) || 1;
                      if (current < 100) {
                        const event = { target: { value: current + 1 } };
                        register('totalQuantity').onChange(event);
                      }
                    }}
                    className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {errors.totalQuantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.totalQuantity.message}</p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  This will create {watchedTotalQuantity || 1} identical items
                </p>
              </div>

              {/* Common Fields for Quick Add */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <select
                    {...register('measurementUnit', { required: 'Unit is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {measurementUnits.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(categories).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Other common fields... */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  {...register('location')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Pantry Shelf 2, Garage Storage"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    {...register('purchaseDate')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    {...register('expirationDate')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price (per item)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('originalPrice')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Value (per item)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('currentValue')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Barcode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    {...register('barcode')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Scan or enter barcode"
                  />
                  <button
                    type="button"
                    onClick={() => onBarcodeScan && onBarcodeScan()}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center space-x-2"
                  >
                    <Scan size={16} />
                    <span>Scan</span>
                  </button>
                </div>
              </div>

              {/* Warranty/Return Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty/Return Date
                </label>
                <input
                  type="date"
                  {...register('warrantyDate')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Product Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Link
                </label>
                <input
                  type="url"
                  {...register('productLink')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional information..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Picture
                </label>
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600">
                        <Camera size={20} />
                        <span>Take Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <label className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-md cursor-pointer hover:bg-gray-600">
                        <Upload size={20} />
                        <span>Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Shared Status */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="shared"
                  {...register('shared')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="shared" className="text-sm font-medium text-gray-700">
                  Share with household members
                </label>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Summary</h3>
                <p className="text-sm text-blue-700">
                  You will create <strong>{watchedTotalQuantity || 1} identical items</strong> with the name &quot;{watch('name') || 'Item'}&quot; 
                  in the {watch('category') || 'Food'} category.
                </p>
              </div>
            </div>
          ) : (
            // Batch Entry Section
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700">
                  Add multiple different items with individual details.
                </p>
              </div>

              {/* Batch Items */}
              <div className="space-y-4">
                {batchItems.map(item => renderBatchItem(item))}
              </div>

              {/* Add Another Item Button */}
              <button
                type="button"
                onClick={addBatchItem}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Another Item</span>
              </button>

              {/* Shared Status for Batch */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="shared"
                  {...register('shared')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="shared" className="text-sm font-medium text-gray-700">
                  Share with household members
                </label>
              </div>

              {/* Summary for Batch */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Summary</h3>
                <p className="text-sm text-green-700">
                  You will add <strong>{batchItems.length} different items</strong> to your inventory.
                </p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding Items...' : (addMethod === 'quick' ? `Add ${watchedTotalQuantity || 1} Items` : `Add ${batchItems.length} Items`)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

MultiItemForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onBarcodeScan: PropTypes.func.isRequired
};

export default MultiItemForm; 