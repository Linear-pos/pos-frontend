import { useCartStore } from "@/stores/cart.store";
import { Button } from "@/components/ui/button";
import { ShoppingBag, X, Plus, Minus, Smartphone, CreditCard, Banknote, Loader2, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import { salesAPI } from "@/features/sales/api";
import { paymentService } from "@/services/payment.service";
import { usePaymentStore } from "@/stores/payment.store";
import type { Sale } from "@/types/sale";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MpesaProcessingModal } from "../components/MpesaProcessingModal";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Receipt from "@/components/receipts/Receipt";
import type { PaymentStatus } from '@/types/payment.ts';

function mapToSaleStatus(paymentStatus: PaymentStatus): 'completed' | 'pending' | 'cancelled' | undefined {
  switch(paymentStatus) {
    case 'success':
      return 'completed';
    case 'failed':
    case 'timeout':
      return 'cancelled';
    case 'waiting':
    case 'processing':
      return 'pending';
    case 'idle':
    default:
      return undefined;
  }
}
const BAG_OPTIONS = [
  { id: 'bag-small', name: 'Small Bag', price: 20 },
  { id: 'bag-medium', name: 'Medium Bag', price: 30 },
  { id: 'bag-large', name: 'Large Bag', price: 50 },
] as const;

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, total, clearCart, removeItem, updateQuantity } = useCartStore();
<<<<<<< Updated upstream
=======

  const handleQuantityChange = useCallback((productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  }, [updateQuantity]);
>>>>>>> Stashed changes

  // Payment state from store
  const {
    paymentStatus,
    error,
    success,
    setPaymentStatus,
    setPaymentMethod,
    setError,
    setSuccess,
    setCurrentSaleId,
    setCheckoutRequestId,
    resetPaymentState
  } = usePaymentStore();

  // Local state
  const [activeTab, setActiveTab] = useState<"cash" | "mpesa" | "card">("cash");
  const [amountTendered, setAmountTendered] = useState<string>("");
  const [change, setChange] = useState<number>(0);
  const [phoneNumber, setPhoneNumber] = useState("2547");
  const [showReceipt, setShowReceipt] = useState(false);
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);

  // Derived state
  const isProcessing = paymentStatus === 'processing' || paymentStatus === 'waiting';

  // Reset payment state on component mount
  useEffect(() => {
    return () => {
      // Only reset if not in a processing state
      if (!isProcessing) {
        resetPaymentState();
      }
    };
  }, [isProcessing, resetPaymentState]);

<<<<<<< Updated upstream
  // Handle payment status timeout
  useEffect(() => {
    if (paymentStatus === 'waiting' || paymentStatus === 'waiting_confirmation') {
      const timer = setTimeout(() => {
        // if (paymentStatus !== 'success' && paymentStatus !== 'failed') { // Redundant check removed
        setPaymentStatus('timeout');
        setError('Payment request timed out. Please try again.');
        // }
      }, 120000); // 2 minutes timeout

      return () => clearTimeout(timer);
    }
  }, [paymentStatus, setPaymentStatus, setError]);
=======
useEffect(() => {
  if (paymentStatus !== 'waiting') return;

  const timer = setTimeout(() => {
      if (paymentStatus === 'waiting') {
        setError('Payment request timed out. Please try again.');
        setPaymentStatus('timeout');
      }
  }, 120000);

  return () => clearTimeout(timer);
}, [paymentStatus, setPaymentStatus, setError]);

>>>>>>> Stashed changes

  // Redirect if cart is empty and not processing/showing receipt
  useEffect(() => {
    if (items.length === 0 && !showReceipt && !isProcessing && paymentStatus === 'idle') {
      // Small delay to prevent immediate redirect if just landed
      const timer = setTimeout(() => {
        // navigate("/pos"); // Optional: auto-redirect or let user click back
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [items, showReceipt, isProcessing, paymentStatus, navigate]);

  // Handle payment status changes
  useEffect(() => {
    if (paymentStatus === 'success' && currentSale) {
      // Show receipt on successful payment
      setTimeout(() => {
        setShowReceipt(true);
      }, 500);
    }
  }, [paymentStatus, currentSale]);

  // Calculate totals
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  }, [items]);

  const tax = useMemo(() => {
    return Math.ceil(subtotal * 0.16);
  }, [subtotal]);

  // Bag logic could be simplified or kept if needed. 
  // For now, assuming bag selection was part of checkout, keeping it simple.
  // Unless user specifically asked to move bag selection to POS. 
  // The prompt said "remove scan or search", so bag options can stay or go.
  // Let's keep bag options here as it's a checkout detail.
  const [selectedBag, setSelectedBag] = useState<string | null>(null);

  const bagPrice = useMemo(() => {
    if (!selectedBag) return 0;
    const bag = BAG_OPTIONS.find(b => b.id === selectedBag);
    return bag ? bag.price : 0;
  }, [selectedBag]);

  // Re-calculate total with bag
  const finalTotal = useMemo(() => {
    return subtotal + tax + bagPrice;
  }, [subtotal, tax, bagPrice]);

  // Quick add amounts for cash
  const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

  // Handle back to POS
  const handleBackToPos = useCallback(() => {
    navigate("/pos");
  }, [navigate]);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  // Payment processing
  const buildPaymentReference = () => {
    return crypto.randomUUID();
  };

  type PaymentData = {
    reference?: string;
    status?: PaymentStatus;
    phone_number?: string;
    amount_tendered?: number;
    change?: number;
    [key: string]: unknown;
  };

  const handleProcessPayment = useCallback(async (method: 'cash' | 'mpesa' | 'card', data: Omit<PaymentData, 'status'> & { status?: PaymentStatus } = {}) => {
    try {
      const reference = data.reference || buildPaymentReference();
      // Create the payload with all necessary fields for the API
      const apiPayload = {
        payment_method: method,
        status: mapToSaleStatus(data.status || 'waiting'),
        reference,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: Number(item.price) // price is optional in CreateSalePayload but we include it
        })),
        tax: tax,
        // Include other fields that might be needed
        branch_id: data.branch_id,
        notes: data.notes,
        // Include the rest of the data that might be needed
        ...(selectedBag && { bag_fee: bagPrice })
      };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any      
      const sale = await salesAPI.createSale(apiPayload as any);
      setCurrentSale(sale);
      setCurrentSaleId(sale.id);
      return sale;
    } catch (err: unknown) {
      console.error("Payment processing error:", err);
      const errorMessage = (err as string) || "Payment processing failed";
      setError(errorMessage);
      setPaymentStatus('failed');
      throw new Error(errorMessage);
    }
  }, [items, tax, finalTotal, selectedBag, bagPrice, setCurrentSaleId, setError, setPaymentStatus]);

  const handleReceiptClose = useCallback(() => {
    handleBackToPos();
    setShowReceipt(false);
    clearCart();
    setCurrentSale(null);
    resetPaymentState();
    setAmountTendered("");
    setChange(0);
  }, [clearCart, resetPaymentState, handleBackToPos]);

  const handleCashSubmit = async () => {
    const tendered = parseFloat(amountTendered) || 0;
    if (tendered < total) {
      setError("Insufficient amount tendered");
      return;
    }

    setPaymentMethod('cash');
    setPaymentStatus('processing');
    setError(null);

    try {
      await handleProcessPayment("cash", {
        amount_tendered: tendered,
        change: change
      });
      setSuccess("Payment Successful!");
      setPaymentStatus('success');
    } catch (err: unknown) {
      setError(err as string || "Payment failed");
      setPaymentStatus('failed');
    }
  };

  const handleMpesaSubmit = async () => {
    if (!phoneNumber || phoneNumber.length < 12) {
      setError("Please enter a valid phone number (254XXXXXXXXX)");
      return;
    }

    try {
      // Set initial processing state
      setPaymentStatus('processing');
      setError(null);
      setShowMpesaModal(true);

      // 1. Create Pending Sale First
      const pendingSale = await handleProcessPayment("mpesa", {
        status: "waiting",
        phone_number: phoneNumber
      });

      if (!pendingSale?.id) {
        throw new Error("Failed to create pending sale");
      }

      // 2. Initiate M-Pesa Payment with Real Sale ID
      const result = await paymentService.processMpesaPayment({
        phone_number: phoneNumber,
        amount: total,
        sale_id: pendingSale.id,
        reference: pendingSale.reference
      });

      if (result.success && result.checkoutRequestID) {
        // Update to waiting state
        setSuccess("Please check your phone to complete the payment");
        setPaymentStatus('waiting');  // This should be 'waiting' not 'waiting_confirmation'
        setCheckoutRequestId(result.checkoutRequestID);

        // Start polling as a fallback
        pollPaymentStatus(result.checkoutRequestID, pendingSale.id);
      } else {
        console.log(result)
        throw new Error(result.message || "Failed to initiate M-Pesa payment");
      }
    } catch (error: unknown) {
      console.error("M-Pesa payment error:", error);
      setError(error as string || "Failed to process M-Pesa payment");
      setPaymentStatus('failed');
    }
  };

  const pollPaymentStatus = useCallback(async (checkoutID: string, saleId: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      // If payment was already confirmed via WebSocket, stop polling
      if (paymentStatus === 'success') return;

      attempts++;
      try {
        const result = await paymentService.verifyMpesaPayment(checkoutID);
        if (result.success && result.status === "completed") {
          setSuccess("Payment Verified! Completing sale...");
          setPaymentStatus('processing');

          try {
            // Update Sale to Completed
            await salesAPI.updateSale(saleId, {
              status: "completed"
            });

            setPaymentStatus('success');
            // Close modal after a short delay
            setTimeout(() => setShowMpesaModal(false), 2000);
          } catch (saleError) {
            console.error("Failed to update sale status:", saleError);
            setError("Payment verified but failed to update sale status");
            setPaymentStatus('failed');
          }
        } else if (result.status === "failed") {
          setError(result.message || "Payment Failed");
          setPaymentStatus('failed');
          // Update the sale status to cancelled
          await salesAPI.updateSale(saleId, { status: "cancelled" }).catch(console.error);
        } else if (attempts < maxAttempts) {
          // Continue polling
          setTimeout(poll, 2000);
        } else {
          // Max attempts reached without confirmation
          setError("Payment verification timeout. Please check your M-Pesa statement.");
          setPaymentStatus('timeout');
        }
      } catch (error: unknown) {
        console.error("Error verifying payment:", error as string);
        if (attempts < maxAttempts) {
          // Retry on error
          setTimeout(poll, 2000);
        } else {
          setError("Error verifying payment. Please check your internet connection.");
          setPaymentStatus('failed');
        }
      }
    };

    // Start polling
    const pollTimer = setTimeout(poll, 2000);

    // Cleanup function to clear the timeout if component unmounts
    return () => clearTimeout(pollTimer);
  }, [paymentStatus, setError, setSuccess, setPaymentStatus]);

  // Update change when amount tendered changes
  useEffect(() => {
    const tendered = parseFloat(amountTendered) || 0;
    setChange(Math.max(0, tendered - total));
  }, [amountTendered, total]);

  // Handle M-Pesa modal close
  const handleCloseMpesaModal = useCallback(() => {
    if (paymentStatus === 'success') {
      setShowReceipt(true);
    }
    setShowMpesaModal(false);

    // Reset payment status if not completed
    if (paymentStatus !== 'success') {
      setPaymentStatus('idle');
    }
  }, [paymentStatus, setPaymentStatus]);

  // Handle M-Pesa retry
  const handleRetryMpesa = () => {
    setError(null);
    setPaymentStatus('idle');
    setShowMpesaModal(false);
    // Small delay to allow state to reset before retrying
    setTimeout(handleMpesaSubmit, 300);
  };

  // Cleanup payment state when component unmounts
  useEffect(() => {
    return () => {
      // Only reset if not in a processing state
      if (!isProcessing) {
        resetPaymentState();
      }
    };
  }, [isProcessing, resetPaymentState]);

  // Clear cart confirmation
  const handleClearCart = () => {
    if (confirm("Clear all items from cart?")) {
      clearCart();
      toast.success("Cart cleared");
    }
  };

  const validStatus = ['processing', 'waiting', 'success', 'failed', 'timeout'].includes(paymentStatus)
    ? paymentStatus as PaymentStatus
    : 'processing';

  return (
    <div className="h-screen bg-background flex flex-col p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground text-sm">Complete purchase and payment</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {items.length} items
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCart}
            disabled={items.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-4 lg:grid-cols-4 gap-6">

        {/* Middle Column - Cart Items */}
        <div className="lg:col-span-3 bg-card rounded-xl p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Cart Items</h2>
            <Badge variant="secondary">
              Total: KES {total.toFixed(2)}
            </Badge>
          </div>

          {/* Cart Items List */}
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Cart is empty</p>
                <p className="text-sm">Scan products to add them here</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-background/50"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.sku && `SKU: ${item.sku} • `}KES {Number(item.price).toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-10 text-center font-medium bg-muted py-1 rounded">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="font-semibold">
                        KES {(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeItem(item.product_id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bag Options */}
          {items.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-3 flex items-center">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Bag Options
              </h3>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={!selectedBag ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedBag(null)}
                >
                  No Bag
                </Button>
                {BAG_OPTIONS.map((bag) => (
                  <Button
                    key={bag.id}
                    variant={selectedBag === bag.id ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedBag(bag.id === selectedBag ? null : bag.id)}
                  >
                    {bag.name}
                    <span className="ml-1 text-xs opacity-80">(KES {bag.price})</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Payment */}
        <div className="lg:col-span-1 bg-card rounded-xl p-4 md:p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">Payment</h2>

          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Add items to cart to proceed with payment</p>
            </div>
          ) : (
            <>
              {/* Order Summary */}
              <div className="space-y-3 mb-6 p-4 bg-muted/30 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">KES {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (16%)</span>
                  <span className="font-medium">KES {tax.toFixed(2)}</span>
                </div>
                {selectedBag && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {BAG_OPTIONS.find(b => b.id === selectedBag)?.name}
                    </span>
                    <span className="font-medium">KES {bagPrice.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">KES {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
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

                {/* M-Pesa Processing Modal */}
                <AnimatePresence>
                  {showMpesaModal && (
                    <MpesaProcessingModal
                      isOpen={showMpesaModal}
                      status={validStatus}
                      error={error || undefined}
                      onClose={handleCloseMpesaModal}
                      onRetry={handleRetryMpesa}
                    />
                  )}
                </AnimatePresence>

<<<<<<< Updated upstream
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
=======
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "cash" | "mpesa" | "card")}>
>>>>>>> Stashed changes
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="cash">
                      <Banknote className="h-4 w-4 mr-2" /> Cash
                    </TabsTrigger>
                    <TabsTrigger
                      value="mpesa"
                      className="relative"
                      disabled={isProcessing}
                    >
                      <div className="flex items-center">
                        <Smartphone className="h-4 w-4 mr-2" />
                        <span>M-Pesa</span>
                        {isProcessing && (
                          <motion.div
                            className="ml-2 h-2 w-2 rounded-full bg-primary"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        )}
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="card" disabled>
                      <CreditCard className="h-4 w-4 mr-2" /> Card
                    </TabsTrigger>
                  </TabsList>

                  {/* Cash Tab */}
                  <TabsContent value="cash" className="space-y-4 pt-4">
                    <div className="space-y-3">
                      <Label>Amount Tendered</Label>
                      <Input
                        type="number"
                        value={amountTendered}
                        onChange={(e) => setAmountTendered(e.target.value)}
                        placeholder="0.00"
                        className="text-2xl font-bold h-14"
                        autoFocus
                      />

                      <div className="grid grid-cols-3 gap-2">
                        {QUICK_AMOUNTS.map((amt) => (
                          <Button
                            key={amt}
                            variant="outline"
                            size="sm"
                            onClick={() => setAmountTendered((prev) =>
                              (parseFloat(prev) || 0 + amt).toString()
                            )}
                          >
                            +{amt}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAmountTendered(total.toString())}
                          className="col-span-3"
                        >
                          Exact Amount (KES {total.toFixed(2)})
                        </Button>
                      </div>

                      {change > 0 && (
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Change Due:</span>
                            <span className="text-2xl font-bold text-primary">
                              KES {change.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full h-12 text-lg"
                      onClick={handleCashSubmit}
                      disabled={isProcessing || !amountTendered || parseFloat(amountTendered) < total}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Complete Sale (KES ${total.toFixed(2)})`
                      )}
                    </Button>
                  </TabsContent>

                  {/* M-Pesa Tab */}
                  <TabsContent value="mpesa" className="space-y-4 pt-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <div className="relative">
                          <Input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="2547XXXXXXXX"
                            className="h-12 text-base pl-10"
                            disabled={isProcessing}
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Smartphone className="h-4 w-4" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Enter phone number in format 2547XXXXXXXX
                        </p>
                      </div>

                      <div className="pt-2">
                        <Button
                          className="w-full h-12 text-lg relative overflow-hidden group"
                          onClick={handleMpesaSubmit}
                          disabled={isProcessing || !phoneNumber || phoneNumber.length < 12}
                          size="lg"
                        >
                          <motion.span
                            className="absolute inset-0 bg-primary/10"
                            initial={{ width: '0%' }}
                            animate={isProcessing ? { width: '100%' } : { width: '0%' }}
                            transition={{ duration: 30, ease: 'linear' }}
                          />
                          <span className="relative z-10 flex items-center justify-center">
                            {isProcessing ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Smartphone className="mr-2 h-5 w-5" />
                                Pay with M-Pesa
                              </>
                            )}
                          </span>
                        </Button>

                        {isProcessing && (
                          <motion.div
                            className="mt-3 text-sm text-muted-foreground flex items-center justify-center gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Waiting for payment confirmation...</span>
                          </motion.div>
                        )}
                      </div>

                      {error && (
                        <motion.div
                          className="mt-2"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              {error}
                            </AlertDescription>
                          </Alert>
                        </motion.div>
                      )}

                      {success && (
                        <motion.div
                          className="mt-2"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <Alert className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription>{success}</AlertDescription>
                          </Alert>
                        </motion.div>
                      )}
                    </motion.div>
                  </TabsContent>

                  {/* Card Tab */}
                  <TabsContent value="card" className="space-y-4 pt-4">
                    <div className="text-center p-6 bg-muted/30 rounded-lg">
                      <CreditCard className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">Card payment integration coming soon</p>
                    </div>
                    <Button className="w-full" disabled>Pay with Card</Button>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-6 text-xs text-muted-foreground text-center">
        <p>
          💡 <strong>Quick Tips:</strong> Press <kbd>F9</kbd> for cash payment
        </p>
      </div>
      {/* Receipt Modal */}
      <Receipt
        open={showReceipt}
        onClose={handleReceiptClose}
        sale={currentSale}
      />
    </div>
  );
};

export default CheckoutPage;