'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BicameralHeading, MicroLabel, Price, StatusPill, Button, Input, Card } from '@/components/primitives';
import { getProducts, getCategories, moveProductsToCategory } from '@/lib/data/queries';
import { Product, Category } from '@/lib/data/types';
import { ProductFormModal } from '@/components/admin/product-form-modal';
import { DeleteProductDialog } from '@/components/admin/delete-product-dialog';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreVertical,
  FolderInput,
  Check,
  AlertCircle,
  X,
  Package,
} from 'lucide-react';

function AdminProductsContent() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<'name' | 'price' | 'stock' | 'date'>('date');

  // Role State (default Chief Curator)
  const userRole = 'Chief Curator';
  const canAddEdit = ['Chief Curator', 'Curator', 'Registrar', 'admin', 'Admin'].includes(userRole);
  const canDelete = ['Chief Curator', 'admin', 'Admin'].includes(userRole);

  // Modals State
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [productToEdit, setProductToEdit] = React.useState<Product | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null);

  // Mobile Dropdown Menu State
  const [activeMobileMenuId, setActiveMobileMenuId] = React.useState<string | null>(null);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [bulkMoveCatId, setBulkMoveCatId] = React.useState<string>('');

  // Toast Banner State
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    const [prods, cats] = await Promise.all([
      getProducts({ status: 'all' }),
      getCategories({ activeOnly: false }),
    ]);
    setProducts(prods);
    setCategories(cats);
    if (cats.length > 0) setBulkMoveCatId(cats[0].id);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const categoryMap = React.useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  // Filter & Sort Products
  const filteredProducts = React.useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.artisanCluster.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
        const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;

        return matchesSearch && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'price') return b.price - a.price;
        if (sortBy === 'stock') return b.totalStock - a.totalStock;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [products, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // Bulk Checkbox Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkMoveCategory = async () => {
    if (selectedIds.length === 0 || !bulkMoveCatId) return;
    const movedCount = await moveProductsToCategory(selectedIds, bulkMoveCatId);
    const targetCatName = categoryMap.get(bulkMoveCatId) || 'Category';

    setProducts((prev) =>
      prev.map((p) => (selectedIds.includes(p.id) ? { ...p, categoryId: bulkMoveCatId } : p))
    );

    showToast(`Successfully moved ${movedCount} piece(s) to ${targetCatName}.`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (!canDelete) {
      showToast('Forbidden: Only Chief Curator or Admin can delete products.');
      return;
    }
    if (selectedIds.length === 0) return;

    // Remove selected products locally
    setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
    showToast(`Processed bulk deletion for ${selectedIds.length} piece(s).`);
    setSelectedIds([]);
  };

  // Open Add Modal
  const openAddModal = () => {
    setProductToEdit(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (p: Product) => {
    setProductToEdit(p);
    setIsFormModalOpen(true);
    setActiveMobileMenuId(null);
  };

  // Open Delete Dialog
  const openDeleteDialog = (p: Product) => {
    setProductToDelete(p);
    setIsDeleteDialogOpen(true);
    setActiveMobileMenuId(null);
  };

  return (
    <div className="space-y-8 select-none">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#5C1A1B] text-[#FBF7EE] border border-[#B8923A] px-4 py-3 rounded-[var(--radius-card)] shadow-2xl font-sans text-xs flex items-center gap-3 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-[#FBF7EE]/60 hover:text-[#FBF7EE]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[var(--color-cream-200)] pb-6">
        <div>
          <MicroLabel className="text-[var(--color-gold-600)] mb-1">CATALOG REPOSITORY</MicroLabel>
          <BicameralHeading italicPart="The" romanPart="Collection" size="xl" />
        </div>

        {canAddEdit && (
          <Button
            variant="primary"
            size="md"
            onClick={openAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="min-h-[44px] px-6 cursor-pointer shrink-0"
          >
            Add Product
          </Button>
        )}
      </div>

      {/* Filter, Search & Sort Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-4 rounded-[var(--radius-card)] shadow-xs">
        <div className="w-full lg:w-80 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-500)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, code, or cluster..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--color-cream-100)] border border-[var(--color-cream-200)] rounded text-xs text-[var(--color-text-900)] placeholder-[var(--color-text-400)] outline-none focus:border-[var(--color-gold-500)]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-sans">
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--color-text-500)]">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[var(--color-cream-100)] border border-[var(--color-cream-300)] rounded px-2.5 py-1.5 text-xs text-[var(--color-text-900)] outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[var(--color-text-500)]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[var(--color-cream-100)] border border-[var(--color-cream-300)] rounded px-2.5 py-1.5 text-xs text-[var(--color-text-900)] outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="live">Live</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[var(--color-text-500)]">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[var(--color-cream-100)] border border-[var(--color-cream-300)] rounded px-2.5 py-1.5 text-xs text-[var(--color-text-900)] outline-none"
            >
              <option value="date">Date Added (Newest)</option>
              <option value="name">Name (A-Z)</option>
              <option value="price">Price (High-Low)</option>
              <option value="stock">Stock (High-Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Controls (When >= 1 item selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-[#5C1A1B] text-[#FBF7EE] p-3 px-5 rounded-[var(--radius-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <span className="font-sans text-xs font-medium">
            <strong>{selectedIds.length}</strong> product(s) selected
          </span>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] opacity-80">Move to:</span>
              <select
                value={bulkMoveCatId}
                onChange={(e) => setBulkMoveCatId(e.target.value)}
                className="bg-[#FBF7EE] text-[#2A1E17] text-xs rounded px-2 py-1 outline-none font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleBulkMoveCategory}
                className="px-3 py-1 bg-[#B8923A] text-[#2A1E17] font-semibold rounded text-xs hover:bg-[#d9a441] transition-colors cursor-pointer min-h-[36px]"
              >
                Move
              </button>
            </div>

            {canDelete && (
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-700 text-white font-semibold rounded text-xs hover:bg-red-800 transition-colors cursor-pointer min-h-[36px] flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Desktop Product Table (1440px) */}
      <div className="hidden lg:block bg-[var(--color-surface)] border border-[var(--color-cream-200)] rounded-[var(--radius-card)] overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-cream-200)] bg-[var(--color-cream-50)]">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-[var(--color-cream-300)] cursor-pointer"
                />
              </th>
              <th className="py-3 px-4"><MicroLabel>PIECE & CODE</MicroLabel></th>
              <th className="py-3 px-4"><MicroLabel>CATEGORY</MicroLabel></th>
              <th className="py-3 px-4"><MicroLabel>PRICE</MicroLabel></th>
              <th className="py-3 px-4"><MicroLabel>TOTAL STOCK</MicroLabel></th>
              <th className="py-3 px-4"><MicroLabel>STATUS</MicroLabel></th>
              <th className="py-3 px-4 text-right"><MicroLabel>ACTIONS</MicroLabel></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-cream-200)] text-xs font-sans">
            {filteredProducts.map((p) => {
              const statusVariant = p.status === 'live' ? 'ok' : p.status === 'draft' ? 'warn' : 'risk';
              const catName = categoryMap.get(p.categoryId) || 'Uncategorized';
              const isSelected = selectedIds.includes(p.id);

              return (
                <tr key={p.id} className={`h-16 hover:bg-[var(--color-cream-50)] transition-colors ${isSelected ? 'bg-[var(--color-cream-100)]/60' : ''}`}>
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectOne(p.id)}
                      className="rounded border-[var(--color-cream-300)] cursor-pointer"
                    />
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--color-cream-200)] rounded relative overflow-hidden shrink-0 border border-[var(--color-cream-300)]">
                        <Image src={p.images[0] || '/images/products/maharani-temple-necklace-1.jpg'} alt={p.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-serif text-sm font-medium text-[var(--color-text-900)]">
                          {p.name}
                        </p>
                        <span className="text-[10px] text-[var(--color-gold-600)] font-mono font-semibold">
                          {p.code || `AP-${p.id.slice(-6)}`}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-[var(--color-text-700)]">{catName}</td>

                  <td className="py-3 px-4">
                    <Price amount={p.price} size="sm" className="font-semibold text-[var(--color-text-900)]" />
                  </td>

                  <td className="py-3 px-4 font-semibold text-[var(--color-text-900)]">
                    <span className={p.totalStock <= (p.lowStockThreshold ?? 3) ? 'text-[var(--color-risk-fg)] font-bold' : ''}>
                      {p.totalStock} units
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <StatusPill variant={statusVariant} dot>
                      {p.status}
                    </StatusPill>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {canAddEdit && (
                        <button
                          onClick={() => openEditModal(p)}
                          className="group relative p-2 text-[var(--color-text-700)] hover:text-[var(--color-gold-600)] hover:bg-[var(--color-cream-100)] rounded transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label={`Edit ${p.name}`}
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[var(--color-ink-900)] text-[#FBF7EE] text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                            Edit
                          </span>
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => openDeleteDialog(p)}
                          className="group relative p-2 text-[var(--color-text-500)] hover:text-[var(--color-risk-fg)] hover:bg-[var(--color-risk-bg)] rounded transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label={`Delete ${p.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[var(--color-ink-900)] text-[#FBF7EE] text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                            Delete
                          </span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards (375px) */}
      <div className="lg:hidden space-y-4">
        {filteredProducts.map((p) => {
          const statusVariant = p.status === 'live' ? 'ok' : p.status === 'draft' ? 'warn' : 'risk';
          const catName = categoryMap.get(p.categoryId) || 'Uncategorized';
          const isSelected = selectedIds.includes(p.id);

          return (
            <Card key={p.id} className={`p-4 space-y-3 relative ${isSelected ? 'border-[var(--color-gold-500)]' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectOne(p.id)}
                    className="rounded border-[var(--color-cream-300)] cursor-pointer"
                  />
                  <div className="w-12 h-12 rounded bg-[var(--color-cream-200)] relative overflow-hidden border border-[var(--color-cream-300)] shrink-0">
                    <Image src={p.images[0] || '/images/products/maharani-temple-necklace-1.jpg'} alt={p.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-serif font-medium text-sm text-[var(--color-text-900)] leading-tight">{p.name}</h4>
                    <span className="font-sans text-[10px] text-[var(--color-gold-600)] font-mono font-semibold">{p.code || `AP-${p.id.slice(-6)}`}</span>
                  </div>
                </div>

                {/* Mobile Three-Dot Dropdown Menu */}
                <div className="relative">
                  <button
                    onClick={() => setActiveMobileMenuId(activeMobileMenuId === p.id ? null : p.id)}
                    className="p-2.5 text-[var(--color-text-700)] hover:bg-[var(--color-cream-200)] rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Product options menu"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {activeMobileMenuId === p.id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded shadow-xl py-1 z-30">
                      {canAddEdit && (
                        <button
                          onClick={() => openEditModal(p)}
                          className="w-full text-left px-3 py-2.5 text-xs text-[var(--color-text-900)] hover:bg-[var(--color-cream-100)] flex items-center gap-2 min-h-[44px]"
                        >
                          <Edit2 className="w-4 h-4 text-[var(--color-gold-600)]" />
                          <span>Edit Product</span>
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => openDeleteDialog(p)}
                          className="w-full text-left px-3 py-2.5 text-xs text-[var(--color-risk-fg)] hover:bg-[var(--color-risk-bg)] flex items-center gap-2 min-h-[44px]"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete Product</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--color-cream-200)] text-xs">
                <div>
                  <span className="text-[10px] text-[var(--color-text-500)] block">Category</span>
                  <span className="font-medium text-[var(--color-text-900)]">{catName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-500)] block">Price</span>
                  <Price amount={p.price} size="sm" className="font-semibold" />
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-500)] block">Stock</span>
                  <span className="font-semibold text-[var(--color-text-900)]">{p.totalStock} units</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Form Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        productToEdit={productToEdit}
        categories={categories}
        onSuccess={(updatedP) => {
          setProducts((prev) => {
            const idx = prev.findIndex((p) => p.id === updatedP.id);
            if (idx > -1) {
              const copy = [...prev];
              copy[idx] = updatedP;
              return copy;
            }
            return [updatedP, ...prev];
          });
          showToast(productToEdit ? 'Product updated successfully.' : 'Product created successfully.');
        }}
      />

      {/* Delete Dialog */}
      <DeleteProductDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        product={productToDelete}
        userRole={userRole}
        onSuccess={(deletedId, wasArchived) => {
          setProducts((prev) =>
            wasArchived
              ? prev.map((p) => (p.id === deletedId ? { ...p, status: 'archived' } : p))
              : prev.filter((p) => p.id !== deletedId)
          );
          showToast(
            wasArchived
              ? 'Product appears in past orders and was safely archived.'
              : 'Product deleted successfully.'
          );
        }}
      />
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <React.Suspense fallback={<div className="p-8">Loading catalogue...</div>}>
      <AdminProductsContent />
    </React.Suspense>
  );
}
