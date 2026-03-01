import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Image as ImageIcon } from 'lucide-react';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  cloudName: string;
  uploadPreset?: string;
  folder?: string;
}

export const ImageUpload = ({
  value,
  onChange,
  label = 'Product Image',
  cloudName,
  uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'pos_products',
  folder,
}: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | undefined>(value);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadImage, uploading, progress, error } = useCloudinaryUpload({
    cloudName,
    uploadPreset,
    folder,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  });

  const processFile = async (file: File) => {
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    const result = await uploadImage(file);
    if (result) {
      onChange(result.secureUrl);
      setPreview(result.secureUrl);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    // 1. Handle File Drop
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
      return;
    }

    // 2. Handle URL Drop (from web)
    const items = e.dataTransfer.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'string' && items[i].type.match(/^text\/uri-list|text\/plain$/)) {
          // If it's a direct URL
          items[i].getAsString((url) => {
            if (url && (url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || url.startsWith('http'))) {
              // Basic check if it looks like an image or URL
              setPreview(url);
              onChange(url);
            }
          });
          return;
        } else if (items[i].kind === 'string' && items[i].type === 'text/html') {
          // If it's HTML (dragged <img> tag)
          items[i].getAsString((html) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const img = doc.querySelector('img');
            if (img && img.src) {
              setPreview(img.src);
              onChange(img.src);
            }
          });
          return;
        }
      }
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {preview ? (
        <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-muted">
          <img
            src={preview}
            alt="Product preview"
            className="w-full h-full object-contain"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white text-sm">Uploading... {progress}%</div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging
            ? 'border-primary bg-primary/10'
            : 'hover:border-primary'
            }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-1">
            {isDragging ? 'Drop image here' : 'Click or drop image here'}
          </p>
          <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</p>
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};
