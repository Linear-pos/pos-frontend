import { axiosInstance } from '../../../services/api';
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductsListResponse,
} from '../../../types/product';

interface ProductsQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  is_active?: boolean;
  low_stock?: boolean;
  sort_by?: 'name' | 'sku' | 'price' | 'stock_quantity' | 'created_at';
  sort_order?: 'asc' | 'desc';
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

export const productsAPI = {
  /**
   * Get all products with pagination, search, filters, and sorting
   */
  getProducts: async (params?: ProductsQueryParams): Promise<ProductsListResponse> => {
    const response = await axiosInstance.get<BackendListResponse<Product>>('/products', {
      params: {
        page: params?.page || 1,
        limit: params?.per_page || 20, // Backend uses 'limit', Frontend types use 'per_page'
        ...(params?.search && { search: params.search }),
        ...(params?.category && { category: params.category }),
        ...(params?.is_active !== undefined && { is_active: params.is_active }),
        ...(params?.low_stock && { low_stock: params.low_stock }),
        ...(params?.sort_by && { sort_by: params.sort_by }),
        ...(params?.sort_order && { sort_order: params.sort_order }),
      },
    });

    // Map Backend pagination to Frontend (Laravel-style) expectation
    const { data, pagination } = response.data;

    return {
      data: data,
      current_page: pagination.page,
      last_page: pagination.pages,
      per_page: pagination.limit,
      total: pagination.total
    };
  },

  /**
   * Get a single product by ID
   */
  getProduct: async (id: string): Promise<Product> => {
    const response = await axiosInstance.get<BackendSingleResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  /**
   * Create a new product
   */
  createProduct: async (payload: CreateProductPayload): Promise<Product> => {
    const response = await axiosInstance.post<BackendSingleResponse<Product>>('/products', payload);
    return response.data.data;
  },

  /**
   * Update an existing product
   */
  updateProduct: async (id: string, payload: UpdateProductPayload): Promise<Product> => {
    const response = await axiosInstance.put<BackendSingleResponse<Product>>(`/products/${id}`, payload);
    return response.data.data;
  },

  /**
   * Delete a product (soft delete)
   */
  deleteProduct: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/products/${id}`);
  },

  /**
   * Bulk update products (if backend supports)
   */
  bulkUpdate: async (updates: Array<{ id: string; data: UpdateProductPayload }>): Promise<void> => {
    await Promise.all(
      updates.map(({ id, data }) => productsAPI.updateProduct(id, data))
    );
  },

  /**
   * Check if product needs reordering
   */
  needsReorder: (product: Product): boolean => {
    return product.stock_quantity <= product.reorder_level;
  },

  /**
   * Get products that need reordering
   */
  getProductsNeedingReorder: async (): Promise<Product[]> => {
    // This logic performs a full fetch, which is inefficient but matches original logic.
    // Ideally backend should support ?low_stock=true, which it does now!
    // Optimized implementation:
    const response = await productsAPI.getProducts({ low_stock: true, per_page: 100 });
    return response.data;
  },
};

export default productsAPI;
