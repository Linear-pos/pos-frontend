import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PaymentStatus } from '@/types/payment.ts';

type PaymentMethod = 'mpesa' | 'cash' | 'card' | '';

interface PaymentState {
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  error: string | null;
  success: string | null;
  currentSaleId: string | null;
  checkoutRequestId: string | null;
  transactionDetails: {
    mpesaReceiptNumber?: string;
    transactionDate?: string;
    phoneNumber?: string;
  } | null;
  setPaymentStatus: (status: PaymentStatus) => void;
  setPaymentMethod: (method: PaymentMethod) => void;  // Add this line
  setError: (error: string | null) => void;
  setSuccess: (message: string | null) => void;
  setCurrentSaleId: (saleId: string | null) => void;
  setCheckoutRequestId: (requestId: string | null) => void;
  setTransactionDetails: (details: PaymentState['transactionDetails']) => void;
  resetPaymentState: () => void;
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set) => ({
      paymentStatus: 'idle',
      paymentMethod: '',
      error: null,
      success: null,
      currentSaleId: null,
      checkoutRequestId: null,
      transactionDetails: null,  // Add this line
      setPaymentStatus: (status) => set({ paymentStatus: status }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setError: (error) => set({ error }),
      setSuccess: (message) => set({ success: message }),
      setCurrentSaleId: (saleId) => set({ currentSaleId: saleId }),
      setCheckoutRequestId: (requestId) => set({ checkoutRequestId: requestId }),
      setTransactionDetails: (details) => set({ transactionDetails: details }),  // Add this line
      resetPaymentState: () =>
        set({
          paymentStatus: 'idle',
          paymentMethod: '',
          error: null,
          success: null,
          currentSaleId: null,
          checkoutRequestId: null,
          transactionDetails: null,  // Add this line to reset transactionDetails
        }),
    }),
    {
      name: 'payment-storage',
      partialize: (state) => ({
        currentSaleId: state.currentSaleId,
        checkoutRequestId: state.checkoutRequestId,
        transactionDetails: state.transactionDetails,  // Optionally persist transaction details
      }),
    }
  )
);

// WebSocket service for payment callbacks
class PaymentWebSocketService {
  private static instance: PaymentWebSocketService;
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds

  private constructor() {
    this.connect();
  }

  public static getInstance(): PaymentWebSocketService {
    if (!PaymentWebSocketService.instance) {
      PaymentWebSocketService.instance = new PaymentWebSocketService();
    }
    return PaymentWebSocketService.instance;
  }

  private connect() {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/payment/callback`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket Connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handlePaymentUpdate(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket Disconnected');
      this.attemptReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private handlePaymentUpdate(data: {
    checkoutRequestID: string;
    resultCode: string;
    resultDesc: string;
    mpesaReceiptNumber?: string;
    transactionDate?: string;
    phoneNumber?: string;
  }) {
    const { checkoutRequestID, resultCode, resultDesc, mpesaReceiptNumber, transactionDate } = data;

    // Only process if we have a matching checkout request ID
    const paymentStore = usePaymentStore.getState();
    if (paymentStore.checkoutRequestId !== checkoutRequestID) return;

    if (resultCode === '0') {
      // Payment successful
      paymentStore.setPaymentStatus('success');
      paymentStore.setSuccess('Payment received successfully');

      // You can update the sale status in your backend here if needed
      // This is just an example - you might want to handle this differently
      if (paymentStore.currentSaleId) {
        // Update sale status in the backend
        fetch(`/api/sales/${paymentStore.currentSaleId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'completed',
            paymentStatus: 'completed',
            paymentMethod: 'mpesa',
            transactionId: mpesaReceiptNumber,
            transactionDate: transactionDate ? new Date(transactionDate).toISOString() : new Date().toISOString()
          })
        }).catch(console.error);
      }
    } else {
      // Payment failed
      paymentStore.setPaymentStatus('failed');
      paymentStore.setError(`Payment failed: ${resultDesc}`);
    }
  }

  public close() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Initialize WebSocket connection when the store is first used
if (typeof window !== 'undefined') {
  PaymentWebSocketService.getInstance();
}
