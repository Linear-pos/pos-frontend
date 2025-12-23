import { axiosInstance } from './api';

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  requires_reference: boolean;
  requires_verification: boolean;
}

export interface Payment {
  id: string;
  sale_id: string;
  amount: number;
  payment_method: string;
  reference?: string;
  notes?: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  change_amount: number;
  created_at: string;
  updated_at: string;
}

export interface ProcessPaymentPayload {
  payment_method: string;
  amount: number;
  reference?: string;
  notes?: string;
}

export interface RefundPaymentPayload {
  reason: string;
  amount?: number;
}

export const paymentsAPI = {
  /**
   * Get available payment methods
   */
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await axiosInstance.get<PaymentMethod[]>('/payment-methods');
    return response.data;
  },

  /**
   * Process a payment for a sale
   */
  processPayment: async (saleId: string, payload: ProcessPaymentPayload): Promise<Payment> => {
    const response = await axiosInstance.post<any>(`/sales/${saleId}/payment`, payload);
    return response.data.payment;
  },

  /**
   * Get payment history for a sale
   */
  getSalePayments: async (saleId: string): Promise<{
    sale_id: string;
    sale_total: number;
    payments: Payment[];
    total_paid: number;
    remaining_balance: number;
  }> => {
    const response = await axiosInstance.get(`/sales/${saleId}/payments`);
    return response.data;
  },

  /**
   * Refund a payment
   */
  refundPayment: async (paymentId: string, payload: RefundPaymentPayload): Promise<Payment> => {
    const response = await axiosInstance.post<any>(`/payments/${paymentId}/refund`, payload);
    return response.data.payment;
  },

  /**
   * Verify payment with external provider
   */
  verifyPayment: async (paymentMethod: string, reference: string): Promise<boolean> => {
    const response = await axiosInstance.post<{ verified: boolean }>(
      '/payments/verify',
      { payment_method: paymentMethod, reference }
    );
    return response.data.verified;
  },

  /**
   * Format currency
   */
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  },

  /**
   * Calculate change amount
   */
  calculateChange: (paymentAmount: number, totalAmount: number): number => {
    return Math.max(0, paymentAmount - totalAmount);
  },
};

export default paymentsAPI;
