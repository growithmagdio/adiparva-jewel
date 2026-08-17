'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BicameralHeading, MicroLabel, Price, StatusPill, Button, Input, DataTable } from '@/components/primitives';
import { getProducts, getCategories } from '@/lib/data/queries';
import { Product, Category } from '@/lib/data/types';
import { Plus, Search, Filter } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        getProducts({ status: 'all' }),
        getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.artisanCluster.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[var(--color-cream-200)] pb-6">
        <div>
          <MicroLabel className="text-[var(--color-gold-600)] mb-1">CATALOG REPOSITORY</MicroLabel>
          <BicameralHeading italicPart="The" romanPart="Collection" size="xl" />
        </div>

        <Link href="/admin/products/new">
          <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
            ADD NEW PIECE
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-4 rounded-[var(--radius-card)]">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search piece name or cluster..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-1.5 text-xs"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-sans">
          <span className="text-[var(--color-text-500)]">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[var(--color-cream-100)] border border-[var(--color-cream-300)] rounded px-3 py-1.5 text-xs text-[var(--color-text-900)] outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] rounded-[var(--radius-card)] overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-cream-200)] bg-[var(--color-cream-50)]">
              <th className="py-3 px-4"><MicroLabel>PIECE</MicroLabel></th>
              <th className="py-3 px-4"><MicroLabel>CLUSTER</MicroLabel></th>
              <th className="py-3 px-4"><MicroLabel>STATUS</MicroLabel></th>
              <th className="py-3 px-4"><MicroLabel>STOCK</MicroLabel></th>
              <th className="py-3 px-4 text-right"><MicroLabel>PRICE</MicroLabel></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-cream-200)] text-xs font-sans">
            {filteredProducts.map((p) => {
              const statusVariant = p.status === 'live' ? 'ok' : p.status === 'draft' ? 'warn' : 'risk';
              return (
                <tr
                  key={p.id}
                  className="h-16 hover:bg-[var(--color-cream-50)] transition-colors cursor-pointer group"
                  onClick={() => (window.location.href = `/admin/products/${p.id}`)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--color-cream-200)] rounded relative overflow-hidden shrink-0">
                        <Image src={p.images[0] || '/images/products/maharani-temple-necklace-1.jpg'} alt={p.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-serif text-sm font-medium text-[var(--color-text-900)] group-hover:text-[var(--color-gold-600)] transition-colors">
                          {p.name}
                        </p>
                        {p.collectionTag && (
                          <span className="text-[10px] text-[var(--color-gold-600)] font-semibold uppercase">{p.collectionTag}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-700)]">{p.artisanCluster}</td>
                  <td className="py-3 px-4">
                    <StatusPill variant={statusVariant} dot>
                      {p.status}
                    </StatusPill>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[var(--color-text-900)]">
                    <span className={p.totalStock < 5 ? 'text-[var(--color-risk-fg)]' : ''}>
                      {p.totalStock} units
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Price amount={p.price} size="sm" className="font-semibold" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
