import React, { useState, useRef, useEffect } from 'react';
import { Camera, QrCode, Package, X, Check, AlertCircle } from 'lucide-react';

export default function BarcodeScanner({ onScan, onClose, isOpen }) {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);
  const [scanMode, setScanMode] = useState('barcode'); // 'barcode' or 'qr'
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isOpen && scanning) {
      startCamera();
    } else if (!isOpen || !scanning) {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, scanning]);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleScan = (data) => {
    if (data) {
      setScannedData(data);
      setScanning(false);
      onScan(data);
    }
  };

  const handleManualInput = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const code = formData.get('manualCode');
    
    if (code.trim()) {
      handleScan(code.trim());
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setError(null);
    setScanning(false);
  };

  const startScanning = () => {
    setScanning(true);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Barcode Scanner</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Scan items for quick inventory entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!scanning && !scannedData && (
            <div className="space-y-4">
              {/* Mode Selection */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setScanMode('barcode')}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                    scanMode === 'barcode'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <Package className="inline w-4 h-4 mr-2" />
                  Barcode
                </button>
                <button
                  onClick={() => setScanMode('qr')}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                    scanMode === 'qr'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <QrCode className="inline w-4 h-4 mr-2" />
                  QR Code
                </button>
              </div>

              {/* Start Scanning Button */}
              <button
                onClick={startScanning}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Camera size={20} />
                <span>Start Scanning</span>
              </button>

              {/* Manual Input */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Or enter code manually:</p>
                <form onSubmit={handleManualInput} className="space-y-3">
                  <input
                    type="text"
                    name="manualCode"
                    placeholder="Enter barcode or QR code"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  >
                    Submit Code
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Camera View */}
          {scanning && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 bg-gray-900 rounded-lg object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-blue-500 rounded-lg p-8">
                    <div className="w-32 h-32 border-2 border-blue-500 rounded-lg relative">
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Position the {scanMode === 'barcode' ? 'barcode' : 'QR code'} within the frame
                </p>
                <button
                  onClick={() => setScanning(false)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Stop Scanning
                </button>
              </div>
            </div>
          )}

          {/* Scanned Result */}
          {scannedData && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Check className="text-green-600 dark:text-green-400" size={24} />
                  <div>
                    <h3 className="font-medium text-green-800 dark:text-green-200">Code Scanned Successfully!</h3>
                    <p className="text-sm text-green-600 dark:text-green-300 mt-1">Code: {scannedData}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => onScan(scannedData)}
                  className="flex-1 py-2 px-4 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  Use This Code
                </button>
                <button
                  onClick={resetScanner}
                  className="flex-1 py-2 px-4 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                  Scan Another
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
                <div>
                  <h3 className="font-medium text-red-800 dark:text-red-200">Error</h3>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 