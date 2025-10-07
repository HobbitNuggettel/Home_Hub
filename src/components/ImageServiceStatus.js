import React, { useState, useEffect } from 'react';
import { imageManagementService } from '../services/ImageManagementService.js';

const ImageServiceStatus = () => {
  const [status, setStatus] = useState(null);
  const [help, setHelp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkServices = async () => {
      try {
        const healthStatus = await imageManagementService.healthCheck();
        const configHelp = imageManagementService.getConfigurationHelp();
        
        setStatus(healthStatus);
        setHelp(configHelp);
      } catch (error) {
        console.error('Failed to check services:', error);
      } finally {
        setLoading(false);
      }
    };

    checkServices();
  }, []);

  if (loading) {
    return <div className="p-4">Loading service status...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">🖼️ Image Service Status</h2>
      
      {/* Overall Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Overall Status</h3>
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
          status?.overall === 'healthy' ? 'bg-green-100 text-green-800' :
          status?.overall === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status?.overall?.toUpperCase() || 'UNKNOWN'}
        </div>
      </div>

      {/* Service Details */}
      <div className="space-y-4">
        {Object.entries(help || {}).map(([service, config]) => (
          <div key={service} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-medium capitalize">{service}</h4>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                config.configured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {config.configured ? 'Configured' : 'Not Configured'}
              </div>
            </div>
            
            <p className="text-gray-600 mb-2">{config.benefits}</p>
            
            {!config.configured && (
              <div className="bg-yellow-50 p-3 rounded">
                <h5 className="font-medium text-yellow-800 mb-2">Setup Required:</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {Object.entries(config.setup).map(([step, instruction]) => (
                    <li key={step} className="flex items-start">
                      <span className="text-yellow-600 mr-2">•</span>
                      {instruction}
                    </li>
                  ))}
                </ul>
                
                {config.troubleshooting && (
                  <div className="mt-3">
                    <h6 className="font-medium text-yellow-800 mb-1">Troubleshooting:</h6>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {config.troubleshooting.map((tip, index) => (
                        <li key={`troubleshooting-tip-${tip.slice(0, 20)}`} className="flex items-start">
                          <span className="text-yellow-600 mr-2">💡</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {config.limitations && (
              <div className="mt-2 text-sm text-gray-500">
                <strong>Note:</strong> {config.limitations}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">🚀 Quick Setup Options</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>• <strong>Option A:</strong> Try Imgur again (1,250 uploads/day free)</p>
          <p>• <strong>Option B:</strong> Set up Cloudinary (25GB/month free)</p>
          <p>• <strong>Option C:</strong> Use base64 only (always works, limited to 500KB)</p>
        </div>
        <p className="text-blue-600 mt-2">
          <strong>💡 For now:</strong> All images will use base64 storage in Firestore. 
          This works fine for small images and is completely free!
        </p>
      </div>
    </div>
  );
};

export default ImageServiceStatus;
