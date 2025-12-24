import { useState, useCallback, useEffect } from "react";
import { productsAPI } from "../api/products.api";
import type { Product } from "../../../types/product";
import { ProductTable } from "../components/ProductTable";
import { ProductForm } from "../components/ProductForm";
import { ProductSearch } from "../components/ProductSearch";
import { useBarcodeScanner } from "../../../hooks/useBarcodeScanner";
import { useAuth } from "../../../hooks/useAuth";

type SortBy = "name" | "sku" | "price" | "stock_quantity" | "created_at";

export const Products = () => {
  const { hasRole } = useAuth();
  const canEdit = hasRole(["SYSTEM_OWNER", "BRANCH_MANAGER"]);

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Barcode scanner
  const {
    isListening,
    start: startScanning,
    stop: stopScanning,
  } = useBarcodeScanner(handleBarcodeScanned, handleScanError);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productsAPI.getProducts({
        page: currentPage,
        per_page: 20,
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        is_active: showInactive ? undefined : true,
        low_stock: lowStockOnly || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      setProducts(response.data);
      setTotalPages(response.last_page);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    searchQuery,
    selectedCategory,
    showInactive,
    lowStockOnly,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCategory,
    showInactive,
    lowStockOnly,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handlers
  function handleBarcodeScanned(barcode: string) {
    // Search for product by barcode (SKU for now)
    setSearchQuery(barcode);
  }

  function handleScanError(error: Error) {
    setError(`Barcode scan error: ${error.message}`);
  }

  async function handleCreateProduct() {
    setEditingProduct(null);
    setShowForm(true);
  }

  async function handleEditProduct(product: Product) {
    setEditingProduct(product);
    setShowForm(true);
  }

  async function handleDeleteProduct(product: Product) {
    setDeletingProduct(product);
  }

  async function confirmDelete() {
    if (!deletingProduct) return;

    try {
      setLoading(true);
      await productsAPI.deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
      await fetchProducts();
    } catch (err: any) {
      setError(err.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  }

  async function handleFormSubmit(data: any) {
    try {
      setLoading(true);

      if (editingProduct) {
        await productsAPI.updateProduct(editingProduct.id, data);
      } else {
        await productsAPI.createProduct(data);
      }

      setShowForm(false);
      setEditingProduct(null);
      await fetchProducts();
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  }

  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ] as string[];

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Product Management
              </h1>
              <p className="mt-1 text-neutral-600">
                Manage your product inventory
              </p>
            </div>

            {canEdit && (
              <div className="flex gap-3">
                <button
                  onClick={isListening ? stopScanning : startScanning}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    isListening
                      ? "bg-error-600 hover:bg-error-700 text-white"
                      : "bg-primary-600 hover:bg-primary-700 text-white"
                  }`}
                >
                  {isListening ? "⊚ Stop Scanning" : "📱 Start Scanner"}
                </button>
                <button
                  onClick={handleCreateProduct}
                  className="px-4 py-2 bg-success-600 hover:bg-success-700 text-white rounded-lg font-medium transition"
                >
                  + Add Product
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-neutral-600">Total Products</p>
              <p className="text-2xl font-bold text-neutral-900">{total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-neutral-600">Categories</p>
              <p className="text-2xl font-bold text-neutral-900">
                {categories.length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-neutral-600">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600">
                {products.filter(productsAPI.needsReorder).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-neutral-600">Inactive</p>
              <p className="text-2xl font-bold text-neutral-600">
                {products.filter((p) => !p.is_active).length}
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-error-50 border border-error-200 rounded-lg">
            <p className="text-error-700">{error}</p>
          </div>
        )}

        {/* Search and Filter */}
        <ProductSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          showInactive={showInactive}
          onShowInactiveChange={setShowInactive}
          lowStockOnly={lowStockOnly}
          onLowStockChange={setLowStockOnly}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          isScanning={isListening}
        />

        {/* Products Table */}
        <ProductTable
          products={products}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onEdit={canEdit ? handleEditProduct : undefined}
          onDelete={canEdit ? handleDeleteProduct : undefined}
        />
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          loading={loading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-2">
              Delete Product?
            </h3>
            <p className="text-neutral-600 mb-4">
              Are you sure you want to delete{" "}
              <strong>{deletingProduct.name}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingProduct(null)}
                disabled={loading}
                className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-900 rounded-lg font-medium transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="px-4 py-2 bg-error-600 hover:bg-error-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
