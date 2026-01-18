import { useState } from "react";
import { useCartStore } from "@/stores/cart.store";
import type { Product } from "@/types/product";
import { productsAPI } from "@/features/products/api/products.api";
import { ProductSearch } from "./components/ProductSearch";
import { ProductGrid } from "./components/ProductGrid";
import { Cart } from "./components/Cart";
import { CheckoutBar } from "./components/CheckoutBar";
import { toast } from "sonner";
import type { BarcodeLookupResponse } from "@/types/product";

export const PosPage = () => {
  const {
    items,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
  } = useCartStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [orderId] = useState(() => Math.floor(Date.now() / 10000));

  const findProductByBarcode = async (barcode: string): Promise<Product | null> => {
    try {
      const response = await productsAPI.getProducts({
        search: barcode,
        per_page: 100 // Get more results to find the match
      });
      return response.data.find(p => p.sku === barcode) || null;
    } catch (error) {
      console.error('Error finding product:', error);
      return null;
    }
  };

  const handleBarcodeScanned = async (barcode: string, product?: BarcodeLookupResponse['data']) => {
    try {
      let foundProduct: Product | null = null;

      // Use barcode lookup API result if available
      if (product) {
        foundProduct = {
          ...product,
          // Convert to Product interface format
          stock_quantity: product.stock_quantity,
          reorder_level: product.reorder_level,
          image_url: product.image_url,
          is_active: product.is_active,
          unit_size: product.unit_size,
          deleted_at: product.deleted_at,
        } as Product;
      } else {
        // Fallback to product search
        foundProduct = await findProductByBarcode(barcode);
      }

      if (!foundProduct) {
        toast.error(`Product with barcode "${barcode}" not found`);
        return;
      }

      if (foundProduct.stock_quantity <= 0) {
        toast.error(`Product "${foundProduct.name}" is out of stock`);
        return;
      }

      addItem(foundProduct);
      toast.success(`Added "${foundProduct.name}" to cart`);

    } catch {
      toast.error('Failed to process barcode');
    }
  };




  const addToCart = (product: Product) => {
    addItem(product);
    toast.success(`Added "${product.name}" to cart`);
  };

  const handleBarcodeSubmit = async (barcode: string) => {
    await handleBarcodeScanned(barcode);
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
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
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
            products={[]}
            onAddToCart={addToCart}
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
            Order ID: #POS-{orderId}
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
          <CheckoutBar />
        </footer>
      </aside>
    </div>
  );
};

export default PosPage;