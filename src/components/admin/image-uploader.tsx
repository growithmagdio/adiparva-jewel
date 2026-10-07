'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Upload,
  X,
  Trash2,
  RefreshCw,
  Star,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/primitives';
import {
  validateImageFile,
  resizeAndConvertToWebP,
  uploadImageToFirebaseStorage,
  deleteStorageFileByUrl,
} from '@/lib/utils/image-processor';

export interface PendingUpload {
  id: string;
  filename: string;
  progress: number;
  previewUrl: string;
  error?: string;
  storageUrl?: string;
}

export interface ImageUploaderProps {
  folder: 'categories' | 'products';
  entityId: string;
  maxImages?: number; // 1 for category, 8 for product
  images: string[];
  onChange: (newImages: string[]) => void;
  onUploadingStateChange?: (isUploading: boolean) => void;
  onNewTempUpload?: (storageUrl: string) => void;
  variantOptions?: { id: string; label: string }[];
  variantAssignments?: Record<string, string>; // imageUrl -> variantId
  onVariantAssignmentChange?: (assignments: Record<string, string>) => void;
  userRole?: string;
}

export function ImageUploader({
  folder,
  entityId,
  maxImages = 8,
  images,
  onChange,
  onUploadingStateChange,
  onNewTempUpload,
  variantOptions = [],
  variantAssignments = {},
  onVariantAssignmentChange,
  userRole = 'Chief Curator',
}: ImageUploaderProps) {
  const isSingleMode = maxImages === 1;
  const canUpload = ['Chief Curator', 'Curator', 'Registrar', 'admin', 'Admin'].includes(userRole);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [errorAlert, setErrorAlert] = React.useState<string | null>(null);
  const [pendingUploads, setPendingUploads] = React.useState<PendingUpload[]>([]);

  const isUploading = pendingUploads.some((p) => p.progress < 100 && !p.error);

  React.useEffect(() => {
    onUploadingStateChange?.(isUploading);
  }, [isUploading, onUploadingStateChange]);

  const processAndUploadFiles = async (filesList: FileList | File[]) => {
    if (!canUpload) {
      setErrorAlert('Forbidden: Your role does not have permission to upload media.');
      return;
    }

    setErrorAlert(null);
    const fileArray = Array.from(filesList);

    // Check max image limits
    if (images.length + fileArray.length > maxImages) {
      setErrorAlert(
        isSingleMode
          ? 'Category allows only 1 image. Use "Replace" to upload a new image.'
          : `You can upload up to ${maxImages} images. (${images.length} already uploaded).`
      );
      return;
    }

    for (const file of fileArray) {
      // Validate format and size (< 5MB)
      const val = validateImageFile(file);
      if (!val.valid) {
        setErrorAlert(val.error || 'Invalid file');
        continue;
      }

      const tempId = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const localPreviewUrl = URL.createObjectURL(file);

      // Add to pending uploads
      setPendingUploads((prev) => [
        ...prev,
        {
          id: tempId,
          filename: file.name,
          progress: 0,
          previewUrl: localPreviewUrl,
        },
      ]);

      try {
        // Step 1: Resize in browser to max 2000px and convert to WebP
        const webpBlob = await resizeAndConvertToWebP(file, 2000);

        // Step 2: Upload WebP blob to Firebase Storage with progress tracking
        const { downloadUrl } = await uploadImageToFirebaseStorage(
          folder,
          entityId,
          webpBlob,
          file.name,
          (progress, finalUrl, path, err) => {
            setPendingUploads((prev) =>
              prev.map((item) =>
                item.id === tempId
                  ? { ...item, progress, error: err, storageUrl: finalUrl }
                  : item
              )
            );
          }
        );

        // Notify parent of uploaded file so orphan cleanup can track it if cancelled
        onNewTempUpload?.(downloadUrl);

        if (isSingleMode) {
          onChange([downloadUrl]);
        } else {
          onChange([...images, downloadUrl]);
        }

        // Remove from pending list after completion
        setPendingUploads((prev) => prev.filter((item) => item.id !== tempId));
      } catch (err: any) {
        console.error('File upload failed:', err);
        setPendingUploads((prev) =>
          prev.map((item) =>
            item.id === tempId ? { ...item, error: err.message || 'Upload failed' } : item
          )
        );
      }
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processAndUploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processAndUploadFiles(e.target.files);
    }
  };

  // Remove Image with Firebase Storage Deletion
  const handleRemoveImage = async (index: number) => {
    const targetUrl = images[index];
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);

    // Delete from Firebase Storage
    if (targetUrl) {
      await deleteStorageFileByUrl(targetUrl);
    }

    // Clean up variant assignment
    if (onVariantAssignmentChange && variantAssignments[targetUrl]) {
      const copy = { ...variantAssignments };
      delete copy[targetUrl];
      onVariantAssignmentChange(copy);
    }
  };

  // Single Mode Replace: Deletes old Storage image and triggers upload
  const handleReplaceImage = async () => {
    if (images.length > 0) {
      const oldUrl = images[0];
      await deleteStorageFileByUrl(oldUrl);
      onChange([]);
    }
    fileInputRef.current?.click();
  };

  // Reorder Images
  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    onChange(copy);
  };

  // Set Main Image (Move to index 0)
  const handleSetMain = (index: number) => {
    if (index === 0) return;
    const copy = [...images];
    const selected = copy.splice(index, 1)[0];
    onChange([selected, ...copy]);
  };

  // Assign variant
  const handleAssignVariant = (imgUrl: string, variantId: string) => {
    if (!onVariantAssignmentChange) return;
    const copy = { ...variantAssignments };
    if (variantId) {
      copy[imgUrl] = variantId;
    } else {
      delete copy[imgUrl];
    }
    onVariantAssignmentChange(copy);
  };

  return (
    <div className="space-y-4 font-sans text-xs select-none">
      {/* Error Banner */}
      {errorAlert && (
        <div className="p-3 bg-[var(--color-risk-bg)] border border-[var(--color-risk-fg)]/30 rounded text-xs text-[var(--color-risk-fg)] flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorAlert}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorAlert(null)}
            className="text-[var(--color-risk-fg)] hover:opacity-80 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Single Mode Category Image View */}
      {isSingleMode && images.length > 0 ? (
        <div className="relative w-full aspect-[16/9] max-w-md rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-cream-300)] bg-[var(--color-cream-200)] group shadow-md">
          <Image src={images[0]} alt="Category Vitrine Image" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={handleReplaceImage}
              className="inline-flex items-center gap-1.5 min-h-[44px] cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-[var(--color-gold-600)]" />
              <span>Replace</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              type="button"
              onClick={() => handleRemoveImage(0)}
              className="inline-flex items-center gap-1.5 min-h-[44px] cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Dropzone Box */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-[var(--radius-card)] p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[var(--color-gold-500)] bg-[var(--color-gold-100)]/40 scale-[1.01]'
              : 'border-[var(--color-cream-300)] bg-[var(--color-cream-50)] hover:border-[var(--color-gold-500)] hover:bg-[var(--color-cream-100)]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={!isSingleMode}
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[var(--color-gold-100)] flex items-center justify-center text-[var(--color-gold-600)] border border-[var(--color-gold-400)]/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif font-medium text-sm text-[var(--color-text-900)]">
                {isSingleMode ? 'Upload Category Image' : 'Upload Product Images'}
              </p>
              <p className="text-[11px] text-[var(--color-text-500)]">
                Drag & drop or tap to choose from camera / gallery
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--color-cream-200)] text-[10px] font-semibold text-[var(--color-text-700)]">
              <span>JPG, PNG, WebP • Max 5 MB • Resized to WebP 2000px</span>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bars for Pending Uploads */}
      {pendingUploads.length > 0 && (
        <div className="space-y-2">
          {pendingUploads.map((item) => (
            <div
              key={item.id}
              className="p-2.5 bg-[var(--color-cream-50)] border border-[var(--color-cream-200)] rounded flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded relative overflow-hidden bg-[var(--color-cream-200)] shrink-0">
                <Image src={item.previewUrl} alt={item.filename} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center text-[11px] mb-1 font-medium">
                  <span className="truncate text-[var(--color-text-900)]">{item.filename}</span>
                  {item.error ? (
                    <span className="text-[var(--color-risk-fg)] font-semibold">Failed</span>
                  ) : (
                    <span className="text-[var(--color-gold-600)] font-bold">{item.progress}%</span>
                  )}
                </div>
                {item.error ? (
                  <p className="text-[10px] text-[var(--color-risk-fg)]">{item.error}</p>
                ) : (
                  <div className="w-full bg-[var(--color-cream-300)] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[var(--color-gold-600)] h-full transition-all duration-200"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Mode: Multiple Image Previews with Drag/Reorder, Main Label & Variant Assignment */}
      {!isSingleMode && images.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[var(--color-text-700)]">
              Uploaded Images ({images.length} / {maxImages})
            </span>
            <span className="text-[10px] text-[var(--color-text-500)]">
              1st image is Main. Reorder using arrows.
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((imgUrl, idx) => {
              const isMain = idx === 0;
              const assignedVariantId = variantAssignments[imgUrl] || '';

              return (
                <div
                  key={idx}
                  className={`relative bg-[var(--color-surface)] border rounded-[var(--radius-card)] p-2 space-y-2 transition-all ${
                    isMain ? 'border-[var(--color-gold-500)] shadow-sm' : 'border-[var(--color-cream-200)]'
                  }`}
                >
                  {/* Thumbnail Image */}
                  <div className="relative aspect-[4/5] rounded overflow-hidden bg-[var(--color-cream-200)] border border-[var(--color-cream-300)] group">
                    <Image src={imgUrl} alt={`Product Image ${idx + 1}`} fill className="object-cover" />

                    {/* Main Badge */}
                    {isMain && (
                      <span className="absolute top-1.5 left-1.5 bg-[#5C1A1B] text-[#FBF7EE] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current text-[var(--color-gold-400)]" />
                        Main
                      </span>
                    )}

                    {/* Hover Overlay Controls */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                      {!isMain && (
                        <button
                          type="button"
                          onClick={() => handleSetMain(idx)}
                          className="p-1.5 bg-[#8A6A1F] text-white rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                          title="Set as Main Image"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1.5 bg-red-700 text-white rounded cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="Remove Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Reorder Buttons & Variant Assignment */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, 'left')}
                        disabled={idx === 0}
                        className="p-1.5 text-[var(--color-text-500)] hover:text-[var(--color-text-900)] disabled:opacity-30 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center border border-[var(--color-cream-300)] rounded"
                        title="Move Left"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-mono text-[var(--color-text-500)]">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, 'right')}
                        disabled={idx === images.length - 1}
                        className="p-1.5 text-[var(--color-text-500)] hover:text-[var(--color-text-900)] disabled:opacity-30 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center border border-[var(--color-cream-300)] rounded"
                        title="Move Right"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Optional Variant Assignment Dropdown */}
                    {variantOptions.length > 0 && (
                      <div className="pt-1">
                        <select
                          value={assignedVariantId}
                          onChange={(e) => handleAssignVariant(imgUrl, e.target.value)}
                          className="w-full bg-[var(--color-cream-50)] border border-[var(--color-cream-300)] rounded p-1 text-[10px] text-[var(--color-text-900)] outline-none focus:border-[var(--color-gold-500)]"
                        >
                          <option value="">Assign to Variant (Optional)</option>
                          {variantOptions.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
