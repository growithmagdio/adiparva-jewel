'use client';

import * as React from 'react';
import Image from 'next/image';
import { Product, Category, ProductVariant } from '@/lib/data/types';
import { serverCreateProduct, serverUpdateProduct, serverExecuteStockMovement } from '@/app/actions/admin-product-actions';
import { generateServerProductCode } from '@/app/actions/product-code';
import { X, Plus, Trash2, Check, Upload, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/primitives';
import { ImageUploader } from '@/components/admin/image-uploader';
import { deleteStorageFileByUrl } from '@/lib/utils/image-processor';

export interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  categories: Category[];
  onSuccess: (updatedProduct: Product) => void;
}

export function ProductFormModal({
  isOpen,
  onClose,
  productToEdit,
  categories,
  onSuccess,
}: ProductFormModalProps) {
  const isEditing = Boolean(productToEdit);

  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [shortDescription, setShortDescription] = React.useState('');
  const [story, setStory] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [price, setPrice] = React.useState(45000);
  const [compareAtPrice, setCompareAtPrice] = React.useState<number | undefined>(undefined);
  const [lowStockThreshold, setLowStockThreshold] = React.useState(3);
  const [status, setStatus] = React.useState<'live' | 'draft' | 'archived'>('live');
  const [images, setImages] = React.useState<string[]>([]);
  const [tempUploads, setTempUploads] = React.useState<string[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);

  const [variants, setVariants] = React.useState<ProductVariant[]>([]);

  const [saving, setSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  // Variant deletion confirmation dialog
  const [variantToDelete, setVariantToDelete] = React.useState<ProductVariant | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setTempUploads([]);
      setIsUploading(false);
      if (productToEdit) {
        setName(productToEdit.name);
        setCode(productToEdit.code || `AP-${productToEdit.id.slice(-6)}`);
        setShortDescription(productToEdit.shortDescription || '');
        setStory(productToEdit.story || '');
        setCategoryId(productToEdit.categoryId || categories[0]?.id || '');
        setPrice(productToEdit.price || 0);
        setCompareAtPrice(productToEdit.compareAtPrice);
        setLowStockThreshold(productToEdit.lowStockThreshold ?? 3);
        setStatus(productToEdit.status || 'live');
        setImages(productToEdit.images && productToEdit.images.length > 0 ? [...productToEdit.images] : ['/images/products/maharani-temple-necklace-1.jpg']);
        setVariants(productToEdit.variants && productToEdit.variants.length > 0 ? JSON.parse(JSON.stringify(productToEdit.variants)) : []);
      } else {
        setName('');
        setShortDescription('Handcrafted antique jewellery piece with traditional nakashi repoussé work.');
        setStory('Hand-hammered by master sthapati artisans using traditional 22K antique formulations.');
        setCategoryId(categories[0]?.id || '');
        setPrice(45000);
        setCompareAtPrice(undefined);
        setLowStockThreshold(3);
        setStatus('live');
        setImages(['/images/products/maharani-temple-necklace-1.jpg']);
        setVariants([
          {
            id: `var-${Date.now()}-1`,
            label: '22K Gold Standard',
            metal: '22K gold',
            priceDelta: 0,
            stock: 10,
            sku: 'AP-VAR-001',
          },
        ]);
        // Generate new product code
        generateServerProductCode('demo-admin-token').then((newCode) => setCode(newCode));
      }
    }
  }, [isOpen, productToEdit, categories]);

  const handleCloseAndCleanup = async () => {
    if (tempUploads.length > 0) {
      await Promise.all(tempUploads.map((url) => deleteStorageFileByUrl(url)));
      setTempUploads([]);
    }
    onClose();
  };

  if (!isOpen) return null;

  const handleVariantImageChange = (variantId: string, imageUrl: string) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, image: imageUrl } : v))
    );
  };

  // Add variant
  const handleAddVariant = () => {
    const newV: ProductVariant = {
      id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: `Option ${variants.length + 1}`,
      metal: '22K gold',
      priceDelta: 0,
      stock: 5,
      sku: `${code || 'AP-VAR'}-V${variants.length + 1}`,
    };
    setVariants((prev) => [...prev, newV]);
  };

  // Request variant deletion
  const handleRequestDeleteVariant = (v: ProductVariant) => {
    if (variants.length <= 1) {
      setErrorMsg('A product must have at least one variant.');
      return;
    }
    if (v.stock > 0) {
      setVariantToDelete(v);
    } else {
      setVariants((prev) => prev.filter((item) => item.id !== v.id));
    }
  };

  const confirmDeleteVariant = async () => {
    if (!variantToDelete) return;
    const token = 'demo-admin-token';

    if (productToEdit) {
      // Log adjustment movement for deleted stock
      await serverExecuteStockMovement(token, {
        productId: productToEdit.id,
        variantId: variantToDelete.id,
        changeQty: -variantToDelete.stock,
        reason: 'adjustment',
        note: `Variant ${variantToDelete.label} deleted from product`,
      });
    }

    setVariants((prev) => prev.filter((item) => item.id !== variantToDelete.id));
    setVariantToDelete(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) {
      setErrorMsg('Please wait for image uploads to complete before saving.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Product name is required');
      return;
    }
    if (status === 'live' && images.length === 0) {
      setErrorMsg('At least one product image is required before a product can be set to Live.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    const token = 'demo-admin-token';
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

    const payload = {
      name,
      code,
      shortDescription,
      story,
      categoryId,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      lowStockThreshold: Number(lowStockThreshold),
      status,
      images,
      variants,
      totalStock,
      craftTime: '6 weeks',
      artisanCluster: 'Nagercoil, Tamil Nadu',
      certification: ['BIS Hallmarked', 'Certificate of Authenticity'],
      careNotes: ['Store in velvet box', 'Wipe with soft cloth'],
      specs: [
        { label: 'Metal', value: '22K Gold' },
        { label: 'Finish', value: 'Antique Reddish Patina' },
      ],
      rating: productToEdit?.rating || 4.8,
      reviewCount: productToEdit?.reviewCount || 36,
    };

    if (isEditing && productToEdit) {
      const res = await serverUpdateProduct(token, { ...payload, id: productToEdit.id });
      if (res.success) {
        setTempUploads([]);
        onSuccess({ ...productToEdit, ...payload });
        onClose();
      } else {
        setErrorMsg(res.message || 'Failed to update product');
      }
    } else {
      const res = await serverCreateProduct(token, payload);
      if (res.success && res.product) {
        setTempUploads([]);
        onSuccess(res.product);
        onClose();
      } else {
        setErrorMsg((res as any).message || 'Failed to create product');
      }
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded-[var(--radius-card)] max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-[var(--color-cream-200)] flex items-center justify-between shrink-0 bg-[var(--color-cream-50)]">
          <div>
            <h3 className="font-serif font-medium text-xl text-[var(--color-text-900)]">
              {isEditing ? `Edit Product: ${productToEdit?.name}` : 'Add New Product'}
            </h3>
            <p className="text-xs text-[var(--color-gold-600)] font-mono font-medium">
              Product Code: {code || 'Generating...'} (Read-Only)
            </p>
          </div>
          <button
            onClick={handleCloseAndCleanup}
            className="p-2 text-[var(--color-text-500)] hover:text-[var(--color-text-900)] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-[var(--color-risk-bg)] border border-[var(--color-risk-fg)]/30 rounded text-xs text-[var(--color-risk-fg)] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs font-sans">
          {/* Grid 1: Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[var(--color-text-700)] mb-1">
                Product Name <span className="text-[var(--color-risk-fg)]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maharani Temple Necklace"
                className="w-full bg-[var(--color-cream-50)] border border-[var(--color-cream-300)] rounded p-2.5 text-xs text-[var(--color-text-900)] outline-none focus:border-[var(--color-gold-500)]"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--color-text-700)] mb-1">
                Category <span className="text-[var(--color-risk-fg)]">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[var(--color-cream-50)] border border-[var(--color-cream-300)] rounded p-2.5 text-xs text-[var(--color-text-900)] outline-none focus:border-[var(--color-gold-500)]"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[var(--color-text-700)] mb-1">
                Price (₹) <span className="text-[var(--color-risk-fg)]">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                className="w-full bg-[var(--color-cream-50)] border border-[var(--color-cream-300)] rounded p-2.5 text-xs text-[var(--color-text-900)] outline-none focus:border-[var(--color-gold-500)]"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--color-text-700)] mb-1">
                Compare-at Price (₹ Optional)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Original price before discount"
                value={compareAtPrice || ''}
                onChange={(e) => setCompareAtPrice(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full bg-[var(--color-cream-50)] border border-[var(--color-cream-300)] rounded p-2.5 text-xs text-[var(--color-text-900)] outline-none focus:border-[var(--color-gold-500)]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--color-text-700)] mb-1">
                Low Stock Warning Threshold
              </label>
              <input
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 3)}
                className="w-full bg-[var(--color-cream-50)] border border-[var(--color-cream-300)] rounded p-2.5 text-xs text-[var(--color-text-900)] outline-none focus:border-[var(--color-gold-500)]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--color-text-700)] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[var(--color-cream-50)] border border-[var(--color-cream-300)] rounded p-2.5 text-xs text-[var(--color-text-900)] outline-none focus:border-[var(--color-gold-500)]"
              >
                <option value="live">Live (Active in storefront)</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-[var(--color-text-700)] mb-1">
                Short Description (1 line)
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="e.g. Grand 22K gold temple choker with cascading ruby drops."
                className="w-full bg-[var(--color-cream-50)] border border-[var(--color-cream-300)] rounded p-2 text-xs text-[var(--color-text-900)] outline-none focus:border-[var(--color-gold-500)]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--color-text-700)] mb-1">
                Provenance Story
              </label>
              <textarea
                rows={3}
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Historical craft details, artisan heritage story..."
                className="w-full bg-[var(--color-cream-50)] border border-[var(--color-cream-300)] rounded p-2 text-xs text-[var(--color-text-900)] outline-none focus:border-[var(--color-gold-500)]"
              />
            </div>
          </div>

          {/* Shared Image Uploader Component */}
          <div className="border-t border-[var(--color-cream-200)] pt-4">
            <ImageUploader
              folder="products"
              entityId={productToEdit?.id || code || 'new-product'}
              images={images}
              onChange={setImages}
              maxImages={8}
              variantOptions={variants.map((v) => ({ id: v.id, label: v.label }))}
              variantAssignments={variants.reduce<Record<string, string>>((acc, v) => {
                if (v.image) acc[v.image] = v.id;
                return acc;
              }, {})}
              onVariantAssignmentChange={(assignments) => {
                setVariants((prev) =>
                  prev.map((v) => {
                    const assignedImg = Object.keys(assignments).find((url) => assignments[url] === v.id);
                    return { ...v, image: assignedImg || undefined };
                  })
                );
              }}
              onNewTempUpload={(url) => setTempUploads((prev) => [...prev, url])}
              onUploadingStateChange={setIsUploading}
            />
          </div>

          {/* Variants & Opening Stock Section */}
          <div className="space-y-3 border-t border-[var(--color-cream-200)] pt-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block font-semibold text-[var(--color-text-700)]">
                  Variants & Stock Breakdown
                </label>
                <p className="text-[10px] text-[var(--color-text-500)]">
                  Opening stock per variant required. Every stock change writes a transaction movement.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={handleAddVariant}
                className="inline-flex items-center gap-1 cursor-pointer min-h-[44px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variant</span>
              </Button>
            </div>

            <div className="space-y-2">
              {variants.map((v, idx) => (
                <div
                  key={v.id}
                  className="p-3 bg-[var(--color-cream-50)] border border-[var(--color-cream-200)] rounded flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 flex-1">
                    <div>
                      <span className="text-[10px] text-[var(--color-text-500)]">Variant Label</span>
                      <input
                        type="text"
                        value={v.label}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVariants((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, label: val } : item))
                          );
                        }}
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded p-1.5 text-xs text-[var(--color-text-900)]"
                        required
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-[var(--color-text-500)]">SKU</span>
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVariants((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, sku: val } : item))
                          );
                        }}
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded p-1.5 text-xs text-[var(--color-text-900)]"
                        required
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-[var(--color-text-500)]">Price Delta (₹)</span>
                      <input
                        type="number"
                        value={v.priceDelta}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setVariants((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, priceDelta: val } : item))
                          );
                        }}
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded p-1.5 text-xs text-[var(--color-text-900)]"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-[var(--color-text-500)]">Stock Units</span>
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setVariants((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, stock: val } : item))
                          );
                        }}
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded p-1.5 text-xs text-[var(--color-text-900)]"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRequestDeleteVariant(v)}
                    className="p-2 text-[var(--color-risk-fg)] hover:bg-[var(--color-risk-bg)] rounded self-end md:self-center cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Delete Variant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-cream-200)]">
            <Button
              variant="ghost"
              size="md"
              type="button"
              onClick={handleCloseAndCleanup}
              className="min-h-[44px] cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={saving || isUploading}
              className="min-h-[44px] cursor-pointer"
            >
              {saving ? 'Saving...' : isUploading ? 'Uploading Image...' : isEditing ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>

      {/* VARIANT DELETE CONFIRMATION DIALOG */}
      {variantToDelete && (
        <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-cream-300)] p-6 rounded max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-[var(--color-risk-fg)] font-semibold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Confirm Variant Deletion</span>
            </div>
            <p className="text-xs text-[var(--color-text-700)] leading-relaxed">
              Variant <strong>{variantToDelete.label}</strong> currently has{' '}
              <strong>{variantToDelete.stock}</strong> units in stock. Deleting this variant will log a negative stock adjustment movement of -{variantToDelete.stock}. Continue?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVariantToDelete(null)}
                className="min-h-[44px]"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={confirmDeleteVariant}
                className="bg-[var(--color-risk-fg)] text-white hover:bg-red-800 min-h-[44px]"
              >
                Delete Variant & Log Movement
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
