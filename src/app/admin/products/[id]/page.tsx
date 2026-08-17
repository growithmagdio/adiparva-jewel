'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BicameralHeading, MicroLabel, Button, Input, Field } from '@/components/primitives';
import { getProductById, saveProduct } from '@/lib/data/queries';
import { Product } from '@/lib/data/types';
import { ArrowLeft, Save, Check } from 'lucide-react';

export default function AdminEditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || '';

  const [product, setProduct] = React.useState<Product | null>(null);
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState(0);
  const [stock, setStock] = React.useState(0);
  const [status, setStatus] = React.useState<'live' | 'draft' | 'archived'>('live');
  const [saving, setSaving] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  React.useEffect(() => {
    async function loadProduct() {
      if (id) {
        const item = await getProductById(id);
        if (item) {
          setProduct(item);
          setName(item.name);
          setPrice(item.price);
          setStock(item.totalStock);
          setStatus(item.status);
        }
      }
    }
    loadProduct();
  }, [id]);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    await saveProduct({
      ...product,
      name,
      price: Number(price),
      totalStock: Number(stock),
      status,
    });

    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 select-none max-w-4xl">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-wider text-[var(--color-gold-600)] hover:text-[var(--color-gold-700)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>

      <div className="border-b border-[var(--color-cream-200)] pb-6 flex items-center justify-between">
        <div>
          <MicroLabel className="text-[var(--color-gold-600)]">EDIT ENTRY #{product.id}</MicroLabel>
          <BicameralHeading italicPart="Edit" romanPart={product.name.split(' ')[0]} size="xl" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-8 rounded-[var(--radius-card)] space-y-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="PIECE NAME" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="PRICE (INR ₹)" required>
            <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="TOTAL VAULT STOCK">
            <Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
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

        <div className="pt-4 border-t border-[var(--color-cream-200)] flex items-center justify-between">
          {savedSuccess && <span className="text-xs text-[var(--color-ok-fg)] font-semibold">Changes saved to repository.</span>}
          <div className="ml-auto">
            <Button type="submit" variant="primary" size="lg" disabled={saving} leftIcon={savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}>
              {saving ? 'SAVING...' : savedSuccess ? 'CHANGES SAVED' : 'SAVE CHANGES'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
