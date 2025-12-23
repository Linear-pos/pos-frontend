import { axiosInstance } from '../../../services/api';
import type { 
  Product, 
  CreateProductPayload, 
  UpdateProductPayload, 
  ProductsListResponse,
  ProductResponse 
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

export const productsAPI = {
  /**
   * Get all products with pagination, search, filters, and sorting
   */
  getProducts: async (params?: ProductsQueryParams): Promise<ProductsListResponse> => {
    const response = await axiosInstance.get<ProductsListResponse>('/products', {
      params: {
        page: params?.page || 1,
        per_page: params?.per_page || 20,
        ...(params?.search && { search: params.search }),
        ...(params?.category && { category: params.category }),
        ...(params?.is_active !== undefined && { is_active: params.is_active }),
        ...(params?.low_stock && { low_stock: params.low_stock }),
        ...(params?.sort_by && { sort_by: params.sort_by }),
        ...(params?.sort_order && { sort_order: params.sort_order }),
      },
    });
    return response.data;
  },

  /**
   * Get a single product by ID
   */
  getProduct: async (id: number): Promise<Product> => {
    const response = await axiosInstance.get<Product>(`/products/${id}`);
    return response.data;
  },

  /**
   * Create a new product
   */
  createProduct: async (payload: CreateProductPayload): Promise<Product> => {
    const response = await axiosInstance.post<ProductResponse>('/products', payload);
    return response.data.data || response.data as any;
  },

  /**
   * Update an existing product
   */
  updateProduct: async (id: number, payload: UpdateProductPayload): Promise<Product> => {
    const response = await axiosInstance.put<ProductResponse>(`/products/${id}`, payload);
    return response.data.data || response.data as any;
  },

  /**
   * Delete a product (soft delete)
   */
  deleteProduct: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/products/${id}`);
  },

  /**
   * Bulk update products (if backend supports)
   */
  bulkUpdate: async (updates: Array<{ id: number; data: UpdateProductPayload }>): Promise<void> => {
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
    const response = await axiosInstance.get<ProductsListResponse>('/products', {
      params: { per_page: 1000 }, // Get all with high limit
    });
    
    return response.data.data.filter(p => productsAPI.needsReorder(p));
  },
};

export default productsAPI;
