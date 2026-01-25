import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart.store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CheckoutBar = () => {
  const navigate = useNavigate();
  const { total, itemCount } = useCartStore();

  // Calculate totals
  const subtotal = total / 1.16;
  const tax = total - subtotal;

  const [error, setError] = useState<string | null>(null);

  const handleCheckout = () => {
    if (itemCount === 0) return;
    setError(null);
    navigate("/pos/checkout");
  };

  return (
    <div className="bg-card border-t p-4 shadow-up">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
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
    </div>
  );
};

export default CheckoutBar;
