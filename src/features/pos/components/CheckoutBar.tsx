import { useState } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { salesAPI } from "../../sales/api";
import PaymentModal from "@/components/payments/PaymentModal";
import Receipt from "@/components/receipts/Receipt";
import type { Sale } from "../../../types/sale";

interface CheckoutBarProps {
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
  items: any[];
  onCheckout: () => void;
  className?: string;
}

export const CheckoutBar = ({
  subtotal,
  tax,
  total,
  itemCount,
  items,
  onCheckout,
  className = "",
}: CheckoutBarProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("cash");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdSale, setCreatedSale] = useState<Sale | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const handleCheckout = async () => {
    if (itemCount === 0) return;

    // For non-cash payments, we need to handle payment flow
    if (selectedPaymentMethod !== "cash") {
      await handleNonCashPayment();
    } else {
      await handleCashPayment();
    }
  };

  const handleCashPayment = async () => {
    if (itemCount === 0) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        payment_method: "cash",
        status: "completed" as const,
        reference: referenceNumber || undefined,
        tax,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: Number(item.price),
        })),
      };
      console.log("Checkout payload (cash):", payload);
      const sale = await salesAPI.createSale(payload);
      setSuccessMessage(`Order #${sale.id} completed successfully!`);
      setCompletedSale(sale);

      // Show receipt after a short delay
      setTimeout(() => {
        setShowReceipt(true);
      }, 1000);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to ";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNonCashPayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create sale with pending status
      const payload = {
        payment_method: selectedPaymentMethod,
        status: "pending" as const,
        reference: referenceNumber || undefined,
        tax,
        items: items.map((item) => ({
          product_id: String(item.product_id),
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
      };
      console.log("Checkout payload (non-cash):", payload);
      const sale = await salesAPI.createSale(payload);
      setCreatedSale(sale);
      setShowPaymentModal(true);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create order";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentComplete = (sale: Sale) => {
    setSuccessMessage(`Order #${sale.id} payment completed successfully!`);
    setCompletedSale(sale);
    setShowPaymentModal(false);
    setCreatedSale(null);

    // Show receipt after a short delay
    setTimeout(() => {
      setShowReceipt(true);
    }, 1000);
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
    setCompletedSale(null);
    setSuccessMessage(null);
    setReferenceNumber("");
    onCheckout();
  };

  return (
    <div className={`${className}`}>
      {/* Error Message */}
      {error && (
        <div className="mb-3 p-3 bg-error-50 border border-error-200 rounded flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-error-600 flex-shrink-0 mt-0.5" />
          <span className="text-error-600 text-sm">{error}</span>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-3 p-3 bg-success-50 border border-success-200 rounded flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-success-600 flex-shrink-0 mt-0.5" />
          <span className="text-success-600 text-sm">{successMessage}</span>
        </div>
      )}

      {/* Payment Method Selection */}
      <div className="mb-4">
        <label className="text-sm font-medium text-primary mb-2 block">
          Payment Method
        </label>
        <Select
          value={selectedPaymentMethod}
          onValueChange={setSelectedPaymentMethod}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="mpesa">M-Pesa</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reference Number for M-Pesa/Card */}
      {(selectedPaymentMethod === "mpesa" ||
        selectedPaymentMethod === "card") && (
        <div className="mb-4">
          <label className="text-sm font-medium text-primary mb-2 block">
            {selectedPaymentMethod === "mpesa" ? "M-Pesa" : "Card"} Reference
          </label>
          <Input
            type="text"
            placeholder={
              selectedPaymentMethod === "mpesa"
                ? "M-Pesa transaction ID"
                : "Card last 4 digits"
            }
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
          />
        </div>
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
        className="w-full "
        onClick={handleCheckout}
        disabled={total <= 0 || isLoading || itemCount === 0}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : selectedPaymentMethod === "cash" ? (
          "Complete Order"
        ) : (
          "Proceed to Payment"
        )}
      </Button>

      {/* Payment Modal for non-cash payments */}
      {createdSale && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setCreatedSale(null);
          }}
          sale={createdSale}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {/* Receipt Modal */}
      {completedSale && (
        <Receipt
          isOpen={showReceipt}
          onClose={handleReceiptClose}
          sale={completedSale}
        />
      )}
    </div>
  );
};

export default CheckoutBar;
