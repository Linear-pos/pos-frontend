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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usersAPI, type User, type UpdateUserPayload } from '../api/users.api';

interface EditUserModalProps {
    user: User;
    open: boolean;
    onClose: () => void;
    onUserUpdated: () => void;
}

export const EditUserModal = ({ user, open, onClose, onUserUpdated }: EditUserModalProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        role_id: user.roleId,
        branch_id: user.branchId || '',
    });

    useEffect(() => {
        if (open) {
            setFormData({
                name: user.name,
                email: user.email,
                role_id: user.roleId,
                branch_id: user.branchId || '',
            });
            setError(null);
        }
    }, [open, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload: UpdateUserPayload = {
                name: formData.name,
                email: formData.email,
                role_id: formData.role_id,
                branch_id: formData.branch_id || null,
            };

            await usersAPI.updateUser(user.id, payload);
            onUserUpdated();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Update user information and role assignment.
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
                            <Label htmlFor="edit-name">Full Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-role">Role</Label>
                            <Select
                                value={formData.role_id}
                                onValueChange={(value) => setFormData({ ...formData, role_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="role-system-admin">System Admin</SelectItem>
                                    <SelectItem value="role-branch-manager">Branch Manager</SelectItem>
                                    <SelectItem value="role-cashier">Cashier</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-branch">Branch</Label>
                            <Select
                                value={formData.branch_id || '_none'}
                                onValueChange={(value) => setFormData({ ...formData, branch_id: value === '_none' ? '' : value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_none">No Branch</SelectItem>
                                    {/* TODO: Load branches from API */}
                                    <SelectItem value="branch-1">Main Branch</SelectItem>
                                    <SelectItem value="branch-2">Downtown Branch</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
