import { axiosInstance } from '@/services/api';

export interface Branch {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    tenantId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    stats?: {
        userCount: number;
        salesCount: number;
        totalRevenue: number;
    };
}

export interface BranchStats {
    activeUsers: number;
    totalSales: number;
    totalRevenue: number;
    totalProducts: number;
    totalInventoryItems: number;
    inventoryValue: number;
    lowStockItems: number;
}

export interface BranchesListResponse {
    success: boolean;
    data: Branch[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface CreateBranchPayload {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
}

export interface UpdateBranchPayload {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
}

export interface BranchesQueryParams {
    page?: number;
    limit?: number;
    search?: string;
}

export const branchesAPI = {
    getBranches: async (params?: BranchesQueryParams): Promise<BranchesListResponse> => {
        const response = await axiosInstance.get<BranchesListResponse>('/branches', { params });
        return response.data;
    },

    getBranch: async (id: string): Promise<Branch> => {
        const response = await axiosInstance.get<{ success: boolean; data: Branch }>(`/branches/${id}`);
        return response.data.data;
    },

    createBranch: async (payload: CreateBranchPayload): Promise<Branch> => {
        const response = await axiosInstance.post<{ success: boolean; data: Branch }>('/branches', payload);
        return response.data.data;
    },

    updateBranch: async (id: string, payload: UpdateBranchPayload): Promise<Branch> => {
        const response = await axiosInstance.put<{ success: boolean; data: Branch }>(`/branches/${id}`, payload);
        return response.data.data;
    },

    deactivateBranch: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/branches/${id}`);
    },

    getBranchStats: async (id: string): Promise<BranchStats> => {
        const response = await axiosInstance.get<{ success: boolean; data: BranchStats }>(`/branches/${id}/stats`);
        return response.data.data;
    },
};
