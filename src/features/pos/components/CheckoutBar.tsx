import { Button } from '@/components/ui/button';

export const CheckoutBar = ({
  total,
  onCheckout,
  className = ''
}: {
  total: number;
  onCheckout: () => void;
  className?: string;
}) => {
  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold">Total:</span>
        <span className="text-xl font-bold">${total.toFixed(2)}</span>
      </div>
      <Button 
        className="w-full bg-green-600 hover:bg-green-700"
        onClick={onCheckout}
        disabled={total <= 0}
      >
        Complete Order
      </Button>
    </div>
  );
};

export default CheckoutBar;