import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';

export interface UploadProgressCallback {
  (progress: number, downloadUrl?: string, storagePath?: string, error?: string): void;
}

/**
 * Validates file format and size
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file format "${file.name}". Only JPG, PNG, and WebP images are allowed.`,
    };
  }

  const maxBytes = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds 5 MB size limit (Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  return { valid: true };
}

/**
 * Resizes image in the browser to max width 2000px and converts to WebP Blob
 */
export function resizeAndConvertToWebP(file: File, maxWidth = 2000): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas 2d context for image resizing'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert canvas to WebP blob'));
            }
          },
          'image/webp',
          0.88 // WebP compression quality
        );
      };
      img.onerror = (err) => reject(new Error('Failed to load image for resizing'));
    };
    reader.onerror = (err) => reject(new Error('Failed to read image file'));
  });
}

/**
 * Uploads a WebP blob to Firebase Storage with progress updates
 */
export function uploadImageToFirebaseStorage(
  folder: 'categories' | 'products',
  entityId: string,
  webpBlob: Blob,
  originalFilename: string,
  onProgress: UploadProgressCallback
): Promise<{ downloadUrl: string; storagePath: string }> {
  return new Promise((resolve, reject) => {
    const cleanId = entityId || 'temp-' + Date.now();
    const sanitizeFilename = originalFilename.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const uniqueFilename = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}_${sanitizeFilename}.webp`;
    const storagePath = `images/${folder}/${cleanId}/${uniqueFilename}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, webpBlob, {
      contentType: 'image/webp',
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress(progress);
      },
      (error) => {
        console.error('Firebase Storage upload error:', error);
        onProgress(0, undefined, undefined, error.message);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          onProgress(100, downloadUrl, storagePath);
          resolve({ downloadUrl, storagePath });
        } catch (err: any) {
          reject(err);
        }
      }
    );
  });
}

/**
 * Deletes a file from Firebase Storage given its download URL or Storage path
 */
export async function deleteStorageFileByUrl(urlOrPath: string): Promise<boolean> {
  if (!urlOrPath) return false;

  // Don't attempt to delete static seeded public images (/images/...)
  if (urlOrPath.startsWith('/') || urlOrPath.startsWith('http://') && !urlOrPath.includes('firebasestorage')) {
    return true;
  }

  try {
    const fileRef = ref(storage, urlOrPath);
    await deleteObject(fileRef);
    return true;
  } catch (err) {
    console.warn('Storage file deletion error:', err);
    return false;
  }
}
