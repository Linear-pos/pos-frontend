import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { productsAPI } from '../../features/products/api/products.api';
import type { Product } from '../../types/product';
import BarcodeManagement from '../../components/barcode/BarcodeManagement';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';

export const ProductBarcodesPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) return;

      try {
        setIsLoading(true);
        const response = await productsAPI.getProduct(productId);
        setProduct(response.data);
        setError(null);
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Failed to load product';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleBarcodeUpdated = () => {
    // Optional: Refresh product data if needed
    console.log('Barcodes updated');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Loading Product...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="h-64">
              <Skeleton className="h-full w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Product</h3>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">Product Not Found</h3>
            <p className="text-gray-600 mt-2">The requested product could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Barcode Management
            </h1>
            <p className="text-gray-600">
              Managing barcodes for: <span className="font-medium">{product.name}</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-600">SKU: {product.sku}</div>
          <div className="text-2xl font-bold text-green-600">
            ${product.price}
          </div>
          <div className={`text-sm font-medium ${
            product.stock_quantity <= product.reorder_level 
              ? 'text-red-600' 
              : 'text-green-600'
          }`}>
            Stock: {product.stock_quantity} {product.unit}
          </div>
        </div>
      </div>

      {/* Product Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Product Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-600">Basic Info</div>
              <div className="space-y-1">
                <div><span className="text-gray-900 font-medium">Name:</span> {product.name}</div>
                <div><span className="text-gray-900 font-medium">SKU:</span> {product.sku}</div>
                {product.category && (
                  <div><span className="text-gray-900 font-medium">Category:</span> {product.category}</div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-600">Pricing</div>
              <div className="space-y-1">
                <div><span className="text-gray-900 font-medium">Price:</span> ${product.price}</div>
                {product.cost && (
                  <div><span className="text-gray-900 font-medium">Cost:</span> ${product.cost}</div>
                )}
                {product.cost && (
                  <div>
                    <span className="text-gray-900 font-medium">Margin:</span> 
                    <span className={((product.price - product.cost) / product.cost * 100) > 20 ? 'text-green-600' : 'text-yellow-600'}>
                      {(((product.price - product.cost) / product.cost * 100)).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-600">Stock</div>
              <div className="space-y-1">
                <div>
                  <span className="text-gray-900 font-medium">Current:</span> 
                  <span className={`font-medium ml-1 ${
                    product.stock_quantity <= product.reorder_level 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {product.stock_quantity} {product.unit}
                  </span>
                </div>
                <div>
                  <span className="text-gray-900 font-medium">Reorder Level:</span> 
                  <span className="font-medium ml-1">{product.reorder_level} {product.unit}</span>
                </div>
                {product.unit_size && (
                  <div>
                    <span className="text-gray-900 font-medium">Unit Size:</span> 
                    <span className="font-medium ml-1">{product.unit_size}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {product.description && (
            <div className="mt-6 pt-6 border-t">
              <div className="text-sm font-medium text-gray-600 mb-2">Description</div>
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}

          {product.image_url && (
            <div className="mt-6 pt-6 border-t">
              <div className="text-sm font-medium text-gray-600 mb-2">Product Image</div>
              <img
                src={product.image_url}
                alt={product.name}
                className="h-32 w-32 object-cover rounded-lg border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Barcode Management Component */}
      <BarcodeManagement
        productId={product.id}
        productName={product.name}
        onBarcodeUpdated={handleBarcodeUpdated}
      />
    </div>
  );
};

export default ProductBarcodesPage;