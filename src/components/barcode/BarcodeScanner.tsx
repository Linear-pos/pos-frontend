import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, CameraOff, Scan, Package, Search, Settings } from 'lucide-react';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import { barcodeApi } from '../../services/barcode.api';
import type { BarcodeLookupResponse, BarcodeType } from '../../types/product';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Skeleton } from '../ui/skeleton';

interface BarcodeScannerProps {
  onProductFound?: (barcode: string, product: BarcodeLookupResponse['data']) => void;
  onBarcodeScanned?: (barcode: string) => void;
  onError?: (error: string) => void;
  className?: string;
  showCamera?: boolean;
  allowManualEntry?: boolean;
  autoLookup?: boolean;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onProductFound,
  onBarcodeScanned,
  onError,
  className = '',
  showCamera = true,
  allowManualEntry = true,
  autoLookup = true,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [selectedType, setSelectedType] = useState<BarcodeType>('CODE128');
  const [barcodeTypes, setBarcodeTypes] = useState<Record<BarcodeType, string>>({} as Record<BarcodeType, string>);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<BarcodeLookupResponse['data'] | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load barcode types
  useEffect(() => {
    const loadBarcodeTypes = async () => {
      setIsLoadingTypes(true);
      try {
        const response = await barcodeApi.getBarcodeTypes();
        setBarcodeTypes(response.data);
      } catch (error) {
        console.error('Failed to load barcode types:', error);
      } finally {
        setIsLoadingTypes(false);
      }
    };
    
    loadBarcodeTypes();
  }, []);

  // Barcode scanner hook for hardware scanners
  const { isListening, isLookingUp, start, stop, reset } = useBarcodeScanner({
    onScan: useCallback(async (barcode: string, product?: BarcodeLookupResponse['data']) => {
      setLastScannedBarcode(barcode);
      setManualBarcode(barcode);
      
      if (product) {
        setScanResult(product);
        onProductFound?.(barcode, product);
      } else {
        setScanResult(null);
        onBarcodeScanned?.(barcode);
      }
    }, [onProductFound, onBarcodeScanned]),
    onError: useCallback((error) => {
      const message = error.message || 'Scanning error occurred';
      onError?.(message);
      setCameraError(message);
    }, [onError]),
    lookupProduct: autoLookup,
  });

  // Camera scanning with ZXing
  const startCamera = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      await new Promise((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => resolve(void 0);
        }
      });

      setIsScanning(true);
      startCameraScanning();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Camera access denied';
      setCameraError(message);
      onError?.(message);
    }
  }, [onError]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if ((window as any).scanInterval) {
      clearInterval((window as any).scanInterval);
      (window as any).scanInterval = null;
    }
    setIsScanning(false);
  }, []);

  const startCameraScanning = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    // Simplified camera scanning without ZXing for now
    // Can be enhanced later if needed
    console.log('Camera scanning started (simplified version)');
    
    const scanInterval = setInterval(() => {
      if (!isScanning) {
        clearInterval(scanInterval);
        return;
      }
      
      // For demo purposes, we'll just show scanning UI
      // Real barcode scanning would require ZXing or similar library
      console.log('Scanning...');
    }, 1000);

    // Store interval for cleanup
    (window as any).scanInterval = scanInterval;
  }, [isScanning]);

  // Manual barcode submission
  const handleManualSubmit = useCallback(async () => {
    if (!manualBarcode.trim()) return;

    const barcode = manualBarcode.trim();
    
    if (autoLookup) {
      try {
        const response = await barcodeApi.findByBarcode(barcode);
        setScanResult(response.data);
        onProductFound?.(barcode, response.data);
      } catch (error) {
        setScanResult(null);
        onBarcodeScanned?.(barcode);
      }
    } else {
      onBarcodeScanned?.(barcode);
    }
  }, [manualBarcode, autoLookup, onProductFound, onBarcodeScanned]);

  // Generate sample barcode
  const generateSampleBarcode = useCallback(() => {
    const generated = barcodeApi.generateBarcode(selectedType);
    setManualBarcode(generated);
  }, [selectedType]);

  const handleClear = useCallback(() => {
    setManualBarcode('');
    setScanResult(null);
    setLastScannedBarcode(null);
    reset();
  }, [reset]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Scanner Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Scan className={`h-5 w-5 ${isListening ? 'text-green-600' : 'text-gray-400'}`} />
          <span className="text-sm font-medium">
            {isScanning ? 'Camera Scanning' : isListening ? 'Hardware Scanner Active' : 'Scanner Inactive'}
          </span>
          {isLookingUp && <span className="text-sm text-blue-600">(Looking up...)</span>}
        </div>
        <div className="flex space-x-2">
          {allowManualEntry && (
            <Button
              variant={isListening ? "default" : "outline"}
              size="sm"
              onClick={isListening ? stop : start}
            >
              <Package className="h-4 w-4 mr-2" />
              {isListening ? 'Disable' : 'Enable'} Hardware Scanner
            </Button>
          )}
        </div>
      </div>

      {/* Camera Section */}
      {showCamera && (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-black">
            {!isScanning ? (
              <div className="aspect-video flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Camera className="h-16 w-16 mx-auto text-gray-400" />
                  <Button onClick={startCamera} className="mx-auto">
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera Scanner
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border-2 border-green-500 border-opacity-50">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-4 bg-green-500"></div>
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-4 h-px bg-green-500"></div>
                    <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-4 h-px bg-green-500"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-px h-4 bg-green-500"></div>
                  </div>
                </div>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={stopCamera}
                  className="absolute top-4 right-4"
                >
                  <CameraOff className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {cameraError && (
            <Alert variant="destructive">
              <AlertDescription>{cameraError}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Manual Entry Section */}
      {allowManualEntry && (
        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Enter barcode manually or scan with hardware scanner"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleManualSubmit();
                  }
                }}
                className="text-lg"
              />
            </div>
            <Button onClick={handleManualSubmit} disabled={!manualBarcode.trim()}>
              <Search className="h-4 w-4 mr-2" />
              Look Up
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>

          {/* Barcode Type Selection & Generation */}
          <div className="flex items-center space-x-2">
            <Select value={selectedType} onValueChange={(value: BarcodeType) => setSelectedType(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select barcode type" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingTypes ? (
                  <div className="p-2">
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  Object.entries(barcodeTypes).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={generateSampleBarcode} size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Generate Sample
            </Button>
          </div>
        </div>
      )}

      {/* Last Scanned Barcode */}
      {lastScannedBarcode && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm font-medium text-blue-900">Last Scanned:</div>
          <div className="font-mono text-lg text-blue-700">{lastScannedBarcode}</div>
        </div>
      )}

      {/* Scan Result */}
      {scanResult && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm font-medium text-green-900 mb-2">Product Found!</div>
          <div className="space-y-1">
            <div><strong>Name:</strong> {scanResult.name}</div>
            <div><strong>SKU:</strong> {scanResult.sku}</div>
            <div><strong>Price:</strong> ${scanResult.price}</div>
            <div><strong>Stock:</strong> {scanResult.stock_quantity} {scanResult.unit}</div>
          </div>
        </div>
      )}

      {/* No Product Found */}
      {lastScannedBarcode && !scanResult && !isLookingUp && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm font-medium text-yellow-900">
            No product found for barcode: <span className="font-mono">{lastScannedBarcode}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;