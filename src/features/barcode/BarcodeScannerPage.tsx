import React, { useState } from 'react';
import { Scan, Package, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import BarcodeScanner from '../../components/barcode/BarcodeScanner';
import ProductLookupResult from '../../components/barcode/ProductLookupResult';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useCartStore } from '../../stores/cart.store';
import type { BarcodeLookupResponse } from '../../types/product';

export const BarcodeScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  
  const [activeTab, setActiveTab] = useState('scan');
  const [lastScanResult, setLastScanResult] = useState<BarcodeLookupResponse['data'] | null>(null);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<Array<{barcode: string; timestamp: Date; product?: BarcodeLookupResponse["data"]}>(() => [
  ]);
  const [error, setError] = useState<string | null>(null);

  const isManager = user?.role === 'SYSTEM_OWNER' || user?.role === 'BRANCH_MANAGER';

  const handleProductFound = (barcode: string, product: BarcodeLookupResponse['data']) => {
    setLastScannedBarcode(barcode);
    setLastScanResult(product);
    
    // Add to scan history
    setScanHistory(prev => [
      { barcode, timestamp: new Date(), product },
      ...prev.slice(0, 9) // Keep last 10 scans
    ]);
    
    setError(null);
  };

  const handleBarcodeScanned = (barcode: string) => {
    setLastScannedBarcode(barcode);
    setError(`No product found for barcode: ${barcode}`);
    
    // Add to scan history without product
    setScanHistory(prev => [
      { barcode, timestamp: new Date() },
      ...prev.slice(0, 9)
    ]);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleAddToCart = () => {
    if (lastScanResult) {
      addItem({
        id: lastScanResult.id,
        name: lastScanResult.name,
        sku: lastScanResult.sku,
        price: lastScanResult.price,
        quantity: 1,
        image_url: lastScanResult.image_url,
      });
      
      // Navigate to POS if they want to continue shopping
      if (confirm('Product added to cart! Go to POS page?')) {
        navigate('/pos');
      }
    }
  };

  const handleManageBarcodes = () => {
    if (lastScanResult) {
      // Navigate to product edit page with barcode management
      navigate(`/products/${lastScanResult.id}/barcodes`);
    }
  };

  const handleEditProduct = () => {
    if (lastScanResult) {
      navigate(`/products/${lastScanResult.id}/edit`);
    }
  };

  const clearHistory = () => {
    setScanHistory([]);
    setLastScanResult(null);
    setLastScannedBarcode('');
    setError(null);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Scan className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Barcode Scanner</h1>
        </div>
        <div className="flex items-center space-x-2">
          {isManager && (
            <Button
              variant="outline"
              onClick={() => navigate('/products')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Products
            </Button>
          )}
          <Button onClick={() => navigate('/pos')}>
            <Package className="h-4 w-4 mr-2" />
            POS
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scan">Scan Products</TabsTrigger>
          <TabsTrigger value="history">Scan History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Scan Tab */}
        <TabsContent value="scan" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scanner Component */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scan className="h-5 w-5" />
                  <span>Barcode Scanner</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarcodeScanner
                  onProductFound={handleProductFound}
                  onBarcodeScanned={handleBarcodeScanned}
                  onError={handleError}
                  showCamera={true}
                  allowManualEntry={true}
                  autoLookup={true}
                />
              </CardContent>
            </Card>

            {/* Result Display */}
            {lastScanResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Scan Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductLookupResult
                    result={lastScanResult}
                    scannedBarcode={lastScannedBarcode}
                    onAddToCart={handleAddToCart}
                    onManageBarcodes={isManager ? handleManageBarcodes : undefined}
                    onEditProduct={isManager ? handleEditProduct : undefined}
                  />
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!lastScanResult && !error && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Scan className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Scan</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Use the hardware scanner, camera, or manual entry to scan barcodes.
                    Products will appear here automatically.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Scan History</CardTitle>
              <Button variant="outline" onClick={clearHistory} size="sm">
                Clear History
              </Button>
            </CardHeader>
            <CardContent>
              {scanHistory.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <Scan className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p>No scan history yet. Start scanning some products!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scanHistory.map((scan, index) => (
                    <div
                      key={`${scan.timestamp.getTime()}-${index}`}
                      className={`p-4 border rounded-lg ${
                        scan.product
                          ? 'bg-green-50 border-green-200'
                          : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-mono font-medium">
                            {scan.barcode}
                          </div>
                          <div className="text-sm text-gray-600">
                            {scan.timestamp.toLocaleTimeString()}
                          </div>
                          {scan.product && (
                            <div className="text-sm font-medium text-green-700">
                              {scan.product.name}
                            </div>
                          )}
                        </div>
                        <div className="text-sm">
                          {scan.product ? (
                            <span className="text-green-600">✓ Found</span>
                          ) : (
                            <span className="text-yellow-600">⚠ Not Found</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Scanner Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Supported Barcode Types</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• EAN-13 (13 digits)</div>
                    <div>• EAN-8 (8 digits)</div>
                    <div>• UPC-A (12 digits)</div>
                    <div>• UPC-E (6 digits)</div>
                    <div>• Code 128 (alphanumeric)</div>
                    <div>• Code 39 (alphanumeric)</div>
                    <div>• ISBN (10 or 13 digits)</div>
                    <div>• ISSN (format: 1234-567X)</div>
                    <div>• ITF-14 (14 digits)</div>
                    <div>• GS1-128 (alphanumeric)</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">How to Use</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>1. Connect a USB barcode scanner (recommended)</div>
                    <div>2. Use camera for on-device scanning</div>
                    <div>3. Manual entry for backup</div>
                    <div>4. Auto product lookup enabled by default</div>
                  </div>
                </div>

                {isManager && (
                  <div className="space-y-2 pt-4 border-t">
                    <h4 className="font-medium">Management</h4>
                    <p className="text-sm text-gray-600">
                      As a manager, you can add/edit barcodes for products from the product management pages.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Troubleshooting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Scanner Not Working?</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Check USB connection</div>
                    <div>• Try clicking "Enable Hardware Scanner"</div>
                    <div>• Ensure scanner is configured as keyboard</div>
                    <div>• Check browser permissions for camera</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Camera Issues?</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Allow camera permissions in browser</div>
                    <div>• Ensure good lighting</div>
                    <div>• Hold camera steady</div>
                    <div>• Try manual entry as backup</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Product Not Found?</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Check barcode is clean and readable</div>
                    <div>• Verify product exists in inventory</div>
                    <div>• Ensure barcode is assigned to product</div>
                    <div>• Contact manager to add missing barcodes</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BarcodeScannerPage;