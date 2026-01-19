import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { productsAPI, type Product, type UpdateProductPayload } from '../api/products.api';
import type { Category } from '../api/categories.api';

interface EditProductModalProps {
    product: Product;
    categories: Category[];
    open: boolean;
    onClose: () => void;
    onProductUpdated: () => void;
}

export const EditProductModal = ({ product, categories, open, onClose, onProductUpdated }: EditProductModalProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: product.name,
        sku: product.sku || '',
        description: product.description || '',
        category: product.category || '',
        price: (product.price || 0).toString(),
        cost: (product.cost || 0).toString(),
        unit: product.unit,
        unit_size: product.unitSize?.toString() || '',
        reorder_level: (product.reorderLevel || 0).toString(),
        is_active: product.isActive,
        imageUrl: product.imageUrl || '',
    });

    useEffect(() => {
        if (open) {
            setFormData({
                name: product.name,
                sku: product.sku || '',
                description: product.description || '',
                category: product.category || '',
                price: (product.price || 0).toString(),
                cost: (product.cost || 0).toString(),
                unit: product.unit,
                unit_size: product.unitSize?.toString() || '',
                reorder_level: (product.reorderLevel || 0).toString(),
                is_active: product.isActive,
                imageUrl: product.imageUrl || '',
            });
            setError(null);
        }
    }, [open, product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload: UpdateProductPayload = {
                name: formData.name,
                price: parseFloat(formData.price),
                cost: parseFloat(formData.cost),
                unit: formData.unit,
                is_active: formData.is_active,
            };

            if (formData.sku) payload.sku = formData.sku;
            if (formData.description) payload.description = formData.description;
            if (formData.category) payload.category = formData.category;
            if (formData.unit_size) payload.unit_size = parseFloat(formData.unit_size);
            if (formData.reorder_level) payload.reorder_level = parseInt(formData.reorder_level);
            if (formData.imageUrl) payload.image_url = formData.imageUrl;

            await productsAPI.updateProduct(product.id, payload);
            onProductUpdated();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                    <DialogDescription>
                        Update product information.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {error && (
                            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Product Name *</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-sku">SKU</Label>
                                <Input
                                    id="edit-sku"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                            />
                        </div>

                        <ImageUpload
                            value={formData.imageUrl}
                            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                            label="Product Image"
                            cloudName={import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ddburtjhv'}
                            uploadPreset={import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'pos_products'}
                        />

                        <div className="grid gap-2">
                            <Label htmlFor="edit-category">Category</Label>
                            <Select
                                value={formData.category || '_none'}
                                onValueChange={(value) => setFormData({ ...formData, category: value === '_none' ? '' : value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_none">No Category</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.name}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-cost">Cost Price (KES) *</Label>
                                <Input
                                    id="edit-cost"
                                    type="number"
                                    step="0.01"
                                    value={formData.cost}
                                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-price">Selling Price (KES) *</Label>
                                <Input
                                    id="edit-price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-unit">Unit *</Label>
                                <Select
                                    value={formData.unit}
                                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pieces">Pieces</SelectItem>
                                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                        <SelectItem value="g">Grams (g)</SelectItem>
                                        <SelectItem value="l">Liters (l)</SelectItem>
                                        <SelectItem value="ml">Milliliters (ml)</SelectItem>
                                        <SelectItem value="m">Meters (m)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-unit_size">Unit Size</Label>
                                <Input
                                    id="edit-unit_size"
                                    type="number"
                                    step="0.01"
                                    value={formData.unit_size}
                                    onChange={(e) => setFormData({ ...formData, unit_size: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-reorder_level">Reorder Level</Label>
                                <Input
                                    id="edit-reorder_level"
                                    type="number"
                                    value={formData.reorder_level}
                                    onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-status">Status</Label>
                                <Select
                                    value={formData.is_active ? 'active' : 'inactive'}
                                    onValueChange={(value) => setFormData({ ...formData, is_active: value === 'active' })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Product'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
