type SortBy = "name" | "sku" | "price" | "stock_quantity" | "created_at";

interface ProductSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  categories: string[];
  showInactive: boolean;
  onShowInactiveChange: (show: boolean) => void;
  lowStockOnly: boolean;
  onLowStockChange: (low: boolean) => void;
  sortBy: SortBy;
  onSortByChange: (sort: SortBy) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (order: "asc" | "desc") => void;
  isScanning: boolean;
}

export const ProductSearch = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  showInactive,
  onShowInactiveChange,
  lowStockOnly,
  onLowStockChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  isScanning,
}: ProductSearchProps) => {
  return (
    <div className="bg-card text-card-foreground rounded-lg shadow p-4 mb-6 space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-2">
            Search Products
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, SKU, or description..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={isScanning}
              className={`w-full px-4 py-2 border rounded-lg ${
                isScanning
                  ? "bg-primary/10 border-primary text-primary"
                  : "border-input bg-background"
              } focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            <span className="absolute right-3 top-10 text-muted-foreground">🔍</span>
          </div>
          {isScanning && (
            <p className="mt-1 text-sm text-primary">
              📱 Barcode scanner active...
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Category
          </label>
          <select
            value={selectedCategory || ""}
            onChange={(e) => onCategoryChange(e.target.value || null)}
            className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortBy)}
            className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="name">Name</option>
            <option value="sku">SKU</option>
            <option value="price">Price</option>
            <option value="stock_quantity">Stock</option>
            <option value="created_at">Date Added</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Order
          </label>
          <select
            value={sortOrder}
            onChange={(e) =>
              onSortOrderChange(e.target.value as "asc" | "desc")
            }
            className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="asc">Ascending (↑)</option>
            <option value="desc">Descending (↓)</option>
          </select>
        </div>

        {/* Toggle Filters */}
        <div className="flex flex-col justify-end gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => onLowStockChange(e.target.checked)}
              className="w-4 h-4 border-input rounded text-primary focus:ring-2 focus:ring-primary"
            />
            <span className="text-sm font-medium text-foreground">
              Low Stock Only
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => onShowInactiveChange(e.target.checked)}
              className="w-4 h-4 border-input rounded text-primary focus:ring-2 focus:ring-primary"
            />
            <span className="text-sm font-medium text-foreground">
              Show Inactive
            </span>
          </label>
        </div>
      </div>

      {/* Active Filters Badge */}
      {(searchQuery || selectedCategory || lowStockOnly || showInactive) && (
        <div className="flex items-center flex-wrap gap-2 pt-2 border-t">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
              {searchQuery}
              <button
                onClick={() => onSearchChange("")}
                className="text-primary hover:text-primary/80 font-bold"
              >
                ✕
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center gap-2 bg-info-100 text-info-800 dark:bg-info-900/20 dark:text-info-300 px-3 py-1 rounded-full text-sm">
              {selectedCategory}
              <button
                onClick={() => onCategoryChange(null)}
                className="text-info-600 hover:text-info-800 dark:text-info-400 dark:hover:text-info-300 font-bold"
              >
                ✕
              </button>
            </span>
          )}
          {lowStockOnly && (
            <span className="inline-flex items-center gap-2 bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300 px-3 py-1 rounded-full text-sm">
              Low Stock
              <button
                onClick={() => onLowStockChange(false)}
                className="text-warning-600 hover:text-warning-800 dark:text-warning-400 dark:hover:text-warning-300 font-bold"
              >
                ✕
              </button>
            </span>
          )}
          {showInactive && (
            <span className="inline-flex items-center gap-2 bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">
              Showing Inactive
              <button
                onClick={() => onShowInactiveChange(false)}
                className="text-muted-foreground hover:text-foreground font-bold"
              >
                ✕
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
