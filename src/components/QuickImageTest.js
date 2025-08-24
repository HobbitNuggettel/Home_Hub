import React, { useState } from 'react';
import { imageManagementService } from '../services/ImageManagementService';

const QuickImageTest = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setResult(null);
      setImageUrl('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const uploadResult = await imageManagementService.uploadImage(file, {
        useCase: 'general',
        private: false,
        generateThumbnail: true
      });

      setResult(uploadResult);
      
      if (uploadResult.success && uploadResult.url) {
        setImageUrl(uploadResult.url);
      }

      console.log('Upload result:', uploadResult);
    } catch (error) {
      console.error('Upload failed:', error);
      setResult({ success: false, error: error.message });
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">🚀 Quick Image Upload Test</h2>
      
      {/* File Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* File Info */}
      {file && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p><strong>File:</strong> {file.name}</p>
          <p><strong>Size:</strong> {formatFileSize(file.size)}</p>
          <p><strong>Type:</strong> {file.type}</p>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 mb-4"
      >
        {loading ? '🔄 Uploading...' : '📤 Upload Image'}
      </button>

      {/* Results */}
      {result && (
        <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <h3 className={`text-lg font-semibold mb-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.success ? '✅ Upload Successful!' : '❌ Upload Failed'}
          </h3>
          
          {result.success ? (
            <div className="space-y-2">
              <p><strong>Service:</strong> {result.service}</p>
              <p><strong>Strategy:</strong> {result.strategy}</p>
              <p><strong>URL:</strong> <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{result.url}</a></p>
              {result.publicId && <p><strong>Public ID:</strong> {result.publicId}</p>}
              
              {/* Compression Stats */}
              {result.compression && (
                <div className="mt-3 p-3 bg-green-100 rounded">
                  <h4 className="font-medium text-green-800">Compression Results:</h4>
                  <p>Original: {formatFileSize(result.compression.originalSize)}</p>
                  <p>Final: {formatFileSize(result.compression.compressedSize)}</p>
                  <p>Reduction: {result.compression.stats.totalReduction}%</p>
                  <p>Savings: {result.compression.stats.savings.megabytes}MB</p>
                </div>
              )}

              {/* Thumbnail */}
              {result.thumbnail && (
                <div className="mt-3">
                  <h4 className="font-medium text-green-800">Thumbnail:</h4>
                  <p>Size: {formatFileSize(result.thumbnail.size)}</p>
                  <p>Dimensions: {result.thumbnail.dimensions?.width} × {result.thumbnail.dimensions?.height}</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p><strong>Error:</strong> {result.error}</p>
              <p><strong>Code:</strong> {result.code}</p>
            </div>
          )}
        </div>
      )}

      {/* Display Uploaded Image */}
      {imageUrl && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">📸 Uploaded Image:</h3>
          <img 
            src={imageUrl} 
            alt="Uploaded" 
            className="max-w-full h-auto rounded border"
            style={{ maxHeight: '300px' }}
          />
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800">📋 How to Check Uploads:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
          <li><strong>Console:</strong> Check browser DevTools → Console for detailed logs</li>
          <li><strong>Network:</strong> Check DevTools → Network for API calls</li>
          <li><strong>Cloudinary:</strong> Visit console.cloudinary.com → Media Library → home-hub folder</li>
          <li><strong>Image Display:</strong> The uploaded image appears above after successful upload</li>
        </ol>
      </div>
    </div>
  );
};

export default QuickImageTest;
