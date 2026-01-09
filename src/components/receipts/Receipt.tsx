import { useState } from "react";
import {
  Printer,
  Download,
  Share2,
  Receipt as ReceiptIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Sale } from "@/types/sale";
import { useAuthStore } from "@/stores/auth.store";
import { format } from "date-fns";

interface ReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export const Receipt = ({ isOpen, onClose, sale }: ReceiptProps) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const { user } = useAuthStore();

  if (!sale) return null;

  const handlePrint = () => {
    setIsPrinting(true);
    const printWindow = window.open("", "_blank");

    if (printWindow) {
      const receiptContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt #${sale.id}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              max-width: 300px;
              margin: 0 auto;
              padding: 20px;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 18px;
              font-weight: bold;
            }
            .header p {
              margin: 5px 0;
              font-size: 12px;
              color: #666;
            }
            .info {
              margin: 10px 0;
            }
            .info .item span:first-child {
              color: #666;
            }
            .info .item span:last-child {
              font-weight: 500;
            }
            .items {
              margin: 20px 0;
            }
            .item {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
              font-size: 12px;
            }
            .item-name {
              flex: 1;
              font-weight: 500;
            }
            .item-qty {
              width: 30px;
              text-align: center;
              color: #666;
            }
            .item-price {
              width: 50px;
              text-align: right;
              font-weight: 500;
            }
            .total {
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
              padding: 20px 0;
              margin: 20px 0;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            font-size: 12px;
          }
          .total-row span:first-child {
            color: #666;
          }
          .total-row span:last-child {
            font-weight: 500;
          }
          .total-row:last-child {
            font-size: 14px;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SALES RECEIPT</h1>
            <p>Point of Sale System</p>
            <p>Tel: +254 XXX XXX XXX</p>
          </div>
          
          <div class="info">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>KES ${sale.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>VAT(16%):</span>
              <span>KES ${sale.tax.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>TOTAL:</span>
              <span>KES ${sale.total.toFixed(2)}</span>
            </div>
            <div class="item">
              <span>Date:</span>
              <span>${format(
                new Date(sale.created_at),
                "dd/MM/yyyy HH:mm"
              )}</span>
            </div>
            <div class="item">
              <span>Cashier:</span>
              <span>${user?.name || "N/A"}</span>
            </div>
            <div class="item">
              <span>Payment:</span>
              <span>${sale.payment_method?.toUpperCase() || "N/A"}</span>
            </div>
            ${
              sale.reference
                ? `
            <div class="item">
              <span>Reference:</span>
              <span>${sale.reference}</span>
            </div>`
                : ""
            }
          </div>
          
          <div class="items">
            ${
              sale.items
                ?.map(
                  (item) => `
              <div class="item">
                <span class="item-name">${
                  item.product?.name || "Product"
                }</span>
                <span class="item-qty">${item.quantity}</span>
                <span class="item-price">${(item.price * item.quantity).toFixed(
                  2
                )}</span>
              </div>
            `
                )
                .join("") || ""
            }
          </div>
          
          <div class="total">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>KES ${sale.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>VAT (16%):</span>
              <span>KES ${sale.tax.toFixed(2)}</span>
            </div>
            <div class="total-row font-bold">
              <span>TOTAL:</span>
              <span>KES ${sale.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Please come again</p>
            <p>** Goods once sold are not returnable **</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(receiptContent);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        setIsPrinting(false);
      };
    } else {
      setIsPrinting(false);
    }
  };

  const handleDownloadPDF = () => {
    // For PDF download, we could use a library like jsPDF
    // For now, we'll trigger print which allows "Save as PDF"
    handlePrint();
  };

  const handleShare = async () => {
    const receiptText = `
RECEIPT #${sale.id}
Date: ${format(new Date(sale.created_at), "dd/MM/yyyy HH:mm")}
Payment: ${sale.payment_method?.toUpperCase()}

${sale.items
  ?.map(
    (item) =>
      `${item.product?.name} (${item.quantity}x) = KES ${(
        item.price * item.quantity
      ).toFixed(2)}`
  )
  .join("\n")}

Subtotal: KES ${sale.subtotal.toFixed(2)}
Tax: KES ${sale.tax.toFixed(2)}
TOTAL: KES ${sale.total.toFixed(2)}

Thank you for your business!
    `;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt #${sale.id}`,
          text: receiptText,
        });
      } catch {
        console.log("Share cancelled or failed");
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(receiptText).then(() => {
        alert("Receipt copied to clipboard");
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ReceiptIcon className="h-5 w-5" />
            Receipt #{sale.id}
          </DialogTitle>
        </DialogHeader>

        <div className="bg-white border rounded p-4 font-mono text-sm text-black">
          {/* Receipt Header */}
          <div className="text-center mb-4">
            <div className="font-bold text-base">SALES RECEIPT</div>
            <div className="text-sm text-foreground/80">
              Point of Sale System
            </div>
            <div className="text-sm text-foreground/80">
              Tel: +254 XXX XXX XXX
            </div>
          </div>

          {/* Receipt Info */}
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Receipt #:</span>
              <span className="font-medium">{sale.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">
                {format(new Date(sale.created_at), "dd/MM/yyyy HH:mm")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cashier:</span>
              <span className="font-medium">{user?.name || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment:</span>
              <span className="font-medium">
                {sale.payment_method?.toUpperCase() || "N/A"}
              </span>
            </div>
            {sale.reference && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference:</span>
                <span className="font-medium">{sale.reference}</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="border-t border-b border-dashed py-3 mb-3">
            {sale.items?.map((item, index) => (
              <div key={index} className="flex justify-between text-sm mb-2">
                <span className="flex-1 font-medium">
                  {item.product?.name || "Product"}
                </span>
                <span className="w-8 text-center text-muted-foreground">
                  {item.quantity}
                </span>
                <span className="w-16 text-right font-medium">
                  KES {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">
                KES {sale.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VAT (16%):</span>
              <span className="font-medium">KES {sale.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>TOTAL:</span>
              <span>KES {sale.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <div>Thank you for shopping with us!</div>
            <div className="italic mt-1">
              ** Goods once sold are not returnable **
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handlePrint}
            disabled={isPrinting}
          >
            {isPrinting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2" />
                Printing...
              </>
            ) : (
              <>
                <Printer className="h-3 w-3 mr-2" />
                Print
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleDownloadPDF}
          >
            <Download className="h-3 w-3 mr-2" />
            PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleShare}
          >
            <Share2 className="h-3 w-3 mr-2" />
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Receipt;
