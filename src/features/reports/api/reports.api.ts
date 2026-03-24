import { axiosInstance } from "@/services/api";

export interface SalesReportParams {
    startDate?: string;
    endDate?: string;
    branchId?: string;
}

export interface SalesReportData {
    totalRevenue: number;
    totalSalesCount: number;
    averageSaleValue?: number;
    averageOrderValue?: number;
    totalTax?: number;
    paymentMethods: {
        method: string;
        total: number;
        count: number;
    }[];
    dailyBreakdown?: {
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

export type ReportTemplateType =
    | "sales_summary"
    | "top_products"
    | "inventory_summary"
    | "category_revenue";

export interface ReportTemplate {
    id: string;
    tenantId: string;
    branchId: string | null;
    name: string;
    description: string | null;
    type: ReportTemplateType;
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ReportTemplateQueryParams {
    search?: string;
    type?: ReportTemplateType;
    branchId?: string | null;
    isActive?: boolean;
}

export interface CreateReportTemplatePayload {
    name: string;
    description?: string | null;
    type: ReportTemplateType;
    startDate?: string | null;
    endDate?: string | null;
    branchId?: string | null;
    isActive?: boolean;
}

export interface UpdateReportTemplatePayload extends Partial<CreateReportTemplatePayload> {}

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

    getReportTemplates: async (params?: ReportTemplateQueryParams) => {
        const response = await axiosInstance.get<{ data: ReportTemplate[] }>("/reports/templates", { params });
        return response.data.data;
    },

    getReportTemplate: async (id: string) => {
        const response = await axiosInstance.get<{ data: ReportTemplate }>(`/reports/templates/${id}`);
        return response.data.data;
    },

    createReportTemplate: async (payload: CreateReportTemplatePayload) => {
        const response = await axiosInstance.post<{ data: ReportTemplate }>("/reports/templates", payload);
        return response.data.data;
    },

    updateReportTemplate: async (id: string, payload: UpdateReportTemplatePayload) => {
        const response = await axiosInstance.put<{ data: ReportTemplate }>(`/reports/templates/${id}`, payload);
        return response.data.data;
    },

    deleteReportTemplate: async (id: string) => {
        await axiosInstance.delete(`/reports/templates/${id}`);
    },
};
