import { axiosInstance } from '@/services/api';

export interface Category {
    id: string;
    name: string;
    tenantId: string;
    productCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryPayload {
    name: string;
}

export interface UpdateCategoryPayload {
    name: string;
}

export const categoriesAPI = {
    getCategories: async (): Promise<Category[]> => {
        const response = await axiosInstance.get<{ success: boolean; data: any[] }>('/categories');
        const data = response.data.data;

        // Handle case where API returns array of strings
        if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
            return data.map((name: string) => ({
                id: name,
                name: name,
                tenantId: '',
                productCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }));
        }

        return data as Category[];
    },

    createCategory: async (payload: CreateCategoryPayload): Promise<Category> => {
        const response = await axiosInstance.post<{ success: boolean; data: Category }>('/categories', payload);
        return response.data.data;
    },

    updateCategory: async (id: string, payload: UpdateCategoryPayload): Promise<Category> => {
        const response = await axiosInstance.put<{ success: boolean; data: Category }>(`/categories/${id}`, payload);
        return response.data.data;
    },

    deleteCategory: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/categories/${id}`);
    },
};
