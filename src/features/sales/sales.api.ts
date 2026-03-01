import { axiosInstance } from '../../services/api';
import { isNetworkOrOfflineError, queueSaleForSync } from '../../services/offlineSalesSync.service';
import type {
  Sale,
  CreateSalePayload,
  SalesListResponse,
} from '../../types/sale';

interface SalesQueryParams {
  page?: number;
  per_page?: number;
  branch_id?: string;
  start_date?: string;
  end_date?: string;
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

export const salesAPI = {
  getSales: async (params?: SalesQueryParams): Promise<SalesListResponse> => {
    const response = await axiosInstance.get<BackendListResponse<Sale>>('/sales', {
      params: {
        page: params?.page || 1,
        limit: params?.per_page || 15, // Backend expects limit
        ...(params?.branch_id && { branch_id: params.branch_id }),
        ...(params?.start_date && { start_date: params.start_date }),
        ...(params?.end_date && { end_date: params.end_date }),
      },
    });

    const { data, pagination } = response.data;

    return {
      data: data,
      current_page: pagination.page,
      last_page: pagination.pages,
      per_page: pagination.limit,
      total: pagination.total
    };
  },

  getSale: async (id: string): Promise<Sale> => {
    const response = await axiosInstance.get<BackendSingleResponse<Sale>>(`/sales/${id}`);
    return salesAPI.formatSale(response.data.data); // Apply formatting automatically
  },

  createSale: async (payload: CreateSalePayload): Promise<Sale> => {
    try {
      // Ensure product_id is sent as a string (UUID) and quantities are numeric
      const cleanPayload = {
        ...payload,
        items: payload.items.map(item => ({
          ...item,
          product_id: String(item.product_id), // Force string for UUID safety
          quantity: Number(item.quantity),
          price: Number(item.price),
        }))
      };

      // Backend returns { success: true, data: { ... } }
      const response = await axiosInstance.post<BackendSingleResponse<Sale>>('/sales', cleanPayload);
      const saleData = response.data.data;
      return salesAPI.formatSale(saleData);
    } catch (error) {
      if (payload.payment_method !== 'mpesa' && isNetworkOrOfflineError(error)) {
        return salesAPI.formatSale(queueSaleForSync(payload));
      }
      throw error;
    }
  },

  getSalesByDateRange: async (startDate: string, endDate: string, page = 1): Promise<SalesListResponse> => {
    return salesAPI.getSales({
      page,
      start_date: startDate,
      end_date: endDate,
      per_page: 50,
    });
  },

  getTotalSales: async (startDate: string, endDate: string): Promise<number> => {
    const response = await salesAPI.getSalesByDateRange(startDate, endDate, 1);

    // Efficiently sum totals from all pages
    const pagePromises = [];
    for (let i = 2; i <= response.last_page; i++) {
      pagePromises.push(salesAPI.getSalesByDateRange(startDate, endDate, i));
    }

    const otherPages = await Promise.all(pagePromises);
    const allPages = [response, ...otherPages];

    return allPages.reduce((sum, page) =>
      sum + page.data.reduce((pageSum, sale) => pageSum + Number(sale.total), 0), 0
    );
  },

  calculateTax: (subtotal: number, taxRate: number = 0.16): number => {
    return Math.round((subtotal * taxRate) * 100) / 100;
  },

  /**
   * Format for display: Prevents 'toFixed is not a function' errors
   */
  formatSale: (sale: Sale): Sale => {
    return {
      ...sale,
      subtotal: Number(sale.subtotal || 0),
      tax: Number(sale.tax || 0),
      total: Number(sale.total || 0),
    };
  },
};

export default salesAPI;
