import { axiosInstance } from './api';

export interface Shift {
    id: string;
    tenantId: string;
    branchId: string;
    terminalId: string;
    cashierId: string;
    status: 'open' | 'closed' | 'force_closed' | 'reconciled';
    openedAt: Date;
    closedAt: Date | null;
    reconciledAt: Date | null;
    openingCash: number;
    closingCash: number | null;
    expectedCash: number | null;
    cashDifference: number | null;
    totalSales: number;
    totalCashSales: number;
    totalMpesaSales: number;
    totalCardSales: number;
    cashDrops: number;
    cashAdditions: number;
    openedByCashierId: string;
    closedByCashierId: string | null;
    notes: string | null;
    createdAt: Date;
}

export interface ShiftEvent {
    id: string;
    shiftId: string;
    eventType: string;
    eventSubtype: string | null;
    saleId: string | null;
    paymentId: string | null;
    productId: string | null;
    amount: number | null;
    quantity: number | null;
    previousValue: string | null;
    newValue: string | null;
    performedByCashierId: string;
    authorizedByCashierId: string | null;
    notes: string | null;
    metadata: Record<string, unknown>;
    createdAt: Date;
}

export interface ShiftReconciliation {
    shift: Shift;
    totalTransactions: number;
    cashierName: string;
    terminalName: string;
    salesBreakdown: {
        cash: number;
        mpesa: number;
        card: number;
    };
    discrepancy: number;
    events: ShiftEvent[];
}

export interface OpenShiftRequest {
    terminalId: string;
    cashierId: string;
    openingCash: number;
    notes?: string;
}

export interface CloseShiftRequest {
    closingCash: number;
    closedByCashierId: string;
    notes?: string;
}

export interface CashDropRequest {
    amount: number;
    performedByCashierId: string;
    notes?: string;
}

export interface CashAdditionRequest {
    amount: number;
    performedByCashierId: string;
    reason: string;
}

/**
 * Get all shifts
 */
export const getShifts = async (params?: {
    page?: number;
    limit?: number;
    cashierId?: string;
    terminalId?: string;
    branchId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
}): Promise<{
    success: boolean;
    data: Shift[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}> => {
    const response = await axiosInstance.get('/api/shifts', { params });
    return response.data;
};

/**
 * Get shift by ID
 */
export const getShiftById = async (
    id: string
): Promise<{ success: boolean; data: Shift }> => {
    const response = await axiosInstance.get(`/api/shifts/${id}`);
    return response.data;
};

/**
 * Open a new shift
 */
export const openShift = async (
    data: OpenShiftRequest
): Promise<{ success: boolean; data: Shift }> => {
    const response = await axiosInstance.post('/api/shifts/open', data);
    return response.data;
};

/**
 * Close a shift
 */
export const closeShift = async (
    shiftId: string,
    data: CloseShiftRequest
): Promise<{ success: boolean; data: Shift }> => {
    const response = await axiosInstance.post(`/api/shifts/${shiftId}/close`, data);
    return response.data;
};

/**
 * Force close a shift (supervisor action)
 */
export const forceCloseShift = async (
    shiftId: string,
    closedByCashierId: string,
    reason: string
): Promise<{ success: boolean; data: Shift }> => {
    const response = await axiosInstance.post(
        `/api/shifts/${shiftId}/force-close`,
        {
            closedByCashierId,
            reason,
        }
    );
    return response.data;
};

/**
 * Record cash drop
 */
export const recordCashDrop = async (
    shiftId: string,
    data: CashDropRequest
): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.post(
        `/api/shifts/${shiftId}/cash-drop`,
        data
    );
    return response.data;
};

/**
 * Record cash addition
 */
export const recordCashAddition = async (
    shiftId: string,
    data: CashAdditionRequest
): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.post(
        `/api/shifts/${shiftId}/cash-addition`,
        data
    );
    return response.data;
};

/**
 * Get shift reconciliation report
 */
export const getShiftReconciliation = async (
    shiftId: string
): Promise<{ success: boolean; data: ShiftReconciliation }> => {
    const response = await axiosInstance.get(`/api/shifts/${shiftId}/reconciliation`);
    return response.data;
};

/**
 * Mark shift as reconciled
 */
export const reconcileShift = async (
    shiftId: string,
    reviewedBy: string
): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.post(`/api/shifts/${shiftId}/reconcile`, {
        reviewedBy,
    });
    return response.data;
};

/**
 * Get shift events
 */
export const getShiftEvents = async (
    shiftId: string,
    eventType?: string
): Promise<{ success: boolean; data: ShiftEvent[] }> => {
    const response = await axiosInstance.get(`/api/shifts/${shiftId}/events`, {
        params: { eventType },
    });
    return response.data;
};

/**
 * Get current open shift for terminal
 */
export const getCurrentShift = async (
    terminalId: string
): Promise<{ success: boolean; data: Shift }> => {
    const response = await axiosInstance.get(
        `/api/shifts/terminal/${terminalId}/current`
    );
    return response.data;
};

/**
 * Get shifts for cashier
 */
export const getCashierShifts = async (
    cashierId: string,
    startDate?: string,
    endDate?: string
): Promise<{ success: boolean; data: Shift[] }> => {
    const response = await axiosInstance.get(`/api/shifts/cashier/${cashierId}`, {
        params: { startDate, endDate },
    });
    return response.data;
};
