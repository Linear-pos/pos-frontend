import { axiosInstance } from './api';

export interface CashierAuthRequest {
    tenantId: string;
    pin: string;
    branchId?: string;
    terminalId?: string;
}

export interface CashierAuthResponse {
    success: boolean;
    data: {
        cashier: Cashier;
        access_token: string;
        token?: string;
        expiresIn?: string;
        requiresPinReset?: boolean;
    };
    message: string;
}

export interface Cashier {
    id: string;
    tenantId: string;
    branchId: string | null;
    fullName: string;
    role: 'cashier' | 'supervisor' | 'manager';
    isActive: boolean;
    canOpenShift: boolean;
    canCloseShift: boolean;
    canOverridePrices: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
    tenantName?: string;
    branchName?: string;
}

export interface CreateCashierRequest {
    fullName: string;
    pin?: string;
    role?: 'cashier' | 'supervisor' | 'manager';
    branchId?: string;
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
        '/cashiers/auth',
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
        '/cashiers/auth/verify',
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
    const response = await axiosInstance.get('/cashiers', { params });
    return response.data;
};

/**
 * Get cashier by ID
 */
export const getCashierById = async (
    id: string
): Promise<{ success: boolean; data: Cashier }> => {
    const response = await axiosInstance.get(`/cashiers/${id}`);
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
    const response = await axiosInstance.post('/cashiers', data);
    return response.data;
};

/**
 * Update cashier
 */
export const updateCashier = async (
    id: string,
    data: Partial<CreateCashierRequest>
): Promise<{ success: boolean; data: Cashier }> => {
    const response = await axiosInstance.put(`/cashiers/${id}`, data);
    return response.data;
};

/**
 * Delete/deactivate cashier
 */
export const deleteCashier = async (
    id: string
): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/cashiers/${id}`);
    return response.data;
};

/**
 * Reset cashier PIN - generates a temporary PIN for manager to share with cashier
 */
export const resetCashierPin = async (
    id: string
): Promise<{ success: boolean; data: { temporaryPin: string; expiresIn: string }; message: string }> => {
    const response = await axiosInstance.post(`/cashiers/${id}/reset-pin`);
    return response.data;
};

/**
 * Unlock cashier account
 */
export const unlockCashier = async (
    id: string
): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.post(`/cashiers/${id}/unlock`);
    return response.data;
};

/**
 * Get cashiers by branch
 */
export const getCashiersByBranch = async (
    branchId: string
): Promise<{ success: boolean; data: Cashier[] }> => {
    const response = await axiosInstance.get(`/cashiers/branch/${branchId}`);
    return response.data;
};
