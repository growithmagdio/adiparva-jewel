'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BicameralHeading, MicroLabel, Button, Input, Field } from '@/components/primitives';
import { createProduct, getCategories, createCategory } from '@/lib/data/queries';
import { generateServerProductCode } from '@/app/actions/product-code';
import { Category } from '@/lib/data/types';
import { ArrowLeft, Save, Plus, AlertTriangle } from 'lucide-react';

function AdminNewProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCatId = searchParams.get('categoryId');

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [categoryId, setCategoryId] = React.useState<string>(preselectedCatId || '');
  const [productCode, setProductCode] = React.useState<string>('Generating...');

  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState(45000);
  const [shortDescription, setShortDescription] = React.useState('');
  const [story, setStory] = React.useState('');
  const [artisanCluster, setArtisanCluster] = React.useState('Nagercoil, Tamil Nadu');
  const [craftTime, setCraftTime] = React.useState('6 weeks');
  const [totalStock, setTotalStock] = React.useState(10);
  const [status, setStatus] = React.useState<'live' | 'draft' | 'archived'>('live');
  const [saving, setSaving] = React.useState(false);

  // Inline Add Category Modal State
  const [isInlineCatModalOpen, setIsInlineCatModalOpen] = React.useState(false);
  const [newCatName, setNewCatName] = React.useState('');
  const [newCatDesc, setNewCatDesc] = React.useState('');
  const [inlineError, setInlineError] = React.useState('');

  const loadData = React.useCallback(async () => {
    const [cats, serverCode] = await Promise.all([
      getCategories(),
      generateServerProductCode(),
    ]);
    setCategories(cats);
    setProductCode(serverCode);

    if (preselectedCatId && cats.some((c) => c.id === preselectedCatId)) {
      setCategoryId(preselectedCatId);
    } else if (cats.length > 0) {
      setCategoryId(cats[0].id);
    }
  }, [preselectedCatId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Inline Category Add
  const handleInlineAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError('');
    if (!newCatName.trim()) {
      setInlineError('Category name is required.');
      return;
    }

    const res = await createCategory({
      name: newCatName.trim(),
      description: newCatDesc.trim(),
      isActive: true,
    });

    if (res.error) {
      setInlineError(res.error);
      return;
    }

    if (res.category) {
      const updatedCats = await getCategories();
      setCategories(updatedCats);
      setCategoryId(res.category.id);
      setIsInlineCatModalOpen(false);
      setNewCatName('');
      setNewCatDesc('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return;
    setSaving(true);

    await createProduct({
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: name,
      code: productCode,
      categoryId: categoryId,
      shortDescription: shortDescription || 'Authentic 22K gold temple jewellery parure.',
      story: story || 'Hand-engraved by master sthapati artisans using hereditary repoussé techniques.',
      price: Number(price),
      images: ['/images/products/maharani-temple-necklace-1.jpg'],
      variants: [
        {
          id: `var-${Date.now()}`,
          label: '22K Antique Gold, 16 inch',
          metal: '22K gold',
          priceDelta: 0,
          stock: Number(totalStock),
          sku: `${productCode}-V1`,
        },
      ],
      specs: [
        { label: 'Metal', value: '22K Gold 916' },
        { label: 'Craft', value: 'Nakashi Repoussé' },
      ],
      craftTime: craftTime,
      artisanCluster: artisanCluster,
      certification: ['BIS Hallmarked', 'Certificate of Authenticity'],
      careNotes: ['Clean with flannel cloth', 'Store in dry velvet vault'],
      status: status,
      totalStock: Number(totalStock),
      rating: 5.0,
      reviewCount: 1,
    });

    setSaving(false);
    router.push('/admin/products');
  };

  return (
    <div className="space-y-8 select-none max-w-4xl pb-12">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-wider text-[var(--color-gold-600)] hover:text-[var(--color-gold-700)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>

      <div className="border-b border-[var(--color-cream-200)] pb-6">
        <MicroLabel className="text-[var(--color-gold-600)]">NEW CATALOG ENTRY</MicroLabel>
        <BicameralHeading italicPart="Add New" romanPart="Piece" size="xl" />
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-8 rounded-[var(--radius-card)] space-y-6 shadow-xs">
        {/* Product Code Readonly & Name */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="PRODUCT CODE (SERVER GENERATED)">
            <Input value={productCode} readOnly className="font-mono font-bold bg-[var(--color-cream-100)] text-[var(--color-gold-700)]" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="PIECE NAME" required>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Thanjavur Nagapadam Choker" required />
            </Field>
          </div>
        </div>

        {/* Category & Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="CATEGORY (REQUIRED)" required>
            <div className="flex gap-2">
              <select
                value={categoryId}
                onChange={(e) => {
                  if (e.target.value === 'add-new-category-inline') {
                    setIsInlineCatModalOpen(true);
                  } else {
                    setCategoryId(e.target.value);
                  }
                }}
                className="w-full h-[40px] px-3 bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded text-xs text-[var(--color-text-900)] outline-none"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.pieceCount} pieces)
                  </option>
                ))}
                <option value="add-new-category-inline" className="font-bold text-[var(--color-gold-600)]">
                  + Add new category...
                </option>
              </select>
              <button
                type="button"
                onClick={() => setIsInlineCatModalOpen(true)}
                className="px-3 h-[40px] border border-[var(--color-cream-300)] rounded bg-[var(--color-cream-100)] text-[var(--color-text-900)] hover:bg-[var(--color-gold-100)] hover:text-[var(--color-gold-700)] transition-colors text-xs flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </Field>

          <Field label="PRICE (INR ₹)" required>
            <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
          </Field>
        </div>

        <Field label="SHORT DESCRIPTION (MAX 90 CHARS)">
          <Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="Grand 22K gold temple choker with Lakshmi plaque." />
        </Field>

        <Field label="PROVENANCE STORY (3 PARAGRAPHS)">
          <textarea
            rows={4}
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className="w-full p-3 bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded-[var(--radius-card)] text-xs text-[var(--color-text-900)] outline-none"
            placeholder="Hand-hammered nakashi repoussé work by sthapati guilds..."
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="ARTISAN CLUSTER">
            <Input value={artisanCluster} onChange={(e) => setArtisanCluster(e.target.value)} />
          </Field>
          <Field label="TOTAL VAULT STOCK">
            <Input type="number" value={totalStock} onChange={(e) => setTotalStock(Number(e.target.value))} />
          </Field>
          <Field label="STATUS">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full h-[40px] px-3 bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded text-xs text-[var(--color-text-900)] outline-none"
            >
              <option value="live">Live</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
        </div>

        <div className="pt-4 border-t border-[var(--color-cream-200)] flex justify-end">
          <Button type="submit" variant="primary" size="lg" disabled={saving} leftIcon={<Save className="w-4 h-4" />}>
            {saving ? 'SAVING ENTRY...' : 'SAVE HEIRLOOM ENTRY'}
          </Button>
        </div>
      </form>

      {/* Modal: Inline Category Creation */}
      {isInlineCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded-[var(--radius-card)] max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-medium text-[var(--color-text-900)]">+ Add New Category Inline</h3>
            {inlineError && (
              <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{inlineError}</span>
              </div>
            )}
            <form onSubmit={handleInlineAddCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-[var(--color-text-700)] font-medium mb-1">Category Name *</label>
                <Input
                  placeholder="e.g. Vaddanam Belts"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-[var(--color-text-700)] font-medium mb-1">Description</label>
                <textarea
                  placeholder="Brief description of craft and motif..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full bg-[var(--color-cream-50)] border border-[var(--color-cream-300)] rounded p-2 text-xs text-[var(--color-text-900)] outline-none focus:border-[var(--color-gold-500)] h-20"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-cream-200)]">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsInlineCatModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Create & Select Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminNewProductPage() {
  return (
    <React.Suspense fallback={<div className="p-8">Loading...</div>}>
      <AdminNewProductContent />
    </React.Suspense>
  );
}
