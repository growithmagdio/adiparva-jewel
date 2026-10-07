'use client';

import * as React from 'react';
import { Product } from '@/lib/data/types';
import { serverDeleteProduct } from '@/app/actions/admin-product-actions';
import { deleteProduct } from '@/lib/data/queries';
import { Button } from '@/components/primitives';
import { AlertTriangle, Trash2, X, Archive } from 'lucide-react';

export interface DeleteProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  userRole?: string;
  onSuccess: (deletedId: string, wasArchived: boolean) => void;
}

export function DeleteProductDialog({
  isOpen,
  onClose,
  product,
  userRole = 'Chief Curator',
  onSuccess,
}: DeleteProductDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  const canDelete = ['Chief Curator', 'admin', 'Admin'].includes(userRole);

  if (!isOpen || !product) return null;

  const handleConfirmDelete = async () => {
    if (!canDelete) {
      setErrorMsg('Forbidden: Only Chief Curator or Admin can delete products.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const token = 'demo-admin-token';

    try {
      const res = await serverDeleteProduct(token, product.id);

      if (res.success) {
        // Clear from local store / localStorage as well
        await deleteProduct(product.id);
        onSuccess(product.id, Boolean(res.archived));
        onClose();
      } else {
        setErrorMsg(res.message || 'Failed to delete product.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded-[var(--radius-card)] p-6 max-w-md w-full shadow-2xl space-y-4 font-sans text-xs">
        <div className="flex items-center justify-between border-b border-[var(--color-cream-200)] pb-3">
          <div className="flex items-center gap-2 text-[var(--color-risk-fg)] font-semibold text-sm">
            <Trash2 className="w-5 h-5 shrink-0" />
            <span>Confirm Product Deletion</span>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-text-500)] hover:text-[var(--color-text-900)] p-1 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[var(--color-risk-bg)] border border-[var(--color-risk-fg)]/30 rounded text-xs text-[var(--color-risk-fg)] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!canDelete ? (
          <div className="p-4 bg-[var(--color-warn-bg)] text-[var(--color-warn-fg)] rounded border border-[var(--color-warn-fg)]/30 space-y-2">
            <p className="font-semibold text-xs">Insufficient Permissions</p>
            <p className="text-[11px]">
              Your current role (<strong>{userRole}</strong>) does not have permission to delete products. Only Chief Curator or Admin may delete products.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[var(--color-text-900)] font-serif">
              Delete <strong>{product.name}</strong> ({product.code || `AP-${product.id.slice(-6)}`})?
            </p>
            <p className="text-xs text-[var(--color-text-500)] leading-relaxed">
              This cannot be undone. If this product appears in past customer orders, it will be safely <strong>archived</strong> instead of hard-deleted to preserve order history integrity.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-cream-200)]">
          <Button variant="ghost" size="md" onClick={onClose} className="min-h-[44px] cursor-pointer">
            Cancel
          </Button>
          {canDelete && (
            <Button
              variant="primary"
              size="md"
              onClick={handleConfirmDelete}
              disabled={loading}
              className="bg-[var(--color-risk-fg)] text-white hover:bg-red-800 min-h-[44px] cursor-pointer"
            >
              {loading ? 'Processing...' : 'Confirm Delete'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
