import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
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
  uploadPreset = 'pos_products',
  folder,
}: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | undefined>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadImage, uploading, progress, error } = useCloudinaryUpload({
    cloudName,
    uploadPreset,
    folder,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
          className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-1">Click to upload image</p>
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
