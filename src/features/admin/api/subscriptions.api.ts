import { axiosInstance } from '@/services/api';

export interface Subscription {
    id: string;
    tenantId: string;
    planType: string;
    status: 'trial' | 'active' | 'suspended' | 'cancelled';
    maxBranches: number;
    pricePerMonth: number;
    trialEndsAt: string | null;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    createdAt: string;
    updatedAt: string;
}

export interface Invoice {
    id: string;
    subscriptionId: string;
    tenantId: string;
    amount: number;
    status: 'pending' | 'paid' | 'failed' | 'cancelled';
    dueDate: string;
    paidAt: string | null;
    paymentMethod: string | null;
    mpesaReceipt: string | null;
    createdAt: string;
}

export interface UsageStats {
    branches: {
        current: number;
        max: number;
    };
    users: number;
    products: number;
    subscription: Subscription | null;
}

export interface PricingTier {
    branches: number;
    pricePerMonth: number;
}

export interface PricingData {
    basePricePerMonth: number;
    pricePerAdditionalBranch: number;
    pricing: PricingTier[];
}

export const subscriptionsAPI = {
    /**
     * Get current subscription
     */
    getCurrentSubscription: async (): Promise<Subscription> => {
        const response = await axiosInstance.get('/subscriptions/current');
        return response.data.data;
    },

    /**
     * Get usage statistics
     */
    getUsageStats: async (): Promise<UsageStats> => {
        const response = await axiosInstance.get('/subscriptions/usage');
        return response.data.data;
    },

    /**
     * Upgrade subscription
     */
    upgradeSubscription: async (branches: number): Promise<Subscription> => {
        const response = await axiosInstance.post('/subscriptions/upgrade', { branches });
        return response.data.data;
    },

    /**
     * Downgrade subscription
     */
    downgradeSubscription: async (branches: number): Promise<Subscription> => {
        const response = await axiosInstance.post('/subscriptions/downgrade', { branches });
        return response.data.data;
    },

    /**
     * Get billing history
     */
    getInvoices: async (): Promise<Invoice[]> => {
        const response = await axiosInstance.get('/subscriptions/invoices');
        return response.data.data;
    },

    /**
     * Pay invoice
     */
    payInvoice: async (invoiceId: string, mpesaReceipt: string): Promise<Invoice> => {
        const response = await axiosInstance.post('/subscriptions/pay-invoice', {
            invoiceId,
            mpesaReceipt,
        });
        return response.data.data;
    },

    /**
     * Activate license key
     */
    activateLicense: async (licenseKey: string): Promise<any> => {
        const response = await axiosInstance.post('/subscriptions/activate-license', {
            licenseKey,
        });
        return response.data.data;
    },

    /**
     * Get pricing information
     */
    getPricing: async (): Promise<PricingData> => {
        const response = await axiosInstance.get('/subscriptions/pricing');
        return response.data.data;
    },
};
