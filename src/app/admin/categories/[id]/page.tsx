'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  BicameralHeading,
  MicroLabel,
  Price,
  StatusPill,
  Button,
} from '@/components/primitives';
import {
  getCategoryById,
  getCategories,
  getProducts,
  deleteProduct,
  moveProductsToCategory,
} from '@/lib/data/queries';
import { Category, Product } from '@/lib/data/types';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  MoveRight,
  CheckSquare,
  Square,
  AlertTriangle,
  Package,
} from 'lucide-react';

export default function AdminCategoryProductsPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;

  const [category, setCategory] = React.useState<Category | null>(null);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Selection & Move Modal State
  const [selectedProductIds, setSelectedProductIds] = React.useState<string[]>([]);
  const [isMoveModalOpen, setIsMoveModalOpen] = React.useState(false);
  const [targetCategoryId, setTargetCategoryId] = React.useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null);
  const [feedbackMessage, setFeedbackMessage] = React.useState('');

  const loadData = React.useCallback(async () => {
    setLoading(true);
    const [cat, allCats, prods] = await Promise.all([
      getCategoryById(categoryId),
      getCategories(),
      getProducts({ categoryId, status: 'all' }),
    ]);
    setCategory(cat);
    setCategories(allCats);
    setProducts(prods);

    const otherCats = allCats.filter((c) => c.id !== categoryId);
    if (otherCats.length > 0) {
      setTargetCategoryId(otherCats[0].id);
    }
    setLoading(false);
  }, [categoryId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Selection Toggle
  const toggleSelectAll = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter((pId) => pId !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  // Handle Move Products
  const handleMoveProducts = async () => {
    if (selectedProductIds.length === 0 || !targetCategoryId) return;
    await moveProductsToCategory(selectedProductIds, targetCategoryId);
    setSelectedProductIds([]);
    setIsMoveModalOpen(false);
    await loadData();
  };

  // Handle Delete Product
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    const res = await deleteProduct(productToDelete.id);
    setFeedbackMessage(res.message);
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
    await loadData();
  };

  if (!category && !loading) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-[var(--color-text-500)]">Category not found.</p>
        <Link href="/admin/categories">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Categories
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none pb-12">
      {/* Back & Header */}
      <div className="space-y-4 border-b border-[var(--color-cream-200)] pb-6">
        <Link href="/admin/categories" className="inline-flex items-center gap-2 text-xs text-[var(--color-gold-600)] hover:text-[var(--color-gold-700)] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to All Categories
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <MicroLabel className="text-[var(--color-gold-600)] mb-1">VITRINE COLLECTION</MicroLabel>
            <BicameralHeading italicPart="Category:" romanPart={category?.name || '...'} size="xl" />
          </div>

          <div className="flex items-center gap-3">
            {selectedProductIds.length > 0 && (
              <Button
                variant="secondary"
                size="md"
                leftIcon={<MoveRight className="w-4 h-4" />}
                onClick={() => setIsMoveModalOpen(true)}
              >
                MOVE SELECTED ({selectedProductIds.length})
              </Button>
            )}

            <Link href={`/admin/products/new?categoryId=${categoryId}`}>
              <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
                ADD PIECE TO CATEGORY
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded flex items-center gap-2">
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] rounded-[var(--radius-card)] overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-cream-200)] bg-[var(--color-cream-50)]">
              <th className="py-3 px-4 w-10 text-center">
                <button onClick={toggleSelectAll} className="cursor-pointer text-[var(--color-text-500)]">
                  {selectedProductIds.length === products.length && products.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-[var(--color-gold-600)]" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3 px-4"><MicroLabel>PIECE & CODE</MicroLabel></th>
              <th className="py-3 px-4"><MicroLabel>STATUS</MicroLabel></th>
              <th className="py-3 px-4"><MicroLabel>STOCK</MicroLabel></th>
              <th className="py-3 px-4 text-right"><MicroLabel>PRICE</MicroLabel></th>
              <th className="py-3 px-4 text-right"><MicroLabel>ACTIONS</MicroLabel></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-cream-200)] text-xs font-sans">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[var(--color-text-500)]">
                  No products in this category yet.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const isSelected = selectedProductIds.includes(p.id);
                const statusVariant = p.status === 'live' ? 'ok' : p.status === 'draft' ? 'warn' : 'risk';
                const mainImg = p.images?.[0] || '/images/products/maharani-temple-necklace-1.jpg';

                return (
                  <tr key={p.id} className={`h-16 hover:bg-[var(--color-cream-50)] transition-colors ${isSelected ? 'bg-[var(--color-gold-100)]/30' : ''}`}>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => toggleSelectOne(p.id)} className="cursor-pointer text-[var(--color-text-500)]">
                        {isSelected ? <CheckSquare className="w-4 h-4 text-[var(--color-gold-600)]" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded overflow-hidden border border-[var(--color-cream-300)] shrink-0 bg-[#FAF7F2]">
                          <Image src={mainImg} alt={p.name} fill className="object-cover" unoptimized />
                        </div>
                        <div>
                          <Link href={`/admin/products/${p.id}`} className="font-serif text-sm font-medium text-[var(--color-text-900)] hover:text-[var(--color-gold-600)] transition-colors">
                            {p.name}
                          </Link>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-[var(--color-gold-600)] font-semibold uppercase tracking-wider">
                              {p.code || p.plateNumber || 'AP-7K3QXM'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <StatusPill variant={statusVariant}>{p.status}</StatusPill>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium">
                      {p.totalStock} units
                    </td>

                    <td className="py-3 px-4 text-right font-serif font-medium">
                      <Price amount={p.price} />
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      <Link href={`/admin/products/${p.id}`} className="p-1.5 inline-block text-[var(--color-text-500)] hover:text-[var(--color-gold-600)] transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {
                          setProductToDelete(p);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Move Selected Products */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded-[var(--radius-card)] max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-medium text-[var(--color-text-900)]">
              Move {selectedProductIds.length} Product(s) to Category
            </h3>
            <div className="space-y-3 text-xs">
              <label className="block text-[var(--color-text-700)] font-medium">Select Target Destination Category:</label>
              <select
                value={targetCategoryId}
                onChange={(e) => setTargetCategoryId(e.target.value)}
                className="w-full bg-[var(--color-cream-50)] border border-[var(--color-cream-300)] rounded p-2 text-xs outline-none focus:border-[var(--color-gold-500)]"
              >
                {categories
                  .filter((c) => c.id !== categoryId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.pieceCount} pieces)
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-cream-200)]">
              <Button variant="ghost" size="sm" onClick={() => setIsMoveModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleMoveProducts}>
                Move Products
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Product Confirm */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded-[var(--radius-card)] max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-700">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif text-lg font-medium text-[var(--color-text-900)]">Delete Product</h3>
            </div>
            <p className="text-xs text-[var(--color-text-700)]">
              Are you sure you want to delete <strong>"{productToDelete.name}"</strong>? If this piece appears in past customer orders, it will be archived automatically to keep order history intact.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-cream-200)]">
              <Button variant="ghost" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteProduct}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
