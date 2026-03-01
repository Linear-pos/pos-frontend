import { axiosInstance } from '@/services/api';

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    created_at: string;
    updated_at: string;
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
                slug: name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
                description: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
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
