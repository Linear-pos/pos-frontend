import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getCashiers,
    createCashier,
    updateCashier,
    deleteCashier,
    resetCashierPin,
    unlockCashier,
} from '@/services/cashier.api';
import type { Cashier } from '@/services/cashier.api';
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
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Edit,
    Trash2,
    Unlock,
    Key,
    User,
    ShieldCheck,
    Crown,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/common/DataTable';

export default function CashierManagement() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);

    // Modals
    const [createModal, setCreateModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [resetPinModal, setResetPinModal] = useState(false);
    const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        role: 'cashier' as 'cashier' | 'supervisor' | 'manager',
        canOpenShift: true,
        canCloseShift: false,
        canOverridePrices: false,
    });
    const [newPin, setNewPin] = useState('');

    // Fetch cashiers
    const { data, isLoading, error } = useQuery({
        queryKey: ['cashiers', page, search, roleFilter, statusFilter],
        queryFn: () =>
            getCashiers({
                page,
                limit: 20,
                search: search || undefined,
                role: roleFilter !== 'all' ? roleFilter : undefined,
                isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
            }),
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: createCashier,
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['cashiers'] });
            // Store temp PIN to show in modal
            setNewPin(response.data.temporaryPin);
            toast.success('Cashier created successfully');
            // Don't close modal yet - show the temp PIN
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create cashier');
            setCreateModal(false);
            resetForm();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateCashier(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cashiers'] });
            toast.success('Cashier updated successfully');
            setEditModal(false);
            setSelectedCashier(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update cashier');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCashier,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cashiers'] });
            toast.success('Cashier deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete cashier');
        },
    });

    const resetPinMutation = useMutation({
        mutationFn: (id: string) => resetCashierPin(id),
        onSuccess: (response) => {
            // Store temp PIN to show in modal
            setNewPin(response.data.temporaryPin);
            toast.success('Temporary PIN generated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to generate temporary PIN');
            setResetPinModal(false);
            setNewPin('');
            setSelectedCashier(null);
        },
    });

    const unlockMutation = useMutation({
        mutationFn: unlockCashier,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cashiers'] });
            toast.success('Cashier account unlocked');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to unlock account');
        },
    });

    const resetForm = () => {
        setFormData({
            fullName: '',
            role: 'cashier',
            canOpenShift: true,
            canCloseShift: false,
            canOverridePrices: false,
        });
        setNewPin('');
    };

    const handleCreate = () => {
        if (!formData.fullName) {
            toast.error('Please enter cashier name');
            return;
        }

        createMutation.mutate(formData);
    };

    const handleEdit = () => {
        if (!selectedCashier) return;

        const updates = {
            fullName: formData.fullName,
            role: formData.role,
            canOpenShift: formData.canOpenShift,
            canCloseShift: formData.canCloseShift,
            canOverridePrices: formData.canOverridePrices,
        };

        updateMutation.mutate({ id: selectedCashier.id, data: updates });
    };

    const handleDelete = (cashier: Cashier) => {
        if (confirm(`Are you sure you want to delete ${cashier.fullName}?`)) {
            deleteMutation.mutate(cashier.id);
        }
    };

    const handleResetPin = () => {
        if (!selectedCashier) return;
        // Trigger the mutation to generate temp PIN
        resetPinMutation.mutate(selectedCashier.id);
    };

    const openEditModal = (cashier: Cashier) => {
        setSelectedCashier(cashier);
        setFormData({
            fullName: cashier.fullName,
            pin: '',
            role: cashier.role,
            canOpenShift: cashier.canOpenShift,
            canCloseShift: cashier.canCloseShift,
            canOverridePrices: cashier.canOverridePrices,
        });
        setEditModal(true);
    };

    const openResetPinModal = (cashier: Cashier) => {
        setSelectedCashier(cashier);
        setNewPin('');
        setResetPinModal(true);
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'manager':
                return <Crown className="w-4 h-4 text-amber-600" />;
            case 'supervisor':
                return <ShieldCheck className="w-4 h-4 text-blue-600" />;
            default:
                return <User className="w-4 h-4 text-gray-600" />;
        }
    };

    const getRoleBadge = (role: string) => {
        const colors = {
            manager: 'bg-amber-100 text-amber-800',
            supervisor: 'bg-blue-100 text-blue-800',
            cashier: 'bg-gray-100 text-gray-800',
        };
        return colors[role as keyof typeof colors] || colors.cashier;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Cashier Management</h1>
                    <p className="text-muted-foreground">Manage cashier accounts and permissions</p>
                </div>
                <Button onClick={() => setCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Cashier
                </Button>
            </div>

            {/* DataTable */}
            <DataTable<Cashier>
                data={data?.data}
                columns={[
                    {
                        key: 'name',
                        title: 'Name',
                        render: (cashier: Cashier) => (
                            <div className="flex items-center gap-2">
                                {getRoleIcon(cashier.role)}
                                <div>
                                    <p className="font-medium">{cashier.fullName}</p>
                                    <p className="text-sm text-muted-foreground">{cashier.id.slice(0, 8)}</p>
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: 'role',
                        title: 'Role',
                        render: (cashier: Cashier) => (
                            <Badge className={getRoleBadge(cashier.role)}>{cashier.role}</Badge>
                        ),
                    },
                    {
                        key: 'status',
                        title: 'Status',
                        render: (cashier: Cashier) => (
                            <Badge variant={cashier.isActive ? 'default' : 'secondary'}>
                                {cashier.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        ),
                    },
                    {
                        key: 'permissions',
                        title: 'Permissions',
                        render: (cashier: Cashier) => (
                            <div className="flex gap-1">
                                {cashier.canOpenShift && <Badge variant="outline" className="text-xs">Open</Badge>}
                                {cashier.canCloseShift && <Badge variant="outline" className="text-xs">Close</Badge>}
                                {cashier.canOverridePrices && <Badge variant="outline" className="text-xs">Override</Badge>}
                            </div>
                        ),
                    },
                    {
                        key: 'lastLogin',
                        title: 'Last Login',
                        render: (cashier: Cashier) => (
                            <span className="text-sm text-muted-foreground">
                                {cashier.lastLoginAt
                                    ? new Date(cashier.lastLoginAt).toLocaleDateString()
                                    : 'Never'}
                            </span>
                        ),
                    },
                ]}
                isLoading={isLoading}
                error={error}
                pagination={data?.pagination}
                onPageChange={setPage}
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search cashiers..."
                filters={
                    <>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="cashier">Cashier</SelectItem>
                                <SelectItem value="supervisor">Supervisor</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </>
                }
                rowActions={(cashier: Cashier) => (
                    <>
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(cashier)}>
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openResetPinModal(cashier)}>
                            <Key className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => unlockMutation.mutate(cashier.id)}>
                            <Unlock className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(cashier)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </>
                )}
                emptyMessage="No cashiers found"
                getItemId={(cashier: Cashier) => cashier.id}
            />

            {/* Create Cashier Modal */}
            <Dialog open={createModal} onOpenChange={setCreateModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Cashier</DialogTitle>
                        <DialogDescription>Add a new cashier to the system</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {newPin ? (
                            <>
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                                    <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                                        ✓ Cashier created successfully!
                                    </p>
                                </div>
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                    <Label className="text-sm text-muted-foreground">Temporary PIN</Label>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-4xl font-mono font-bold tracking-widest">
                                            {newPin}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                navigator.clipboard.writeText(newPin);
                                                toast.success('PIN copied to clipboard');
                                            }}
                                        >
                                            Copy
                                        </Button>
                                    </div>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        <strong>Important:</strong> Share this 4-digit PIN securely with the cashier.
                                        They must use it within 24 hours to set their permanent PIN.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cashier">Cashier</SelectItem>
                                            <SelectItem value="supervisor">Supervisor</SelectItem>
                                            <SelectItem value="manager">Manager</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Permissions</Label>
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.canOpenShift}
                                                onChange={(e) => setFormData({ ...formData, canOpenShift: e.target.checked })}
                                            />
                                            <span className="text-sm">Can open shifts</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.canCloseShift}
                                                onChange={(e) => setFormData({ ...formData, canCloseShift: e.target.checked })}
                                            />
                                            <span className="text-sm">Can close shifts</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.canOverridePrices}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, canOverridePrices: e.target.checked })
                                                }
                                            />
                                            <span className="text-sm">Can override prices</span>
                                        </label>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setCreateModal(false);
                                resetForm();
                            }}
                        >
                            {newPin ? 'Close' : 'Cancel'}
                        </Button>
                        {!newPin && (
                            <Button onClick={handleCreate} disabled={createMutation.isPending}>
                                {createMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Cashier'
                                )}
                            </Button>
                        )}
                </DialogFooter>
            </DialogContent>
        </Dialog>

            {/* Edit Cashier Modal */ }
    <Dialog open={editModal} onOpenChange={setEditModal}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Edit Cashier</DialogTitle>
                <DialogDescription>Update cashier information and permissions</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div>
                    <Label htmlFor="edit-name">Full Name</Label>
                    <Input
                        id="edit-name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                </div>
                <div>
                    <Label htmlFor="edit-role">Role</Label>
                    <Select
                        value={formData.role}
                        onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="cashier">Cashier</SelectItem>
                            <SelectItem value="supervisor">Supervisor</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Permissions</Label>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.canOpenShift}
                                onChange={(e) => setFormData({ ...formData, canOpenShift: e.target.checked })}
                            />
                            <span className="text-sm">Can open shifts</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.canCloseShift}
                                onChange={(e) => setFormData({ ...formData, canCloseShift: e.target.checked })}
                            />
                            <span className="text-sm">Can close shifts</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.canOverridePrices}
                                onChange={(e) =>
                                    setFormData({ ...formData, canOverridePrices: e.target.checked })
                                }
                            />
                            <span className="text-sm">Can override prices</span>
                        </label>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setEditModal(false)}>
                    Cancel
                </Button>
                <Button onClick={handleEdit} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Updating...
                        </>
                    ) : (
                        'Update Cashier'
                    )}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    {/* Reset PIN Modal */ }
    <Dialog open={resetPinModal} onOpenChange={setResetPinModal}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Generate Temporary PIN</DialogTitle>
                <DialogDescription>
                    {newPin
                        ? `Temporary PIN for ${selectedCashier?.fullName}`
                        : `Generate a temporary PIN for ${selectedCashier?.fullName}`
                    }
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                {newPin ? (
                    <>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <Label className="text-sm text-muted-foreground">Temporary PIN</Label>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-4xl font-mono font-bold tracking-widest">
                                    {newPin}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        navigator.clipboard.writeText(newPin);
                                        toast.success('PIN copied to clipboard');
                                    }}
                                >
                                    Copy
                                </Button>
                            </div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                <strong>Important:</strong> Share this PIN securely with the cashier.
                                They must use it to set their permanent PIN within 24 hours.
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-muted-foreground mb-4">
                            Click "Generate PIN" to create a temporary 4-digit PIN.
                            The cashier will use this to set their permanent PIN.
                        </p>
                    </div>
                )}
            </div>
            <DialogFooter>
                <Button
                    variant="outline"
                    onClick={() => {
                        setResetPinModal(false);
                        setNewPin('');
                        setSelectedCashier(null);
                    }}
                >
                    {newPin ? 'Close' : 'Cancel'}
                </Button>
                {!newPin && (
                    <Button onClick={handleResetPin} disabled={resetPinMutation.isPending}>
                        {resetPinMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            'Generate PIN'
                        )}
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
    </Dialog>
        </div >
    );
}
