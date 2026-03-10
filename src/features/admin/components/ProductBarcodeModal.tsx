import { useEffect, useMemo, useState } from 'react';
import { Download, Printer, RefreshCw, Copy } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { productsAPI, type Product } from '../api/products.api';

function safeFilenamePart(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'product';
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

interface ProductBarcodeModalProps {
  open: boolean;
  product: Product | null;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
  onClose: () => void;
  onBarcodeUpdated?: () => void;
}

export const ProductBarcodeModal = ({
  open,
  product,
  products,
  onSelectProduct,
  onClose,
  onBarcodeUpdated
}: ProductBarcodeModalProps) => {
  const [working, setWorking] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState<string | null>(null);
  const [pngBlob, setPngBlob] = useState<Blob | null>(null);
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>('_none');

  const canAct = !!product?.id;
  const hasBarcode = !!barcodeValue;

  const downloadName = useMemo(() => {
    if (!product) return 'barcode.png';
    const base = safeFilenamePart(product.name);
    return `${base}-barcode.png`;
  }, [product]);

  const clearPreview = () => {
    if (pngUrl) URL.revokeObjectURL(pngUrl);
    setPngUrl(null);
    setPngBlob(null);
  };

  const loadPreview = async (productId: string) => {
    clearPreview();
    const blob = await productsAPI.downloadBarcodePng(productId);
    const url = URL.createObjectURL(blob);
    setPngBlob(blob);
    setPngUrl(url);
  };

  useEffect(() => {
    if (!open) return;

    setSelectedProductId(product?.id ?? '_none');
    setBarcodeValue(product?.barcode ?? null);
    clearPreview();

    if (product?.id && product.barcode) {
      loadPreview(product.id).catch(() => {
        // ignore preview failures; user can regenerate and try again
      });
    }

    return () => {
      clearPreview();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id]);

  const handleSelect = (id: string) => {
    setSelectedProductId(id);
    const next = products?.find(p => p.id === id);
    if (next && onSelectProduct) {
      onSelectProduct(next);
    }
  };

  const handleGenerate = async () => {
    if (!product?.id) return;

    setWorking(true);
    try {
      const updated = await productsAPI.generateBarcode(product.id);
      setBarcodeValue(updated.barcode ?? null);
      await loadPreview(product.id);
      toast.success('Barcode generated');
      onBarcodeUpdated?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to generate barcode');
    } finally {
      setWorking(false);
    }
  };

  const handleCopy = async () => {
    if (!barcodeValue) return;
    try {
      await navigator.clipboard.writeText(barcodeValue);
      toast.success('Barcode copied');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDownload = () => {
    if (!pngBlob) return;

    const url = URL.createObjectURL(pngBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrint = async () => {
    if (!pngBlob || !product) return;

    try {
      const dataUrl = await blobToDataUrl(pngBlob);
      const win = window.open('', '_blank', 'width=600,height=800');
      if (!win) {
        toast.error('Popup blocked. Allow popups to print.');
        return;
      }

      const title = `${product.name} Barcode`;
      win.document.open();
      win.document.write(`
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title.replace(/</g, '&lt;')}</title>
    <style>
      @page { margin: 6mm; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
      .wrap { display: grid; place-items: center; }
      img { max-width: 100%; height: auto; image-rendering: crisp-edges; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <img src="${dataUrl}" alt="barcode" />
    </div>
    <script>
      window.onload = () => {
        window.focus();
        window.print();
      };
    </script>
  </body>
</html>
      `);
      win.document.close();
    } catch {
      toast.error('Failed to print');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Product Barcode</DialogTitle>
          <DialogDescription>
            Generate a scannable barcode label, then download or print it.
          </DialogDescription>
        </DialogHeader>

        {!product ? (
          <div className="grid gap-3">
            <div className="text-sm text-muted-foreground">Select a product to generate and print its barcode.</div>
            <Select value={selectedProductId} onValueChange={handleSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Select product...</SelectItem>
                {(products || []).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Product</Label>
              <Input value={product.name} readOnly />
            </div>

            <div className="grid gap-2">
              <Label>Barcode</Label>
              <div className="flex gap-2">
                <Input value={barcodeValue ?? ''} readOnly placeholder="No barcode yet" />
                <Button variant="outline" onClick={handleCopy} disabled={!hasBarcode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Generating a new barcode changes what scanners should use for this product.
              </div>
            </div>

            <div className="rounded-md border bg-background p-4">
              {pngUrl ? (
                <div className="grid place-items-center gap-2">
                  <img src={pngUrl} alt="Barcode preview" className="max-h-[220px] w-auto" />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {hasBarcode ? 'Loading preview...' : 'Generate a barcode to preview the label.'}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex flex-wrap gap-2 sm:mr-auto">
            <Button
              onClick={handleGenerate}
              disabled={!canAct || working}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${working ? 'animate-spin' : ''}`} />
              {hasBarcode ? 'Generate New' : 'Generate Barcode'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleDownload}
              disabled={!pngBlob || working}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download PNG
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={!pngBlob || working}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
          <Button variant="outline" onClick={onClose} disabled={working}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
