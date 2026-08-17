'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BicameralHeading, MicroLabel, Button, Input, Field } from '@/components/primitives';
import { saveProduct } from '@/lib/data/queries';
import { ArrowLeft, Save, Check } from 'lucide-react';

export default function AdminNewProductPage() {
  const router = useRouter();

  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState(45000);
  const [shortDescription, setShortDescription] = React.useState('');
  const [story, setStory] = React.useState('');
  const [artisanCluster, setArtisanCluster] = React.useState('Nagercoil, Tamil Nadu');
  const [craftTime, setCraftTime] = React.useState('6 weeks');
  const [totalStock, setTotalStock] = React.useState(10);
  const [status, setStatus] = React.useState<'live' | 'draft' | 'archived'>('live');
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const created = await saveProduct({
      id: `prod-${Date.now()}`,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: name,
      categoryId: 'cat-temple-jewellery',
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
          stock: totalStock,
          sku: `SKU-${Date.now()}`,
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
      createdAt: new Date().toISOString(),
    });

    setSaving(false);
    router.push('/admin/products');
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

      <div className="border-b border-[var(--color-cream-200)] pb-6">
        <MicroLabel className="text-[var(--color-gold-600)]">NEW CATALOG ENTRY</MicroLabel>
        <BicameralHeading italicPart="Add New" romanPart="Piece" size="xl" />
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-8 rounded-[var(--radius-card)] space-y-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="PIECE NAME" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Thanjavur Nagapadam Choker" required />
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
    </div>
  );
}
