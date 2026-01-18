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

    // Data State
    const [movements, setMovements] = useState<InventoryLog[]>([]);
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

    // Loading State
    const [loadingMovements, setLoadingMovements] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchMovements = useCallback(async () => {
        try {
            setLoadingMovements(true);
            const response = await inventoryAPI.getLogs({ page, limit: 20 });
            setMovements(response.data);
            setTotalPages(response.pagination.pages);
        } catch (error) {
            console.error("Failed to fetch inventory movements", error);
        } finally {
            setLoadingMovements(false);
        }
    }, [page]);

    const fetchLowStock = useCallback(async () => {
        try {
            const data = await inventoryAPI.getLowStockProducts();
            setLowStockProducts(data);
        } catch (error) {
            console.error("Failed to fetch low stock products", error);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchMovements();
        fetchLowStock();
    }, [fetchMovements, fetchLowStock]);

    const handleSuccess = async () => {
        // Refresh data after successful adjustment
        await Promise.all([fetchMovements(), fetchLowStock()]);
    };

    const openReceive = () => {
        setAdjustmentType("receive");
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
                    <Button onClick={openReceive} className="bg-green-600 hover:bg-green-700">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lowStockProducts.length}</div>
                        <p className="text-xs text-muted-foreground">Products below reorder level</p>
                    </CardContent>
                </Card>
                {/* Additional stats could go here */}
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
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

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock Movements History</CardTitle>
                            <CardDescription>
                                Recent transactions including sales, restocking, and adjustments.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <InventoryMovementsTable
                                logs={movements}
                                loading={loadingMovements}
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
                                onRestock={() => {
                                    // Pre-fill form? For now just open receive
                                    // Ideally pass the product to the form
                                    openReceive();
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
                    onClose={() => setShowAdjustmentForm(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

export default InventoryPage;
