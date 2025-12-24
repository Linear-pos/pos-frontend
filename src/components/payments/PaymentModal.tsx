import { useState, useEffect } from "react";
import { Smartphone, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { paymentService, type MpesaPaymentRequest } from "@/services/payment.service";
import type { Sale } from "@/types/sale";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  onPaymentComplete: (sale: Sale) => void;
}

export const PaymentModal = ({ isOpen, onClose, sale, onPaymentComplete }: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [_checkoutRequestID, setCheckoutRequestID] = useState<string | null>(null);

  useEffect(() => {
    // Reset form when modal opens/closes
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setPhoneNumber('');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setError(null);
    setIsVerifying(false);
    setCheckoutRequestID(null);
  };

  const handleMpesaPayment = async () => {
    if (!sale || !phoneNumber) return;

    setIsProcessing(true);
    setError(null);

    try {
      const mpesaData: MpesaPaymentRequest = {
        phone_number: phoneNumber,
        amount: sale.total,
        sale_id: sale.id,
        reference: sale.reference
      };

      const result = await paymentService.processMpesaPayment(mpesaData);

      if (result.success && result.checkoutRequestID) {
        setCheckoutRequestID(result.checkoutRequestID);
        setIsVerifying(true);
        
        // Start polling for payment confirmation
        pollPaymentStatus(result.checkoutRequestID);
      } else {
        setError(result.message || 'Failed to initiate M-Pesa payment');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process M-Pesa payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (checkoutID: string) => {
    const maxAttempts = 20; // Poll for max 2 minutes (6 seconds × 20)
    let attempts = 0;

    const poll = async () => {
      attempts++;
      
      try {
        const result = await paymentService.verifyMpesaPayment(checkoutID);
        
        if (result.success && result.status === 'completed') {
          // Payment successful
          setIsVerifying(false);
          if (sale) {
            onPaymentComplete(sale);
          }
          onClose();
        } else if (result.status === 'failed') {
          // Payment failed
          setIsVerifying(false);
          setError(result.message || 'M-Pesa payment failed');
        } else if (attempts < maxAttempts) {
          // Still pending, continue polling
          setTimeout(poll, 6000); // Poll every 6 seconds
        } else {
          // Timeout
          setIsVerifying(false);
          setError('Payment verification timeout. Please check if the payment was completed.');
        }
      } catch (err: any) {
        if (attempts < maxAttempts) {
          setTimeout(poll, 6000);
        } else {
          setIsVerifying(false);
          setError('Failed to verify payment status');
        }
      }
    };

    // Start polling after 3 seconds
    setTimeout(poll, 3000);
  };

  const handleCardPayment = async () => {
    if (!sale || !cardNumber || !expiryDate || !cvv) return;

    setIsProcessing(true);
    setError(null);

    try {
      const paymentData = {
        sale_id: sale.id,
        payment_method: 'card',
        amount: sale.total,
        reference: sale.reference,
        card_number: cardNumber,
        expiry_date: expiryDate,
        cvv: cvv
      };

      await paymentService.processCardPayment(paymentData);
      onPaymentComplete(sale);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to process card payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'mpesa') {
      handleMpesaPayment();
    } else {
      handleCardPayment();
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {paymentMethod === 'mpesa' ? (
              <Smartphone className="h-5 w-5 text-success-600" />
            ) : (
              <CreditCard className="h-5 w-5 text-info-600" />
            )}
            Payment Processing
          </DialogTitle>
        </DialogHeader>

        {sale && (
          <div className="mb-4 p-3 bg-neutral-50 rounded">
            <div className="text-sm text-neutral-600">Amount Due</div>
            <div className="text-2xl font-bold text-primary">KES {sale.total.toFixed(2)}</div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isVerifying && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Waiting for M-Pesa payment confirmation. Please check your phone and complete the payment.
            </AlertDescription>
          </Alert>
        )}

        {!isVerifying && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Method Selection */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={paymentMethod === 'mpesa' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setPaymentMethod('mpesa')}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                M-Pesa
              </Button>
              <Button
                type="button"
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Card
              </Button>
            </div>

            {paymentMethod === 'mpesa' ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">M-Pesa Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="254XXXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isProcessing || !phoneNumber}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Send STK Push'
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={formatCardNumber(cardNumber)}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').slice(0, 16))}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      type="text"
                      placeholder="MM/YY"
                      value={formatExpiryDate(expiryDate)}
                      onChange={(e) => setExpiryDate(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      value={cvv.replace(/\D/g, '').slice(0, 3)}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isProcessing || !cardNumber || !expiryDate || !cvv}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Process Payment'
                  )}
                </Button>
              </div>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;