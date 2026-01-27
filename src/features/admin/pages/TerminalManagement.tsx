import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getTerminals,
    createTerminal,
    updateTerminal,
    deactivateTerminal,
    getTerminalDevices,
    unpairDevice,
    revokeDevice,
} from '@/services/terminal.api';
import type { Terminal, TerminalDevice } from '@/services/terminal.api';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Plus,
    Search,
    Edit,
    Power,
    Monitor,
    Smartphone,
    Wifi,
    WifiOff,
    Loader2,
    AlertCircle,
    Trash2,
    Ban,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDistanceToNow } from 'date-fns';
import { useBranchScope } from '@/hooks/useBranchScope';


export default function TerminalManagement() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);

    // Modals
    const [createModal, setCreateModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [devicesModal, setDevicesModal] = useState(false);
    const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);

    const { branchId } = useBranchScope();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        terminalCode: '',
        maxConcurrentShifts: 1,
        offlineModeEnabled: false,
        branchId: branchId || '',
    });

    // Fetch terminals
    const { data, isLoading, error } = useQuery({
        queryKey: ['terminals', page, search, statusFilter],
        queryFn: () =>
            getTerminals({
                page,
                limit: 20,
                search: search || undefined,
                isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
            }),
    });

    // Fetch devices for selected terminal
    const { data: devicesData, isLoading: devicesLoading } = useQuery({
        queryKey: ['terminal-devices', selectedTerminal?.id],
        queryFn: () => getTerminalDevices(selectedTerminal!.id),
        enabled: !!selectedTerminal && devicesModal,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: createTerminal,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['terminals'] });
            toast.success('Terminal created successfully');
            setCreateModal(false);
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create terminal');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateTerminal(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['terminals'] });
            toast.success('Terminal updated successfully');
            setEditModal(false);
            setSelectedTerminal(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update terminal');
        },
    });

    const deactivateMutation = useMutation({
        mutationFn: deactivateTerminal,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['terminals'] });
            toast.success('Terminal deactivated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to deactivate terminal');
        },
    });

    const unpairDeviceMutation = useMutation({
        mutationFn: ({ terminalId, deviceId }: { terminalId: string; deviceId: string }) =>
            unpairDevice(terminalId, deviceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['terminal-devices'] });
            toast.success('Device unpaired successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to unpair device');
        },
    });

    const revokeDeviceMutation = useMutation({
        mutationFn: ({ terminalId, deviceId }: { terminalId: string; deviceId: string }) =>
            revokeDevice(terminalId, deviceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['terminal-devices'] });
            toast.success('Device revoked successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to revoke device');
        },
    });

    const resetForm = () => {
        setFormData({
            name: '',
            terminalCode: '',
            maxConcurrentShifts: 1,
            offlineModeEnabled: false,
            branchId: branchId || '',
        });
    };

    const handleCreate = () => {
        if (!formData.name || !formData.terminalCode) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!formData.branchId || formData.branchId === '') {
            toast.error('Please select a branch for this terminal');
            return;
        }

        createMutation.mutate(formData);
    };

    const handleEdit = () => {
        if (!selectedTerminal) return;

        const updates = {
            name: formData.name,
            maxConcurrentShifts: formData.maxConcurrentShifts,
            offlineModeEnabled: formData.offlineModeEnabled,
            branchId: formData.branchId,
        };

        updateMutation.mutate({ id: selectedTerminal.id, data: updates });
    };

    const handleDeactivate = (terminal: Terminal) => {
        if (confirm(`Are you sure you want to deactivate ${terminal.name}?`)) {
            deactivateMutation.mutate(terminal.id);
        }
    };

    const openEditModal = (terminal: Terminal) => {
        setSelectedTerminal(terminal);
        setFormData({
            name: terminal.name,
            terminalCode: terminal.terminalCode,
            maxConcurrentShifts: terminal.maxConcurrentShifts,
            offlineModeEnabled: terminal.offlineModeEnabled,
            branchId: terminal.branchId || branchId || '',
        });
        setEditModal(true);
    };

    const openDevicesModal = (terminal: Terminal) => {
        setSelectedTerminal(terminal);
        setDevicesModal(true);
    };

    const isOnline = (terminal: Terminal) => {
        if (!terminal.lastSeenAt) return false;
        const lastSeen = new Date(terminal.lastSeenAt).getTime();
        const now = new Date().getTime();
        return now - lastSeen < 5 * 60 * 1000; // 5 minutes
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Terminal Management</h1>
                    <p className="text-muted-foreground">Manage POS terminals and devices</p>
                </div>
                <Button onClick={() => setCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Terminal
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search terminals..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
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
            </div>

            {/* Error State */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Failed to load terminals. Please try again.</AlertDescription>
                </Alert>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}

            {/* Terminals Table */}
            {!isLoading && data && (
                <div className="bg-card rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Terminal</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Online</TableHead>
                                <TableHead>Last Seen</TableHead>
                                <TableHead>Max Shifts</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                        No terminals found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.data.map((terminal) => (
                                    <TableRow key={terminal.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Monitor className="w-4 h-4 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">{terminal.name}</p>
                                                    {terminal.offlineModeEnabled && (
                                                        <Badge variant="outline" className="text-xs mt-1">
                                                            Offline Mode
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-sm bg-muted px-2 py-1 rounded">
                                                {terminal.terminalCode}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={terminal.isActive ? 'default' : 'secondary'}>
                                                {terminal.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {isOnline(terminal) ? (
                                                <Badge className="bg-green-100 text-green-800">
                                                    <Wifi className="w-3 h-3 mr-1" />
                                                    Online
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    <WifiOff className="w-3 h-3 mr-1" />
                                                    Offline
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {terminal.lastSeenAt
                                                ? formatDistanceToNow(new Date(terminal.lastSeenAt), { addSuffix: true })
                                                : 'Never'}
                                        </TableCell>
                                        <TableCell>{terminal.maxConcurrentShifts}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openDevicesModal(terminal)}
                                                >
                                                    <Smartphone className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => openEditModal(terminal)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeactivate(terminal)}
                                                >
                                                    <Power className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Pagination */}
            {data && data.pagination.pages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Page {data.pagination.page} of {data.pagination.pages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                            disabled={page === data.pagination.pages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Create Terminal Modal */}
            <Dialog open={createModal} onOpenChange={setCreateModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Terminal</DialogTitle>
                        <DialogDescription>Add a new POS terminal to the system</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="name">Terminal Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Main Counter"
                            />
                        </div>
                        <div>
                            <Label htmlFor="code">Terminal Code *</Label>
                            <Input
                                id="code"
                                value={formData.terminalCode}
                                onChange={(e) => setFormData({ ...formData, terminalCode: e.target.value })}
                                placeholder="TERM001"
                            />
                        </div>
                        <div>
                            <Label htmlFor="shifts">Max Concurrent Shifts</Label>
                            <Input
                                id="shifts"
                                type="number"
                                min="0"
                                max="10"
                                value={formData.maxConcurrentShifts}
                                onChange={(e) =>
                                    setFormData({ ...formData, maxConcurrentShifts: parseInt(e.target.value) || 1 })
                                }
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="offline"
                                checked={formData.offlineModeEnabled}
                                onChange={(e) =>
                                    setFormData({ ...formData, offlineModeEnabled: e.target.checked })
                                }
                            />
                            <Label htmlFor="offline" className="cursor-pointer">
                                Enable offline mode
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={createMutation.isPending}>
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Terminal'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Terminal Modal */}
            <Dialog open={editModal} onOpenChange={setEditModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Terminal</DialogTitle>
                        <DialogDescription>Update terminal settings</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="edit-name">Terminal Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-shifts">Max Concurrent Shifts</Label>
                            <Input
                                id="edit-shifts"
                                type="number"
                                min="0"
                                max="10"
                                value={formData.maxConcurrentShifts}
                                onChange={(e) =>
                                    setFormData({ ...formData, maxConcurrentShifts: parseInt(e.target.value) || 1 })
                                }
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="edit-offline"
                                checked={formData.offlineModeEnabled}
                                onChange={(e) =>
                                    setFormData({ ...formData, offlineModeEnabled: e.target.checked })
                                }
                            />
                            <Label htmlFor="edit-offline" className="cursor-pointer">
                                Enable offline mode
                            </Label>
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
                                'Update Terminal'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Devices Modal */}
            <Dialog open={devicesModal} onOpenChange={setDevicesModal}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Paired Devices - {selectedTerminal?.name}</DialogTitle>
                        <DialogDescription>Manage devices connected to this terminal</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {devicesLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                        ) : devicesData && devicesData.data.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Device</TableHead>
                                        <TableHead>OS</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Seen</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {devicesData.data.map((device: TerminalDevice) => (
                                        <TableRow key={device.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Smartphone className="w-4 h-4" />
                                                    <div>
                                                        <p className="font-medium">{device.deviceName || 'Unnamed'}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {device.deviceFingerprint.slice(0, 12)}...
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">{device.os || 'Unknown'}</TableCell>
                                            <TableCell>
                                                {device.revokedAt ? (
                                                    <Badge variant="destructive">Revoked</Badge>
                                                ) : device.isTrusted ? (
                                                    <Badge className="bg-green-100 text-green-800">Trusted</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Paired</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {device.lastHeartbeatAt
                                                    ? formatDistanceToNow(new Date(device.lastHeartbeatAt), {
                                                        addSuffix: true,
                                                    })
                                                    : 'Never'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {!device.revokedAt && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                revokeDeviceMutation.mutate({
                                                                    terminalId: selectedTerminal!.id,
                                                                    deviceId: device.id,
                                                                })
                                                            }
                                                        >
                                                            <Ban className="w-4 h-4 text-orange-600" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            unpairDeviceMutation.mutate({
                                                                terminalId: selectedTerminal!.id,
                                                                deviceId: device.id,
                                                            })
                                                        }
                                                    >
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>No devices paired to this terminal</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
