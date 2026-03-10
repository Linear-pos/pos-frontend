import { useState } from 'react';
import { Edit, Trash2, MoreVertical, Barcode, Package } from 'lucide-react';
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
    onBarcode?: (product: Product) => void;
    onSort?: (field: string) => void;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const ProductTable = ({ products, categories, onProductUpdated, onBarcode }: ProductTableProps) => {
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<string | null>(null);
    
    // Debug: Log products to see category data
    console.log('ProductTable - Products with categories:', products.map(p => ({ id: p.id, name: p.name, category: p.category })));

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
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b bg-neutral-50">
                            <th className="text-left p-3 font-medium text-neutral-700">id</th>
                            <th className="text-left p-3 font-medium text-neutral-700">Image</th>
                            <th className="text-left p-3 font-medium text-neutral-700">Product</th>
                            <th className="text-left p-3 font-medium text-neutral-700">SKU</th>
                            <th className="text-left p-3 font-medium text-neutral-700">Category</th>
                            <th className="text-right p-3 font-medium text-neutral-700">Cost</th>
                            <th className="text-right p-3 font-medium text-neutral-700">Price</th>
                            <th className="text-left p-3 font-medium text-neutral-700">Unit</th>
                            <th className="text-center p-3 font-medium text-neutral-700">Status</th>
                            <th className="text-center p-3 font-medium text-neutral-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product, index) => (
                            <tr key={product.id} className="border-b hover:bg-neutral-50 transition-colors">
                                <td className="p-3">
                                    {index + 1}
                                </td>
                                <td className="p-3">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 flex items-center justify-center">
                                        {product.image_url ? (
                                            <img 
                                                src={product.image_url} 
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent) {
                                                        parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><Package class="w-6 h-6 text-neutral-400" /></div>';
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <Package className="w-6 h-6 text-neutral-400" />
                                        )}
                                    </div>
                                </td>
                                <td className="p-3">
                                    <div>
                                        <div className="font-medium text-neutral-900">{product.name}</div>
                                        {product.description && (
                                            <div className="text-sm text-neutral-500 truncate max-w-xs">
                                                {product.description}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3 text-sm text-neutral-600">
                                    {product.sku || <span className="text-neutral-400">N/A</span>}
                                </td>
                                <td className="p-3 text-sm">
                                    {product.category ? (
                                        <Badge variant="outline" className="text-xs">{product.category}</Badge>
                                    ) : (
                                        <span className="text-neutral-400 text-xs">Uncategorized</span>
                                    )}
                                </td>
                                <td className="p-3 text-right text-sm text-neutral-600">
                                    KES {(product.cost || 0).toLocaleString()}
                                </td>
                                <td className="p-3 text-right font-medium text-neutral-900">
                                    KES {(product.price || 0).toLocaleString()}
                                </td>
                                <td className="p-3 text-sm text-neutral-600">
                                    <div className="flex items-center gap-1">
                                        <span>{product.unit}</span>
                                        {product.unit_size && (
                                            <span className="text-neutral-500">({product.unit_size})</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3 text-center">
                                    <Badge 
                                        variant={product.is_active ? 'default' : 'secondary'}
                                        className={product.is_active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-neutral-100 text-neutral-600 border-neutral-200'}
                                    >
                                        {product.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </td>
                                <td className="p-3 text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={loading === product.id}
                                                className="h-8 w-8 p-0 hover:bg-neutral-100"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {onBarcode && (
                                                <DropdownMenuItem onClick={() => onBarcode && onBarcode(product)}>
                                                    <Barcode className="h-4 w-4 mr-2" />
                                                    Barcode / Print
                                                </DropdownMenuItem>
                                            )}
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
        </div>
    );
};
