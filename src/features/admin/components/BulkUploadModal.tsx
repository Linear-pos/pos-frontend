import { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  FileSpreadsheet,
  Image as ImageIcon,
  ExternalLink} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { axiosInstance as api } from '../../../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface BulkUploadProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
}

interface UploadResult {
  success: boolean;
  data: {
    total: number;
    created: number;
    errors?: Array<{
      sku: string;
      error: string;
      details?: string;
    }>;
    processingErrors?: string[];
  };
}

const csvTemplate = [
  {
    sku: 'PROD-001',
    name: 'Example Product',
    price: '999.00',
    category_id: 'CAT-123',
    description: 'Product description goes here',
    image_url: 'https://example.com/image.jpg',
    stock_quantity: '100'
  }
];

export const BulkUploadModal = ({ open, onClose, onUploadComplete }: BulkUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<{ url: string, sku: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setUploadResult(null);
    setValidationErrors([]);
    setImagePreview(null);
    
    await previewCSV(selectedFile);
  };

  const previewCSV = async (selectedFile: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length <= 1) { // Only header or empty
          setValidationErrors(['CSV file appears to be empty or only contains headers']);
          return;
        }

        // Parse CSV headers
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const data = lines.slice(1).map((line, index) => {
          // Handle quoted values with commas inside
          const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => {
            let val = v.trim();
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.slice(1, -1);
            }
            return val;
          });

          const row: any = {};

          headers.forEach((header, i) => {
            row[header] = values[i] || '';
          });

          return {
            ...row,
            _rowNumber: index + 2
          };
        }).filter(row => Object.values(row).some(val => val !== '')); // Remove empty rows

        const requiredColumns = ['sku', 'name', 'price'];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));

        if (missingColumns.length > 0) {
          setValidationErrors([`Missing required columns: ${missingColumns.join(', ')}`]);
          setPreviewData([]);
        } else {
          const errors: string[] = [];
          data.forEach((row) => {
            if (!row.sku?.trim()) {
              errors.push(`Row ${row._rowNumber}: SKU is required`);
            }
            if (!row.name?.trim()) {
              errors.push(`Row ${row._rowNumber}: Name is required`);
            }
            const price = Number(row.price);
            if (isNaN(price) || price <= 0) {
              errors.push(`Row ${row._rowNumber}: Price must be a valid number greater than 0`);
            }
            if (row.image_url && row.image_url.trim() !== '') {
              if (!isValidUrl(row.image_url)) {
                errors.push(`Row ${row._rowNumber}: Invalid image URL format`);
              }
            }
          });

          if (errors.length > 0) {
            setValidationErrors(errors.slice(0, 5));
            if (errors.length > 5) {
              setValidationErrors(prev => [...prev, `... and ${errors.length - 5} more errors`]);
            }
          } else {
            setPreviewData(data.slice(0, 5));
            setShowPreview(true);
          }
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast.error('Error parsing CSV file. Make sure it is properly formatted.');
      }
    };

    reader.readAsText(selectedFile, 'UTF-8');
  };

  const isValidUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const downloadTemplate = () => {
    const headers = Object.keys(csvTemplate[0]);
    const csvContent = [
      headers.join(','),
      ...csvTemplate.map(row =>
        headers.map(header => {
          const value = row[header as keyof typeof row];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-bulk-upload-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Template downloaded. Fill it with your product data.');
  };

  const previewImage = (url: string, sku: string) => {
    if (!url || url.trim() === '') {
      toast.error('No image URL provided');
      return;
    }

    if (!isValidUrl(url)) {
      toast.error('Invalid image URL format');
      return;
    }
    setImagePreview({ url, sku });
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    if (validationErrors.length > 0) {
      toast.error('Please fix validation errors before uploading');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/products/bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 100)
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      });

      setUploadResult(response.data);

      if (response.data.success) {
        const { created, errors, processingErrors } = response.data.data;

        toast.success(`Successfully processed ${created} products`, {
          duration: 5000,
        });

        if (errors?.length > 0) {
          toast.error(`${errors.length} products failed to process`, {
            duration: 6000,
          });
        }

        if (processingErrors?.length > 0) {
          toast.error(`${processingErrors.length} image processing errors occurred`, {
            duration: 6000,
          });
        }
        if (onUploadComplete) {
          onUploadComplete();
        }
      } else {
        toast.error('Upload failed. Please try again.');
      }
    } catch (error: unknown) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        'Upload failed. Please check your connection and try again.';
      let errorMessage = 'Upload failed. Please check your connection and try again.';
      
      if (error && typeof error === 'object') {
        const axiosError = error as {
          response?: {
            data?: {
              message?: string;
              error?: string;
            };
          };
        };
        
        errorMessage = 
          axiosError.response?.data?.message || 
          axiosError.response?.data?.error || 
          errorMessage;
      }
      
      toast.error(errorMessage, { duration: 6000 });
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadResult(null);
    setPreviewData([]);
    setShowPreview(false);
    setValidationErrors([]);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatNumber = (num: number) => {
    if (num === undefined || num === null) return 'N/A';
    const number = Number(num);
    return isNaN(number) ? num : number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  useEffect(() => {
    if (!open) {
      resetUpload();
    }
  }, [open]);

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-gray-900 dark:border-gray-800">
        <DialogHeader className="dark:text-gray-100">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 dark:text-gray-100">
              <Upload className="h-5 w-5" />
              Bulk Product Upload
            </DialogTitle>
          </div>
        </DialogHeader>        
        <div className="p-1">
          <div className="space-y-6">
            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Upload a CSV file to create multiple products at once. Images will be automatically downloaded from URLs and uploaded to Cloudinary.
              </p>
            </div>

            {/* Image Preview Modal */}
            {imagePreview && (
              <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Image Preview</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {imagePreview.sku}</p>
                    </div>
                    <button
                      onClick={() => setImagePreview(null)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg dark:text-gray-400"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-4 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <img
                      src={imagePreview.url}
                      alt={`Preview for ${imagePreview.sku}`}
                      className="max-w-full max-h-[60vh] object-contain rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                        toast.error('Failed to load image from URL');
                      }}
                    />
                  </div>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <a
                      href={imagePreview.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </a>
                    <button
                      onClick={() => setImagePreview(null)}
                      className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-100 rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Upload Section */}
              <div className="lg:col-span-2 space-y-6">
                {/* Upload Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Upload CSV File</h2>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={downloadTemplate}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Download Template
                      </button>
                      {file && (
                        <button
                          onClick={resetUpload}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                      file 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                    } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading}
                    />

                    {file ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          <FileText className="h-12 w-12 text-green-500 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-200">{file.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {(file.size / 1024).toFixed(2)} KB • {previewData.length} rows in preview
                          </p>
                        </div>
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              resetUpload();
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            disabled={isUploading}
                          >
                            <X className="h-4 w-4 inline mr-1" />
                            Remove File
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpload();
                            }}
                            disabled={isUploading || validationErrors.length > 0}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${validationErrors.length > 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 inline mr-2" />
                                Confirm Upload
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto" />
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-200">Click to upload or drag & drop</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">CSV file with product data</p>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Supports .csv files up to 10MB
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center text-red-600 dark:text-red-400 mb-2">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <span className="font-medium">Validation Errors</span>
                      </div>
                      <ul className="text-sm text-red-600 dark:text-red-300 space-y-1 max-h-40 overflow-y-auto">
                        {validationErrors.map((error, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                        Please fix these errors in your CSV file before uploading.
                      </p>
                    </div>
                  )}
                </div>

                {/* Preview Section */}
                {showPreview && previewData.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">CSV Preview (First 5 Rows)</h2>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {previewData.length} rows
                        </span>
                        <button
                          onClick={() => setShowPreview(!showPreview)}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          {showPreview ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Row
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              SKU
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Category
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Image
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {previewData.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {row._rowNumber}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-200">
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                                  {row.sku}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs">
                                <div className="truncate" title={row.name}>
                                  {row.name}
                                </div>
                                {row.description && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1" title={row.description}>
                                    {row.description}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-700 dark:text-gray-200">
                                KSh {formatNumber(row.price)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {row.category ? (
                                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-xs">
                                    {row.category}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 dark:text-gray-500 text-sm">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {row.image_url && row.image_url.trim() !== '' ? (
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => previewImage(row.image_url, row.sku)}
                                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50"
                                      title={row.image_url}
                                    >
                                      <ImageIcon className="h-3 w-3 mr-1" />
                                      Preview
                                    </button>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                                      {row.image_url.split('/').pop()}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 dark:text-gray-500 text-sm">No image</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Upload Result */}
                {uploadResult && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Upload Results</h2>
                      <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        uploadResult.data.created > 0 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}>
                        {uploadResult.data.created > 0 ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {uploadResult.data.created} Created
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 mr-1" />
                            No products created
                          </>
                        )}
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Rows</p>
                        <p className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
                          {uploadResult.data.total}
                        </p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">Successfully Created</p>
                        <p className="text-2xl font-semibold text-green-900 dark:text-green-200">
                          {uploadResult.data.created}
                        </p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">Failed</p>
                        <p className="text-2xl font-semibold text-red-900 dark:text-red-200">
                          {uploadResult.data.errors?.length || 0}
                        </p>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
                        <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Image Errors</p>
                        <p className="text-2xl font-semibold text-yellow-900 dark:text-yellow-200">
                          {uploadResult.data.processingErrors?.length || 0}
                        </p>
                      </div>
                    </div>

                    {/* How Images Are Processed */}
                    {uploadResult.data.created > 0 && (
                      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
                        <div className="flex items-center text-blue-700 dark:text-blue-300 mb-2">
                          <ImageIcon className="h-5 w-5 mr-2" />
                          <span className="font-medium">Image Processing Information</span>
                        </div>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          Product images were automatically downloaded from URLs and uploaded to Cloudinary.
                          Each image is now stored securely with optimized delivery.
                        </p>
                      </div>
                    )}

                    {/* Errors List */}
                    {uploadResult.data.errors && uploadResult.data.errors.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-3">Failed Products</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  SKU
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Error
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {uploadResult.data.errors.map((error: any, index: number) => (
                                <tr key={index} className="hover:bg-red-50 dark:hover:bg-red-900/20">
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-200">
                                    {error.sku}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400">
                                    <div>{error.error}</div>
                                    {error.details && (
                                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Details: {error.details.substring(0, 100)}...
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Image Processing Errors */}
                    {uploadResult.data.processingErrors && uploadResult.data.processingErrors.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-3">Image Processing Errors</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          These products were created without images. You can add images later in the product editor.
                        </p>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {uploadResult.data.processingErrors.map((error: string, index: number) => (
                            <div key={index} className="flex items-start text-sm text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
                              <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                              <span>{error}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Next Steps */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-3">Next Steps</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={resetUpload}
                          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Upload Another File
                        </button>
                        <button
                          onClick={() => {
                            onClose();
                            if (onUploadComplete) onUploadComplete();
                          }}
                          className="px-4 py-3 bg-blue-600 dark:bg-blue-700 text-white dark:text-gray-100 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium"
                        >
                          View Products List
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Instructions & Info */}
              <div className="space-y-6">
                {/* How It Works Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">How It Works</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">1</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Prepare CSV File</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Download template and fill with product data
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">2</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Upload & Validate</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Upload CSV file and check for validation errors
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">3</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Image Processing</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Images are downloaded from URLs and uploaded to Cloudinary
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">4</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Products Created</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Products are created with optimized images
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips Card */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Best Practices</h2>
                  
                  <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span>Test image URLs in browser before adding to CSV</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span>Keep image file sizes under 5MB for faster processing</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span>Use HTTPS URLs for secure image transfers</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span>Add image preview in CSV to verify before upload</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span>Start with small batches (10-20 products) to test</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};