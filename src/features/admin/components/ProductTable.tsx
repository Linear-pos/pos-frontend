import { useState } from 'react';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Product } from '../api/products.api';
import type { Category } from '../api/categories.api';
import { productsAPI } from '../api/products.api';
import { EditProductModal } from './EditProductModal';

interface ProductTableProps {
    products: Product[];
    categories: Category[];
    onProductUpdated: () => void;
}

export const ProductTable = ({ products, categories, onProductUpdated }: ProductTableProps) => {
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<string | null>(null);

    const handleDelete = async (product: Product) => {
        if (!confirm(`Are you sure you want to delete ${product.name}?`)) return;

        setLoading(product.id);
        try {
            await productsAPI.deleteProduct(product.id);
            onProductUpdated();
        } catch (error) {
            console.error('Failed to delete product:', error);
            alert('Failed to delete product');
        } finally {
            setLoading(null);
        }
    };

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-4 font-medium text-neutral-700">Product</th>
                            <th className="text-left p-4 font-medium text-neutral-700">SKU</th>
                            <th className="text-left p-4 font-medium text-neutral-700">Category</th>
                            <th className="text-right p-4 font-medium text-neutral-700">Cost</th>
                            <th className="text-right p-4 font-medium text-neutral-700">Price</th>
                            <th className="text-left p-4 font-medium text-neutral-700">Unit</th>
                            <th className="text-center p-4 font-medium text-neutral-700">Status</th>
                            <th className="text-center p-4 font-medium text-neutral-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id} className="border-b hover:bg-neutral-50">
                                <td className="p-4">
                                    <div>
                                        <div className="font-medium">{product.name}</div>
                                        {product.description && (
                                            <div className="text-sm text-neutral-500 truncate max-w-xs">
                                                {product.description}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-sm">
                                    {product.sku || <span className="text-neutral-400">N/A</span>}
                                </td>
                                <td className="p-4 text-sm">
                                    {product.category ? (
                                        <Badge variant="outline">{product.category}</Badge>
                                    ) : (
                                        <span className="text-neutral-400">Uncategorized</span>
                                    )}
                                </td>
                                <td className="p-4 text-right text-sm">
                                    KES {(product.cost || 0).toLocaleString()}
                                </td>
                                <td className="p-4 text-right font-medium">
                                    KES {(product.price || 0).toLocaleString()}
                                </td>
                                <td className="p-4 text-sm">
                                    {product.unit}
                                    {product.unitSize && ` (${product.unitSize})`}
                                </td>
                                <td className="p-4 text-center">
                                    <Badge variant={product.isActive ? 'secondary' : 'outline'}>
                                        {product.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </td>
                                <td className="p-4 text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={loading === product.id}
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(product)}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingProduct && (
                <EditProductModal
                    product={editingProduct}
                    categories={categories}
                    open={!!editingProduct}
                    onClose={() => setEditingProduct(null)}
                    onProductUpdated={() => {
                        setEditingProduct(null);
                        onProductUpdated();
                    }}
                />
            )}
        </>
    );
};
