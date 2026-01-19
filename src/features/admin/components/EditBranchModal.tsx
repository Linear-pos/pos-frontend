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
import { branchesAPI, type Branch, type UpdateBranchPayload } from '../api/branches.api';

interface EditBranchModalProps {
    branch: Branch;
    open: boolean;
    onClose: () => void;
    onBranchUpdated: () => void;
}

export const EditBranchModal = ({ branch, open, onClose, onBranchUpdated }: EditBranchModalProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: branch.name,
        address: branch.address || '',
        phone: branch.phone || '',
        email: branch.email || '',
    });

    useEffect(() => {
        if (open) {
            setFormData({
                name: branch.name,
                address: branch.address || '',
                phone: branch.phone || '',
                email: branch.email || '',
            });
            setError(null);
        }
    }, [open, branch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload: UpdateBranchPayload = {
                name: formData.name,
                address: formData.address || undefined,
                phone: formData.phone || undefined,
                email: formData.email || undefined,
            };

            await branchesAPI.updateBranch(branch.id, payload);
            onBranchUpdated();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update branch');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Branch</DialogTitle>
                    <DialogDescription>
                        Update branch information.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {error && (
                            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Branch Name *</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-address">Address</Label>
                            <Textarea
                                id="edit-address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-phone">Phone</Label>
                            <Input
                                id="edit-phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Branch'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
