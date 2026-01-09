import React from "react";
import {
  Package,
  Boxes,
  Tag,
  Barcode,
  Edit,
} from "lucide-react";
import type {
  BarcodeLookupResponse,
  ProductBarcode,
} from "../../types/product";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface ProductLookupResultProps {
  result: BarcodeLookupResponse["data"];
  scannedBarcode: string;
  onAddToCart?: () => void;
  onManageBarcodes?: () => void;
  onEditProduct?: () => void;
  className?: string;
}

export const ProductLookupResult: React.FC<ProductLookupResultProps> = ({
  result,
  scannedBarcode,
  onAddToCart,
  onManageBarcodes,
  onEditProduct,
  className = "",
}) => {
  const isLowStock = result.stock_quantity <= result.reorder_level;
  const primaryBarcode = result.barcodes.find((b) => b.is_primary);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Product Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-semibold text-gray-900">
              {result.name}
            </h3>
            <Badge variant={result.is_active ? "default" : "secondary"}>
              {result.is_active ? "Active" : "Inactive"}
            </Badge>
            {isLowStock && <Badge variant="destructive">Low Stock</Badge>}
          </div>

          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <Tag className="h-4 w-4 mr-1" />
              {result.sku}
            </span>
            {result.category && <span>{result.category}</span>}
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(result.price)}
          </div>
          {result.cost && result.cost < result.price && (
            <div className="text-sm text-gray-500">
              Cost: {formatCurrency(result.cost)}
            </div>
          )}
        </div>
      </div>

      {/* Product Image */}
      {result.image_url && (
        <div className="flex justify-center">
          <img
            src={result.image_url}
            alt={result.name}
            className="h-48 w-48 object-cover rounded-lg border"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          {/* Stock Information */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-900 mb-2">
              <Boxes className="h-5 w-5" />
              <h4 className="font-medium">Stock Information</h4>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Current Stock:</span>
                <span
                  className={`font-medium ${
                    isLowStock ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {result.stock_quantity} {result.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Reorder Level:</span>
                <span className="font-medium">
                  {result.reorder_level} {result.unit}
                </span>
              </div>
              {result.unit_size && (
                <div className="flex justify-between">
                  <span>Unit Size:</span>
                  <span className="font-medium">{result.unit_size}</span>
                </div>
              )}
            </div>
          </div>

          {/* Scanned Barcode Info */}
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 text-green-900 mb-2">
              <Barcode className="h-5 w-5" />
              <h4 className="font-medium">Scanned Barcode</h4>
            </div>
            <div className="space-y-1 text-sm">
              <div className="font-mono font-medium text-green-700">
                {scannedBarcode}
              </div>
              {result.matched_barcode && (
                <div className="space-y-1 mt-2 pt-2 border-t border-green-200">
                  <div className="text-xs text-green-600">
                    Matched Barcode Details:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium ml-1">
                        {result.matched_barcode.barcode_type}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Primary:</span>
                      <span
                        className={`font-medium ml-1 ${
                          result.matched_barcode.is_primary
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}
                      >
                        {result.matched_barcode.is_primary ? "Yes" : "No"}
                      </span>
                    </div>
                    {result.matched_barcode.quantity && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium ml-1">
                          {result.matched_barcode.quantity}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* All Barcodes */}
          {result.barcodes.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 text-gray-900 mb-3">
                <Barcode className="h-5 w-5" />
                <h4 className="font-medium">
                  All Barcodes ({result.barcodes.length})
                </h4>
              </div>
              <div className="space-y-2">
                {result.barcodes.map((barcode: ProductBarcode) => (
                  <div
                    key={barcode.id}
                    className={`p-2 rounded border text-sm ${
                      barcode.is_primary
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-medium">
                          {barcode.barcode}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {barcode.barcode_type}
                        </Badge>
                        {barcode.is_primary && (
                          <Badge className="text-xs">Primary</Badge>
                        )}
                      </div>
                      {barcode.quantity && (
                        <span className="text-gray-600 text-xs">
                          Qty: {barcode.quantity}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {result.description && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-700">{result.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-4 border-t">
        {onAddToCart && (
          <Button
            onClick={onAddToCart}
            className="bg-green-600 hover:bg-green-700"
          >
            <Package className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        )}
        {onManageBarcodes && (
          <Button variant="outline" onClick={onManageBarcodes}>
            <Barcode className="h-4 w-4 mr-2" />
            Manage Barcodes
          </Button>
        )}
        {onEditProduct && (
          <Button variant="outline" onClick={onEditProduct}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Product
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductLookupResult;
