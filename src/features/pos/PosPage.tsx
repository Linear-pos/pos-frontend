import { useState } from "react";
import { useCartStore } from "@/stores/cart.store";
import type { Product } from "@/types/product";
import { ProductSearch } from "./components/ProductSearch";
import { ProductGrid } from "./components/ProductGrid";
import { Cart } from "./components/Cart";
import { CheckoutBar } from "./components/CheckoutBar";

export const PosPage = () => {
  const {
    items,
    subtotal,
    tax,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCartStore();

  const [searchQuery, setSearchQuery] = useState("");

  const addToCart = (product: Product) => {
    addItem(product);
  };

  const handleBarcodeSubmit = async (barcode: string) => {
    alert(`Barcode "${barcode}" scanned.`);
    setSearchQuery("");
  };

  return (
    // Changed bg-neutral-50 to your theme's background variable
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
      
      {/* Left Side - Product Selection Area */}
      <main className="w-3/4 p-8 flex flex-col space-y-6 overflow-hidden">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-primary">
              Checkout
            </h1>
            <p className="text-muted-foreground font-medium">
              Manage items and fulfill customer orders
            </p>
          </div>
          <div className="text-right hidden lg:block">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">
              Terminal #01
            </span>
          </div>
        </header>

        {/* Enhanced Search Bar Container */}
        <div className="bg-card p-2 rounded-xl border border-border shadow-sm">
          <ProductSearch
            value={searchQuery}
            onChange={setSearchQuery}
            onBarcodeSubmit={handleBarcodeSubmit}
          />
        </div>

        {/* Product Grid with better scroll area styling */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <ProductGrid
            onAddToCart={addToCart}
            searchQuery={searchQuery}
          />
        </div>
      </main>

      {/* Right Side - Sidebar Cart */}
      <aside className="w-1/4 bg-card border-l border-border flex flex-col shadow-2xl z-10">
        {/* Cart Header with Gradient from your theme primary */}
        <div className="p-6 border-b border-border bg-gradient-to-br from-primary/10 to-transparent">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-foreground">Current Order</h2>
            <span className="bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full text-xs font-bold">
              {itemCount}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
            Order ID: #POS-{Math.floor(Date.now() / 10000)}
          </p>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto bg-card/50">
          <Cart
            items={items}
            onRemoveItem={removeItem}
            onUpdateQuantity={updateQuantity}
          />
        </div>

        {/* Checkout Summary - Using secondary/accent for visibility */}
        <footer className="border-t border-border p-6 bg-muted/30 backdrop-blur-sm">
          <CheckoutBar
            subtotal={subtotal}
            tax={tax}
            total={total}
            itemCount={itemCount}
            items={items}
            onCheckout={clearCart}
          />
        </footer>
      </aside>
    </div>
  );
};

export default PosPage;