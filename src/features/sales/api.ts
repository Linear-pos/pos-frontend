import { axiosInstance } from '../../services/api';
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
    const response = await axiosInstance.get<SalesListResponse>('/sales', {
      params: {
        page: params?.page || 1,
        per_page: params?.per_page || 15,
        ...(params?.branch_id && { branch_id: params.branch_id }),
        ...(params?.start_date && { start_date: params.start_date }),
        ...(params?.end_date && { end_date: params.end_date }),
      },
    });
    return response.data;
  },

  /**
   * Get a single sale by ID with all items
   */
  getSale: async (id: string): Promise<Sale> => {
    const response = await axiosInstance.get<Sale>(`/sales/${id}`);
    return response.data;
  },

  /**
   * Create a new sale with items
   * Automatically calculates subtotal and total
   * Handles inventory decrement and audit trail
   */
  createSale: async (payload: CreateSalePayload): Promise<Sale> => {
    const response = await axiosInstance.post<SaleResponse>('/sales', payload);
    return response.data.data || response.data as any;
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
  calculateTax: (subtotal: number, taxRate: number = 0.16): number => {
    return Math.round((subtotal * taxRate) * 100) / 100;
  },

  /**
   * Format sale for display
   */
  formatSale: (sale: Sale): Sale => {
    return {
      ...sale,
      subtotal: Number(sale.subtotal),
      tax: Number(sale.tax),
      total: Number(sale.total),
    };
  },
};

export default salesAPI;
