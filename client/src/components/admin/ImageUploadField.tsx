import { useId, useState } from 'react';
import { FaImage, FaTrash, FaUpload } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Skeleton } from '../ui/Skeleton';

type PreviewShape = 'wide' | 'square' | 'circle' | 'logo';

interface ImageUploadFieldProps {
  value?: string;
  onChange: (url: string) => void;
  label: string;
  description?: string;
  helperText?: string;
  uploadPath?: string;
  accept?: string;
  maxSizeMb?: number;
  previewShape?: PreviewShape;
  disabled?: boolean;
  buttonLabel?: string;
  removeLabel?: string;
  onUploadingChange?: (uploading: boolean) => void;
  layout?: 'responsive' | 'stacked';
}

const defaultHelper = 'JPG, PNG, WebP, GIF, SVG, or ICO. Maximum file size: 5MB.';

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }

  return fallback;
};

const previewClassByShape: Record<PreviewShape, string> = {
  wide: 'h-28 w-full rounded-lg',
  square: 'h-28 w-28 rounded-lg',
  circle: 'h-24 w-24 rounded-full',
  logo: 'h-24 w-32 rounded-lg',
};

export default function ImageUploadField({
  value = '',
  onChange,
  label,
  description = 'Upload an image to Cloudinary and save the hosted URL.',
  helperText = defaultHelper,
  uploadPath = '/upload/image',
  accept = 'image/*',
  maxSizeMb = 5,
  previewShape = 'wide',
  disabled = false,
  buttonLabel = 'Choose Image',
  removeLabel = 'Remove',
  onUploadingChange,
  layout = 'responsive',
}: ImageUploadFieldProps) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  const isDisabled = disabled || uploading;
  const previewClass = previewClassByShape[previewShape];
  const isStacked = layout === 'stacked';

  const setUploadState = (next: boolean) => {
    setUploading(next);
    onUploadingChange?.(next);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file');
      e.target.value = '';
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`Image must be ${maxSizeMb}MB or smaller`);
      e.target.value = '';
      return;
    }

    const previousValue = value;
    const previewUrl = URL.createObjectURL(file);
    const formData = new FormData();
    formData.append('file', file);

    setUploadState(true);
    setFileName(file.name);
    onChange(previewUrl);

    try {
      const response = await api.post(uploadPath, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(response.data.url);
      toast.success('Image uploaded');
    } catch (error) {
      onChange(previousValue);
      setFileName('');
      toast.error(getApiErrorMessage(error, 'Failed to upload image'));
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploadState(false);
      e.target.value = '';
    }
  };

  const handleRemove = () => {
    onChange('');
    setFileName('');
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-navy-800 mb-2">{label}</label>
      <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-4">
        <div
          className={
            isStacked
              ? 'flex flex-col items-center gap-4 text-center'
              : 'flex flex-col gap-5 lg:flex-row'
          }
        >
          <div
            className={`${previewClass} relative shrink-0 overflow-hidden border-2 border-white bg-white shadow-sm ring-1 ring-gray-200`}
          >
            {value ? (
              <img
                src={value}
                alt={`${label} preview`}
                className="h-full w-full object-cover"
                onError={(event) => {
                  (event.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-navy-800 text-white">
                <FaImage className="text-3xl" />
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-navy-950/70 p-3">
                <Skeleton tone="dark" className="h-full w-full" />
              </div>
            )}
          </div>

          <div className={`${isStacked ? 'w-full' : 'min-w-0 flex-1'}`}>
            {description && (
              <p className={`${isStacked ? 'mx-auto max-w-2xl text-center' : ''} text-sm leading-6 text-gray-600`}>
                {description}
              </p>
            )}
            <div
              className={
                isStacked
                  ? 'mt-4 flex w-full flex-wrap items-center justify-center gap-2'
                  : 'mt-4 flex flex-wrap items-center gap-3'
              }
            >
              <label
                htmlFor={inputId}
                className={`inline-flex max-w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  isStacked ? 'min-w-52' : ''
                } ${
                  isDisabled
                    ? 'bg-gray-200 text-gray-500'
                    : 'bg-gold-400 text-navy-950 hover:bg-gold-500'
                }`}
              >
                {uploading ? (
                  <Skeleton tone="gold" className="h-5 w-28" />
                ) : (
                  <>
                    <FaUpload />
                    {buttonLabel}
                  </>
                )}
              </label>
              <input
                id={inputId}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                disabled={isDisabled}
                className="sr-only"
              />
              {value && (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isDisabled}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-all hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaTrash />
                  {removeLabel}
                </button>
              )}
            </div>
            {helperText && (
              <p className={`${isStacked ? 'mx-auto max-w-2xl text-center' : ''} mt-3 text-xs leading-5 text-gray-400`}>
                {helperText}
              </p>
            )}
            {fileName && <p className="mt-2 truncate text-xs font-medium text-navy-700">Selected: {fileName}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
