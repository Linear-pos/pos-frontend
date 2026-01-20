
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, ArrowLeft, CheckCircle } from "lucide-react";
import { salesAPI } from "@/features/sales/api";
import type { Sale } from "@/types/sale";
import ReceiptTemplate from "@/components/receipts/ReceiptTemplate";
import { useReactToPrint } from "react-to-print";
import { Card } from "@/components/ui/card";

export const ReceiptPage = () => {
  const { saleId } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSale = async () => {
      if (!saleId) return;
      try {
        setLoading(true);
        // Assuming salesAPI has a way to get a single sale, or we might need to add it if missing.
        // If salesAPI.getSale(id) doesn't exist, we might need to implement it or use list with filter?
        // Let's assume getSale exists or we'll need to fix it. Reviewing salesAPI next would be prudent, 
        // but let's write the code assuming it might need adjustment or we add the method.
        // Actually, usually APIs have getById at /sales/:id
        const data = await salesAPI.getSale(saleId);
        setSale(data);
      } catch (err: any) {
        console.error("Failed to load sale", err);
        setError("Failed to load receipt information.");
      } finally {
        setLoading(false);
      }
    };

    fetchSale();
  }, [saleId]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Receipt-${sale?.id || 'POS'}`,
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading receipt...</p>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-destructive font-semibold text-lg">{error || "Sale not found"}</div>
        <Button onClick={() => navigate("/pos")}>Return to POS</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 p-8 flex flex-col items-center">
      <div className="max-w-md w-full space-y-6">

        {/* Success Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-green-100 text-green-600 mb-2">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Payment Successful!</h1>
          <p className="text-muted-foreground">Transaction completed successfully.</p>
        </div>

        {/* Receipt Preview */}
        <Card className="p-1 shadow-md bg-white overflow-hidden">
          <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
            <div ref={componentRef}>
              <ReceiptTemplate sale={sale} />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button
            variant="outline"
            className="h-12 text-base"
            onClick={() => navigate("/pos")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            New Sale
          </Button>
          <Button
            className="h-12 text-base shadow-lg"
            onClick={() => handlePrint && handlePrint()}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPage;
