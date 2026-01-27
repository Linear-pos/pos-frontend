
import { useState, useEffect, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Smartphone,
    Banknote,
    CreditCard,
    X,
    Loader2,
    CheckCircle,
    AlertCircle,
    Hash,
    Phone
} from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { usePaymentStore } from "@/stores/payment.store";
import { useShiftStore } from "@/stores/shift.store";
import { useCashierStore } from "@/stores/cashier.store";
import { salesAPI } from "@/features/sales/api";
import { paymentService } from "@/services/payment.service";
import { MpesaProcessingModal } from "./MpesaProcessingModal";
import Receipt from "@/components/receipts/Receipt";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CheckoutModal = ({ isOpen, onClose }: CheckoutModalProps) => {
    const { items, total, clearCart } = useCartStore();
    const {
        paymentStatus,
        error,
        setPaymentStatus,
        setPaymentMethod,
        setError,
        setSuccess,
        setCurrentSaleId,
        setCheckoutRequestId,
        resetPaymentState
    } = usePaymentStore();

    const { currentShift } = useShiftStore();
    const { cashier } = useCashierStore();

    // Local state
    const [activeTab, setActiveTab] = useState<"cash" | "mpesa" | "card">("cash");
    const [amountTendered, setAmountTendered] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [showReceipt, setShowReceipt] = useState(false);
    const [showMpesaModal, setShowMpesaModal] = useState(false);
    const [currentSale, setCurrentSale] = useState<any>(null);

    const isProcessing = paymentStatus === 'processing' || paymentStatus === 'waiting';

    const change = useMemo(() => {
        const tendered = parseFloat(amountTendered) || 0;
        return Math.max(0, tendered - total);
    }, [amountTendered, total]);

    // Clean up on unmount or close
    useEffect(() => {
        if (!isOpen) {
            if (!isProcessing) {
                resetPaymentState();
                setAmountTendered("");
                setPhoneNumber("");
                setActiveTab("cash");
            }
        }
    }, [isOpen, isProcessing, resetPaymentState]);

    const handleProcessPayment = useCallback(async (method: 'cash' | 'mpesa' | 'card', data: any = {}) => {
        try {
            const payload = {
                payment_method: method,
                status: data.status || (method === 'mpesa' ? 'pending' : 'completed'),
                reference: data.reference || crypto.randomUUID(),
                items: items.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: Number(item.price)
                })),
                tax: 0,
                total: total,
                shift_id: currentShift?.id,
                cashier_id: cashier?.id,
                ...data
            };

            const sale = await salesAPI.createSale(payload);
            setCurrentSale(sale);
            setCurrentSaleId(sale.id);
            return sale;
        } catch (err: any) {
            console.error("Payment processing error:", err);
            const errorMessage = err.response?.data?.message || err.message || "Payment processing failed";
            setError(errorMessage);
            setPaymentStatus('failed');
            throw new Error(errorMessage);
        }
    }, [items, total, currentShift, cashier, setCurrentSaleId, setError, setPaymentStatus]);

    // Keypad logic removed as requested, using desktop keyboard

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
            setTimeout(() => setShowReceipt(true), 500);
        } catch (err: any) {
            // Error already handled in handleProcessPayment
        }
    };

    const handleMpesaSubmit = async () => {
        // This assumes phone number is already set or we need to add a quick input
        // For now, ported from CheckoutPage logic
        setPaymentMethod('mpesa');
        setPaymentStatus('processing');
        setError(null);
        setShowMpesaModal(true);

        try {
            if (!phoneNumber) {
                throw new Error("Phone number is required");
            }

            const normalizedPhone = phoneNumber.startsWith('254') ? phoneNumber :
                phoneNumber.startsWith('0') ? `254${phoneNumber.slice(1)}` :
                    `254${phoneNumber}`;

            const pendingSale = await handleProcessPayment("mpesa", {
                status: "pending",
                phone_number: normalizedPhone
            });

            const result = await paymentService.processMpesaPayment({
                phone_number: phoneNumber,
                amount: total,
                sale_id: pendingSale.id,
                reference: pendingSale.reference
            });

            if (result.success && result.checkoutRequestID) {
                setPaymentStatus('waiting');
                setCheckoutRequestId(result.checkoutRequestID);
                pollPaymentStatus(result.checkoutRequestID, pendingSale.id);
            } else {
                throw new Error(result.message || "Failed to initiate M-Pesa");
            }
        } catch (err: any) {
            setError(err.message);
            setPaymentStatus('failed');
        }
    };

    const pollPaymentStatus = useCallback(async (checkoutID: string, saleId: string) => {
        const poll = async (attempts = 0) => {
            if (paymentStatus === 'success' || paymentStatus === 'failed' || attempts > 60) return;
            try {
                const result = await paymentService.verifyMpesaPayment(checkoutID);
                if (result.success && result.status === "completed") {
                    await salesAPI.updateSale(saleId, { status: "completed" });
                    setPaymentStatus('success');
                    setTimeout(() => {
                        setShowMpesaModal(false);
                        setShowReceipt(true);
                    }, 1500);
                } else if (result.status === "failed") {
                    setError(result.message);
                    setPaymentStatus('failed');
                } else {
                    setTimeout(() => poll(attempts + 1), 5000);
                }
            } catch (e) {
                setTimeout(() => poll(attempts + 1), 5000);
            }
        };
        poll();
    }, [paymentStatus, setError, setPaymentStatus]);

    const handleManualStatusCheck = async () => {
        const checkoutID = usePaymentStore.getState().checkoutRequestId;
        const saleId = usePaymentStore.getState().currentSaleId;

        if (!checkoutID || !saleId) return;

        setPaymentStatus('waiting'); // Ensure we show we are doing something
        setError(null);

        try {
            const result = await paymentService.verifyMpesaPayment(checkoutID);
            if (result.success && result.status === "completed") {
                await salesAPI.updateSale(saleId, { status: "completed" });
                setPaymentStatus('success');
                setTimeout(() => {
                    setShowMpesaModal(false);
                    setShowReceipt(true);
                }, 1500);
            } else if (result.status === "failed") {
                setError(result.message);
                setPaymentStatus('failed');
            } else {
                // It's pending/still processing
                setPaymentStatus('waiting'); // Keep in waiting state
                setSuccess(result.message || "Payment still pending. Please wait for the phone prompt.");
                setTimeout(() => setSuccess(""), 4000);
            }
        } catch (err: any) {
            setError(err.message || "Failed to verify payment status");
            setPaymentStatus('failed');
        }
    };

    const handleReceiptClose = () => {
        setShowReceipt(false);
        clearCart();
        resetPaymentState();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isProcessing && !open && onClose()}>
            <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden shadow-2xl">
                <DialogHeader className="p-6 border-b flex flex-row items-center justify-between bg-muted/10">
                    <div>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <span className="bg-primary/10 p-2 rounded-lg">
                                <CreditCard className="w-6 h-6 text-primary" />
                            </span>
                            Checkout
                        </DialogTitle>
                        <p className="text-muted-foreground">Complete the transaction for this order</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} disabled={isProcessing} className="rounded-full">
                        <X className="h-6 w-6" />
                    </Button>
                </DialogHeader>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Side: Summary & Payment Selection */}
                    <div className="w-[380px] border-r bg-muted/30 p-8 flex flex-col gap-6">
                        {/* Order Summary Section */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Hash className="w-4 h-4" />
                                Order Summary
                            </h3>
                            <div className="bg-card rounded-xl border p-5 shadow-sm space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Items</span>
                                    <span className="font-bold">{items.length} units</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-bold">KES {total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">VAT (16%)</span>
                                    <span className="text-muted-foreground italic">Inclusive</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-end pt-2">
                                    <span className="text-sm font-medium">Total Balance</span>
                                    <span className="text-2xl font-black text-primary leading-none">
                                        KES {total.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Separator className="opacity-50" />

                        <div className="space-y-4 flex-1">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                                Payment Method
                            </h3>
                            <div className="flex flex-col gap-3">
                                <Button
                                    variant={activeTab === 'cash' ? 'default' : 'outline'}
                                    className={`h-20 flex items-center justify-start gap-4 px-6 text-lg border-2 transition-all duration-200 ${activeTab === 'cash' ? 'shadow-lg border-primary translate-x-1' : 'hover:border-primary/50'
                                        }`}
                                    onClick={() => setActiveTab('cash')}
                                    disabled={isProcessing}
                                >
                                    <div className={`p-2 rounded-lg ${activeTab === 'cash' ? 'bg-primary-foreground/20' : 'bg-primary/10'}`}>
                                        <Banknote className={`h-6 w-6 ${activeTab === 'cash' ? 'text-primary-foreground' : 'text-primary'}`} />
                                    </div>
                                    <span className="font-bold">Cash Payment</span>
                                </Button>

                                <Button
                                    variant={activeTab === 'mpesa' ? 'default' : 'outline'}
                                    className={`h-24 p-0 flex flex-col items-center justify-center border-2 overflow-hidden transition-all duration-200 ${activeTab === 'mpesa' ? 'shadow-lg border-primary ring-2 ring-primary/20 scale-[1.02]' : 'hover:border-primary/50 '
                                        }`}
                                    onClick={() => setActiveTab('mpesa')}
                                    disabled={isProcessing}
                                >
                                    <div className="w-full h-full flex items-center justify-center p-1">
                                        <img
                                            src="/mpesa_logo1.png"
                                            alt="M-Pesa"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </Button>

                            </div>
                        </div>
                    </div>

                    {/* Right Side: Keyboard/Input Section */}
                    <div className="flex-1 p-10 bg-card flex flex-col justify-center max-w-2xl mx-auto w-full">
                        <AnimatePresence mode="wait">
                            {activeTab === 'cash' && (
                                <motion.div
                                    key="cash"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="tendered" className="text-lg font-semibold flex items-center gap-2">
                                                <Banknote className="w-5 h-5 text-primary" />
                                                Cash Tendered
                                            </Label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground/50">KES</span>
                                                <Input
                                                    id="tendered"
                                                    autoFocus
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={amountTendered}
                                                    onChange={(e) => setAmountTendered(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleCashSubmit()}
                                                    className="pl-20 h-24 text-5xl font-mono font-black border-4 focus-visible:ring-primary shadow-inner bg-muted/5"
                                                />
                                            </div>
                                        </div>

                                        <div className={`p-6 rounded-2xl border-4 flex justify-between items-center transition-colors duration-300 ${change > 0 ? 'bg-primary/5 border-primary/20' : 'bg-muted/10 border-dashed'
                                            }`}>
                                            <div>
                                                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground group">Change Due</p>
                                                <p className={`text-4xl font-mono font-black ${change > 0 ? 'text-primary' : 'text-muted-foreground/40'}`}>
                                                    KES {change.toFixed(2)}
                                                </p>
                                            </div>
                                            {change > 0 && <CheckCircle className="w-12 h-12 text-primary animate-in zoom-in" />}
                                        </div>
                                    </div>

                                    <Button
                                        size="lg"
                                        className="w-full h-24 text-3xl font-black shadow-2xl rounded-2xl group relative overflow-hidden"
                                        disabled={isProcessing || parseFloat(amountTendered) < total}
                                        onClick={handleCashSubmit}
                                    >
                                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        {isProcessing ? <Loader2 className="animate-spin" /> : <Banknote className="mr-4 h-10 w-10 shrink-0" />}
                                        Complete Cash Sale
                                    </Button>
                                </motion.div>
                            )}

                            {activeTab === 'mpesa' && (
                                <motion.div
                                    key="mpesa"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10 text-center"
                                >
                                    <div className="p-10 bg-primary/5 rounded-full inline-block mb-4 relative">
                                        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-25" />
                                        <div className="bg-white p-4 rounded-2xl shadow-xl w-32 h-32 flex items-center justify-center relative z-10">
                                            <img src="/mpesa_logo.png" alt="M-Pesa" className="scale-125" />
                                        </div>
                                    </div>

                                    <div className="space-y-6 max-w-sm mx-auto text-left">
                                        <div className="space-y-3 text-center mb-8">
                                            <h3 className="text-3xl font-black">M-Pesa Checkout</h3>
                                            <p className="text-muted-foreground">Enter the customer's phone number to send a secure STK Push request.</p>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="phone" className="text-lg font-semibold flex items-center gap-2">
                                                <Phone className="w-5 h-5 text-primary" />
                                                Phone Number
                                            </Label>
                                            <Input
                                                id="phone"
                                                autoFocus
                                                type="tel"
                                                placeholder="07XX or 01XX..."
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleMpesaSubmit()}
                                                className="h-20 text-4xl font-mono font-bold border-4 focus-visible:ring-primary text-center tracking-widest"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        size="lg"
                                        className="w-full h-24 text-3xl font-black shadow-2xl rounded-2xl mt-4"
                                        disabled={isProcessing || !phoneNumber}
                                        onClick={handleMpesaSubmit}
                                    >
                                        <Smartphone className="mr-4 h-10 w-10 shrink-0" />
                                        Initiate STK Push
                                        <span className="text-sm font-normal block opacity-50 absolute bottom-2">Press Enter to send</span>
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {error && (
                            <Alert variant="destructive" className="mt-8 border-2 animate-in slide-in-from-bottom-2">
                                <AlertCircle className="h-5 w-5" />
                                <AlertDescription className="text-lg font-medium">{error}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>

                {/* Global Overlays */}
                <MpesaProcessingModal
                    isOpen={showMpesaModal}
                    status={paymentStatus as any}
                    error={error || undefined}
                    onClose={() => setShowMpesaModal(false)}
                    onRetry={handleMpesaSubmit}
                    onCheckStatus={handleManualStatusCheck}
                />

                <Receipt
                    open={showReceipt}
                    onClose={handleReceiptClose}
                    sale={currentSale}
                />
            </DialogContent>
        </Dialog>
    );
};
