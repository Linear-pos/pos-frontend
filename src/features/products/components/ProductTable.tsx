import type { Product } from "../../../types/product";
import { productsAPI } from "../api/products.api";

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export const ProductTable = ({
  products,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}: ProductTableProps) => {
  if (loading && products.length === 0) {
    return (
      <div className="bg-card text-card-foreground rounded-lg shadow p-8 text-center">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <p className="mt-4 text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-card text-card-foreground rounded-lg shadow p-8 text-center">
        <p className="text-muted-foreground mb-4">No products found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Product
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Category
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                Price
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                Stock
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                Status
              </th>
              {(onEdit || onDelete) && (
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => {
              const needsReorder = productsAPI.needsReorder(product);
              const isLowStock = product.stock_quantity <= 5;

              return (
                <tr key={product.id} className="hover:bg-muted/50 transition">
                  {/* Product Name */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-foreground">
                        {product.name}
                        {product.unit_size && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({product.unit_size} {product.unit})
                          </span>
                        )}
                      </p>
                      {product.description && (
                         <p className="text-sm text-muted-foreground truncate">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="px-6 py-4">
                     <code className="bg-muted px-2 py-1 rounded text-sm text-muted-foreground">
                      {product.sku}
                    </code>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                     <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      {product.category || "Uncategorized"}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 text-right">
                     <p className="font-semibold text-foreground">
                      {new Intl.NumberFormat("en-KE", {
                        style: "currency",
                        currency: "KES",
                      }).format(product.price)}
                    </p>
                    {/* {product.cost && (
                      <p className="text-xs text-neutral-500">
                        Cost: KES {product.cost.toFixed(2)}
                      </p>
                    )} */}
                  </td>

                  {/* Stock */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <p
                        className={`font-semibold ${
                          isLowStock
                            ? "text-error-600"
                            : needsReorder
                            ? "text-warning-600"
                            : "text-success-600"
                        }`}
                      >
                        {product.stock_quantity} {product.unit || "pcs"}
                      </p>
                       <p className="text-xs text-muted-foreground">
                         Reorder at: {product.reorder_level}
                       </p>
                      {needsReorder && (
                         <span className="inline-block bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300 px-2 py-0.5 rounded text-xs font-medium">
                          ⚠️ Low Stock
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                         product.is_active
                           ? "bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-300"
                           : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(product)}
                            className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded font-medium text-sm transition"
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(product)}
                            className="px-3 py-1 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded font-medium text-sm transition"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t bg-muted/50 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page <span className="font-semibold">{currentPage}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 bg-muted hover:bg-muted/80 disabled:opacity-50 text-foreground rounded font-medium transition"
            >
              ← Previous
            </button>
            <button
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 bg-muted hover:bg-muted/80 disabled:opacity-50 text-foreground rounded font-medium transition"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
