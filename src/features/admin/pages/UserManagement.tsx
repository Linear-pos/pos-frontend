import { useState, useEffect } from 'react';
import { Search, Plus, Filter, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usersAPI, type User, type UsersQueryParams } from '../api/users.api';
import { UserTable } from '../components/UserTable';
import { CreateUserModal } from '../components/CreateUserModal';

export const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('active');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);

        try {
            const params: UsersQueryParams = {
                page: currentPage,
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
            setTotalPages(response.pagination.pages);
            setTotalCount(response.pagination.total);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage, roleFilter, statusFilter]);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchUsers();
    };

    const handleUserCreated = () => {
        setShowCreateModal(false);
        fetchUsers();
    };

    const handleUserUpdated = () => {
        fetchUsers();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-primary">User Management</h1>
                <Button onClick={() => setShowCreateModal(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create User
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{totalCount}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-success-600">
                            {users.filter(u => u.isActive).length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Managers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-info-600">
                            {users.filter(u => u.role === 'BRANCH_MANAGER').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-10"
                            />
                        </div>

                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger>
                                <Filter className="h-4 w-4 mr-2" />
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
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button onClick={handleSearch} variant="outline">
                            <Filter className="h-4 w-4 mr-2" />
                            Apply Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-error-600">{error}</p>
                            <Button onClick={fetchUsers} className="mt-4">
                                Try Again
                            </Button>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-neutral-500">No users found</p>
                        </div>
                    ) : (
                        <UserTable users={users} onUserUpdated={handleUserUpdated} />
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Create User Modal */}
            <CreateUserModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onUserCreated={handleUserCreated}
            />
        </div>
    );
};

export default UserManagement;
