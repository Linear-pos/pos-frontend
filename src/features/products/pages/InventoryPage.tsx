import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeftRight, AlertTriangle } from "lucide-react";
import { inventoryAPI } from "../api/inventory.api";
import type { InventoryLog } from "../api/inventory.api";
import { StockAdjustmentForm } from "../inventory/StockAdjustmentForm";
import { InventoryMovementsTable } from "../inventory/InventoryMovementsTable";
import { LowStockAlertsTable } from "../inventory/LowStockAlertsTable";
import type { Product } from "../../../types/product";

export const InventoryPage = () => {
    // Modal State
    const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
    const [adjustmentType, setAdjustmentType] = useState<"receive" | "adjustment">("receive");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Data State
    const [movements, setMovements] = useState<InventoryLog[]>([]);
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    const [summary, setSummary] = useState<any>(null);

    // Filters
    const [filterType, setFilterType] = useState<string>("all");
    const [dateRange, setDateRange] = useState<{ from?: Date, to?: Date }>({});

    // Loading State
    const [loading, setLoading] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [logsRes, lowStockRes, summaryRes] = await Promise.all([
                inventoryAPI.getLogs({
                    page,
                    limit: 20,
                    type: filterType === 'all' ? undefined : filterType,
                    // If we had product search for logs, we'd pass it here, 
                    // but backend supports productId, not name search on logs directly yet?
                    // Actually, backend querySchema has productId. 
                    // To support text search on logs, backend needs update or we first find product IDs.
                    // For now, let's assume filtering by type is primary.
                    startDate: dateRange.from?.toISOString(),
                    endDate: dateRange.to?.toISOString()
                }),
                inventoryAPI.getLowStockProducts(),
                inventoryAPI.getSummary()
            ]);

            setMovements(logsRes.data);
            setTotalPages(logsRes.pagination.pages);
            setLowStockProducts(lowStockRes);
            setSummary(summaryRes);
        } catch (error) {
            console.error("Failed to fetch inventory data", error);
        } finally {
            setLoading(false);
        }
    }, [page, filterType, dateRange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSuccess = async () => {
        await fetchData();
    };

    const openReceive = (product?: Product) => {
        setAdjustmentType("receive");
        if (product) {
            setSelectedProduct(product);
        }
        setShowAdjustmentForm(true);
    };

    const openAdjustment = () => {
        setAdjustmentType("adjustment");
        setShowAdjustmentForm(true);
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
                    <p className="text-muted-foreground">Track stock levels, movements, and adjustments.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => openReceive()} className="bg-green-600 hover:bg-green-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Receive Stock
                    </Button>
                    <Button variant="outline" onClick={openAdjustment}>
                        <ArrowLeftRight className="mr-2 h-4 w-4" />
                        Stock Adjustment
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
                        <span className="text-2xl text-muted-foreground">$</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(summary?.totalStockValue || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">Based on product price</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
                        <span className="text-2xl text-muted-foreground">#</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{summary?.totalItems || 0}</div>
                        <p className="text-xs text-muted-foreground">Items across {summary?.totalProducts || 0} products</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{summary?.lowStockItems || 0}</div>
                        <p className="text-xs text-muted-foreground">Products below reorder level</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{summary?.outOfStockItems || 0}</div>
                        <p className="text-xs text-muted-foreground">Products with 0 stock</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <div className="flex justify-between items-center">
                    <TabsList>
                        <TabsTrigger value="overview">Overview & History</TabsTrigger>
                        <TabsTrigger value="alerts">
                            Low Stock Alerts
                            {lowStockProducts.length > 0 && (
                                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                                    {lowStockProducts.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Stock Movements History</CardTitle>
                                    <CardDescription>
                                        Recent transactions including sales, restocking, and adjustments.
                                    </CardDescription>
                                </div>
                                {/* Filters */}
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="date"
                                        className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="From"
                                        onChange={(e) => {
                                            const date = e.target.value ? new Date(e.target.value) : undefined;
                                            setDateRange(prev => ({ ...prev, from: date }));
                                        }}
                                    />
                                    <span className="text-muted-foreground">-</span>
                                    <input
                                        type="date"
                                        className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="To"
                                        onChange={(e) => {
                                            const date = e.target.value ? new Date(e.target.value) : undefined;
                                            setDateRange(prev => ({ ...prev, to: date }));
                                        }}
                                    />
                                    <select
                                        className="h-9 w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        value={filterType}
                                        onChange={(e) => {
                                            setFilterType(e.target.value);
                                            setPage(1);
                                        }}
                                    >
                                        <option value="all">All Types</option>
                                        <option value="sale">Sales</option>
                                        <option value="restock">Restock</option>
                                        <option value="adjustment">Adjustments</option>
                                    </select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <InventoryMovementsTable
                                logs={movements}
                                loading={loading}
                                page={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Low Stock Alerts</CardTitle>
                            <CardDescription>
                                These products are running low and need restocking.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LowStockAlertsTable
                                products={lowStockProducts}
                                onRestock={(product) => {
                                    openReceive(product);
                                }}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Adjustment Modal */}
            {showAdjustmentForm && (
                <StockAdjustmentForm
                    type={adjustmentType}
                    initialProduct={selectedProduct} // Pass the selected product
                    onClose={() => {
                        setShowAdjustmentForm(false);
                        setSelectedProduct(null); // Clear selection on close
                    }}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

export default InventoryPage;
