import { useState, useEffect, useCallback } from 'react';
import { Search, Package, Upload, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { productsAPI, type Product, type ProductsQueryParams } from '../api/products.api';
import { categoriesAPI, type Category } from '../api/categories.api';
import { ProductTable } from '../components/ProductTable';
import { CreateProductModal } from '../components/CreateProductModal';
import { CategoryManager } from '../components/CategoryManager';
import { BulkUploadModal } from '../components/BulkUploadModal';

const ITEMS_PER_PAGE = 20;

export const ProductCatalog = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
    const [showCategoryManager, setShowCategoryManager] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('active');
    const [sortBy, setSortBy] = useState<NonNullable<ProductsQueryParams['sort_by']>>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [activeCount, setActiveCount] = useState(0);

    const fetchProducts = useCallback(async () => {
        try {
            const params: ProductsQueryParams = {
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                sort_by: sortBy,
                sort_order: sortOrder,
            };

            if (categoryFilter !== 'all') {
                const selectedCategory = categories.find(cat => cat.name === categoryFilter);
                if (selectedCategory) {
                    params.category = selectedCategory.id;
                }
            }

            if (statusFilter === 'active') {
                params.is_active = true;
            } else if (statusFilter === 'inactive') {
                params.is_active = false;
            }

            if (searchQuery.trim()) {
                params.search = searchQuery.trim();
            }

            const response = await productsAPI.getProducts(params);
            setProducts(response.data);
            setTotalPages(response.pagination.pages);
            setTotalCount(response.pagination.total);

            // Update active count
            const activeProducts = response.data.filter(p => p.is_active);
            setActiveCount(activeProducts.length);

            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch products');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentPage, categoryFilter, statusFilter, searchQuery, sortBy, sortOrder, categories]);

    const fetchCategories = useCallback(async () => {
        try {
            console.log('[ProductCatalog] Fetching categories...');
            const data = await categoriesAPI.getCategories();
            console.log('[ProductCatalog] Categories fetched:', data);
            setCategories(data);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchProducts();
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchProducts();
    };

    const handleProductCreated = () => {
        setShowCreateModal(false);
        fetchProducts();
        fetchCategories(); // Refresh categories in case a new one was created
    };

    const handleBulkUploadComplete = () => {
        setShowBulkUploadModal(false);
        fetchProducts();
        fetchCategories();
    };

    const handleProductUpdated = () => {
        fetchProducts();
    };

    const handleCategoryManagerClose = () => {
        setShowCategoryManager(false);
        fetchCategories(); // Refresh categories after managing them
        fetchProducts(); // Refresh products in case categories affected them
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setCategoryFilter('all');
        setStatusFilter('active');
        setSortBy('name');
        setSortOrder('asc');
        setCurrentPage(1);
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field as any);
            setSortOrder('asc');
        }
        setCurrentPage(1);
    };

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch();
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    // Calculate some stats
    const lowStockProducts = products.filter(p => p.stock_quantity !== undefined && p.stock_quantity < 10).length;
    const outOfStockProducts = products.filter(p => p.stock_quantity !== undefined && p.stock_quantity === 0).length;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Product Catalog</h1>
                    <p className="text-muted-foreground mt-1">Manage your products and inventory</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowCategoryManager(!showCategoryManager)}
                        className="gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        {showCategoryManager ? 'Hide Categories' : 'Manage Categories'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                        <Package className="h-4 w-4" />
                        Add Product
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowBulkUploadModal(true)}
                        className="gap-2"
                    >
                        <Upload className="h-4 w-4" />
                        Bulk Upload
                    </Button>
                </div>
            </div>

            {/* Category Manager */}
            {showCategoryManager && (
                <Card className="border-2 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Category Manager</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowCategoryManager(false)}
                            >
                                Hide
                            </Button>
                        </CardTitle>
                        <CardDescription>Create, edit, and organize product categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CategoryManager onClose={handleCategoryManagerClose} />
                    </CardContent>
                </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Products
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">{totalCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {activeCount} active • {totalCount - activeCount} inactive
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Stock Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">{lowStockProducts}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Low stock • {outOfStockProducts} out of stock
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{categories.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {categories.slice(0, 3).map(cat => cat.name).join(', ')}
                            {categories.length > 3 && '...'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Inventory Value
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                            ${products.reduce((sum, p) => sum + (p.price * (p.stock_quantity || 0)), 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total value of current stock
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                    <Input
                                        placeholder="Search products by name, SKU, or description..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-10"
                                    />
                                </div>

                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name">Name</SelectItem>
                                        <SelectItem value="price">Price</SelectItem>
                                        <SelectItem value="sku">SKU</SelectItem>
                                        <SelectItem value="stock_quantity">Stock Quantity</SelectItem>
                                        <SelectItem value="created_at">Date Added</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSearch}
                                    className="gap-2"
                                >
                                    <Search className="h-4 w-4" />
                                    Search
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleClearFilters}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </div>

                        {/* Active Filters */}
                        {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'active' || sortBy !== 'name') && (
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                                <span className="text-sm text-muted-foreground">Active filters:</span>
                                {searchQuery && (
                                    <Badge variant="secondary" className="gap-1">
                                        Search: "{searchQuery}"
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-3 w-3 ml-1"
                                            onClick={() => setSearchQuery('')}
                                        >
                                            ×
                                        </Button>
                                    </Badge>
                                )}
                                {categoryFilter !== 'all' && (
                                    <Badge variant="secondary" className="gap-1">
                                        Category: {categories.find(c => c.id === categoryFilter)?.name || 'Unknown'}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-3 w-3 ml-1"
                                            onClick={() => setCategoryFilter('all')}
                                        >
                                            ×
                                        </Button>
                                    </Badge>
                                )}
                                {statusFilter !== 'active' && (
                                    <Badge variant="secondary" className="gap-1">
                                        Status: {statusFilter}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-3 w-3 ml-1"
                                            onClick={() => setStatusFilter('active')}
                                        >
                                            ×
                                        </Button>
                                    </Badge>
                                )}
                                {sortBy !== 'name' && (
                                    <Badge variant="secondary" className="gap-1">
                                        Sort: {sortBy} ({sortOrder})
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-3 w-3 ml-1"
                                            onClick={() => {
                                                setSortBy('name');
                                                setSortOrder('asc');
                                            }}
                                        >
                                            ×
                                        </Button>
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
                <CardContent className="p-0">
                    {loading && !refreshing ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                                <p className="text-muted-foreground">Loading products...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 space-y-4">
                            <div className="text-destructive-foreground bg-destructive/10 inline-flex items-center justify-center h-12 w-12 rounded-full">
                                <Package className="h-6 w-6" />
                            </div>
                            <p className="text-lg font-medium">{error}</p>
                            <Button onClick={fetchProducts} variant="outline">
                                Try Again
                            </Button>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 space-y-4">
                            <div className="text-muted-foreground inline-flex items-center justify-center h-12 w-12 rounded-full border">
                                <Package className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-lg font-medium text-muted-foreground">No products found</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {searchQuery || categoryFilter !== 'all' || statusFilter !== 'active'
                                        ? 'Try adjusting your filters or search terms'
                                        : 'Get started by adding your first product'}
                                </p>
                            </div>
                            <div className="flex gap-2 justify-center">
                                <Button onClick={() => setShowCreateModal(true)}>
                                    Add Product
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowBulkUploadModal(true)}
                                >
                                    Bulk Upload
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <ProductTable
                            products={products}
                            categories={categories}
                            onProductUpdated={handleProductUpdated}
                            onSort={handleSort}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                        {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} products
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(pageNum)}
                                        className="w-10"
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Create Product Modal */}
            <CreateProductModal
                open={showCreateModal}
                categories={categories}
                onClose={() => setShowCreateModal(false)}
                onProductCreated={handleProductCreated}
            />

            {/* Bulk Upload Modal */}
            <BulkUploadModal
                open={showBulkUploadModal}
                onClose={() => setShowBulkUploadModal(false)}
                onUploadComplete={handleBulkUploadComplete}
            />
        </div>
    );
};

export default ProductCatalog;