import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ReactNode } from 'react';

export interface DataTableColumn<T> {
    key: string;
    title: string;
    render: (item: T) => ReactNode;
}

export interface DataTablePagination {
    page: number;
    pages: number;
    total: number;
}

interface DataTableProps<T> {
    // Data
    data?: T[];
    columns: DataTableColumn<T>[];

    // State
    isLoading: boolean;
    error: Error | null;

    // Pagination
    pagination?: DataTablePagination;
    onPageChange?: (page: number) => void;

    // Search
    search?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;

    // Filters
    filters?: ReactNode;

    // Actions
    headerActions?: ReactNode;
    rowActions?: (item: T) => ReactNode;

    // Empty state
    emptyMessage?: string;

    // ID accessor
    getItemId?: (item: T, index: number) => string;
}

export function DataTable<T>({
    data,
    columns,
    isLoading,
    error,
    pagination,
    onPageChange,
    search,
    onSearchChange,
    searchPlaceholder = 'Search...',
    filters,
    headerActions,
    rowActions,
    emptyMessage = 'No items found',
    getItemId = (_item: T, index: number) => index.toString(),
}: DataTableProps<T>) {
    return (
        <div className="space-y-4">
            {/* Header with search and filters */}
            <div className="flex gap-4">
                {onSearchChange && (
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                )}
                {filters}
                {headerActions}
            </div>

            {/* Error state */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Failed to load data. Please try again.</AlertDescription>
                </Alert>
            )}

            {/* Loading state */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}

            {/* Table */}
            {!isLoading && data && (
                <>
                    <div className="bg-card rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columns.map((col) => (
                                        <TableHead key={col.key}>{col.title}</TableHead>
                                    ))}
                                    {rowActions && <TableHead className="text-right">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length + (rowActions ? 1 : 0)}
                                            className="text-center py-12 text-muted-foreground"
                                        >
                                            {emptyMessage}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.map((item, index) => (
                                        <TableRow key={getItemId(item, index)}>
                                            {columns.map((col) => (
                                                <TableCell key={col.key}>{col.render(item)}</TableCell>
                                            ))}
                                            {rowActions && (
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">{rowActions(item)}</div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Page {pagination.page} of {pagination.pages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => onPageChange?.(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => onPageChange?.(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
