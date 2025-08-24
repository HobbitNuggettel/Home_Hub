import React, { useState } from 'react';
import { imageCompressionService } from '../services/ImageCompressionService';
// import { imageManagementService } from '../services/ImageManagementService';

const ImageCompressionDemo = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [compressionResult, setCompressionResult] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useCase, setUseCase] = useState('general');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setCompressionResult(null);
      setUploadResult(null);
    }
  };

  const handleCompressionTest = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const result = await imageCompressionService.compressImageAfterCapture(selectedFile, {
        useCase,
        generateThumbnail: true,
        thumbnailSize: 'small',
        preserveTransparency: true,
        optimizeFormat: true
      });

      setCompressionResult(result);
      console.log('Compression result:', result);
    } catch (error) {
      console.error('Compression test failed:', error);
    } finally {
      setLoading(false);
    }
  };

    const handleUploadTest = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    try {
      // Temporarily disabled
      // const result = await imageManagementService.uploadImage(selectedFile, {
      //   useCase,
      //   private: true,
      //   generateThumbnail: true,
      //   thumbnailSize: 'small'
      // });

      // setUploadResult(result);
      // console.log('Upload result:', result);
      console.log('Upload test temporarily disabled');
    } catch (error) {
      console.error('Upload test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDimensions = (dimensions) => {
    if (!dimensions) return 'Unknown';
    return `${dimensions.width} × ${dimensions.height}`;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">🖼️ Image Compression Demo</h2>
      
      {/* File Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">1. Select Image</h3>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        
        {selectedFile && (
          <div className="mt-2 p-3 bg-gray-50 rounded">
            <p><strong>File:</strong> {selectedFile.name}</p>
            <p><strong>Size:</strong> {formatFileSize(selectedFile.size)}</p>
            <p><strong>Type:</strong> {selectedFile.type}</p>
          </div>
        )}
      </div>

      {/* Use Case Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">2. Select Use Case</h3>
        <select
          value={useCase}
          onChange={(e) => setUseCase(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="general">General Use</option>
          <option value="profile">Profile Photo</option>
          <option value="document">Document/Receipt</option>
          <option value="social">Social Media</option>
          <option value="storage">Long-term Storage</option>
          <option value="web">Web Display</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 space-x-4">
        <button
          onClick={handleCompressionTest}
          disabled={!selectedFile || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : '🧪 Test Compression Only'}
        </button>
        
        <button
          onClick={handleUploadTest}
          disabled={!selectedFile || loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : '🚀 Test Full Pipeline (Compress + Upload)'}
        </button>
      </div>

      {/* Compression Results */}
      {compressionResult && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-blue-800">📊 Compression Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-700">Original Image</h4>
              <p>Size: {formatFileSize(compressionResult.original.size)}</p>
              <p>Type: {compressionResult.original.type}</p>
              <p>Dimensions: {formatDimensions(compressionResult.original.dimensions)}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-700">Compressed Image</h4>
              <p>Size: {formatFileSize(compressionResult.compressed.size)}</p>
              <p>Type: {compressionResult.compressed.type}</p>
              <p>Dimensions: {formatDimensions(compressionResult.compressed.dimensions)}</p>
            </div>
          </div>

          {compressionResult.thumbnail && (
            <div className="mt-4">
              <h4 className="font-medium text-blue-700">Thumbnail</h4>
              <p>Size: {formatFileSize(compressionResult.thumbnail.size)}</p>
              <p>Type: {compressionResult.thumbnail.type}</p>
              <p>Dimensions: {formatDimensions(compressionResult.thumbnail.dimensions)}</p>
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-100 rounded">
            <h4 className="font-medium text-blue-800">Compression Statistics</h4>
            <p>Size Reduction: <strong>{compressionResult.stats.totalReduction}%</strong></p>
            <p>Storage Savings: <strong>{compressionResult.stats.savings.megabytes}MB</strong></p>
            <p>Compression Ratio: <strong>{compressionResult.stats.compressionRatio}</strong></p>
          </div>

          <div className="mt-4">
            <h4 className="font-medium text-blue-700">Storage Recommendations</h4>
            <ul className="list-disc list-inside text-sm text-blue-600">
              {compressionResult.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Upload Results */}
      {uploadResult && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-green-800">🚀 Upload Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-700">Storage Strategy</h4>
              <p>Strategy: <strong>{uploadResult.strategy}</strong></p>
              <p>Service: <strong>{uploadResult.service}</strong></p>
              <p>Success: <strong>{uploadResult.success ? 'Yes' : 'No'}</strong></p>
            </div>
            
            <div>
              <h4 className="font-medium text-green-700">Compression Applied</h4>
              <p>Applied: <strong>{uploadResult.compression?.applied ? 'Yes' : 'No'}</strong></p>
              <p>Original: <strong>{formatFileSize(uploadResult.compression?.originalSize || 0)}</strong></p>
              <p>Final: <strong>{formatFileSize(uploadResult.compression?.compressedSize || 0)}</strong></p>
            </div>
          </div>

          {uploadResult.compression && (
            <div className="mt-4 p-3 bg-green-100 rounded">
              <h4 className="font-medium text-green-800">Final Statistics</h4>
              <p>Total Reduction: <strong>{uploadResult.compression.stats.totalReduction}%</strong></p>
              <p>Storage Savings: <strong>{uploadResult.compression.stats.savings.megabytes}MB</strong></p>
              <p>Strategy Used: <strong>{uploadResult.strategy}</strong></p>
            </div>
          )}

          {uploadResult.thumbnail && (
            <div className="mt-4">
              <h4 className="font-medium text-green-700">Thumbnail Generated</h4>
              <p>Size: {formatFileSize(uploadResult.thumbnail.size)}</p>
              <p>Type: {uploadResult.thumbnail.type}</p>
              <p>Dimensions: {formatDimensions(uploadResult.thumbnail.dimensions)}</p>
            </div>
          )}
        </div>
      )}

      {/* Service Status */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">🔧 Service Status</h3>
        <div className="text-sm text-gray-600">
          <p>• <strong>Compression Service:</strong> Active</p>
          <p>• <strong>Image Management:</strong> Active</p>
          <p>• <strong>Automatic Pipeline:</strong> Enabled</p>
        </div>
      </div>
    </div>
  );
};

export default ImageCompressionDemo;
