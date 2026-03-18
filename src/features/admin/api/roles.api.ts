import { axiosInstance } from '@/services/api';

export interface Role {
    id: string;
    name: string;
    description: string | null;
    permissions: Permission[];
}

export interface Permission {
    id: string;
    name: string;
    description: string | null;
}

export interface RolesResponse {
    success: boolean;
    data: Role[];
}

export const rolesAPI = {
    getRoles: async (): Promise<Role[]> => {
        const response = await axiosInstance.get<RolesResponse>('/roles');
        return response.data.data;
    },
};
