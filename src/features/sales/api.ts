import { axiosInstance } from '../../services/api';
import {
  getConflictedSalesCount,
  getQueuedSalesCount,
  isNetworkOrOfflineError,
  queueSaleForSync,
  syncQueuedSales,
} from '../../services/offlineSalesSync.service';
import type {
  Sale,
  CreateSalePayload,
  SalesListResponse,
  SaleResponse
} from '../../types/sale';

interface SalesQueryParams {
  page?: number;
  per_page?: number;
  branch_id?: string;
  start_date?: string;
  end_date?: string;
}

export const salesAPI = {
  /**
   * Get all sales with pagination and optional filters
   */
  getSales: async (params?: SalesQueryParams): Promise<SalesListResponse> => {
    const response = await axiosInstance.get('/sales', {
      params: {
        page: params?.page || 1,
        per_page: params?.per_page || 15,
        ...(params?.branch_id && { branch_id: params.branch_id }),
        ...(params?.start_date && { start_date: params.start_date }),
        ...(params?.end_date && { end_date: params.end_date }),
      },
    });

    // Backend returns {success, data: [...], pagination}
    const { data, pagination } = response.data;

    return {
      data: data.map((sale: Sale) => salesAPI.formatSale(sale)),
      current_page: pagination.page,
      last_page: pagination.pages,
      per_page: pagination.limit,
      total: pagination.total
    };
  },

  /**
   * Get a single sale by ID with all items
   */
  getSale: async (id: string): Promise<Sale> => {
    const response = await axiosInstance.get<Sale>(`/sales/${id}`);
    return salesAPI.formatSale(response.data);
  },

  /**
   * Create a new sale with items
   * Automatically calculates subtotal and total
   * Handles inventory decrement and audit trail
   */
  createSale: async (payload: CreateSalePayload): Promise<Sale> => {
    try {
      const response = await axiosInstance.post<SaleResponse>('/sales', payload);
      const sale = response.data.data || response.data as unknown as Sale;
      return salesAPI.formatSale(sale);
    } catch (error) {
      // Queue only non-MPesa sales for offline sync. MPesa requires live network callbacks.
      if (payload.payment_method !== 'mpesa' && isNetworkOrOfflineError(error)) {
        const queuedSale = queueSaleForSync(payload);
        return salesAPI.formatSale(queuedSale);
      }
      throw error;
    }
  },

  /**
   * Update an existing sale
   */
  updateSale: async (id: string, payload: Partial<CreateSalePayload>): Promise<Sale> => {
    const response = await axiosInstance.patch<SaleResponse>(`/sales/${id}`, payload);
    const sale = response.data.data || response.data as unknown as Sale;
    return salesAPI.formatSale(sale);
  },

  /**
   * Get sales for a specific date range
   */
  getSalesByDateRange: async (startDate: string, endDate: string, page = 1): Promise<SalesListResponse> => {
    return salesAPI.getSales({
      page,
      start_date: startDate,
      end_date: endDate,
      per_page: 50,
    });
  },

  /**
   * Get total sales for a period
   */
  getTotalSales: async (startDate: string, endDate: string): Promise<number> => {
    const response = await salesAPI.getSalesByDateRange(startDate, endDate, 1);
    const allSales = await Promise.all(
      Array.from({ length: response.last_page }, (_, i) =>
        salesAPI.getSalesByDateRange(startDate, endDate, i + 1)
      )
    );

    return allSales.reduce((sum: number, page) =>
      sum + page.data.reduce((total: number, sale) => total + sale.total, 0), 0
    );
  },

  /**
   * Get sales count for a period
   */
  getSalesCount: async (startDate: string, endDate: string): Promise<number> => {
    const response = await salesAPI.getSalesByDateRange(startDate, endDate, 1);
    return response.total;
  },

  /**
   * Calculate tax for a subtotal
   */
  calculateTax: (_subtotal: number, _taxRate: number = 0): number => {
    const taxRate = _taxRate;
    const tax = _subtotal * taxRate;
    return tax;
  },

  /**
   * Format sale for display - maps backend camelCase to frontend snake_case
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatSale: (sale: any): Sale => {
    return {
      id: sale.id,
      user_id: sale.userId || sale.user_id,
      branch_id: sale.branchId || sale.branch_id,
      subtotal: Number(sale.subtotal),
      tax: Number(sale.tax),
      total: Number(sale.total),
      payment_method: sale.paymentMethod || sale.payment_method,
      status: sale.status,
      reference: sale.reference,
      notes: sale.notes,
      created_at: sale.createdAt || sale.created_at,
      updated_at: sale.updatedAt || sale.updated_at || sale.createdAt || sale.created_at,
      items: sale.items,
      user: sale.user,
      branch: sale.branch
    };
  },
};

export const salesSyncAPI = {
  syncQueuedSales,
  getQueuedSalesCount,
  getConflictedSalesCount,
};

export default salesAPI;
