<<<<<<< Updated upstream
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
=======
import { useState, useRef } from 'react';
import { Upload, FileText, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { productsAPI } from '../api/products.api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type UploadStep = 'upload' | 'preview';

interface PreviewProduct {
  name: string;
  sku: string;
  price: number;
  stockQuantity?: number;
  isActive: boolean;
  _rowNumber: number;
}

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkUploadModal = ({ isOpen, onClose, onSuccess }: BulkUploadModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<UploadStep>('upload');
  const [previewData, setPreviewData] = useState<PreviewProduct[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseFileForPreview = (file: File): Promise<PreviewProduct[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const extension = file.name.split('.').pop()?.toLowerCase();
          
          if (extension === 'json') {
            const data = JSON.parse(content);
            const products = Array.isArray(data) ? data : [data];
            resolve(products.slice(0, 10).map((item: any, index: number) => ({
              name: item.name || 'N/A',
              sku: item.sku || `MISSING-${index + 1}`,
              price: Number(item.price) || 0,
              stockQuantity: item.stockQuantity !== undefined ? Number(item.stockQuantity) : undefined,
              isActive: item.isActive !== false,
              _rowNumber: index + 1
            })));
          } else {
            // Simple CSV preview (first 10 rows)
            const lines = content.split('\n').filter(Boolean).slice(0, 11);
            const headers = lines[0]?.split(',').map((h: string) => h.trim().toLowerCase()) || [];
            const data = lines.slice(1).map((line, index) => {
              const values = line.split(',').map(v => v.trim());
              const row: Record<string, any> = { _rowNumber: index + 1 };
              headers.forEach((header, i) => {
                row[header] = values[i] || '';
              });
              return row;
            });
            
            resolve(data.map((item: any) => ({
              name: item.name || item.product_name || 'N/A',
              sku: item.sku || item.id || `MISSING-${item._rowNumber}`,
              price: Number(item.price) || 0,
              stockQuantity: item.stockQuantity !== undefined ? Number(item.stockQuantity) : undefined,
              isActive: item.isActive === undefined ? true : 
                       String(item.isActive).toLowerCase() === 'true',
              _rowNumber: item._rowNumber
            })));
          }
        } catch (error) {
          console.error('Preview parse error:', error);
          reject(new Error('Failed to parse file for preview'));
        }
      };
      
      reader.onerror = () => reject(new Error('Error reading file'));
      
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        reader.readAsText(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      const validTypes = ['text/csv', 'application/json', 'application/vnd.ms-excel'];
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      const isValidType = validTypes.includes(selectedFile.type) || 
                        ['.csv', '.json'].includes(`.${fileExt}`);
      
      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      const isValidSize = selectedFile.size <= maxSize;
      
      if (!isValidType) {
        setError('Please upload a valid CSV or JSON file');
        return;
      }
      
      if (!isValidSize) {
        setError('File size must be less than 10MB');
        return;
      }
      
      try {
        setFile(selectedFile);
        setError(null);
        const preview = await parseFileForPreview(selectedFile);
        setPreviewData(preview);
        setStep('preview');
      } catch (err) {
        console.error('Preview error:', err);
        setError('Failed to process file for preview');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await productsAPI.bulkUpload(file);
      
      if (response.success) {
        if (response.data.errors && response.data.errors.length > 0) {
          // Handle partial success with errors
          const errorMessages = response.data.errors
            .map((err: { sku: string; error: string }) => 
              `• SKU ${err.sku}: ${err.error}`
            )
            .join('\n');
          
          setError(`Some products couldn't be imported:\n${errorMessages}`);
          
          toast({
            id: 'bulk-upload-partial',
            title: 'Partial Success',
            description: `Imported ${response.data.created} of ${response.data.total} products. ${response.data.errors.length} had errors.`,
            variant: 'default',
          });
        } else {
          // Complete success case
          toast({
            id: 'bulk-upload-success',
            title: 'Success',
            description: `Successfully imported ${response.data.total} products`,
            variant: 'default',
          });
          onSuccess();
          handleClose();
        }
      } else {
        throw new Error(response.message || 'Failed to upload products');
      }
    } catch (err: unknown) {
      let errorMessage = 'Failed to upload products. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('Network Error')) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Request timed out. The file might be too large.';
        } else {
          errorMessage = err.message;
        }
      }
      
      console.error('Upload error details:', err);
      setError(errorMessage);
      toast({
        id: 'bulk-upload-error',
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    setStep('upload');
    setPreviewData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleCancelPreview = () => {
    setStep('upload');
    setPreviewData([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === 'upload' ? 'Bulk Upload Products' : 'Review Products'}
          </DialogTitle>
        </DialogHeader>
        
        {step === 'upload' ? (
          <div className="space-y-4 py-2 flex-1 overflow-auto">
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv, .json, text/csv, application/json"
                className="hidden"
              />
              <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600">
                {file ? file.name : 'Click or drag file to upload'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: .csv, .json (Max 10MB)
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-sm text-blue-800 mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                File Format Requirements
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• CSV or JSON format with UTF-8 encoding</li>
                <li>• Required fields: <code>sku</code>, <code>name</code>, <code>price</code></li>
                <li>• Optional fields: <code>stockQuantity</code>, <code>isActive</code> (defaults to true)</li>
                <li>• First row should contain headers</li>
              </ul>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md flex items-start">
                <AlertTriangle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                <span className="flex-1">{error}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <div className="text-sm text-gray-600 mb-4 p-2 bg-amber-50 rounded-md flex items-start">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>Previewing first {previewData.length} rows. Please review before uploading.</span>
            </div>
            
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((item) => (
                    <TableRow key={`${item.sku}-${item._rowNumber}`}>
                      <TableCell className="text-xs text-gray-500">{item._rowNumber}</TableCell>
                      <TableCell className="font-mono text-xs">
                        <div className="max-w-[120px] truncate" title={item.sku}>
                          {item.sku}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        <div className="truncate" title={item.name}>
                          {item.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.stockQuantity !== undefined ? item.stockQuantity : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={item.isActive ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {item.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        
        <div className="flex justify-between pt-4 border-t mt-4">
          <Button
            variant="outline"
            onClick={step === 'upload' ? handleClose : handleCancelPreview}
            disabled={isLoading}
          >
            {step === 'upload' ? 'Cancel' : 'Back'}
          </Button>
          
          {step === 'preview' && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleCancelPreview}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Check className="h-4 w-4 mr-2" />
                    Confirm Upload
                  </span>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
>>>>>>> Stashed changes
