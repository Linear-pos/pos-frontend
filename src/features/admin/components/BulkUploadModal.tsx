import { useState, useRef } from 'react';
import { Upload, FileText, Check, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { productsAPI } from '../api/products.api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

type UploadStep = 'upload' | 'preview' | 'results';

interface PreviewProduct {
  name: string;
  sku: string;
  price: number;
  stockQuantity?: number;
  isActive: boolean;
  _rowNumber: number;
}

interface UploadResult {
  created: number;
  updated: number;
  total: number;
  errors: { sku: string; error: string }[];
  processingErrors: string[];
}

// CORRECTED: Changed from isOpen to open to match ProductCatalog usage
interface BulkUploadModalProps {
  open: boolean;  // Changed from isOpen to open
  onClose: () => void;
  onUploadComplete: () => void;
}

export const BulkUploadModal = ({ open, onClose, onUploadComplete }: BulkUploadModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<UploadStep>('upload');
  const [previewData, setPreviewData] = useState<PreviewProduct[]>([]);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const parseFileForPreview = async (file: File): Promise<PreviewProduct[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const extension = file.name.split('.').pop()?.toLowerCase();

          if (extension === 'json') {
            const data = JSON.parse(content);
            const products = Array.isArray(data) ? data : [data];
            const previewProducts = products.slice(0, 10).map((item: any, index: number) => ({
              name: item.name || item.product_name || 'N/A',
              sku: item.sku || item.id || `MISSING-${index + 1}`,
              price: Number(item.price) || 0,
              stockQuantity: item.stockQuantity !== undefined ? Number(item.stockQuantity) :
                item.stock_quantity !== undefined ? Number(item.stock_quantity) : undefined,
              isActive: item.isActive !== false,
              _rowNumber: index + 1
            }));
            resolve(previewProducts);
          } else {
            // CSV parsing with better handling
            const lines = content.split('\n').filter(line => line.trim().length > 0);
            if (lines.length === 0) {
              reject(new Error('File is empty'));
              return;
            }

            const headers = lines[0].split(',').map((h: string) =>
              h.trim().toLowerCase().replace(/"/g, '')
            );

            const data = lines.slice(1, 11).map((line, index) => {
              // Handle quoted values and commas within quotes
              const values: string[] = [];
              let currentValue = '';
              let inQuotes = false;

              for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                  inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                  values.push(currentValue.trim().replace(/^"|"$/g, ''));
                  currentValue = '';
                } else {
                  currentValue += char;
                }
              }
              values.push(currentValue.trim().replace(/^"|"$/g, ''));

              const row: Record<string, any> = { _rowNumber: index + 1 };
              headers.forEach((header, i) => {
                row[header] = values[i] || '';
              });
              return row;
            });

            const previewProducts = data.map((item: any) => ({
              name: item.name || item.product_name || 'N/A',
              sku: item.sku || item.id || `MISSING-${item._rowNumber}`,
              price: Number(item.price) || 0,
              stockQuantity: item.stockquantity !== undefined ? Number(item.stockquantity) :
                item.stock_quantity !== undefined ? Number(item.stock_quantity) :
                  item.stock !== undefined ? Number(item.stock) : undefined,
              isActive: item.isactive === undefined ? true :
                String(item.isactive).toLowerCase() === 'true' ||
                item.isactive === '1' ||
                item.isactive === 'yes',
              _rowNumber: item._rowNumber
            }));

            resolve(previewProducts);
          }
        } catch (error) {
          console.error('Preview parse error:', error);
          reject(new Error('Failed to parse file. Please check the file format.'));
        }
      };

      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
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
      const maxSize = 10 * 1024 * 1024;
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
      } catch (err: any) {
        console.error('Preview error:', err);
        setError(err.message || 'Failed to process file for preview');
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
    setUploadProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const response = await productsAPI.bulkUpload(file);
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        const result: UploadResult = {
          created: response.data.created || 0,
          updated: response.data.updated || 0,
          total: response.data.total || 0,
          errors: response.data.errors || [],
          processingErrors: response.data.processingErrors || []
        };

        setUploadResult(result);
        setStep('results');

        // Show toast notification
        if (result.errors.length === 0 && result.processingErrors.length === 0) {
          toast.success('Success', {
            description: `Successfully imported ${result.total} products`,
            id: 'bulk-upload-success',
          });
        } else {
          toast.warning('Partial Success', {
            description: `Imported ${result.created + result.updated} of ${result.total} products. ${result.errors.length + result.processingErrors.length} had errors.`,
            id: 'bulk-upload-partial',
          });
        }

        // If there were successful imports, trigger refresh
        if (result.created > 0 || result.updated > 0) {
          // Call onUploadComplete after a short delay to show results
          setTimeout(() => {
            onUploadComplete();
          }, 2000);
        }
      } else {
        throw new Error(response.message || 'Failed to upload products');
      }
    } catch (err: unknown) {
      clearInterval(progressInterval);
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
      toast.error('Error', {
        description: errorMessage,
        id: 'bulk-upload-error',
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
    setUploadResult(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleCancelPreview = () => {
    setStep('upload');
    setPreviewData([]);
    setUploadResult(null);
  };

  const handleRetry = () => {
    setStep('upload');
    setUploadResult(null);
    setPreviewData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {step === 'upload' && 'Bulk Upload Products'}
              {step === 'preview' && 'Review Products'}
              {step === 'results' && 'Upload Results'}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Upload a CSV or JSON file to import multiple products at once'}
            {step === 'preview' && 'Review the products before importing'}
            {step === 'results' && 'Upload completed with results'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv, .json, text/csv, application/json"
                  className="hidden"
                />
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  CSV or JSON files (Max 10MB)
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                <h4 className="font-medium text-sm text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  File Format Requirements
                </h4>
                <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                  <li>• CSV or JSON format with UTF-8 encoding</li>
                  <li>• Required fields: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">sku</code>, <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">name</code>, <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">price</code></li>
                  <li>• Optional fields: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">stockQuantity</code>, <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">isActive</code>, <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">category</code>, <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">description</code></li>
                  <li>• First row should contain headers</li>
                </ul>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle className="text-amber-800 dark:text-amber-300">Preview</AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-400">
                  Showing first {previewData.length} rows. Please review before uploading.
                </AlertDescription>
              </Alert>

              <div className="rounded-md border overflow-hidden">
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-800">
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
                </ScrollArea>
              </div>
            </div>
          )}

          {step === 'results' && uploadResult && (
            <div className="space-y-4">
              <Alert className={uploadResult.errors.length + uploadResult.processingErrors.length === 0 ?
                "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" :
                "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
              }>
                {uploadResult.errors.length + uploadResult.processingErrors.length === 0 ? (
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                )}
                <AlertTitle className={
                  uploadResult.errors.length + uploadResult.processingErrors.length === 0 ?
                    "text-green-800 dark:text-green-300" : "text-amber-800 dark:text-amber-300"
                }>
                  {uploadResult.errors.length + uploadResult.processingErrors.length === 0 ?
                    'Upload Complete' : 'Partial Success'}
                </AlertTitle>
                <AlertDescription className={
                  uploadResult.errors.length + uploadResult.processingErrors.length === 0 ?
                    "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"
                }>
                  Processed {uploadResult.total} products successfully.
                  {uploadResult.errors.length + uploadResult.processingErrors.length > 0 &&
                    ` ${uploadResult.errors.length + uploadResult.processingErrors.length} had errors.`}
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {uploadResult.created}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Created</div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {uploadResult.updated}
                  </div>
                  <div className="text-sm text-amber-700 dark:text-amber-300">Updated</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {uploadResult.errors.length + uploadResult.processingErrors.length}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">Errors</div>
                </div>
              </div>

              {(uploadResult.errors.length > 0 || uploadResult.processingErrors.length > 0) && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                    Errors ({uploadResult.errors.length + uploadResult.processingErrors.length})
                  </h4>
                  <ScrollArea className="h-[200px] border rounded-md p-4">
                    {uploadResult.processingErrors.map((err, i) => (
                      <div key={`proc-${i}`} className="text-sm text-red-600 dark:text-red-400 mb-1">
                        • {err}
                      </div>
                    ))}
                    {uploadResult.errors.map((err, i) => (
                      <div key={`row-${i}`} className="text-sm text-red-600 dark:text-red-400 mb-1">
                        • <span className="font-mono text-xs bg-red-100 dark:bg-red-900 px-1 rounded mr-2">
                          {err.sku}
                        </span>
                        {err.error}
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {isLoading && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Upload className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
                <p className="text-sm font-medium mb-2">Uploading and processing...</p>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-gray-500 mt-2">{uploadProgress}% complete</p>
              </div>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <DialogFooter>
          {step === 'upload' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select File
              </Button>
            </>
          )}

          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={handleCancelPreview}>
                Back
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Check className="h-4 w-4 mr-2" />
                    Confirm Upload
                  </span>
                )}
              </Button>
            </>
          )}

          {step === 'results' && (
            <>
              <Button variant="outline" onClick={handleRetry}>
                Upload Another File
              </Button>
              <Button onClick={handleClose}>
                Done
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};