import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { branchesAPI, type Branch, type BranchStats } from '../api/branches.api';
import { Building2, Users, ShoppingCart, DollarSign, Package, AlertTriangle } from 'lucide-react';

interface BranchDetailsModalProps {
    branch: Branch;
    open: boolean;
    onClose: () => void;
}

export const BranchDetailsModal = ({ branch, open, onClose }: BranchDetailsModalProps) => {
    const [stats, setStats] = useState<BranchStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open) {
            fetchStats();
        }
    }, [open, branch.id]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await branchesAPI.getBranchStats(branch.id);
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch branch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {branch.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Branch Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Branch Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            {branch.address && (
                                <div>
                                    <span className="font-medium">Address:</span> {branch.address}
                                </div>
                            )}
                            {branch.phone && (
                                <div>
                                    <span className="font-medium">Phone:</span> {branch.phone}
                                </div>
                            )}
                            {branch.email && (
                                <div>
                                    <span className="font-medium">Email:</span> {branch.email}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Statistics */}
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : stats && (
                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Active Users</p>
                                            <p className="text-2xl font-bold">{stats.activeUsers}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2">
                                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Total Sales</p>
                                            <p className="text-2xl font-bold">{stats.totalSales}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Revenue</p>
                                            <p className="text-xl font-bold">
                                                KES {stats.totalRevenue.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Products</p>
                                            <p className="text-2xl font-bold">{stats.totalProducts}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Inventory Value</p>
                                            <p className="text-xl font-bold">
                                                KES {stats.inventoryValue.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-warning-600" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Low Stock</p>
                                            <p className="text-2xl font-bold text-warning-600">
                                                {stats.lowStockItems}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button onClick={onClose}>Close</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
