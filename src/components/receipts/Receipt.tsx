import { useRef } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Sale } from "@/types/sale";
import { Printer } from "lucide-react";
import ReceiptTemplate from "./ReceiptTemplate";
import { useReactToPrint } from "react-to-print";

interface ReceiptProps {
  open: boolean;
  onClose: () => void;
  sale: Sale | null;
}

const Receipt = ({ open, onClose, sale }: ReceiptProps) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Receipt-${sale?.id}`,
    onAfterPrint: () => console.log("Printed"),
    removeAfterPrint: true
  });

  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Transaction Completed</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto border rounded p-4 bg-gray-50 flex justify-center">
          {/* Render the Template for preview & printing */}
          <div ref={componentRef}>
            <ReceiptTemplate sale={sale} />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={() => handlePrint && handlePrint()}>
            <Printer className="w-4 h-4 mr-2" />
            Print Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Receipt;
