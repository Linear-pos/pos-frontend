import { axiosInstance } from '@/services/api';

export interface Role {
    id: string;
    name: string;
    displayName: string;
    description?: string;
    level: number; // For hierarchy (higher number = more privileges)
}

export interface RolesListResponse {
    success: boolean;
    data: Role[];
}

export const rolesAPI = {
    getRoles: async (): Promise<Role[]> => {
        try {
            const response = await axiosInstance.get<RolesListResponse>('/roles');
            return response.data.data;
        } catch (error) {
            // Fallback to hardcoded roles if API fails
            console.warn('Roles API not available, using fallback roles');
            return [
                {
                    id: 'role-system-admin',
                    name: 'SYSTEM_ADMIN',
                    displayName: 'System Admin',
                    description: 'Full system access and user management',
                    level: 3,
                },
                {
                    id: 'role-branch-manager',
                    name: 'BRANCH_MANAGER',
                    displayName: 'Branch Manager',
                    description: 'Branch-level management and reporting',
                    level: 2,
                },
                {
                    id: 'role-cashier',
                    name: 'CASHIER',
                    displayName: 'Cashier',
                    description: 'Sales and basic operations',
                    level: 1,
                },
            ];
        }
    },
};
