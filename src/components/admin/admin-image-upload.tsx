import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, Link as LinkIcon } from 'lucide-react';

export interface AdminImageUploadProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  aspectRatioHint?: string;
  className?: string;
}

function compressImageFile(file: File, maxWidth = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function AdminImageUpload({
  label = 'Photo / Image',
  value,
  onChange,
  placeholder = 'https://images.unsplash.com/... or direct image link',
  aspectRatioHint = 'Supports PNG, JPG, JPEG, WebP up to 10 MB',
  className = '',
}: AdminImageUploadProps) {
  const [mode, setMode] = useState<'upload' | 'url'>(() =>
    value && value.startsWith('http') ? 'url' : 'upload'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image file must be under 10 MB');
      return;
    }

    try {
      const optimized = await compressImageFile(file);
      onChange(optimized);
      toast.success('Image loaded successfully');
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) {
          onChange(result);
          toast.success('Image loaded successfully');
        }
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className={`space-y-2 border-t pt-3 mt-1 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold text-gray-700">{label}</Label>
        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[11px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
              mode === 'upload'
                ? 'bg-white shadow-xs text-orange-600 font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Upload size={12} /> Upload from Computer
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
              mode === 'url'
                ? 'bg-white shadow-xs text-orange-600 font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <LinkIcon size={12} /> Image URL
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div className="space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 hover:border-orange-400 bg-gray-50/70 hover:bg-orange-50/30 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700">Click to browse or upload image from your device</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{aspectRatioHint}</p>
            </div>
          </div>
        </div>
      ) : (
        <Input
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="text-xs"
        />
      )}

      {/* Selected / Uploaded Image Preview */}
      {value && (
        <div className="relative flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-200 mt-2">
          <img
            src={value}
            alt="Preview"
            className="w-16 h-14 rounded-lg object-cover border border-gray-200 shadow-xs bg-white shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800">Image Ready</p>
            <p className="text-[11px] text-gray-500 truncate mt-0.5">
              {value.startsWith('data:') ? 'Uploaded file from device (Local)' : value}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {mode === 'upload' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-7 text-xs px-2.5"
              >
                Change
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange('')}
              className="h-7 text-xs px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
