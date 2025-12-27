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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Product Management
              </h1>
              <p className="mt-1 text-muted-foreground">
                Manage your product inventory
              </p>
            </div>

            {canEdit && (
              <div className="flex gap-3">
                <button
                  onClick={isListening ? stopScanning : startScanning}
                   className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                     isListening
                       ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20"
                       : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                   }`}
                >
                  <span className="flex items-center gap-2">
                    {isListening ? "⊚ Stop Scanning" : "📱 Start Scanner"}
                  </span>
                </button>
                <button
                  onClick={handleCreateProduct}
                  className="px-4 py-2 bg-success-600 hover:bg-success-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg shadow-success-600/20"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">+</span>
                    Add Product
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border border-border hover:shadow-lg transition-all duration-200 animate-slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{total}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary text-xl">📦</span>
                </div>
              </div>
            </div>
            <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border border-border hover:shadow-lg transition-all duration-200 animate-slide-up" style={{ animationDelay: '50ms' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {categories.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
                  <span className="text-info text-xl">🏷️</span>
                </div>
              </div>
            </div>
            <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border border-border hover:shadow-lg transition-all duration-200 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold text-warning-600 mt-1">
                    {products.filter(productsAPI.needsReorder).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <span className="text-warning text-xl">⚠️</span>
                </div>
              </div>
            </div>
            <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md border border-border hover:shadow-lg transition-all duration-200 animate-slide-up" style={{ animationDelay: '150ms' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                  <p className="text-2xl font-bold text-muted-foreground mt-1">
                    {products.filter((p) => !p.is_active).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground text-xl">🔒</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive-foreground">{error}</p>
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
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card text-card-foreground rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-foreground mb-2">
              Delete Product?
            </h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete{" "}
              <strong>{deletingProduct.name}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingProduct(null)}
                disabled={loading}
                className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg font-medium transition disabled:opacity-50"
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
