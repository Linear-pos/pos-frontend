import { useState, useEffect } from "react";
import { Smartphone, CreditCard, Banknote, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { paymentService } from "@/services/payment.service";
import type { Sale } from "@/types/sale";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Sale is null initially if we are creating it, OR we pass the *cart items* to create it?
  // Actually, existing logic creates SALE first for non-cash.
  // We want to create sale ON confirmation for Cash.
  // Let's accept `sale` (if pending) OR `cartPayload`?
  // Simplest: The parent creates a "Pending" sale for EVERY checkout attempt, OR we handle creation here.
  // Better: Pass `total` and `items` if sale not created?
  // Let's stick to: Pass `sale` if it exists (retry). Pass `cartData` if new?
  // To keep props simple, let's assume Parent creates a PENDING sale before opening modal?
  // OR Parent passes data and Modal creates sale.
  // Existing CheckoutBar creates sale for Non-Cash.
  // Let's change CheckoutBar to NOT create sale yet?
  // No, `PaymentModal` needs a `sale_id` for M-Pesa/Card.
  // So:
  // 1. Cash: Create Sale (Completed) immediately.
  // 2. M-Pesa: Create Sale (Pending), then Process.
  // Let's accept `checkoutData` and `sale?`.
  sale?: Sale | null;
  total: number;
  onPaymentComplete: (sale: Sale) => void;
  onProcessPayment?: (method: string, additionalData?: any) => Promise<Sale>; // Callback to create sale
}

export const PaymentModal = ({
  isOpen,
  onClose,
  sale,
  total,
  onPaymentComplete,
  onProcessPayment // Hook to parent to create sale
}: PaymentModalProps) => {
  const [activeTab, setActiveTab] = useState("cash");

  // Cash State
  const [amountTendered, setAmountTendered] = useState<string>("");
  const [change, setChange] = useState<number>(0);

  // M-Pesa State
  const [phoneNumber, setPhoneNumber] = useState("");

  // Common State
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAmountTendered("");
      setChange(0);
      setError(null);
      setSuccess(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const tendered = parseFloat(amountTendered) || 0;
    setChange(Math.max(0, tendered - total));
  }, [amountTendered, total]);

  const handleCashSubmit = async () => {
    const tendered = parseFloat(amountTendered) || 0;
    if (tendered < total) {
      setError("Insufficient amount tendered");
      return;
    }
    setIsProcessing(true);
    try {
      if (onProcessPayment) {
        const completedSale = await onProcessPayment("cash", { amountTendered: tendered });
        setSuccess("Payment Successful!");
        setTimeout(() => onPaymentComplete(completedSale), 1000);
      }
    } catch (err: any) {
      setError(err.message || "Payment failed");
      setIsProcessing(false);
    }
  };

  const handleMpesaSubmit = async () => {
    setIsProcessing(true);
    try {
      // 1. Create Sale (Pending) if not exists
      let currentSale = sale;
      if (!currentSale && onProcessPayment) {
        currentSale = await onProcessPayment("mpesa", { phoneNumber });
      }

      if (!currentSale) throw new Error("Could not create sale");

      // 2. Init STK Push (handled by onProcessPayment or here?)
      // If onProcessPayment handles it, good. If not, we do it here.
      // Let's assume onProcessPayment just creates the PENDING sale in DB.
      // Then we call paymentService.

      // Actually, existing Modal logic called paymentService.processMpesaPayment

      const result = await paymentService.processMpesaPayment({
        phone_number: phoneNumber,
        amount: total,
        sale_id: currentSale.id,
        reference: currentSale.reference
      });

      if (result.success && result.checkoutRequestID) {
        // Start polling (simplified for brevity, reuse existing polling logic)
        pollPaymentStatus(result.checkoutRequestID, currentSale);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err.message || "M-Pesa initiation failed");
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (checkoutID: string, currentSale: Sale) => {
    const maxAttempts = 20;
    let attempts = 0;

    const poll = async () => {
      attempts++;
      try {
        const result = await paymentService.verifyMpesaPayment(checkoutID);
        if (result.success && result.status === "completed") {
          setSuccess("Payment Verified!");
          setTimeout(() => onPaymentComplete(currentSale), 1000);
        } else if (result.status === "failed") {
          setError("Payment Failed");
          setIsProcessing(false);
        } else if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          setError("Verification timeout");
          setIsProcessing(false);
        }
      } catch (error) {
        if (attempts < maxAttempts) setTimeout(poll, 3000);
        else {
          setError("Error verifying payment");
          setIsProcessing(false);
        }
      }
    };
    poll();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
          <div className="mt-2 text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Amount</div>
            <div className="text-3xl font-bold text-primary">KES {total.toFixed(2)}</div>
          </div>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cash">
              <Banknote className="h-4 w-4 mr-2" /> Cash
            </TabsTrigger>
            <TabsTrigger value="mpesa">
              <Smartphone className="h-4 w-4 mr-2" /> M-Pesa
            </TabsTrigger>
            <TabsTrigger value="card">
              <CreditCard className="h-4 w-4 mr-2" /> Card
            </TabsTrigger>
          </TabsList>

          {/* CASH TAB */}
          <TabsContent value="cash" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount Tendered</Label>
              <Input
                type="number"
                value={amountTendered}
                onChange={(e) => setAmountTendered(e.target.value)}
                placeholder="Enter amount..."
                className="text-lg"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 200, 500, 1000].map((amt) => (
                <Button
                  key={amt}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmountTendered(amt.toString())}
                >
                  {amt}
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => setAmountTendered(total.toString())}>Exact</Button>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted rounded">
              <span className="font-semibold">Change:</span>
              <span className={`text-xl font-bold ${change < 0 ? 'text-destructive' : 'text-primary'}`}>
                KES {change.toFixed(2)}
              </span>
            </div>

            <Button className="w-full" onClick={handleCashSubmit} disabled={isProcessing || !amountTendered || parseFloat(amountTendered) < total}>
              {isProcessing ? <Loader2 className="animate-spin" /> : "Complete Cash Sale"}
            </Button>
          </TabsContent>

          {/* MPESA TAB */}
          <TabsContent value="mpesa" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                placeholder="254..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleMpesaSubmit} disabled={isProcessing || !phoneNumber}>
              {isProcessing ? "Processing..." : "Send STK Push"}
            </Button>
          </TabsContent>

          {/* CARD TAB */}
          <TabsContent value="card" className="space-y-4 py-4">
            <div className="text-center text-muted-foreground p-4">
              Card integration Placeholder
            </div>
            <Button className="w-full" disabled>Connect Terminal</Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
