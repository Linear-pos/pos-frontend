import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, RotateCcw, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usersAPI, type User, type UsersQueryParams } from '../api/users.api';
import { CreateUserModal } from '../components/CreateUserModal';
import { EditUserModal } from '../components/EditUserModal';
import { DataTable } from '@/components/common/DataTable';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const UserManagement = () => {
    // Data State
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0,
        limit: 20
    });

    // Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('active');

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);

        try {
            const params: UsersQueryParams = {
                page: pagination.page,
                limit: 20,
            };

            if (roleFilter !== 'all') {
                params.role = roleFilter;
            }

            if (statusFilter !== 'all') {
                params.status = statusFilter as 'active' | 'inactive';
            }

            if (searchQuery) {
                params.search = searchQuery;
            }

            const response = await usersAPI.getUsers(params);
            setUsers(response.data);
            setPagination({
                page: response.pagination.page,
                pages: response.pagination.pages,
                total: response.pagination.total,
                limit: response.pagination.limit
            });
        } catch (err: any) {
            setError(err.message || 'Failed to fetch users');
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, roleFilter, statusFilter]);

    // Handle search specifically (reset page)
    useEffect(() => {
        if (pagination.page !== 1) {
            setPagination(prev => ({ ...prev, page: 1 }));
        } else {
            fetchUsers();
        }
    }, [searchQuery]);

    const getRoleBadgeColor = (role: string) => {
        const colors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            SYSTEM_ADMIN: 'destructive',
            BRANCH_MANAGER: 'default',
            CASHIER: 'secondary',
        };
        return colors[role] || 'outline';
    };

    const handleDeactivate = async (user: User) => {
        if (!confirm(`Are you sure you want to deactivate ${user.name}?`)) return;

        try {
            await usersAPI.deactivateUser(user.id);
            toast.success('User deactivated successfully');
            fetchUsers();
        } catch (error) {
            console.error('Failed to deactivate user:', error);
            toast.error('Failed to deactivate user');
        }
    };

    const handleResetPassword = async (user: User) => {
        if (!confirm(`Send password reset email to ${user.email}?`)) return;

        try {
            await usersAPI.resetPassword(user.id);
            toast.success('Password reset email sent successfully');
        } catch (error) {
            console.error('Failed to reset password:', error);
            toast.error('Failed to send password reset email');
        }
    };

    return (
        <div className="space-y-6 pt-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Manage system users and access controls</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create User
                </Button>
            </div>

            <DataTable<User>
                data={users}
                isLoading={loading}
                error={error ? new Error(error) : null}
                pagination={{
                    page: pagination.page,
                    pages: pagination.pages,
                    total: pagination.total
                }}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                search={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search by name or email..."
                filters={
                    <>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="SYSTEM_ADMIN">System Admin</SelectItem>
                                <SelectItem value="BRANCH_MANAGER">Branch Manager</SelectItem>
                                <SelectItem value="CASHIER">Cashier</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </>
                }
                columns={[
                    {
                        key: 'name',
                        title: 'Name',
                        render: (user) => <div className="font-medium">{user.name}</div>
                    },
                    {
                        key: 'email',
                        title: 'Email',
                        render: (user) => <div className="text-sm text-muted-foreground">{user.email}</div>
                    },
                    {
                        key: 'role',
                        title: 'Role',
                        render: (user) => (
                            <Badge variant={getRoleBadgeColor(user.role)}>
                                {user.role.replace('_', ' ')}
                            </Badge>
                        )
                    },
                    {
                        key: 'branch',
                        title: 'Branch',
                        render: (user) => (
                            <div className="text-sm">
                                {user.branchName || <span className="text-muted-foreground">N/A</span>}
                            </div>
                        )
                    },
                    {
                        key: 'status',
                        title: 'Status',
                        render: (user) => (
                            <Badge variant={user.isActive ? 'secondary' : 'outline'}>
                                {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        )
                    },
                    {
                        key: 'created',
                        title: 'Created',
                        render: (user) => (
                            <div className="text-sm text-muted-foreground">
                                {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                            </div>
                        )
                    }
                ]}
                rowActions={(user) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingUser(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Reset Password
                            </DropdownMenuItem>
                            {user.isActive && (
                                <DropdownMenuItem
                                    onClick={() => handleDeactivate(user)}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Deactivate
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                emptyMessage="No users found matching your criteria."
                getItemId={(user) => user.id}
            />

            {/* Modals */}
            <CreateUserModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onUserCreated={fetchUsers}
            />

            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    open={!!editingUser}
                    onClose={() => setEditingUser(null)}
                    onUserUpdated={() => {
                        setEditingUser(null);
                        fetchUsers();
                    }}
                />
            )}
        </div>
    );
};

export default UserManagement;
