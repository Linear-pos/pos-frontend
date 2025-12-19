import { useState } from 'react';
import type { Product } from './pos.types';
import { ProductSearch } from './components/ProductSearch';
import { ProductGrid } from './components/ProductGrid';
import { Cart } from './components/Cart';
import { CheckoutBar } from './components/CheckoutBar';

export const PosPage = () => {
  const [cart, setCart] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Side - Products */}
      <div className="w-3/4 p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-4">Point of Sale</h1>
        <ProductSearch 
          value={searchQuery}
          onChange={setSearchQuery}
          className="mb-4"
        />
        <ProductGrid 
          onAddToCart={addToCart}
          searchQuery={searchQuery}
          className="flex-1 overflow-auto"
        />
      </div>

      {/* Right Side - Cart */}
      <div className="w-1/4 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Current Order</h2>
        </div>
        <Cart 
          items={cart} 
          onRemoveItem={removeFromCart} 
          className="flex-1 overflow-auto"
        />
        <CheckoutBar 
          total={cart.reduce((sum, item) => sum + item.price, 0)}
          onCheckout={clearCart}
          className="border-t border-gray-200 p-4"
        />
      </div>
    </div>
  );
};

export default PosPage;