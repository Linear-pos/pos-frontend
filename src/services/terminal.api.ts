import { axiosInstance } from './api';

export interface Terminal {
    id: string;
    tenantId: string;
    branchId: string;
    name: string;
    terminalCode: string;
    pairedAt: Date | null;
    lastSeenAt: Date | null;
    isActive: boolean;
    maxConcurrentShifts: number;
    receiptPrinterConfig: Record<string, unknown>;
    offlineModeEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface TerminalDevice {
    id: string;
    terminalId: string;
    tenantId: string;
    deviceFingerprint: string;
    deviceName: string | null;
    os: string | null;
    appVersion: string | null;
    pairedAt: Date;
    lastHeartbeatAt: Date | null;
    lastIpAddress: string | null;
    isTrusted: boolean;
    revokedAt: Date | null;
    createdAt: Date;
}

export interface CreateTerminalRequest {
    name: string;
    terminalCode: string;
    branchId: string;
    allowedCategories?: string[];
    maxConcurrentShifts?: number;
    receiptPrinterConfig?: Record<string, unknown>;
    offlineModeEnabled?: boolean;
}

export interface PairDeviceRequest {
    terminalCode: string;
    deviceFingerprint: string;
    deviceName?: string;
    os?: string;
    appVersion?: string;
    pairingToken: string;
}

/**
 * Get all terminals
 */
export const getTerminals = async (params?: {
    page?: number;
    limit?: number;
    branchId?: string;
    isActive?: boolean;
    search?: string;
}): Promise<{
    success: boolean;
    data: Terminal[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}> => {
    const response = await axiosInstance.get('/api/terminals', { params });
    return response.data;
};

/**
 * Get terminal by ID
 */
export const getTerminalById = async (
    id: string
): Promise<{ success: boolean; data: Terminal }> => {
    const response = await axiosInstance.get(`/api/terminals/${id}`);
    return response.data;
};

/**
 * Create new terminal
 */
export const createTerminal = async (
    data: CreateTerminalRequest
): Promise<{ success: boolean; data: Terminal }> => {
    const response = await axiosInstance.post('/api/terminals', data);
    return response.data;
};

/**
 * Update terminal
 */
export const updateTerminal = async (
    id: string,
    data: Partial<CreateTerminalRequest>
): Promise<{ success: boolean; data: Terminal }> => {
    const response = await axiosInstance.put(`/api/terminals/${id}`, data);
    return response.data;
};

/**
 * Deactivate terminal
 */
export const deactivateTerminal = async (
    id: string
): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.post(`/api/terminals/${id}/deactivate`);
    return response.data;
};

/**
 * Update terminal heartbeat
 */
export const updateTerminalHeartbeat = async (
    id: string
): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.post(`/api/terminals/${id}/heartbeat`);
    return response.data;
};

/**
 * Get terminal devices
 */
export const getTerminalDevices = async (
    terminalId: string
): Promise<{ success: boolean; data: TerminalDevice[] }> => {
    const response = await axiosInstance.get(`/api/terminals/${terminalId}/devices`);
    return response.data;
};

/**
 * Pair device to terminal
 */
export const pairDevice = async (
    data: PairDeviceRequest
): Promise<{ success: boolean; data: TerminalDevice }> => {
    const response = await axiosInstance.post('/api/terminals/pair', data);
    return response.data;
};

/**
 * Revoke device access
 */
export const revokeDevice = async (
    terminalId: string,
    deviceId: string
): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.post(
        `/api/terminals/${terminalId}/devices/${deviceId}/revoke`
    );
    return response.data;
};

/**
 * Unpair device
 */
export const unpairDevice = async (
    terminalId: string,
    deviceId: string
): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(
        `/api/terminals/${terminalId}/devices/${deviceId}`
    );
    return response.data;
};

/**
 * Get terminal allowed categories
 */
export const getTerminalCategories = async (
    terminalId: string
): Promise<{ success: boolean; data: string[] }> => {
    const response = await axiosInstance.get(`/api/terminals/${terminalId}/categories`);
    return response.data;
};

/**
 * Get terminals by branch
 */
export const getTerminalsByBranch = async (
    branchId: string
): Promise<{ success: boolean; data: Terminal[] }> => {
    const response = await axiosInstance.get(`/api/terminals/branch/${branchId}`);
    return response.data;
};
