import type { Product } from "@/types/product";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}



export const ProductGrid = ({
  products,
  onAddToCart,
  isLoading = false,
  error = null,
  className = "",
}: ProductGridProps) => {
  // Removed internal state and fetching logic

  // Filter products based on search query
  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive-foreground font-semibold mb-2">
            Failed to load products
          </p>
          <p className="text-destructive text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <p className="text-muted-foreground">No products available</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}
    >
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-card text-card-foreground rounded-lg border border-border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden hover:border-primary"
          onClick={() => onAddToCart(product)}
        >
          {/* Product Image */}
          <div className="h-40 bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center text-muted-foreground overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-contain hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <svg
                  className="w-12 h-12 text-muted-foreground"
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
                <span className="text-xs text-muted-foreground mt-1">No image</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4 flex flex-col h-36">
            <h3 className="text-foreground font-semibold text-sm leading-tight truncate">
              {product.name}
            </h3>
            {product.name && (
              <p className="text-muted-foreground text-xs mt-1">
                {product.name}
              </p>
            )}
            {product.category && (
              <p className="text-muted-foreground text-xs mt-1">
                {product.category}
              </p>
            )}
            {/* {product.sku && (
              <p className="text-muted-foreground text-xs mt-1">
                SKU: {product.sku}
              </p>
            )} */}


            {/* Stock Info */}
            {product.stock_quantity !== undefined && (
              <div className="mt-2 pt-2 border-t border-border">
                <p
                  className={`text-xs font-medium ${product.stock_quantity > 0
                    ? "text-blue-600"
                    : "text-destructive-foreground"
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
                <span className="text-foreground font-bold text-lg">
                  KES {(Number(product.price) || 0).toFixed(2)}
                </span>
              </div>
              <button
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-2 rounded-md text-xs font-medium transition-colors duration-200 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
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
