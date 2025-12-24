import { useState, useEffect } from "react";
import type { Product } from "@/types/product";
import { productsAPI } from "../../products/api/products.api";

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
  searchQuery: string;
  className?: string;
}

export const ProductGrid = ({
  onAddToCart,
  searchQuery,
  className = "",
}: ProductGridProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch products from API
        const response = await productsAPI.getProducts({
          page: 1,
          per_page: 50,
          is_active: true,
        });

        setProducts(response.data);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch products";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search query
  const filteredProducts = products.filter(
    (product) =>
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center p-6 bg-error-50 border border-error-200 rounded-lg">
          <p className="text-error-700 font-semibold mb-2">
            Failed to load products
          </p>
          <p className="text-error-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <p className="text-neutral-600">No products available</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}
    >
      {filteredProducts.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden hover:border-primary-300"
          onClick={() => onAddToCart(product)}
        >
          {/* Product Image */}
          <div className="h-40 bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center text-neutral-500 overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <svg
                  className="w-12 h-12 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs text-neutral-500 mt-1">No image</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4 flex flex-col h-36">
            <h3 className="text-primary font-semibold text-sm leading-tight truncate">
              {product.name}
            </h3>
            {product.category && (
              <p className="text-neutral-500 text-xs mt-1">
                {product.category}
              </p>
            )}
            {product.sku && (
              <p className="text-neutral-400 text-xs mt-1">
                SKU: {product.sku}
              </p>
            )}

            {/* Stock Info */}
            {product.stock_quantity !== undefined && (
              <div className="mt-2 pt-2 border-t border-neutral-100">
                <p
                  className={`text-xs font-medium ${
                    product.stock_quantity > 0
                      ? "text-success-600"
                      : "text-error-600"
                  }`}
                >
                  {product.stock_quantity > 0
                    ? `${product.stock_quantity} in stock`
                    : "Out of stock"}
                </p>
              </div>
            )}

            {/* Price & Button */}
            <div className="mt-auto pt-3 flex justify-between items-center gap-2">
              <div>
                <span className="text-secondary font-bold text-lg">
                  KES {(Number(product.price) || 0).toFixed(2)}
                </span>
              </div>
              <button
                className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors duration-200 disabled:bg-neutral-400 disabled:cursor-not-allowed"
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    product.stock_quantity !== undefined &&
                    product.stock_quantity <= 0
                  ) {
                    return;
                  }
                  onAddToCart(product);
                }}
                disabled={
                  product.stock_quantity !== undefined &&
                  product.stock_quantity <= 0
                }
              >
                Add
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
