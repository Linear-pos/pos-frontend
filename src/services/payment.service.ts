import { axiosInstance } from '../services/api';
import type { AxiosError } from 'axios';

export interface PaymentRequest {
  sale_id: string;
  payment_method: string;
  amount: number;
  reference?: string;
  phone_number?: string;
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



const normalizeKenyanPhone = (input: string): string => {
  const raw = String(input ?? "").trim();
  const digits = raw.replace(/\D/g, "");

  // Accept: 07XXXXXXXX, 01XXXXXXXX, 7XXXXXXXX, 1XXXXXXXX, 2547XXXXXXXX, 2541XXXXXXXX, +254...
  if (/^0[17]\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^[17]\d{8}$/.test(digits)) return `254${digits}`;
  if (/^254[17]\d{8}$/.test(digits)) return digits;

  throw new Error("Invalid phone number. Use format 07XXXXXXXX, 01XXXXXXXX, or 254XXXXXXXXX");
};

const normalizeMpesaAmount = (amount: number): number => {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error("Invalid amount");
  }

  // Many STK push backends expect an integer amount.
  return Math.round(n);
};

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

  async processMpesaPayment(mpesaData: MpesaPaymentRequest): Promise<{
    success: boolean;
    message: string;
    checkoutRequestID?: string;
  }> {
    try {
      const payload = {
        saleId: mpesaData.sale_id, // Using sale_id as the primary ID
        amount: normalizeMpesaAmount(mpesaData.amount),
        paymentMethod: 'mpesa',
        phoneNumber: normalizeKenyanPhone(mpesaData.phone_number),
        reference: mpesaData.reference || mpesaData.sale_id,
        description: `Sale ${mpesaData.sale_id}`
      };

      console.log('[M-Pesa] Sending STK push request:', payload);
      const response = await axiosInstance.post('/payments/mpesa/stk-push', payload);
      const data = response.data;
      console.log('[M-Pesa] Raw API response:', JSON.stringify(data, null, 2));

      console.log('[M-Pesa] Inspecting data for CheckoutRequestID:', data);

      // Robust parsing for CheckoutRequestID
      let checkoutRequestID =
        // 1. Expected path from backend
        data.data?.mpesaResponse?.CheckoutRequestID ||
        // 2. Direct property (if backend structure changes)
        data.checkoutRequestID ||
        // 3. Lowercase variation
        data.data?.mpesaResponse?.checkoutRequestID ||
        // 4. Root level response (direct from Safaricom proxies)
        data.CheckoutRequestID ||
        // 5. Nested in payment object?
        data.data?.payment?.reference;

      console.log('[M-Pesa] Parsed checkoutRequestID:', checkoutRequestID);
      console.log('[M-Pesa] data.success:', data.success);

      return {
        success: data.success,
        message: data.message,
        checkoutRequestID
      };
    } catch (error: unknown) {
      const err = error as AxiosError<unknown>;
      console.error('[M-Pesa] STK push error:', err.response?.data || err.message);
      const data = err?.response?.data;

      const messageFromObject =
        data && typeof data === "object" && !Array.isArray(data)
          ? (data as { message?: unknown; error?: unknown })
          : null;

      const errorsFromObject =
        messageFromObject && "errors" in messageFromObject
          ? (messageFromObject as { errors?: unknown }).errors
          : null;

      const errorsText =
        errorsFromObject && typeof errorsFromObject === "object"
          ? JSON.stringify(errorsFromObject)
          : null;

      const message =
        (messageFromObject?.message ? String(messageFromObject.message) : null) ||
        (messageFromObject?.error ? String(messageFromObject.error) : null) ||
        errorsText ||
        (typeof data === "string" ? data : null) ||
        err?.message ||
        "Failed to process M-Pesa payment";

      throw new Error(message);
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
    } catch (error: unknown) {
      const err = error as AxiosError<unknown>;
      const data = err?.response?.data;

      const messageFromObject =
        data && typeof data === "object" && !Array.isArray(data)
          ? (data as { message?: unknown; error?: unknown })
          : null;

      const message =
        (messageFromObject?.message ? String(messageFromObject.message) : null) ||
        (messageFromObject?.error ? String(messageFromObject.error) : null) ||
        (typeof data === "string" ? data : null) ||
        err?.message ||
        "Failed to verify M-Pesa payment";

      throw new Error(message);
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