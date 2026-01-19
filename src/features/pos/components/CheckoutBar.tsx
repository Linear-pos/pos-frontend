import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart.store";
import { salesAPI } from "@/features/sales/api";
import type { Sale } from "@/types/sale";
import Receipt from "@/components/receipts/Receipt";
import PaymentModal from "@/components/payments/PaymentModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

export const CheckoutBar = () => {
  const { items, clearCart, total, itemCount } = useCartStore();

  // Calculate totals
  const subtotal = total / 1.16;
  const tax = total - subtotal;

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = () => {
    if (itemCount === 0) return;
    setError(null);
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async (method: string, data?: any): Promise<Sale> => {
    try {
      const itemsPayload = items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: Number(item.price),
      }));

      const payload = {
        payment_method: method,
        status: method === 'cash' ? 'completed' : 'pending',
        items: itemsPayload,
        tax,
        reference: data?.reference,
      };

      const sale = await salesAPI.createSale(payload as any);
      return sale;
    } catch (err: any) {
      console.error("Payment processing error:", err);
      throw new Error(err.response?.data?.message || "Payment processing failed");
    }
  };

  const handlePaymentComplete = (sale: Sale) => {
    setSuccessMessage(`Order #${sale.id} completed!`);
    setCompletedSale(sale);
    setShowPaymentModal(false);

    // Auto Show Receipt
    setTimeout(() => {
      setShowReceipt(true);
    }, 500);
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
    setCompletedSale(null);
    setSuccessMessage(null);
    clearCart();
  };

  return (
    <div className="bg-card border-t p-4 shadow-up">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Order Summary */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Subtotal ({itemCount} items):
          </span>
          <span className="font-medium">KES {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">VAT (16%):</span>
          <span className="font-medium">KES {tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-primary font-semibold">Total:</span>
          <span className="text-muted-foreground text-xl font-bold">
            KES {total.toFixed(2)}
          </span>
        </div>
      </div>

      <Button
        className="w-full h-12 text-lg"
        onClick={handleCheckout}
        disabled={total <= 0 || itemCount === 0}
      >
        Pay KES {total.toFixed(2)}
      </Button>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={total}
        onProcessPayment={handleProcessPayment}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Receipt Modal */}
      <Receipt
        open={showReceipt}
        onClose={handleReceiptClose}
        sale={completedSale}
      />
    </div>
  );
};

export default CheckoutBar;
