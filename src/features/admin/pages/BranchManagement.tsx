import { useState, useEffect } from 'react';
import { Search, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { branchesAPI, type Branch, type BranchesQueryParams } from '../api/branches.api';
import { BranchTable } from '../components/BranchTable';
import { CreateBranchModal } from '../components/CreateBranchModal';

export const BranchManagement = () => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const fetchBranches = async () => {
        setLoading(true);
        setError(null);

        try {
            const params: BranchesQueryParams = {
                page: currentPage,
                limit: 20,
            };

            if (searchQuery) {
                params.search = searchQuery;
            }

            const response = await branchesAPI.getBranches(params);
            setBranches(response.data);
            setTotalPages(response.pagination.pages);
            setTotalCount(response.pagination.total);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch branches');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, [currentPage]);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchBranches();
    };

    const handleBranchCreated = () => {
        setShowCreateModal(false);
        fetchBranches();
    };

    const handleBranchUpdated = () => {
        fetchBranches();
    };

    const totalRevenue = branches.reduce((sum, b) => sum + (b.stats?.totalRevenue || 0), 0);
    const totalSales = branches.reduce((sum, b) => sum + (b.stats?.salesCount || 0), 0);
    const totalUsers = branches.reduce((sum, b) => sum + (b.stats?.userCount || 0), 0);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-primary">Branch Management</h1>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Building2 className="h-4 w-4 mr-2" />
                    Create Branch
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Branches
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{totalCount}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-success-600">
                            KES {totalRevenue.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Sales
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-info-600">
                            {totalSales.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-warning-600">
                            {totalUsers}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                                placeholder="Search branches by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-10"
                            />
                        </div>
                        <Button onClick={handleSearch} variant="outline">
                            Search
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Branches Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-error-600">{error}</p>
                            <Button onClick={fetchBranches} className="mt-4">
                                Try Again
                            </Button>
                        </div>
                    ) : branches.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-neutral-500">No branches found</p>
                        </div>
                    ) : (
                        <BranchTable branches={branches} onBranchUpdated={handleBranchUpdated} />
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

            {/* Create Branch Modal */}
            <CreateBranchModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onBranchCreated={handleBranchCreated}
            />
        </div>
    );
};

export default BranchManagement;
