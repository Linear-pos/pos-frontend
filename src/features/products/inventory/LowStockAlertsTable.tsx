import type { Product } from "../../../types/product";

interface LowStockAlertsTableProps {
    products: Product[];
    onRestock: (product: Product) => void;
}

export const LowStockAlertsTable = ({ products, onRestock }: LowStockAlertsTableProps) => {
    if (products.length === 0) {
        return (
            <div className="p-12 text-center border rounded-lg bg-green-50 text-green-800">
                <p className="font-medium">All good! No products are currently low on stock.</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
                <thead className="bg-red-50">
                    <tr>
                        <th className="px-4 py-3 text-left font-medium text-red-900">Product</th>
                        <th className="px-4 py-3 text-right font-medium text-red-900">Current Stock</th>
                        <th className="px-4 py-3 text-right font-medium text-red-900">Reorder Level</th>
                        <th className="px-4 py-3 text-right font-medium text-red-900">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-red-50/20">
                            <td className="px-4 py-3">
                                <div className="font-medium">{product.name}</div>
                                <div className="text-xs text-muted-foreground">{product.sku}</div>
                            </td>
                            <td className="px-4 py-3 text-right text-red-600 font-bold">
                                {product.stock_quantity}
                                <span className="text-xs font-normal ml-1">
                                    {['pcs', 'items', 'units', 'boxes', 'bottles', 'cans'].includes((product.unit || '').toLowerCase())
                                        ? product.unit
                                        : ''}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right text-muted-foreground">
                                {product.reorder_level}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <button
                                    onClick={() => onRestock(product)}
                                    className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 transition"
                                >
                                    Restock
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
