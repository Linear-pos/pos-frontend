import { useState, useCallback, useEffect } from "react";
import Papa from "papaparse";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { productsAPI } from "../api/products.api";
import type { Product } from "../../../types/product";
import { ProductTable } from "../components/ProductTable";
import { ProductForm } from "../components/ProductForm";
import { ProductSearch } from "../components/ProductSearch";
import { useAuth } from "../../../hooks/useAuth";

type SortBy = "name" | "sku" | "price" | "stock_quantity" | "created_at";

type ImportProductsResult = {
  success: boolean;
  imported?: number;
  failed?: number;
  error?: string;
};

type ImportProductPayload = {
  id: string;
  tenant_id?: string;
  name: string;
  sku?: string;
  description?: string;
  category?: string;
  price: number;
  cost?: number;
  stock_quantity: number;
  reorder_level: number;
  unit: string;
  unit_size?: number;
  is_active: boolean;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export const Products = () => {
  const { hasRole, user, token } = useAuth();
  const canEdit = hasRole(["SYSTEM_ADMIN", "BRANCH_MANAGER"]);
  const currentTenantId = user?.tenant_id;

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Search and filter
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

  const [csvPreviewOpen, setCsvPreviewOpen] = useState(false);
  const [csvPreviewProducts, setCsvPreviewProducts] = useState<ImportProductPayload[]>([]);

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

  // CRUD handlers
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
  };

  const confirmDelete = async () => {
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
  };

  const handleFormSubmit = async (data: any) => {
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
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous state
    setError(null);
    setLoading(true);

    try {
      // Parse CSV
      const results = await new Promise<
        Papa.ParseResult<Record<string, unknown>>
      >((resolve, reject) => {
        Papa.parse<Record<string, unknown>>(file, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: resolve,
          error: reject,
        });
      });

      // Map and validate products
      const mappedProducts = results.data.map((row, index) => {
        const r = row as Record<string, unknown>;

        const name = r.name;
        const price = r.price;

        // Basic validation
        if (name == null || name === "" || price == null || price === "") {
          throw new Error(`Row ${index + 2}: Missing required fields (name, price)`);
        }

        const parsedPrice = Number(price);
        if (!Number.isFinite(parsedPrice)) {
          throw new Error(`Row ${index + 2}: Invalid price`);
        }

        const tenantId =
          (r.tenant_id != null ? String(r.tenant_id) : undefined) ??
          (r.tenantId != null ? String(r.tenantId) : undefined) ??
          currentTenantId;

        return {
          id: (r.id ? String(r.id) : `temp-${Date.now()}-${index}`),
          tenant_id: tenantId,
          name: String(name).trim(),
          sku: r.sku ? String(r.sku).trim() : undefined,
          description: r.description ? String(r.description).trim() : undefined,
          category: r.category ? String(r.category).trim() : undefined,
          price: parsedPrice,
          cost: r.cost != null && r.cost !== "" ? Number(r.cost) : undefined,
          stock_quantity:
            r.stock_quantity != null && r.stock_quantity !== ""
              ? Number(r.stock_quantity)
              : (r.stockQuantity != null && r.stockQuantity !== ""
                  ? Number(r.stockQuantity)
                  : 0),
          reorder_level:
            r.reorder_level != null && r.reorder_level !== ""
              ? Number(r.reorder_level)
              : (r.reorderLevel != null && r.reorderLevel !== ""
                  ? Number(r.reorderLevel)
                  : 10),
          unit: r.unit ? String(r.unit).trim() : "pcs",
          unit_size:
            r.unit_size != null && r.unit_size !== ""
              ? Number(r.unit_size)
              : (r.unitSize != null && r.unitSize !== "" ? Number(r.unitSize) : undefined),
          is_active:
            r.is_active !== undefined
              ? Boolean(r.is_active)
              : (r.isActive !== undefined ? Boolean(r.isActive) : true),
          image_url:
            r.image_url ? String(r.image_url).trim() : (r.imageUrl ? String(r.imageUrl).trim() : undefined),
          created_at: r.created_at ? String(r.created_at) : undefined,
          updated_at: r.updated_at ? String(r.updated_at) : undefined,
          deleted_at:
            r.deleted_at !== undefined ? (r.deleted_at === "" ? null : String(r.deleted_at)) : undefined,
        } as ImportProductPayload;
      });

      setCsvPreviewProducts(mappedProducts);
      setCsvPreviewOpen(true);

    } catch (err) {
      console.error("Import error:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to import products");
      toast.error("Import Failed", {
        description: message || "An error occurred during import",
      });
    } finally {
      setLoading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const confirmCSVImport = async () => {
    if (!csvPreviewProducts.length) return;

    setError(null);
    setLoading(true);

    try {
      if (!window.electron?.products) {
        throw new Error("Electron bridge is not available. Run this in the Electron app.");
      }

      const BATCH_SIZE = 20;
      let importedCount = 0;

      for (let i = 0; i < csvPreviewProducts.length; i += BATCH_SIZE) {
        const batch = csvPreviewProducts.slice(i, i + BATCH_SIZE);

        const result = (await window.electron.products.import({
          products: batch,
          token,
        })) as ImportProductsResult;
        if (!result.success) {
          throw new Error(result.error || "Import failed");
        }

        importedCount += result.imported || 0;
      }

      setCsvPreviewOpen(false);
      setCsvPreviewProducts([]);
      await fetchProducts();

      toast.success("Import Complete", {
        description: `Successfully imported ${importedCount} products`,
      });
    } catch (err) {
      console.error("Import error:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to import products");
      toast.error("Import Failed", {
        description: message || "An error occurred during import",
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ] as string[];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Product Management</h1>
              <p className="mt-1 text-muted-foreground">
                Manage your product inventory
              </p>
            </div>

            {canEdit && (
              <div className="flex gap-3">
                <label className="px-4 py-3 bg-secondary rounded-lg font-semibold flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import Products as CSV
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleCSVImport}
                  />
                </label>

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowForm(true);
                  }}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold"
                >
                  + Add Product
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border rounded-lg">
            {error}
          </div>
        )}

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
          isScanning={false}
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
      {
        showForm && (
          <ProductForm
            product={editingProduct}
            onSubmit={handleFormSubmit}
            onClose={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
            loading={loading}
          />
        )
      }

      {/* Delete Confirmation Modal */}
      {
        deletingProduct && (
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
        )
      }

      {
        csvPreviewOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card text-card-foreground rounded-lg shadow-xl max-w-4xl w-full p-6">
              <h3 className="text-lg font-bold text-foreground mb-2">
                Preview CSV Import
              </h3>
              <p className="text-muted-foreground mb-4">
                {csvPreviewProducts.length} products will be imported. Please review before confirming.
              </p>

              <div className="border border-border rounded-lg overflow-auto max-h-[50vh]">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="text-left p-3 font-semibold">Tenant</th>
                      <th className="text-left p-3 font-semibold">Name</th>
                      <th className="text-left p-3 font-semibold">SKU</th>
                      <th className="text-left p-3 font-semibold">Category</th>
                      <th className="text-right p-3 font-semibold">Price</th>
                      <th className="text-right p-3 font-semibold">Stock</th>
                      <th className="text-right p-3 font-semibold">Reorder</th>
                      <th className="text-left p-3 font-semibold">Unit</th>
                      <th className="text-center p-3 font-semibold">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreviewProducts.slice(0, 15).map((p) => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="p-3">{p.tenant_id || "-"}</td>
                        <td className="p-3">{p.name}</td>
                        <td className="p-3">{p.sku || "-"}</td>
                        <td className="p-3">{p.category || "-"}</td>
                        <td className="p-3 text-right">{Number(p.price).toFixed(2)}</td>
                        <td className="p-3 text-right">{p.stock_quantity}</td>
                        <td className="p-3 text-right">{p.reorder_level}</td>
                        <td className="p-3">{p.unit}{p.unit_size != null ? ` (${p.unit_size})` : ""}</td>
                        <td className="p-3 text-center">{p.is_active ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {csvPreviewProducts.length > 15 && (
                <p className="text-muted-foreground text-sm mt-3">
                  Showing first 15 rows. {csvPreviewProducts.length - 15} more not shown.
                </p>
              )}

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => {
                    if (loading) return;
                    setCsvPreviewOpen(false);
                    setCsvPreviewProducts([]);
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCSVImport}
                  disabled={loading}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition disabled:opacity-50"
                >
                  {loading ? "Importing..." : "Confirm Import"}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Products;
