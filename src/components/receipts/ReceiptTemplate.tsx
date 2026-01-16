import React from "react";
import type { Sale } from "@/types/sale";
import { format } from "date-fns";

interface ReceiptTemplateProps {
    sale: Sale;
}

export const ReceiptTemplate = React.forwardRef<HTMLDivElement, ReceiptTemplateProps>(
    ({ sale }, ref) => {
        return (
            <div ref={ref} className="bg-white text-black p-4 text-sm font-mono leading-tight max-w-[80mm] mx-auto print:max-w-none print:w-[80mm]">
                {/* Header */}
                <div className="text-center mb-4">
                    <h1 className="text-xl font-bold uppercase mb-1">POS System</h1>
                    <p className="text-xs">123 Business Road</p>
                    <p className="text-xs">Nairobi, Kenya</p>
                    <p className="text-xs">0700 000 000</p>
                </div>

                {/* Sale Info */}
                <div className="border-b border-dashed border-black pb-2 mb-2 text-xs">
                    <div className="flex justify-between">
                        <span>Receipt #:</span>
                        <span>{sale.id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{format(new Date(sale.created_at || new Date()), "dd/MM/yyyy HH:mm")}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Server:</span>
                        <span>{sale.user?.name || 'Cashier'}</span>
                    </div>
                </div>

                {/* Items */}
                <div className="mb-2">
                    <table className="w-full text-xs text-left">
                        <thead>
                            <tr className="border-b border-black">
                                <th className="pb-1">Item</th>
                                <th className="pb-1 text-right">Qty</th>
                                <th className="pb-1 text-right">Amt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.items?.map((item: any, idx: number) => (
                                <tr key={idx}>
                                    <td className="py-1 pr-2 truncate max-w-[120px]">
                                        {item.product?.name || item.product_name || "Item"}
                                    </td>
                                    <td className="py-1 text-right align-top">{item.quantity}</td>
                                    <td className="py-1 text-right align-top">
                                        {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="border-t border-dashed border-black pt-2 mb-4 text-xs">
                    <div className="flex justify-between font-bold text-sm mb-1">
                        <span>TOTAL</span>
                        <span>{Number(sale.total).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Cash</span>
                        <span>{sale.payment_method === 'cash' ? Number(sale.total).toFixed(2) : '0.00'}</span>
                    </div>
                    {/* Add Change/Tendered logic if we had it stored in Sale metadata */}
                </div>

                {/* Footer */}
                <div className="text-center text-xs mt-4 border-t border-black pt-2">
                    <p>Thank you for shopping!</p>
                    <p>Goods once sold are not returnable.</p>
                </div>
            </div>
        );
    }
);

export default ReceiptTemplate;
