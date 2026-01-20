import { useState } from 'react';
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
import { productsAPI } from '../api/products.api';
import { AlertCircle, CheckCircle, Upload} from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BulkUploadModalProps {
    open: boolean;
    onClose: () => void;
    onUploadComplete: () => void;
}

export const BulkUploadModal = ({ open, onClose, onUploadComplete }: BulkUploadModalProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{
        created: number;
        errors: { sku: string; error: string }[];
        processingErrors: string[];
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);
        setResult(null);

        try {
            const response = await productsAPI.bulkUpload(file);
            if (response.success) {
                setResult(response.data);
                if (response.data.created > 0 && response.data.errors.length === 0 && response.data.processingErrors.length === 0) {
                    // Auto close after success if perfect
                    setTimeout(() => {
                        onUploadComplete();
                    }, 2000); // Give user a moment to see success
                } else {
                    // Stay open to show partial results
                    // trigger refresh in background if partial success?
                    if (response.data.created > 0) {
                        // Notify parent to refresh but keep modal open
                        // We can't easily notify parent without closing, 
                        // unless we add another prop or just wait for close.
                    }
                }
            }
        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.response?.data?.message || 'Failed to upload file');
            if (err.response?.data?.details) {
                setResult({ created: 0, errors: [], processingErrors: err.response.data.details });
            }
        } finally {
            setUploading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setResult(null);
        setError(null);
        setUploading(false);
    };

    const handleClose = () => {
        if (result && result.created > 0) {
            onUploadComplete();
        } else {
            onClose();
        }
        // Reset state after close animation
        setTimeout(reset, 300);
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Products</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to add multiple products at once.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {!result && (
                        <div className="grid gap-2">
                            <Label>CSV File</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                Supported columns: name, sku, price, category, cost, stock_quantity, unit, unit_size
                            </p>
                            <div className="text-xs bg-slate-100 p-2 rounded text-slate-600 font-mono">
                                name,sku,price,category,stock_quantity,unit<br />
                                "Milk 500ml",MILK001,65,Dairy,100,pieces
                            </div>
                        </div>
                    )}

                    {uploading && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Upload className="h-8 w-8 animate-bounce text-primary mb-4" />
                            <p className="text-sm text-muted-foreground">Uploading and processing...</p>
                        </div>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {result && (
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <Alert className="bg-green-50 border-green-200">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertTitle className="text-green-800">Success</AlertTitle>
                                    <AlertDescription className="text-green-700">
                                        Successfully created {result.created} products.
                                    </AlertDescription>
                                </Alert>
                            </div>

                            {(result.errors.length > 0 || result.processingErrors.length > 0) && (
                                <div className="border rounded-md p-4">
                                    <h4 className="font-medium text-destructive mb-2 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Failures ({result.errors.length + result.processingErrors.length})
                                    </h4>
                                    <ScrollArea className="h-[200px]">
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                            {result.processingErrors.map((err, i) => (
                                                <li key={`proc-${i}`} className="text-red-500">{err}</li>
                                            ))}
                                            {result.errors.map((err, i) => (
                                                <li key={`row-${i}`}>
                                                    <span className="font-mono text-xs bg-slate-100 px-1 rounded mr-2">{err.sku}</span>
                                                    {err.error}
                                                </li>
                                            ))}
                                        </ul>
                                    </ScrollArea>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={uploading}>
                        {result ? 'Close' : 'Cancel'}
                    </Button>
                    {!result && (
                        <Button onClick={handleUpload} disabled={!file || uploading}>
                            {uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
