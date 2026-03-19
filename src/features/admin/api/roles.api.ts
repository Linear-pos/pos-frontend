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

export interface PermissionsResponse {
    success: boolean;
    data: Permission[];
}

export const rolesAPI = {
    getRoles: async (): Promise<Role[]> => {
        const response = await axiosInstance.get<RolesResponse>('/roles');
        return response.data.data;
    },

    getPermissions: async (): Promise<Permission[]> => {
        const response = await axiosInstance.get<PermissionsResponse>('/roles/permissions');
        return response.data.data;
    },

    updateRolePermissions: async (roleId: string, permissionIds: string[]): Promise<Role> => {
        const response = await axiosInstance.put<{ success: boolean; data: Role; message: string }>(
            `/roles/${roleId}/permissions`,
            { permissionIds }
        );
        return response.data.data;
    },
};
