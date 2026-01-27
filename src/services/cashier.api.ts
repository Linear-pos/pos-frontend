import { axiosInstance } from './api';

export interface CashierAuthRequest {
    tenantId: string;
    pin: string;
}

export interface CashierAuthResponse {
    success: boolean;
    data: {
        cashier: Cashier;
        token: string;
        expiresAt: string;
    };
    message: string;
}

export interface Cashier {
    id: string;
    tenantId: string;
    branchId: string | null;
    userId: string | null;
    fullName: string;
    role: 'cashier' | 'supervisor' | 'manager';
    isActive: boolean;
    canOpenShift: boolean;
    canCloseShift: boolean;
    canOverridePrices: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCashierRequest {
    fullName: string;
    pin: string;
    role?: 'cashier' | 'supervisor' | 'manager';
    branchId?: string;
    userId?: string;
    canOpenShift?: boolean;
    canCloseShift?: boolean;
    canOverridePrices?: boolean;
}

/**
 * Authenticate cashier with PIN
 */
export const authenticateCashier = async (
    data: CashierAuthRequest
): Promise<CashierAuthResponse> => {
    const response = await axiosInstance.post<CashierAuthResponse>(
        '/api/cashiers/auth',
        data
    );
    return response.data;
};

/**
 * Verify cashier token
 */
export const verifyCashierToken = async (
    token: string
): Promise<{ success: boolean; data: Cashier }> => {
    const response = await axiosInstance.post(
        '/api/cashiers/auth/verify',
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

/**
 * Get all cashiers
 */
export const getCashiers = async (params?: {
    page?: number;
    limit?: number;
    branchId?: string;
    role?: string;
    isActive?: boolean;
    search?: string;
}): Promise<{
    success: boolean;
    data: Cashier[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}> => {
    const response = await axiosInstance.get('/api/cashiers', { params });
    return response.data;
};

/**
 * Get cashier by ID
 */
export const getCashierById = async (
    id: string
): Promise<{ success: boolean; data: Cashier }> => {
    const response = await axiosInstance.get(`/api/cashiers/${id}`);
    return response.data;
};

/**
 * Create new cashier
 */
export const createCashier = async (
    data: CreateCashierRequest
): Promise<{
    success: boolean;
    data: {
        cashier: Cashier;
        temporaryPin: string;
        expiresIn: string
    };
    message: string;
}> => {
    const response = await axiosInstance.post('/api/cashiers', data);
    return response.data;
};

/**
 * Update cashier
 */
export const updateCashier = async (
    id: string,
    data: Partial<CreateCashierRequest>
): Promise<{ success: boolean; data: Cashier }> => {
    const response = await axiosInstance.put(`/api/cashiers/${id}`, data);
    return response.data;
};

/**
 * Delete/deactivate cashier
 */
export const deleteCashier = async (
    id: string
): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/api/cashiers/${id}`);
    return response.data;
};

/**
 * Reset cashier PIN - generates a temporary PIN for manager to share with cashier
 */
export const resetCashierPin = async (
    id: string
): Promise<{ success: boolean; data: { temporaryPin: string; expiresIn: string }; message: string }> => {
    const response = await axiosInstance.post(`/api/cashiers/${id}/reset-pin`);
    return response.data;
};

/**
 * Unlock cashier account
 */
export const unlockCashier = async (
    id: string
): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.post(`/api/cashiers/${id}/unlock`);
    return response.data;
};

/**
 * Get cashiers by branch
 */
export const getCashiersByBranch = async (
    branchId: string
): Promise<{ success: boolean; data: Cashier[] }> => {
    const response = await axiosInstance.get(`/api/cashiers/branch/${branchId}`);
    return response.data;
};
