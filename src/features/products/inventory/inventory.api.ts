import { axiosInstance } from '../../../services/api';
import type { Product } from '../../../types/product';

interface RestockPayload {
    productId: string;
    quantity: number;
    cost?: number;
    notes?: string;
}

interface InventoryLog {
    id: string;
    product_id: string;
    tenant_id: string;
    quantity_change: number;
    new_quantity: number;
    type: 'sale' | 'restock' | 'return' | 'adjustment' | 'correction';
    notes?: string;
    created_at: string;
    product?: Product; // If joined
}

interface InventoryLogsQueryParams {
    page?: number;
    limit?: number;
    productId?: string;
    startDate?: string;
    endDate?: string;
    type?: string;
}

interface BackendListResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    message: string;
}

interface BackendSingleResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

// Frontend pagination shape if needed
interface InventoryLogsListResponse {
    data: InventoryLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}


export const inventoryAPI = {
    /**
     * Manual restock of a product
     */
    restock: async (payload: RestockPayload): Promise<void> => {
        // Backend expects: productId, quantity, cost, notes
        await axiosInstance.post<BackendSingleResponse<any>>('/inventory/restock', payload);
    },

    /**
     * Get inventory logs
     */
    getLogs: async (params?: InventoryLogsQueryParams): Promise<InventoryLogsListResponse> => {
        const response = await axiosInstance.get<BackendListResponse<InventoryLog>>('/inventory/logs', {
            params: {
                page: params?.page || 1,
                limit: params?.limit || 20,
                productId: params?.productId,
                startDate: params?.startDate,
                endDate: params?.endDate,
                type: params?.type
            }
        });

        const { data, pagination } = response.data;

        return {
            data: data,
            current_page: pagination.page,
            last_page: pagination.pages,
            per_page: pagination.limit,
            total: pagination.total
        };
    }
};

export default inventoryAPI;
