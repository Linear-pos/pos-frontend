import type { InventoryLog } from "../api/inventory.api";

interface InventoryMovementsTableProps {
    logs: InventoryLog[];
    loading: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const InventoryMovementsTable = ({
    logs,
    loading,
    page,
    totalPages,
    onPageChange,
}: InventoryMovementsTableProps) => {
    if (loading && logs.length === 0) {
        return <div className="p-8 text-center text-muted-foreground">Loading history...</div>;
    }

    if (logs.length === 0) {
        return <div className="p-8 text-center text-muted-foreground">No inventory movements found.</div>;
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
                <thead className="bg-muted">
                    <tr>
                        <th className="px-4 py-3 text-left font-medium">Date</th>
                        <th className="px-4 py-3 text-left font-medium">Product</th>
                        <th className="px-4 py-3 text-left font-medium">Type</th>
                        <th className="px-4 py-3 text-right font-medium">Change</th>
                        <th className="px-4 py-3 text-right font-medium">New Stock</th>
                        <th className="px-4 py-3 text-left font-medium">Notes</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-muted/50">
                            <td className="px-4 py-3 text-sm">
                                {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">{log.productName}</td>
                            <td className="px-4 py-3 text-sm">
                                <span className={`inline-flex px-2 py-1 rounded text-xs font-medium capitalize
                  ${log.type === 'restock' ? 'bg-green-100 text-green-800' :
                                        log.type === 'sale' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'}`}>
                                    {log.type}
                                </span>
                            </td>
                            <td className={`px-4 py-3 text-sm text-right font-bold ${log.quantityChange > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {log.quantityChange > 0 ? '+' : ''}{log.quantityChange}
                            </td>
                            <td className="px-4 py-3 text-sm text-right">{log.newQuantity}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-[200px]">
                                {log.notes || '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {totalPages > 1 && (
                <div className="px-4 py-3 border-t flex justify-between items-center bg-gray-50">
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};
