import { useState, useEffect } from "react";
import { inventoryAPI } from "../api/inventory.api";
import type { RestockPayload } from "../api/inventory.api";
import { productsAPI } from "../api/products.api";
import type { Product } from "../../../types/product";

interface StockAdjustmentFormProps {
    onSuccess: () => void;
    onClose: () => void;
    type: "receive" | "adjustment";
    initialProduct?: Product | null;
}

export const StockAdjustmentForm = ({
    onSuccess,
    onClose,
    type,
    initialProduct
}: StockAdjustmentFormProps) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProduct || null);
    const [formData, setFormData] = useState<RestockPayload>({
        productId: initialProduct?.id || "",
        quantity: 0,
        cost: initialProduct?.cost || 0,
        notes: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch products for dropdown
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productsAPI.getProducts({
                    search: searchTerm,
                    per_page: 50
                });

                let fetchedProducts = response.data;
                // Ensure initialProduct is in the list if we haven't searched yet (or even if we have, but it matches? No, usually only if initial load)
                if (initialProduct && !searchTerm) {
                    const exists = fetchedProducts.find(p => p.id === initialProduct.id);
                    if (!exists) {
                        fetchedProducts = [initialProduct, ...fetchedProducts];
                    }
                }
                setProducts(fetchedProducts);
            } catch (err) {
                console.error("Failed to load products", err);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchProducts();
        }, 300); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        try {
            setLoading(true);
            setError(null);

            // For adjustments, we might want to allow negative values directly
            // For receive, usually positive. 
            // The form input handles the sign based on user intent or let them type it.

            await inventoryAPI.restockProduct({
                ...formData,
                productId: selectedProduct.id,
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to update stock");
        } finally {
            setLoading(false);
        }
    };

    const handleProductSelect = (productId: string) => {
        const product = products.find(p => p.id === productId);
        setSelectedProduct(product || null);
        setFormData(prev => ({ ...prev, productId, cost: product?.cost || 0 }));
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card text-card-foreground rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">
                        {type === "receive" ? "Receive Stock" : "Adjust Stock"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                            {error}
                        </div>
                    )}

                    {/* Product Search/Select */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Product</label>
                        <input
                            type="text"
                            placeholder="Search product..."
                            className="w-full px-3 py-2 border rounded-md mb-2"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <select
                            required
                            className="w-full px-3 py-2 border rounded-md"
                            onChange={(e) => handleProductSelect(e.target.value)}
                            value={selectedProduct?.id || ""}
                        >
                            <option value="">Select a product...</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} (Current: {p.stock_quantity})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Quantity {type === 'adjustment' && '(Use negative for removal)'}
                        </label>
                        <input
                            type="number"
                            required
                            className="w-full px-3 py-2 border rounded-md"
                            value={formData.quantity}
                            onChange={(e) =>
                                setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                            }
                        />
                    </div>

                    {/* Cost (only for receive usually, but API supports it) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Unit Cost (Optional)</label>
                        <input
                            type="number"
                            className="w-full px-3 py-2 border rounded-md"
                            step="0.01"
                            value={formData.cost}
                            onChange={(e) =>
                                setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })
                            }
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Notes</label>
                        <textarea
                            className="w-full px-3 py-2 border rounded-md"
                            rows={3}
                            value={formData.notes}
                            onChange={(e) =>
                                setFormData({ ...formData, notes: e.target.value })
                            }
                            placeholder="Reason for adjustment..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 border rounded-md hover:bg-muted"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !selectedProduct}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                            {loading ? "Saving..." : "Save Adjustment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
