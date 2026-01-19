import { axiosInstance } from "@/services/api";

export interface SalesReportParams {
    startDate?: string;
    endDate?: string;
    branchId?: string;
}

export interface SalesReportData {
    totalRevenue: number;
    totalSalesCount: number;
    averageSaleValue: number;
    paymentMethods: {
        method: string;
        total: number;
        count: number;
    }[];
    dailyBreakdown: {
        date: string;
        total: number;
    }[];
}

export interface TopProduct {
    productId: string;
    name: string;
    sku: string;
    totalQuantity: number;
    totalRevenue: number;
}

export interface CategoryRevenue {
    category: string;
    totalRevenue: number;
    percentage: number;
}

export interface InventorySummary {
    totalItems: number;
    totalStockValue: number;
    lowStockItems: number;
    outOfStockItems: number;
}

export const reportsAPI = {
    getSalesReport: async (params?: SalesReportParams) => {
        const response = await axiosInstance.get<{ data: SalesReportData }>("/reports/sales", { params });
        return response.data.data;
    },

    getTopProducts: async (params?: SalesReportParams) => {
        const response = await axiosInstance.get<{ data: TopProduct[] }>("/reports/top-products", { params });
        return response.data.data;
    },

    getInventorySummary: async (params?: SalesReportParams) => {
        const response = await axiosInstance.get<{ data: InventorySummary }>("/reports/inventory", { params });
        return response.data.data;
    },

    getRevenueByCategory: async (params?: SalesReportParams) => {
        const response = await axiosInstance.get<{ data: CategoryRevenue[] }>("/reports/category-revenue", { params });
        return response.data.data;
    },
};
