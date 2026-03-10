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
import { inventoryAPI } from '../../products/api/inventory.api';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

import { ImageUpload } from '@/components/ui/image-upload';
import { productsAPI, type CreateProductPayload } from '../api/products.api';
import { categoriesAPI, type Category } from '../api/categories.api';


interface CreateProductModalProps {
    open: boolean;
    categories: Category[];
    onClose: () => void;
    onProductCreated: () => void;
}

export const CreateProductModal = ({ open, categories, onClose, onProductCreated }: CreateProductModalProps) => {

    console.log('[CreateProductModal] Categories received:', categories);

    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        category: '',
        price: '',
        cost: '',
        unit: 'pieces',
        unit_size: '',
        reorder_level: '10',
        initial_stock: '',
        imageUrl: '',
    });

    useEffect(() => {
        if (open) {
            setFormData({
                name: '',
                sku: '',
                description: '',
                category: '',
                price: '',
                cost: '',
                unit: 'pieces',
                unit_size: '',
                reorder_level: '10',
                initial_stock: '',
                imageUrl: '',
            });
            setError(null);
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        console.log('[CreateProduct] User keys:', user ? Object.keys(user) : 'null');
        console.log('[CreateProduct] User values:', user);

        try {
            // Try both snake_case and camelCase
            const tenantId = user?.tenant_id || (user as any)?.tenantId;
            console.log('[CreateProduct] Resolved tenantId:', tenantId);

            const payload: CreateProductPayload = {
                name: formData.name,
                price: parseFloat(formData.price),
                cost: parseFloat(formData.cost),
                unit: formData.unit,
                tenant_id: tenantId
            };

            console.log('[CreateProduct] Payload:', payload);

            if (formData.sku) payload.sku = formData.sku;
            if (formData.description) payload.description = formData.description;
            if (formData.category) payload.category = formData.category;
            if (formData.unit_size) payload.unit_size = parseFloat(formData.unit_size);
            if (formData.reorder_level) payload.reorder_level = parseInt(formData.reorder_level);
            if (formData.imageUrl) payload.image_url = formData.imageUrl;

            const product = await productsAPI.createProduct(payload);

            // Handle Initial Stock
            console.log('[CreateProduct] Initial stock string:', formData.initial_stock);
            const initialStockQty = parseFloat(formData.initial_stock);
            console.log('[CreateProduct] Parsed stock qty:', initialStockQty);

            if (!isNaN(initialStockQty) && initialStockQty > 0) {
                console.log('[CreateProduct] Attempting restock for product:', product.id);
                try {
                    const restockResult = await inventoryAPI.restockProduct({
                        productId: product.id,
                        quantity: initialStockQty,
                        notes: 'Initial stock on creation'
                    });
                    console.log('[CreateProduct] Restock success:', restockResult);
                } catch (stockError) {
                    console.error('[CreateProduct] Restock failed:', stockError);
                    toast.error("Product created but stock failed", {
                        description: "Could not set initial stock. Please adjust manually.",
                        id: "stock-error",
                    });
                }
            } else {
                console.log('[CreateProduct] Skipping restock (qty invalid or <= 0)');
            }

            onProductCreated();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.error('Category name is required');
            return;
        }

        setCreatingCategory(true);
        try {
            const newCategory = await categoriesAPI.createCategory({
                name: newCategoryName.trim()
            });
            
            toast.success('Category created successfully');
            setNewCategoryName('');
            setShowNewCategoryDialog(false);
            
            // Update form with the new category ID
            setFormData({ ...formData, category: newCategory.id });
            
            // Refresh categories by calling the parent callback
            onProductCreated();
        } catch (err: any) {
            toast.error('Failed to create category', {
                description: err.response?.data?.message || 'Please try again'
            });
        } finally {
            setCreatingCategory(false);
        }
    };

    return (
        <>
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                        Create a new product in the catalog.
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
                                <Label htmlFor="name">Product Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                    id="sku"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
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
                            <Label htmlFor="category">Category</Label>
                            <div className="space-y-2">
                                <Select
                                    value={formData.category || '_none'}
                                    onValueChange={(value) => {
                                        console.log('Category value changed:', value);
                                        if (value === '_new') {
                                        setShowNewCategoryDialog(true);
                                        } else {
                                            console.log('Setting category to:', value === '_none' ? '' : value);
                                            setFormData({ ...formData, category: value === '_none' ? '' : value });
                                            setNewCategoryName('');
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_none">No Category</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="_new" className="text-blue-600">
                                            + Add New Category
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                
                                {formData.category === '_creating' && (
                                    <div className="mt-2 space-y-2">
                                        <Input
                                            placeholder="Enter new category name"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            className="w-full"
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setFormData({ ...formData, category: '' });
                                                    setNewCategoryName('');
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={async () => {
                                                    if (!newCategoryName.trim()) {
                                                        toast.error('Category name is required');
                                                        return;
                                                    }
                                                    
                                                    setCreatingCategory(true);
                                                    try {
                                                        const newCategory = await categoriesAPI.createCategory({
                                                            name: newCategoryName.trim()
                                                        });
                                                        
                                                        toast.success('Category created successfully');
                                                        setFormData({ ...formData, category: newCategory.id });
                                                        setNewCategoryName('');
                                                    } catch (err: any) {
                                                        toast.error('Failed to create category', {
                                                            description: err.response?.data?.message || 'Please try again'
                                                        });
                                                    } finally {
                                                        setCreatingCategory(false);
                                                    }
                                                }}
                                                disabled={creatingCategory || !newCategoryName.trim()}
                                            >
                                                {creatingCategory ? 'Creating...' : 'Create & Select'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="cost">Cost Price (KES) *</Label>
                                <Input
                                    id="cost"
                                    type="number"
                                    step="0.01"
                                    value={formData.cost}
                                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="price">Selling Price (KES) *</Label>
                                <Input
                                    id="price"
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
                                <Label htmlFor="unit">Unit *</Label>
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
                                <Label htmlFor="unit_size">Unit Size</Label>
                                <Input
                                    id="unit_size"
                                    type="number"
                                    step="0.01"
                                    value={formData.unit_size}
                                    onChange={(e) => setFormData({ ...formData, unit_size: e.target.value })}
                                    placeholder="e.g., 500 for 500ml"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="reorder_level">Reorder Level</Label>
                                <Input
                                    id="reorder_level"
                                    type="number"
                                    value={formData.reorder_level}
                                    onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="initial_stock">Initial Stock</Label>
                                <Input
                                    id="initial_stock"
                                    type="number"
                                    placeholder="0"
                                    value={formData.initial_stock}
                                    onChange={(e) => setFormData({ ...formData, initial_stock: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Product'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        {/* New Category Dialog */}
        <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                    <DialogDescription>
                        Create a new product category.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="new-category-name">Category Name</Label>
                        <Input
                            id="new-category-name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Enter category name"
                            disabled={creatingCategory}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowNewCategoryDialog(false)}
                        disabled={creatingCategory}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="button" 
                        onClick={handleCreateCategory}
                        disabled={creatingCategory || !newCategoryName.trim()}
                    >
                        {creatingCategory ? 'Creating...' : 'Create Category'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
};
