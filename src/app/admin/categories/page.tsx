'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BicameralHeading,
  MicroLabel,
  StatusPill,
  Button,
  Input,
} from '@/components/primitives';
import {
  getCategories,
  createCategory,
  saveCategory,
  deleteCategory,
  moveCategoryProducts,
  reorderCategories,
} from '@/lib/data/queries';
import { Category } from '@/lib/data/types';
import { serverSaveCategory, serverDeleteCategory } from '@/app/actions/admin-category-actions';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FolderTree,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle,
  X,
  Check,
} from 'lucide-react';

import { ImageUploader } from '@/components/admin/image-uploader';
import { deleteStorageFileByUrl } from '@/lib/utils/image-processor';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Role Authorization
  const userRole = 'Chief Curator';
  const canAddEdit = ['Chief Curator', 'Curator', 'Registrar', 'admin', 'Admin'].includes(userRole);
  const canDelete = ['Chief Curator', 'admin', 'Admin'].includes(userRole);

  // Toast Banner State
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);

  // Form Fields
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);
  const [sortOrder, setSortOrder] = React.useState(1);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [tempUploads, setTempUploads] = React.useState<string[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);

  // Delete Safeguard State
  const [deleteBlocked, setDeleteBlocked] = React.useState(false);
  const [targetMoveCategoryId, setTargetMoveCategoryId] = React.useState('');
  const [moveCount, setMoveCount] = React.useState(0);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCloseModal = async (type: 'add' | 'edit') => {
    if (tempUploads.length > 0) {
      await Promise.all(tempUploads.map((url) => deleteStorageFileByUrl(url)));
      setTempUploads([]);
    }
    if (type === 'add') setIsAddModalOpen(false);
    if (type === 'edit') setIsEditModalOpen(false);
    resetForm();
  };

  // Handle Add Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) {
      setErrorMessage('Please wait for image upload to complete.');
      return;
    }
    if (!canAddEdit) {
      setErrorMessage('Forbidden: Insufficient role permissions');
      return;
    }
    setErrorMessage('');
    if (!name.trim()) {
      setErrorMessage('Category name is required.');
      return;
    }

    const res = await createCategory({
      name: name.trim(),
      description: description.trim(),
      image: imageUrl.trim() || undefined,
      heroImage: imageUrl.trim() || '',
      isActive,
      sortOrder: Number(sortOrder) || categories.length + 1,
    });

    if (res.error || !res.category) {
      setErrorMessage(res.error || 'Failed to create category.');
      return;
    }

    // Server action check
    await serverSaveCategory('demo-admin-token', {
      id: res.category.id,
      name: name.trim(),
      description: description.trim(),
      heroImage: imageUrl.trim() || undefined,
      image: imageUrl.trim() || undefined,
      isActive,
      sortOrder: Number(sortOrder) || categories.length + 1,
    });

    setTempUploads([]);
    setIsAddModalOpen(false);
    resetForm();
    showToast(`Category "${name.trim()}" created successfully.`);
    await loadData();
  };

  // Handle Edit Category
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) {
      setErrorMessage('Please wait for image upload to complete.');
      return;
    }
    if (!selectedCategory) return;
    if (!canAddEdit) {
      setErrorMessage('Forbidden: Insufficient role permissions');
      return;
    }
    setErrorMessage('');

    // If image replaced, delete old image from storage
    const oldImg = selectedCategory.image || selectedCategory.heroImage;
    if (oldImg && oldImg !== imageUrl && oldImg.includes('firebasestorage')) {
      await deleteStorageFileByUrl(oldImg);
    }

    const updatedCat: Category = {
      ...selectedCategory,
      name: name.trim(),
      description: description.trim(),
      heroImage: imageUrl.trim() || selectedCategory.heroImage,
      image: imageUrl.trim() || selectedCategory.image,
      isActive,
      sortOrder: Number(sortOrder),
      order: Number(sortOrder),
    };

    await saveCategory(updatedCat);
    await serverSaveCategory('demo-admin-token', updatedCat);

    setTempUploads([]);
    setIsEditModalOpen(false);
    resetForm();
    showToast(`Category "${name.trim()}" updated successfully.`);
    await loadData();
  };

  // Open Edit Modal
  const openEditModal = (cat: Category) => {
    setSelectedCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImageUrl(cat.image || cat.heroImage || '');
    setIsActive(cat.isActive !== false);
    setSortOrder(cat.sortOrder || cat.order || 1);
    setErrorMessage('');
    setTempUploads([]);
    setIsUploading(false);
    setIsEditModalOpen(true);
  };

  // Open Delete Modal & Check Safeguard
  const openDeleteModal = (cat: Category) => {
    if (!canDelete) {
      showToast('Forbidden: Only Chief Curator or Admin can delete categories.');
      return;
    }
    setSelectedCategory(cat);
    setErrorMessage('');

    if (cat.pieceCount > 0) {
      setDeleteBlocked(true);
      setMoveCount(cat.pieceCount);
      const otherCats = categories.filter((c) => c.id !== cat.id);
      if (otherCats.length > 0) {
        setTargetMoveCategoryId(otherCats[0].id);
      }
    } else {
      setDeleteBlocked(false);
    }
    setIsDeleteModalOpen(true);
  };

  // Handle Delete / Move & Delete
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    if (!canDelete) {
      setErrorMessage('Forbidden: Only Chief Curator or Admin can delete categories');
      return;
    }

    if (deleteBlocked) {
      if (!targetMoveCategoryId) {
        setErrorMessage('Please select a destination category to move products.');
        return;
      }
      await moveCategoryProducts(selectedCategory.id, targetMoveCategoryId);
    }

    const res = await deleteCategory(selectedCategory.id);
    await serverDeleteCategory('demo-admin-token', selectedCategory.id);

    if (res.success) {
      setIsDeleteModalOpen(false);
      resetForm();
      showToast(`Category "${selectedCategory.name}" deleted successfully.`);
      await loadData();
    } else {
      setErrorMessage(res.message);
    }
  };

  // Reorder Handler
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const newCats = [...categories];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newCats.length) return;

    const temp = newCats[index];
    newCats[index] = newCats[targetIdx];
    newCats[targetIdx] = temp;

    const orderedIds = newCats.map((c) => c.id);
    await reorderCategories(orderedIds);
    await loadData();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setImageUrl('');
    setIsActive(true);
    setSortOrder(categories.length + 1);
    setSelectedCategory(null);
    setErrorMessage('');
    setDeleteBlocked(false);
    setTempUploads([]);
    setIsUploading(false);
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 select-none pb-12">
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[var(--color-cream-200)] pb-6">
        <div>
          <MicroLabel className="text-[var(--color-gold-600)] mb-1">CURATORIAL VITRINES</MicroLabel>
          <BicameralHeading italicPart="Category" romanPart="Management" size="xl" />
        </div>

        {canAddEdit && (
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              resetForm();
              setSortOrder(categories.length + 1);
              setIsAddModalOpen(true);
            }}
            className="min-h-[44px] cursor-pointer"
          >
            ADD CATEGORY
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-4 rounded-[var(--radius-card)]">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search category by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-1.5 text-xs"
          />
        </div>
        <div className="text-xs text-[var(--color-text-500)] flex items-center gap-2">
          <span>Total Categories:</span>
          <strong className="text-[var(--color-text-900)]">{categories.length}</strong>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] rounded-[var(--radius-card)] overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-cream-200)] bg-[var(--color-cream-50)]">
              <th className="py-3 px-4"><MicroLabel>THUMBNAIL & NAME</MicroLabel></th>
              <th className="py-3 px-4 text-center"><MicroLabel>PRODUCTS</MicroLabel></th>
              <th className="py-3 px-4 text-center"><MicroLabel>STATUS</MicroLabel></th>
              <th className="py-3 px-4 text-center"><MicroLabel>SORT ORDER</MicroLabel></th>
              <th className="py-3 px-4 text-right"><MicroLabel>ACTIONS</MicroLabel></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-cream-200)] text-xs font-sans">
            {filteredCategories.map((cat, idx) => {
              const displayImg = cat.image || cat.heroImage || `/images/categories/${cat.slug}.jpg`;
              return (
                <tr key={cat.id} className="h-16 hover:bg-[var(--color-cream-50)] transition-colors">
                  {/* Thumbnail & Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded overflow-hidden border border-[var(--color-cream-300)] shrink-0 bg-[#FAF7F2]">
                        <Image
                          src={displayImg}
                          alt={cat.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <Link
                          href={`/admin/categories/${cat.id}`}
                          className="font-serif text-sm text-[var(--color-text-900)] font-medium hover:text-[var(--color-gold-600)] transition-colors"
                        >
                          {cat.name}
                        </Link>
                        <p className="text-[11px] text-[var(--color-text-500)] line-clamp-1 max-w-xs">
                          {cat.description || cat.tagline}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Product Count */}
                  <td className="py-3 px-4 text-center font-medium">
                    <Link
                      href={`/admin/categories/${cat.id}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--color-cream-100)] text-[var(--color-text-700)] hover:bg-[var(--color-gold-100)] hover:text-[var(--color-gold-700)] transition-colors"
                    >
                      <FolderTree className="w-3.5 h-3.5 text-[var(--color-gold-600)]" />
                      <span>{cat.pieceCount} pieces</span>
                    </Link>
                  </td>

                  {/* Active / Hidden Status */}
                  <td className="py-3 px-4 text-center">
                    {cat.isActive !== false ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Eye className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <EyeOff className="w-3 h-3" /> Hidden
                      </span>
                    )}
                  </td>

                  {/* Sort Order Controls */}
                  <td className="py-3 px-4 text-center font-mono">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleMoveOrder(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-[var(--color-text-400)] hover:text-[var(--color-text-900)] disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold">{cat.sortOrder || cat.order || idx + 1}</span>
                      <button
                        onClick={() => handleMoveOrder(idx, 'down')}
                        disabled={idx === categories.length - 1}
                        className="p-1 text-[var(--color-text-400)] hover:text-[var(--color-text-900)] disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {canAddEdit && (
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-2 text-[var(--color-text-500)] hover:text-[var(--color-gold-600)] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center rounded hover:bg-[var(--color-cream-100)]"
                          title="Edit Category"
                          aria-label={`Edit category ${cat.name}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => openDeleteModal(cat)}
                          className="p-2 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center rounded hover:bg-rose-50"
                          title="Delete Category"
                          aria-label={`Delete category ${cat.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal: Add Category */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded-[var(--radius-card)] max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-medium text-[var(--color-text-900)]">Add New Category</h3>
            {errorMessage && (
              <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-[var(--color-text-700)] font-medium mb-1">Category Name *</label>
                <Input
                  placeholder="e.g. Navaratna Ornaments"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-[var(--color-text-700)] font-medium mb-1">Description</label>
                <textarea
                  placeholder="Brief description of craft and motif..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[var(--color-cream-50)] border border-[var(--color-cream-300)] rounded p-2 text-xs text-[var(--color-text-900)] outline-none focus:border-[var(--color-gold-500)] h-20"
                />
              </div>
              
              {/* Category Image Uploader */}
              <div>
                <label className="block text-[var(--color-text-700)] font-medium mb-1">Category Image</label>
                <ImageUploader
                  folder="categories"
                  entityId={name ? name.toLowerCase().replace(/\s+/g, '-') : 'new-category'}
                  images={imageUrl ? [imageUrl] : []}
                  onChange={(imgs: string[]) => setImageUrl(imgs[0] || '')}
                  maxImages={1}
                  onNewTempUpload={(url: string) => setTempUploads((prev) => [...prev, url])}
                  onUploadingStateChange={setIsUploading}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="accent-[var(--color-gold-600)]"
                  />
                  <span>Active (Visible on Storefront)</span>
                </label>
                <div className="w-24">
                  <Input
                    type="number"
                    placeholder="Sort"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-cream-200)]">
                <Button variant="ghost" size="sm" type="button" onClick={() => handleCloseModal('add')}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isUploading}>
                  {isUploading ? 'Uploading Image...' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Category */}
      {isEditModalOpen && selectedCategory && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded-[var(--radius-card)] max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-medium text-[var(--color-text-900)]">Edit Category: {selectedCategory.name}</h3>
            {errorMessage && (
              <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            <form onSubmit={handleUpdateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-[var(--color-text-700)] font-medium mb-1">Category Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-[var(--color-text-700)] font-medium mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[var(--color-cream-50)] border border-[var(--color-cream-300)] rounded p-2 text-xs text-[var(--color-text-900)] outline-none focus:border-[var(--color-gold-500)] h-20"
                />
              </div>

              {/* Category Image Uploader */}
              <div>
                <label className="block text-[var(--color-text-700)] font-medium mb-1">Category Image</label>
                <ImageUploader
                  folder="categories"
                  entityId={selectedCategory.id}
                  images={imageUrl ? [imageUrl] : []}
                  onChange={(imgs: string[]) => setImageUrl(imgs[0] || '')}
                  maxImages={1}
                  onNewTempUpload={(url: string) => setTempUploads((prev) => [...prev, url])}
                  onUploadingStateChange={setIsUploading}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="accent-[var(--color-gold-600)]"
                  />
                  <span>Active (Visible on Storefront)</span>
                </label>
                <div className="w-24">
                  <Input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-cream-200)]">
                <Button variant="ghost" size="sm" type="button" onClick={() => handleCloseModal('edit')}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isUploading}>
                  {isUploading ? 'Uploading Image...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Category Safeguard */}
      {isDeleteModalOpen && selectedCategory && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded-[var(--radius-card)] max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-700">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif text-lg font-medium text-[var(--color-text-900)]">
                {deleteBlocked ? 'Cannot Delete Category' : 'Delete Category'}
              </h3>
            </div>

            {deleteBlocked ? (
              <div className="space-y-4 text-xs text-[var(--color-text-700)]">
                <p className="bg-amber-50 border border-amber-200 p-3 rounded text-amber-800">
                  Category <strong>"{selectedCategory.name}"</strong> currently contains <strong>{moveCount} product(s)</strong>.
                  You must move these products to another category before deleting.
                </p>

                <div>
                  <label className="block font-medium mb-1 text-[var(--color-text-900)]">
                    Move all {moveCount} products to:
                  </label>
                  <select
                    value={targetMoveCategoryId}
                    onChange={(e) => setTargetMoveCategoryId(e.target.value)}
                    className="w-full bg-[var(--color-cream-50)] border border-[var(--color-cream-300)] rounded p-2 text-xs outline-none focus:border-[var(--color-gold-500)]"
                  >
                    {categories
                      .filter((c) => c.id !== selectedCategory.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.pieceCount} pieces)
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--color-text-700)]">
                Are you sure you want to delete category <strong>"{selectedCategory.name}"</strong>? This action cannot be undone.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-cream-200)]">
              <Button variant="ghost" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteCategory}>
                {deleteBlocked ? 'Move Products & Delete' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
