import { useState } from 'react';
import { Edit, Trash2, MoreVertical, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import type { Branch } from '../api/branches.api';
import { branchesAPI } from '../api/branches.api';
import { EditBranchModal } from './EditBranchModal';
import { BranchDetailsModal } from './BranchDetailsModal';

interface BranchTableProps {
    branches: Branch[];
    onBranchUpdated: () => void;
}

export const BranchTable = ({ branches, onBranchUpdated }: BranchTableProps) => {
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [viewingBranch, setViewingBranch] = useState<Branch | null>(null);
    const [loading, setLoading] = useState<string | null>(null);

    const handleDeactivate = async (branch: Branch) => {
        if (!confirm(`Are you sure you want to deactivate ${branch.name}?`)) return;

        setLoading(branch.id);
        try {
            await branchesAPI.deactivateBranch(branch.id);
            onBranchUpdated();
        } catch (error) {
            console.error('Failed to deactivate branch:', error);
            alert('Failed to deactivate branch');
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
                            <th className="text-left p-4 font-medium text-neutral-700">Address</th>
                            <th className="text-left p-4 font-medium text-neutral-700">Contact</th>
                            <th className="text-right p-4 font-medium text-neutral-700">Users</th>
                            <th className="text-right p-4 font-medium text-neutral-700">Sales</th>
                            <th className="text-right p-4 font-medium text-neutral-700">Revenue</th>
                            <th className="text-center p-4 font-medium text-neutral-700">Status</th>
                            <th className="text-center p-4 font-medium text-neutral-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {branches.map((branch) => (
                            <tr key={branch.id} className="border-b hover:bg-neutral-50">
                                <td className="p-4 font-medium">{branch.name}</td>
                                <td className="p-4 text-sm text-neutral-600">
                                    {branch.address || <span className="text-neutral-400">N/A</span>}
                                </td>
                                <td className="p-4 text-sm">
                                    {branch.phone && <div>{branch.phone}</div>}
                                    {branch.email && <div className="text-neutral-500">{branch.email}</div>}
                                    {!branch.phone && !branch.email && <span className="text-neutral-400">N/A</span>}
                                </td>
                                <td className="p-4 text-right">{branch.stats?.userCount || 0}</td>
                                <td className="p-4 text-right">{branch.stats?.salesCount || 0}</td>
                                <td className="p-4 text-right font-medium">
                                    KES {(branch.stats?.totalRevenue || 0).toLocaleString()}
                                </td>
                                <td className="p-4 text-center">
                                    <Badge variant={branch.isActive ? 'secondary' : 'outline'}>
                                        {branch.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </td>
                                <td className="p-4 text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={loading === branch.id}
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setViewingBranch(branch)}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setEditingBranch(branch)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            {branch.isActive && (
                                                <DropdownMenuItem
                                                    onClick={() => handleDeactivate(branch)}
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

            {editingBranch && (
                <EditBranchModal
                    branch={editingBranch}
                    open={!!editingBranch}
                    onClose={() => setEditingBranch(null)}
                    onBranchUpdated={() => {
                        setEditingBranch(null);
                        onBranchUpdated();
                    }}
                />
            )}

            {viewingBranch && (
                <BranchDetailsModal
                    branch={viewingBranch}
                    open={!!viewingBranch}
                    onClose={() => setViewingBranch(null)}
                />
            )}
        </>
    );
};
