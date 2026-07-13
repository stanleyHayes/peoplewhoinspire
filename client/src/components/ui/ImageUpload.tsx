import { useRef, useState } from 'react';
import { FaCloudUploadAlt, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Skeleton, SkeletonText } from './Skeleton';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  /** Label shown on the empty dropzone. */
  hint?: string;
}

/**
 * Cover-image uploader. Posts the file to /api/upload (which stores it on
 * Cloudinary when configured) and returns the hosted URL via onChange.
 * Supports click-to-select and drag-and-drop, with a live thumbnail.
 */
export default function ImageUpload({ value, onChange, hint = 'PNG, JPG, WEBP up to 5MB' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.url as string);
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (value) {
    return (
      <div className="group relative overflow-hidden rounded-xl border-2 border-gray-200">
        <img src={value} alt="Cover preview" className="h-44 w-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-navy-950/0 opacity-0 transition-all group-hover:bg-navy-950/45 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg bg-white/90 px-3 py-2 text-sm font-semibold text-navy-900 hover:bg-white cursor-pointer"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={() => onChange('')}
            className="rounded-lg bg-red-500/90 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500 cursor-pointer"
          >
            <FaTrash />
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = '';
          }}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) upload(file);
      }}
      className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-10 text-center transition-colors cursor-pointer ${
        dragging ? 'border-[#d4a843] bg-[#d4a843]/5' : 'border-gray-300 hover:border-[#d4a843] hover:bg-gray-50'
      }`}
    >
      {uploading ? (
        <div className="w-full max-w-xs px-6">
          <Skeleton className="mx-auto mb-4 h-10 w-10 rounded-full" />
          <SkeletonText lines={2} />
        </div>
      ) : (
        <>
          <FaCloudUploadAlt className="text-3xl text-gray-400" />
          <span className="text-sm font-semibold text-navy-800">Click or drag an image to upload</span>
          <span className="text-xs text-gray-400">{hint}</span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = '';
        }}
      />
    </button>
  );
}
