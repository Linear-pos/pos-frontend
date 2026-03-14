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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
        <div className="rounded-lg border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-left">id</TableHead>
                        <TableHead className="text-left">Image</TableHead>
                        <TableHead className="text-left">Product</TableHead>
                        <TableHead className="text-left">SKU</TableHead>
                        <TableHead className="text-left">Category</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-left">Unit</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product, index) => (
                        <TableRow key={product.id}>
                            <TableCell className="p-3">
                                {index + 1}
                            </TableCell>
                            <TableCell className="p-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center">
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
                                                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><Package class="w-6 h-6 " /></div>';
                                                }
                                            }}
                                        />
                                    ) : (
                                        <Package className="w-6 h-6 " />
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="p-3">
                                <div className="font-medium">{product.name}</div>
                            </TableCell>
                            <TableCell className="p-3 text-sm">
                                {product.sku || <span className="">N/A</span>}
                            </TableCell>
                            <TableCell className="p-3 text-sm">
                                {product.category ? (
                                    <Badge variant="outline" className="text-xs">{product.category}</Badge>
                                ) : (
                                    <span className=" text-xs">Uncategorized</span>
                                )}
                            </TableCell>
                            <TableCell className="p-3 text-right text-sm">
                                KES {(product.cost || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="p-3 text-right font-medium">
                                KES {(product.price || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="p-3 text-sm">
                                <div className="flex items-center gap-1">
                                    <span>{product.unit}</span>
                                    {product.unit_size && (
                                        <span className="">({product.unit_size})</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="p-3 text-center">
                                <Badge 
                                    variant={product.is_active ? 'default' : 'secondary'}
                                    className={product.is_active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-slate-100 border-slate-200'}
                                >
                                    {product.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </TableCell>
                            <TableCell className="p-3 text-center">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={loading === product.id}
                                            className="h-8 w-8 p-0"
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
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

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
