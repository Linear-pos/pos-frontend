import { axiosInstance } from '../services/api';

export interface PaymentRequest {
  sale_id: string;
  payment_method: string;
  amount: number;
  reference?: string;
  phone_number?: string; // For M-Pesa
}

export interface PaymentResponse {
  id: string;
  sale_id: string;
  payment_method: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference?: string;
  transaction_id?: string;
  created_at: string;
}

export interface MpesaPaymentRequest {
  phone_number: string;
  amount: number;
  sale_id: string;
  reference?: string;
}

class PaymentService {
  /**
   * Process payment for a sale
   */
  async processPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    const response = await axiosInstance.post<PaymentResponse>(
      '/payments/process', 
      paymentData
    );
    return response.data;
  }

  /**
   * Process M-Pesa payment (STK Push)
   */
  async processMpesaPayment(mpesaData: MpesaPaymentRequest): Promise<{
    success: boolean;
    message: string;
    checkoutRequestID?: string;
  }> {
    try {
      const response = await axiosInstance.post('/payments/mpesa/stk-push', mpesaData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || 'Failed to process M-Pesa payment'
      );
    }
  }

  /**
   * Verify M-Pesa payment status
   */
  async verifyMpesaPayment(checkoutRequestID: string): Promise<{
    success: boolean;
    status: 'pending' | 'completed' | 'failed';
    message: string;
    transactionId?: string;
  }> {
    try {
      const response = await axiosInstance.post('/payments/mpesa/verify', {
        checkoutRequestID
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || 'Failed to verify M-Pesa payment'
      );
    }
  }

  /**
   * Process card payment
   */
  async processCardPayment(paymentData: PaymentRequest & {
    card_number?: string;
    expiry_date?: string;
    cvv?: string;
  }): Promise<PaymentResponse> {
    const response = await axiosInstance.post<PaymentResponse>(
      '/payments/card',
      paymentData
    );
    return response.data;
  }

  /**
   * Get payment methods available
   */
  async getPaymentMethods(): Promise<Array<{
    id: string;
    name: string;
    type: 'cash' | 'mobile' | 'card';
    enabled: boolean;
    icon?: string;
  }>> {
    const response = await axiosInstance.get('/payment-methods');
    return response.data;
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId: string, reason?: string): Promise<PaymentResponse> {
    const response = await axiosInstance.post<PaymentResponse>(
      `/payments/${paymentId}/refund`,
      { reason }
    );
    return response.data;
  }

  /**
   * Get payment details
   */
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    const response = await axiosInstance.get<PaymentResponse>(
      `/payments/${paymentId}`
    );
    return response.data;
  }

  /**
   * Get payments for a sale
   */
  async getSalePayments(saleId: string): Promise<PaymentResponse[]> {
    const response = await axiosInstance.get<PaymentResponse[]>(
      `/sales/${saleId}/payments`
    );
    return response.data;
  }

  /**
   * Format payment method for display
   */
  formatPaymentMethod(method: string): string {
    const methods: Record<string, string> = {
      'cash': 'Cash',
      'mpesa': 'M-Pesa',
      'card': 'Card',
      'bank_transfer': 'Bank Transfer',
      'cheque': 'Cheque',
      'credit': 'Store Credit'
    };
    return methods[method] || method.charAt(0).toUpperCase() + method.slice(1);
  }

  /**
   * Get payment status color
   */
  getPaymentStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'pending': 'warning',
      'completed': 'success',
      'failed': 'error',
      'refunded': 'neutral'
    };
    return colors[status] || 'neutral';
  }
}

export const paymentService = new PaymentService();
export default paymentService;