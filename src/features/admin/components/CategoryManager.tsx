import { useState } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useCategories, type Category } from '@/hooks/useCategories';


interface CategoryManagerProps {
    onCategoryChange?: () => void;
    onClose?: () => void;
}

export const CategoryManager = ({ onCategoryChange }: CategoryManagerProps) => {
    const {
        categories,
        loading,
        error: apiError,
        createCategory,
        updateCategory,
        deleteCategory
    } = useCategories();

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

    // Form data
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDescription, setNewCategoryDescription] = useState('');
    const [editCategoryName, setEditCategoryName] = useState('');

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            await createCategory({
                name: newCategoryName.trim()
            });
            setNewCategoryName('');
            setShowCreateModal(false);
            onCategoryChange?.();
        } catch (err) {
            console.error('Failed to create category:', err);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory || !editCategoryName.trim()) return;

        try {
            await updateCategory(editingCategory.id, { name: editCategoryName.trim() });
            setEditingCategory(null);
            onCategoryChange?.();
        } catch (err) {
            console.error('Failed to update category:', err);
        }
    };

    const handleDelete = async () => {
        if (!deletingCategory) return;

        try {
            await deleteCategory(deletingCategory.id);
            setDeletingCategory(null);
            onCategoryChange?.();
        } catch (err) {
            console.error('Failed to delete category:', err);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Product Categories
                </h2>
                <Button onClick={() => setShowCreateModal(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                </Button>
            </div>

            {apiError && (
                <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
                    {apiError}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : categories.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        No categories yet. Create one to get started.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                        <Card key={category.id}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center justify-between">
                                    <span>{category.name}</span>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setEditingCategory(category);
                                                setEditCategoryName(category.name);
                                            }}
                                        >
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setDeletingCategory(category)}
                                        >
                                            <Trash2 className="h-3 w-3 text-destructive" />
                                        </Button>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {category.productCount} product{category.productCount !== 1 ? 's' : ''}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Category</DialogTitle>
                        <DialogDescription>
                            Add a new product category to organize your inventory.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="category-name">Category Name <span className='text-red-500'>(required)</span></Label>
                                <Input
                                    id="category-name"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="e.g., Electronics, Food, Beverages"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Input
                                    id="description"
                                    value={newCategoryDescription}
                                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                                    placeholder="Enter a description for this category"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Create</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Update the category name. This will affect all products in this category.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-category-name">Category Name</Label>
                                <Input
                                    id="edit-category-name"
                                    value={editCategoryName}
                                    onChange={(e) => setEditCategoryName(e.target.value)}
                                    placeholder="Enter category name"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingCategory(null)}>
                                Cancel
                            </Button>
                            <Button type="submit">Update</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deletingCategory?.name}"?
                            {deletingCategory && (deletingCategory.productCount || 0) > 0 && (
                                <span className="block mt-2 text-warning-600">
                                    This category has {deletingCategory.productCount || 0} product(s).
                                    They will be uncategorized.
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingCategory(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
};
