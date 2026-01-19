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
import { usersAPI, type CreateUserPayload } from '../api/users.api';
import { useAuthStore } from '@/stores/auth.store';

interface CreateUserModalProps {
    open: boolean;
    onClose: () => void;
    onUserCreated: () => void;
}

export const CreateUserModal = ({ open, onClose, onUserCreated }: CreateUserModalProps) => {
    const user = useAuthStore((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roleId: '',
        branchId: '',
    });

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            setFormData({
                name: '',
                email: '',
                password: '',
                roleId: '',
                branchId: '',
            });
            setError(null);
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload: CreateUserPayload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                roleId: formData.roleId,
                tenantId: user?.tenant_id || '',
                branchId: formData.branchId || null,
            };

            await usersAPI.createUser(payload);
            onUserCreated();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                        Add a new user to the system. They will receive login credentials via email.
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
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={8}
                            />
                            <p className="text-xs text-muted-foreground">
                                Minimum 8 characters
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.roleId}
                                onValueChange={(value) => setFormData({ ...formData, roleId: value })}
                                required
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
                            <Label htmlFor="branch">Branch (Optional)</Label>
                            <Select
                                value={formData.branchId || '_none'}
                                onValueChange={(value) => setFormData({ ...formData, branchId: value === '_none' ? '' : value })}
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
                            <p className="text-xs text-muted-foreground">
                                Required for Branch Managers and Cashiers
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
