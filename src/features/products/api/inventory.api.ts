import { axiosInstance } from '../../../services/api';

// Matches backend inventory_logs table structure
export interface InventoryLog {
    id: string;
    productId: string;
    productName: string;
    quantityChange: number;
    newQuantity: number;
    type: 'sale' | 'restock' | 'return' | 'adjustment' | 'correction';
    notes?: string;
    createdAt: string;
    userName?: string;
    tenantId: string;
}

export interface RestockPayload {
    productId: string;
    quantity: number;
    cost?: number;
    notes?: string;
}

export const inventoryAPI = {
    // Get inventory movement logs (matches backend GET /inventory/logs)
    getLogs: async (params?: {
        productId?: string;
        type?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }) => {
        // Map 'type' to backend expected query param 'changeType' or 'type' - backend uses 'type' in query mapping?
        // Checking routes/inventory.ts: changeType: req.query.type as any. So backend expects 'type'.
        const response = await axiosInstance.get('/inventory/logs', { params });
        return response.data;
    },

    // Restock product (matches backend POST /inventory/restock)
    restockProduct: async (payload: RestockPayload) => {
        const response = await axiosInstance.post('/inventory/restock', payload);
        return response.data;
    },

    // Get low stock products (use existing products API with low_stock filter)
    getLowStockProducts: async () => {
        const response = await axiosInstance.get('/products', {
            params: { low_stock: true, limit: 100 }
        });
        // Backend returns {success, data: [...], pagination}, extract just the data array
        return response.data.data;
    },

    // Get inventory summary stats
    getSummary: async () => {
        const response = await axiosInstance.get('/reports/inventory');
        return response.data.data; // Extract data from {success, data, message} structure
    }
};
