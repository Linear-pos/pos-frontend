import { useEffect, useState } from "react";
import {
    CreditCard,
    DollarSign,
    Package,
    AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { reportsAPI } from "@/features/reports/api/reports.api";
import type { SalesReportData, TopProduct, InventorySummary } from "@/features/reports/api/reports.api";
import { salesAPI } from "@/features/sales/sales.api";
import type { Sale } from "@/types/sale";

export const DashboardOverview = () => {
    const [salesData, setSalesData] = useState<SalesReportData | null>(null);
    const [inventoryData, setInventoryData] = useState<InventorySummary | null>(null);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [recentSales, setRecentSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Date range: Last 30 days default
                const endDate = new Date().toISOString();
                const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

                const [sales, inventory, top, salesList] = await Promise.all([
                    reportsAPI.getSalesReport({ startDate, endDate }),
                    reportsAPI.getInventorySummary(),
                    reportsAPI.getTopProducts({ startDate, endDate }),
                    salesAPI.getSales({ page: 1, per_page: 5 })
                ]);

                setSalesData(sales);
                setInventoryData(inventory);
                setTopProducts(top);
                setRecentSales(salesList.data);

            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">KES {salesData?.totalRevenue.toLocaleString() || "0"}</div>
                        <p className="text-xs text-muted-foreground">
                            Last 30 days
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sales Count</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{salesData?.totalSalesCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Last 30 days
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inventoryData?.lowStockItems || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Items below reorder level
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">KES {inventoryData?.totalStockValue.toLocaleString() || '0'}</div>
                        <p className="text-xs text-muted-foreground">
                            Total stock value
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                        <CardDescription>
                            Latest 5 transactions from the POS.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentSales.map((sale) => (
                                <div key={sale.id} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {sale.created_at ? format(new Date(sale.created_at), "MMM dd, HH:mm") : "N/A"}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Ref: {sale.reference || sale.id.slice(0, 8)} | Method: {sale.payment_method}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        +KES {Number(sale.total).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                            {recentSales.length === 0 && (
                                <div className="text-center text-muted-foreground py-8">
                                    No recent sales found
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Products</CardTitle>
                        <CardDescription>
                            Best selling items by quantity (Last 30 Days)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topProducts.map((product) => (
                                <div key={product.productId} className="flex items-center">
                                    <div className="w-full">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium">{product.name}</span>
                                            <span className="text-sm text-muted-foreground">{product.totalQuantity} sold</span>
                                        </div>
                                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-primary h-full"
                                                style={{ width: `${Math.min(100, (product.totalQuantity / (topProducts[0]?.totalQuantity || 1)) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {topProducts.length === 0 && (
                                <div className="text-center text-muted-foreground py-8">
                                    No sales data yet
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardOverview;
