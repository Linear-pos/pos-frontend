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
    <div className="bg-white rounded-lg shadow p-4 mb-6 space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
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
                  ? "bg-info-50 border-primary-300 text-primary-900"
                  : "border-neutral-300 bg-white"
              } focus:outline-none focus:ring-2 focus:ring-primary-500`}
            />
            <span className="absolute right-3 top-10 text-neutral-400">🔍</span>
          </div>
          {isScanning && (
            <p className="mt-1 text-sm text-primary-600">
              📱 Barcode scanner active...
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Category
          </label>
          <select
            value={selectedCategory || ""}
            onChange={(e) => onCategoryChange(e.target.value || null)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortBy)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Order
          </label>
          <select
            value={sortOrder}
            onChange={(e) =>
              onSortOrderChange(e.target.value as "asc" | "desc")
            }
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              className="w-4 h-4 border-neutral-300 rounded text-primary-600 focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-neutral-700">
              Low Stock Only
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => onShowInactiveChange(e.target.checked)}
              className="w-4 h-4 border-neutral-300 rounded text-primary-600 focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-neutral-700">
              Show Inactive
            </span>
          </label>
        </div>
      </div>

      {/* Active Filters Badge */}
      {(searchQuery || selectedCategory || lowStockOnly || showInactive) && (
        <div className="flex items-center flex-wrap gap-2 pt-2 border-t">
          <span className="text-sm text-neutral-600">Active filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-2 bg-info-100 text-primary-700 px-3 py-1 rounded-full text-sm">
              {searchQuery}
              <button
                onClick={() => onSearchChange("")}
                className="text-primary-600 hover:text-primary-700 font-bold"
              >
                ✕
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              {selectedCategory}
              <button
                onClick={() => onCategoryChange(null)}
                className="text-purple-600 hover:text-purple-800 font-bold"
              >
                ✕
              </button>
            </span>
          )}
          {lowStockOnly && (
            <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
              Low Stock
              <button
                onClick={() => onLowStockChange(false)}
                className="text-orange-600 hover:text-orange-800 font-bold"
              >
                ✕
              </button>
            </span>
          )}
          {showInactive && (
            <span className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-800 px-3 py-1 rounded-full text-sm">
              Showing Inactive
              <button
                onClick={() => onShowInactiveChange(false)}
                className="text-neutral-600 hover:text-neutral-800 font-bold"
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
