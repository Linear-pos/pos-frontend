import { axiosInstance } from '@/services/api';

export interface Product {
    id: string;
    name: string;
    sku: string | null;
    description: string | null;
    category: string | null;
    price: number;
    cost: number;
    unit: string;
    unitSize: number | null;
    reorderLevel: number;
    imageUrl: string | null;
    tenantId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ProductsListResponse {
    success: boolean;
    data: Product[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface CreateProductPayload {
    name: string;
    sku?: string;
    description?: string;
    category?: string;
    price: number;
    cost: number;
    unit: string;
    unit_size?: number;
    reorder_level?: number;
    image_url?: string;
}

export interface UpdateProductPayload {
    name?: string;
    sku?: string;
    description?: string;
    category?: string;
    price?: number;
    cost?: number;
    unit?: string;
    unit_size?: number;
    reorder_level?: number;
    image_url?: string;
    is_active?: boolean;
}

export interface ProductsQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    low_stock?: boolean;
    is_active?: boolean;
    sort_by?: 'name' | 'price' | 'created_at';
    sort_order?: 'asc' | 'desc';
}

export const productsAPI = {
    getProducts: async (params?: ProductsQueryParams): Promise<ProductsListResponse> => {
        const response = await axiosInstance.get<ProductsListResponse>('/products', { params });
        return response.data;
    },

    getProduct: async (id: string): Promise<Product> => {
        const response = await axiosInstance.get<{ success: boolean; data: Product }>(`/products/${id}`);
        return response.data.data;
    },

    createProduct: async (payload: CreateProductPayload): Promise<Product> => {
        const response = await axiosInstance.post<{ success: boolean; data: Product }>('/products', payload);
        return response.data.data;
    },

    updateProduct: async (id: string, payload: UpdateProductPayload): Promise<Product> => {
        const response = await axiosInstance.put<{ success: boolean; data: Product }>(`/products/${id}`, payload);
        return response.data.data;
    },

    deleteProduct: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/products/${id}`);
    },
};
