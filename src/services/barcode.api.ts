import { axiosInstance } from './api';
import type { 
  ProductBarcode, 
  BarcodeTypesResponse, 
  BarcodeLookupResponse, 
  CreateBarcodePayload,
  UpdateBarcodePayload,
  ProductResponse 
} from '../types/product';

export const barcodeApi = {
  /**
   * Find product by barcode
   */
  async findByBarcode(barcode: string): Promise<BarcodeLookupResponse> {
    const response = await axiosInstance.get(`/products/barcode/${encodeURIComponent(barcode)}`);
    return response.data;
  },

  /**
   * Get supported barcode types
   */
  async getBarcodeTypes(): Promise<BarcodeTypesResponse> {
    const response = await axiosInstance.get('/barcodes/types');
    return response.data;
  },

  /**
   * Get barcodes for a product
   */
  async getProductBarcodes(productId: string): Promise<{ data: ProductBarcode[]; message: string }> {
    const response = await axiosInstance.get(`/products/${productId}/barcodes`);
    return response.data;
  },

  /**
   * Add barcode to product
   */
  async addBarcode(productId: string, payload: CreateBarcodePayload): Promise<{ data: ProductBarcode; message: string }> {
    const response = await axiosInstance.post(`/products/${productId}/barcodes`, payload);
    return response.data;
  },

  /**
   * Update barcode
   */
  async updateBarcode(barcodeId: string, payload: UpdateBarcodePayload): Promise<{ data: ProductBarcode; message: string }> {
    const response = await axiosInstance.put(`/barcodes/${barcodeId}`, payload);
    return response.data;
  },

  /**
   * Remove barcode
   */
  async removeBarcode(barcodeId: string): Promise<{ data: ProductBarcode; message: string }> {
    const response = await axiosInstance.delete(`/barcodes/${barcodeId}`);
    return response.data;
  },

  /**
   * Set barcode as primary
   */
  async setPrimaryBarcode(barcodeId: string): Promise<{ data: ProductBarcode; message: string }> {
    const response = await axiosInstance.post(`/barcodes/${barcodeId}/set-primary`);
    return response.data;
  },

  /**
   * Generate a new barcode of specific type (frontend utility)
   */
  generateBarcode(type: 'CODE128' | 'EAN13' | 'EAN8' | 'UPC' | 'CODE39' = 'CODE128'): string {
    // This is a simple frontend generator for UI purposes
    // Real barcode generation should use backend service for proper checksums
    switch (type) {
      case 'CODE128':
        return 'CODE' + Math.random().toString(36).substr(2, 9).toUpperCase();
      case 'EAN13':
        return Math.random().toString().substr(2, 13);
      case 'EAN8':
        return Math.random().toString().substr(2, 8);
      case 'UPC':
        return Math.random().toString().substr(2, 12);
      case 'CODE39':
        return Math.random().toString(36).substr(2, 8).toUpperCase();
      default:
        return this.generateBarcode('CODE128');
    }
  },

  /**
   * Validate barcode format (basic frontend validation)
   */
  validateBarcodeFormat(barcode: string, type: string): boolean {
    if (!barcode || barcode.trim().length === 0) return false;

    const cleanedBarcode = barcode.trim();

    switch (type) {
      case 'EAN13':
        return /^\d{13}$/.test(cleanedBarcode);
      case 'EAN8':
        return /^\d{8}$/.test(cleanedBarcode);
      case 'UPC':
        return /^\d{12}$/.test(cleanedBarcode);
      case 'UPCE':
        return /^\d{6}$/.test(cleanedBarcode);
      case 'ISBN':
        return /^(\d{10}|\d{13})$/.test(cleanedBarcode.replace(/[-\s]/g, ''));
      case 'ISSN':
        return /^\d{4}-\d{3}[\dX]$/.test(cleanedBarcode);
      case 'ITF14':
        return /^\d{14}$/.test(cleanedBarcode);
      case 'CODE128':
      case 'CODE39':
      case 'GS1_128':
        return cleanedBarcode.length >= 1 && cleanedBarcode.length <= 48;
      default:
        return false;
    }
  }
};

export default barcodeApi;