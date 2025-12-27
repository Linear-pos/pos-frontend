import { X, Minus, Plus } from "lucide-react";
import type { CartItem } from "../../../types/sale";

export const Cart = ({
  items,
  onRemoveItem,
  onUpdateQuantity,
  className = "",
}: {
  items: CartItem[];
  onRemoveItem: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  className?: string;
}) => {
  if (items.length === 0) {
    return (
      <div
        className={`flex items-center justify-center h-full text-center ${className}`}
      >
        <div className="py-12">
          <svg
            className="w-16 h-16 text-muted-foreground mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <p className="text-muted-foreground">Your cart is empty</p>
          <p className="text-muted-foreground text-sm mt-2 opacity-75">
            Add products to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-auto ${className}`}>
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li
            key={item.product_id}
            className="p-4 hover:bg-muted transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="text-primary font-semibold text-sm">
                  {item.product.name}
                </h4>
                <p className="text-muted-foreground text-xs mt-1">
                  {item.product.category}
                </p>
              </div>
              <span className="text-secondary font-bold text-sm ml-2">
                KES {Number(item.total).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>KES {Number(item.price).toFixed(2)} each</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <button
                    onClick={() =>
                      onUpdateQuantity(item.product_id, item.quantity - 1)
                    }
                    className="p-1 hover:bg-muted/80 rounded transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3 w-3 text-foreground" />
                  </button>
                  <span className="w-5 text-center font-semibold text-foreground">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      onUpdateQuantity(item.product_id, item.quantity + 1)
                    }
                    className="p-1 hover:bg-muted/80 rounded transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3 w-3 text-foreground" />
                  </button>
                </div>
                <button
                  onClick={() => onRemoveItem(item.product_id)}
                  className="p-1 text-error-500 hover:text-error-700 hover:bg-error-50 rounded transition"
                  aria-label="Remove item"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Cart;
