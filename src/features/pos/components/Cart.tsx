import { X } from 'lucide-react';
import type { Product } from '../pos.types';

export const Cart = ({
  items,
  onRemoveItem,
  className = ''
}: {
  items: Product[];
  onRemoveItem: (productId: string) => void;
  className?: string;
}) => {
  const cartItems = items.reduce<{product: Product; quantity: number}[]>((acc, item) => {
    const existingItem = acc.find(i => i.product.id === item.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      acc.push({ product: item, quantity: 1 });
    }
    return acc;
  }, []);

  if (cartItems.length === 0) {
    return (
      <div className={`flex items-center justify-center h-32 text-gray-500 ${className}`}>
        <p>Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className={`p-4 overflow-auto ${className}`}>
      <ul className="space-y-4">
        {cartItems.map(({ product, quantity }) => (
          <li key={product.id} className="flex items-center justify-between border-b pb-2">
            <div className="flex-1">
              <div className="flex justify-between">
                <h4 className="font-medium">{product.name}</h4>
                <span className="font-semibold">${(product.price * quantity).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>${product.price.toFixed(2)} × {quantity}</span>
                <button 
                  onClick={() => onRemoveItem(product.id)}
                  className="text-red-500 hover:text-red-700"
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