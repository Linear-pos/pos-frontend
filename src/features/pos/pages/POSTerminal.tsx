import { useState, useEffect, useMemo } from "react";
import { useCartStore } from "@/stores/cart.store";
import type { Product } from "@/types/product";
import { productsAPI } from "@/features/products/api/products.api";
import { ProductSearch } from "../components/ProductSearch";
import { ProductGrid } from "../components/ProductGrid";
import { Cart } from "../components/Cart";
import { CheckoutBar } from "../components/CheckoutBar";
import { CategorySidebar } from "../components/CategorySidebar";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { toast } from "sonner";

export const POSTerminal = () => {
    // Cart Store
    const {
        items,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
    } = useCartStore();

    // Local State
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Fetch Products (Initial Load)
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                // Fetch all active products (pagination might be needed for large catalogs, 
                // but for POS speed, loading all active items is often better or use infinite scroll)
                // For MVP, fetch a large page
                const response = await productsAPI.getProducts({
                    page: 1,
                    per_page: 500, // Large specific limit
                    is_active: true
                });
                setAllProducts(response.data);
            } catch (error) {
                console.error("Failed to load products:", error);
                toast.error("Failed to load product catalog");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Barcode Scanner Hook
    useBarcodeScanner({
        onScan: (barcode) => {
            const product = allProducts.find(p => p.sku === barcode);
            if (product) {
                if (product.stock_quantity !== undefined && product.stock_quantity <= 0) {
                    toast.error(`"${product.name}" is out of stock`);
                    return;
                }
                addItem(product);
                toast.success(`Added ${product.name}`);
            } else {
                toast.error(`Product not found: ${barcode}`);
            }
        }
    });

    // Derived State (Filtering)
    const filteredProducts = useMemo(() => {
        return allProducts.filter(p => {
            const matchesSearch = !searchQuery ||
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.sku?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = !selectedCategory || p.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [allProducts, searchQuery, selectedCategory]);

    // Extract Categories
    const categories = useMemo(() => {
        const cats = new Set(allProducts.map(p => p.category).filter(Boolean));
        return Array.from(cats).map(c => ({
            id: c as string,
            name: c as string,
            count: allProducts.filter(p => p.category === c).length
        }));
    }, [allProducts]);

    return (
        <div className="flex h-full bg-background overflow-hidden">

            {/* LEFT COLUMN: Categories (1/6) */}
            <aside className="w-1/6 min-w-[200px] border-r border-border bg-card/50 p-4 overflow-y-auto">
                <CategorySidebar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />
            </aside>

            {/* CENTER COLUMN: Grid (3/6) */}
            <main className="flex-1 flex flex-col min-w-[400px] p-4 gap-4 overflow-hidden">
                {/* Search Bar */}
                <div className="bg-card p-2 rounded-lg border shadow-sm">
                    <ProductSearch
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onBarcodeSubmit={(code) => {
                            const product = allProducts.find(p => p.sku === code);
                            if (product) addItem(product);
                        }}
                    />
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <ProductGrid
                        products={filteredProducts}
                        onAddToCart={addItem}
                        isLoading={loading}
                    />
                </div>
            </main>

            {/* RIGHT COLUMN: Cart (2/6) */}
            <aside className="w-1/4 min-w-[300px] max-w-[400px] border-l border-border bg-card shadow-xl flex flex-col z-10">
                {/* Cart Header */}
                <div className="p-4 border-b border-border bg-muted/20">
                    <h2 className="font-bold text-lg">Current Order</h2>
                    <div className="text-xs text-muted-foreground">{itemCount} items</div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-0">
                    <Cart
                        items={items}
                        onRemoveItem={removeItem}
                        onUpdateQuantity={updateQuantity}
                    />
                </div>

                {/* Checkout */}
                <div className="p-4 border-t border-border bg-background">
                    <CheckoutBar />
                </div>
            </aside>

        </div>
    );
};
