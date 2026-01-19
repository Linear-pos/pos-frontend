import { useState, useCallback } from 'react';
import { axiosInstance } from '@/services/api';

interface CloudinaryUploadOptions {
  cloudName: string;
  uploadPreset?: string;
  folder?: string;
  maxFileSize?: number; // in bytes
  allowedFormats?: string[];
}

interface UploadResult {
  url: string;
  publicId: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
}

interface SignatureResponse {
  success: boolean;
  data: {
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
    folder: string;
  };
}

export const useCloudinaryUpload = (options: CloudinaryUploadOptions) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        // Validate file size
        if (options.maxFileSize && file.size > options.maxFileSize) {
          throw new Error(`File size exceeds ${options.maxFileSize / 1024 / 1024}MB limit`);
        }

        // Validate file format
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (options.allowedFormats && !options.allowedFormats.includes(fileExtension || '')) {
          throw new Error(`File format not allowed. Allowed: ${options.allowedFormats.join(', ')}`);
        }

        // 1. Get signature from backend
        const signatureResponse = await axiosInstance.get<SignatureResponse>('/cloudinary/signature');

        if (!signatureResponse.data.success) {
          throw new Error('Failed to get upload signature');
        }

        const { signature, timestamp, apiKey, folder } = signatureResponse.data.data;

        // 2. Prepare FormData for Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', folder);

        // 3. Upload to Cloudinary
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${options.cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Upload failed');
        }

        const data = await response.json();

        setProgress(100);
        setUploading(false);

        return {
          url: data.url,
          publicId: data.public_id,
          secureUrl: data.secure_url,
          format: data.format,
          width: data.width,
          height: data.height,
        };
      } catch (err: any) {
        console.error('Upload error:', err);
        setError(err.message || 'Upload failed');
        setUploading(false);
        return null;
      }
    },
    [options]
  );

  return {
    uploadImage,
    uploading,
    progress,
    error,
  };
};
