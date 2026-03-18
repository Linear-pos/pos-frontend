import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { rolesAPI } from '../api/roles.api';
import { branchesAPI } from '../api/branches.api';
import { invitationsAPI } from '../api/invitations.api';
import { toast } from 'sonner';

interface CreateUserModalProps {
    open: boolean;
    onClose: () => void;
    onUserCreated: () => void;
}

export const CreateUserModal = ({ open, onClose, onUserCreated }: CreateUserModalProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        roleId: '',
        branchId: '',
    });

    const { data: branchesData } = useQuery({
        queryKey: ['branches'],
        queryFn: () => branchesAPI.getBranches({ limit: 100 }),
        enabled: open,
    });

    const { data: rolesData, isLoading: rolesLoading } = useQuery({
        queryKey: ['roles'],
        queryFn: () => rolesAPI.getRoles(),
        enabled: open,
    });

    const getRoleName = (roleId: string) => {
        const role = rolesData?.find(r => r.id === roleId);
        return role?.name || '';
    };

    useEffect(() => {
        if (open) {
            setFormData({
                name: '',
                email: '',
                roleId: '',
                branchId: '',
            });
            setError(null);
        }
    }, [open, rolesData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const roleName = getRoleName(formData.roleId);
            
            await invitationsAPI.inviteUser({
                name: formData.name,
                email: formData.email,
                role: roleName,
                branchId: formData.branchId || undefined,
            });

            toast.success('Invitation sent', {
                description: `An invitation email has been sent to ${formData.email}`,
            });
            
            onUserCreated();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Invite User</DialogTitle>
                    <DialogDescription>
                        Send an invitation to join your organization. They will set their own password.
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
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.roleId}
                                onValueChange={(value) => setFormData({ ...formData, roleId: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={rolesLoading ? "Loading..." : "Select role"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {rolesData?.map((role) => (
                                        <SelectItem key={role.id} value={role.id}>
                                            {role.name.replace(/_/g, ' ')}
                                        </SelectItem>
                                    ))}
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
                                    {branchesData?.data?.map((branch) => (
                                        <SelectItem key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </SelectItem>
                                    ))}
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
                            {loading ? 'Sending...' : 'Send Invitation'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
