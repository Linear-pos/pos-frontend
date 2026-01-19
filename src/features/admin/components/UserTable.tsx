import { useState } from 'react';
import { Edit, Trash2, RotateCcw, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import type { User } from '../api/users.api';
import { usersAPI } from '../api/users.api';
import { EditUserModal } from './EditUserModal';

interface UserTableProps {
    users: User[];
    onUserUpdated: () => void;
}

export const UserTable = ({ users, onUserUpdated }: UserTableProps) => {
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<string | null>(null);

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

        setLoading(user.id);
        try {
            await usersAPI.deactivateUser(user.id);
            onUserUpdated();
        } catch (error) {
            console.error('Failed to deactivate user:', error);
            alert('Failed to deactivate user');
        } finally {
            setLoading(null);
        }
    };

    const handleResetPassword = async (user: User) => {
        if (!confirm(`Send password reset email to ${user.email}?`)) return;

        setLoading(user.id);
        try {
            await usersAPI.resetPassword(user.id);
            alert('Password reset email sent successfully');
        } catch (error) {
            console.error('Failed to reset password:', error);
            alert('Failed to send password reset email');
        } finally {
            setLoading(null);
        }
    };

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-4 font-medium text-neutral-700">Name</th>
                            <th className="text-left p-4 font-medium text-neutral-700">Email</th>
                            <th className="text-left p-4 font-medium text-neutral-700">Role</th>
                            <th className="text-left p-4 font-medium text-neutral-700">Branch</th>
                            <th className="text-center p-4 font-medium text-neutral-700">Status</th>
                            <th className="text-left p-4 font-medium text-neutral-700">Created</th>
                            <th className="text-center p-4 font-medium text-neutral-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-neutral-50">
                                <td className="p-4 font-medium">{user.name}</td>
                                <td className="p-4 text-sm text-neutral-600">{user.email}</td>
                                <td className="p-4">
                                    <Badge variant={getRoleBadgeColor(user.role)}>
                                        {user.role.replace('_', ' ')}
                                    </Badge>
                                </td>
                                <td className="p-4 text-sm">
                                    {user.branchName || <span className="text-neutral-400">N/A</span>}
                                </td>
                                <td className="p-4 text-center">
                                    <Badge variant={user.isActive ? 'secondary' : 'outline'}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </td>
                                <td className="p-4 text-sm text-neutral-600">
                                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                                </td>
                                <td className="p-4 text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={loading === user.id}
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setEditingUser(user)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                                                <RotateCcw className="h-4 w-4 mr-2" />
                                                Reset Password
                                            </DropdownMenuItem>
                                            {user.isActive && (
                                                <DropdownMenuItem
                                                    onClick={() => handleDeactivate(user)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Deactivate
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    open={!!editingUser}
                    onClose={() => setEditingUser(null)}
                    onUserUpdated={() => {
                        setEditingUser(null);
                        onUserUpdated();
                    }}
                />
            )}
        </>
    );
};
