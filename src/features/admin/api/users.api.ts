import { axiosInstance } from '@/services/api';

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    roleId: string;
    tenantId: string;
    branchId: string | null;
    branchName: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UsersListResponse {
    success: boolean;
    data: User[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface CreateUserPayload {
    name: string;
    email: string;
    password: string;
    roleId: string;
    tenantId: string;
    branchId?: string | null;
}

export interface UpdateUserPayload {
    name?: string;
    email?: string;
    role_id?: string;
    branch_id?: string | null;
}

export interface UsersQueryParams {
    page?: number;
    limit?: number;
    role?: string;
    branch_id?: string;
    status?: 'active' | 'inactive';
    search?: string;
}

export const usersAPI = {
    getUsers: async (params?: UsersQueryParams): Promise<UsersListResponse> => {
        const response = await axiosInstance.get<UsersListResponse>('/users', { params });
        return response.data;
    },

    getUser: async (id: string): Promise<User> => {
        const response = await axiosInstance.get<{ success: boolean; data: User }>(`/users/${id}`);
        return response.data.data;
    },

    createUser: async (payload: CreateUserPayload): Promise<User> => {
        const response = await axiosInstance.post<{ success: boolean; data: User }>('/users', payload);
        return response.data.data;
    },

    updateUser: async (id: string, payload: UpdateUserPayload): Promise<User> => {
        const response = await axiosInstance.put<{ success: boolean; data: User }>(`/users/${id}`, payload);
        return response.data.data;
    },

    deactivateUser: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/users/${id}`);
    },

    resetPassword: async (id: string): Promise<void> => {
        await axiosInstance.post(`/users/${id}/reset-password`);
    },
};
