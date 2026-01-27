import { useEffect, useState } from "react";
import { reportsAPI } from "@/features/reports/api/reports.api";
import type { SalesReportData, TopProduct, CategoryRevenue, InventorySummary } from "@/features/reports/api/reports.api";
import { SalesTrendChart } from "../components/SalesTrendChart";
import { TopProductsChart } from "../components/TopProductsChart";
import { PaymentMethodsChart } from "../components/PaymentMethodsChart";
import { CategoryRevenueChart } from "../components/CategoryRevenueChart";
import { StockStatusChart } from "../components/StockStatusChart";

export const AnalyticsPage = () => {
    const [salesData, setSalesData] = useState<SalesReportData | null>(null);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [categoryRevenue, setCategoryRevenue] = useState<CategoryRevenue[]>([]);
    const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Date range: Last 30 days default
                const endDate = new Date().toISOString();
                const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

                const [sales, top, category, inventory] = await Promise.all([
                    reportsAPI.getSalesReport({ startDate, endDate }),
                    reportsAPI.getTopProducts({ startDate, endDate }),
                    reportsAPI.getRevenueByCategory({ startDate, endDate }),
                    reportsAPI.getInventorySummary()
                ]);

                setSalesData(sales);
                setTopProducts(top);
                setCategoryRevenue(category);
                setInventorySummary(inventory);

            } catch (error) {
                console.error("Failed to load analytics data:", error);
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
            <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
                {/* Sales Trend - Full Width */}
                {salesData?.dailyBreakdown && (
                    <SalesTrendChart data={salesData.dailyBreakdown} />
                )}

                {/* Top Products & Categories */}
                {topProducts.length > 0 && (
                    <TopProductsChart data={topProducts} />
                )}

                {categoryRevenue.length > 0 && (
                    <CategoryRevenueChart data={categoryRevenue} />
                )}

                {/* Pie Charts Row */}
                <div className="col-span-4 grid gap-4 grid-cols-1 md:grid-cols-2">
                    {salesData?.paymentMethods && (
                        <PaymentMethodsChart data={salesData.paymentMethods} />
                    )}

                    {inventorySummary && (
                        <StockStatusChart data={inventorySummary} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
