import { useState, useEffect } from 'react';
import { Search, Package, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { productsAPI, type Product, type ProductsQueryParams } from '../api/products.api';
import { categoriesAPI, type Category } from '../api/categories.api';
import { ProductTable } from '../components/ProductTable';
import { CreateProductModal } from '../components/CreateProductModal';
import { CategoryManager } from '../components/CategoryManager';
import { BulkUploadModal } from '../components/BulkUploadModal';

export const ProductCatalog = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
    const [showCategoryManager, setShowCategoryManager] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('active');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);

        try {
            const params: ProductsQueryParams = {
                page: currentPage,
                limit: 20,
            };

            if (categoryFilter !== 'all') {
                params.category = categoryFilter;
            }

            if (statusFilter === 'active') {
                params.is_active = true;
            } else if (statusFilter === 'inactive') {
                params.is_active = false;
            }

            if (searchQuery) {
                params.search = searchQuery;
            }

            const response = await productsAPI.getProducts(params);
            setProducts(response.data);
            setTotalPages(response.pagination.pages);
            setTotalCount(response.pagination.total);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await categoriesAPI.getCategories();
            setCategories(data);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [currentPage, categoryFilter, statusFilter]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchProducts();
    };

    const handleProductCreated = () => {
        setShowCreateModal(false);
        fetchProducts();
        fetchCategories(); // Refresh categories in case a new one was created
    };

    const handleProductUpdated = () => {
        fetchProducts();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-primary">Product Catalog</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowCategoryManager(!showCategoryManager)}>
                        Manage Categories
                    </Button>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Package className="h-4 w-4 mr-2" />
                        Add Product
                    </Button>
                    <Button variant="secondary" onClick={() => setShowBulkUploadModal(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Bulk Upload
                    </Button>
                </div>
            </div>

            {/* Category Manager */}
            {showCategoryManager && (
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <CategoryManager />
                    </CardContent>
                </Card>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Products
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{totalCount}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Products
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-success-600">
                            {products.filter(p => p.isActive).length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-info-600">
                            {categories.length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                                placeholder="Search products..."
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
                                    <SelectItem key={cat.id} value={cat.name}>
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

                        <Button onClick={handleSearch} variant="outline">
                            Search
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-error-600">{error}</p>
                            <Button onClick={fetchProducts} className="mt-4">
                                Try Again
                            </Button>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-neutral-500">No products found</p>
                        </div>
                    ) : (
                        <ProductTable
                            products={products}
                            categories={categories}
                            onProductUpdated={handleProductUpdated}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
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
                onUploadComplete={handleProductCreated}
            />
        </div>
    );
};

export default ProductCatalog;
