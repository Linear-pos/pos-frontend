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
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600 mb-4">No products found</p>
        <p className="text-sm text-gray-500">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Product
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Category
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                Price
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                Stock
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                Status
              </th>
              {(onEdit || onDelete) && (
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
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
                <tr key={product.id} className="hover:bg-gray-50 transition">
                  {/* Product Name */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.name}
                        {product.unit_size && (
                          <span className="text-sm text-gray-500 ml-2">
                            ({product.unit_size} {product.unit})
                          </span>
                        )}
                      </p>
                      {product.description && (
                        <p className="text-sm text-gray-500 truncate">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="px-6 py-4">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-700">
                      {product.sku}
                    </code>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {product.category || "Uncategorized"}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 text-right">
                    <p className="font-semibold text-gray-900">
                      {new Intl.NumberFormat("en-KE", {
                        style: "currency",
                        currency: "KES",
                      }).format(product.price)}
                    </p>
                    {/* {product.cost && (
                      <p className="text-xs text-gray-500">
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
                            ? "text-red-600"
                            : needsReorder
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        {product.stock_quantity} {product.unit || "pcs"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Reorder at: {product.reorder_level}
                      </p>
                      {needsReorder && (
                        <span className="inline-block bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-medium">
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
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
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
                            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-medium text-sm transition"
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(product)}
                            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded font-medium text-sm transition"
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
        <div className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page <span className="font-semibold">{currentPage}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-900 rounded font-medium transition"
            >
              ← Previous
            </button>
            <button
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-900 rounded font-medium transition"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
