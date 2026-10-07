'use client';

import * as React from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductFormModal } from '@/components/admin/product-form-modal';
import { DeleteProductDialog } from '@/components/admin/delete-product-dialog';
import {
  BicameralHeading,
  MicroLabel,
  StatusPill,
  Button,
  Card,
  Skeleton,
} from '@/components/primitives';
import { getProducts, getCategories, getStockMovements } from '@/lib/data/queries';
import { Product, Category, StockMovement, StockMovementReason, ProductVariant } from '@/lib/data/types';
import { serverExecuteStockMovement } from '@/app/actions/admin-product-actions';
import {
  Search,
  Download,
  Plus,
  SlidersHorizontal,
  History as HistoryIcon,
  RotateCcw,
  AlertTriangle,
  X,
  Check,
  Boxes,
  Edit2,
  Trash2,
  MoreVertical,
} from 'lucide-react';

function StockInventoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTabParam = searchParams.get('tab') || 'all';

  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'all' | 'low_stock' | 'sold_out'>(
    activeTabParam as any
  );

  // Role Authorization
  const userRole = 'Chief Curator';
  const canAddEdit = ['Chief Curator', 'Curator', 'Registrar', 'admin', 'Admin'].includes(userRole);
  const canDelete = ['Chief Curator', 'admin', 'Admin'].includes(userRole);

  // Form & Delete Modal States
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [productToEdit, setProductToEdit] = React.useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null);
  const [activeMobileMenuId, setActiveMobileMenuId] = React.useState<string | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Restock / Adjust / History Modal States
  const [restockProduct, setRestockProduct] = React.useState<Product | null>(null);
  const [restockVariantId, setRestockVariantId] = React.useState<string>('');
  const [restockQty, setRestockQty] = React.useState<number>(5);
  const [restockNote, setRestockNote] = React.useState<string>('');
  const [restockLoading, setRestockLoading] = React.useState<boolean>(false);

  const [adjustProduct, setAdjustProduct] = React.useState<Product | null>(null);
  const [adjustVariantId, setAdjustVariantId] = React.useState<string>('');
  const [adjustQty, setAdjustQty] = React.useState<number>(-1);
  const [adjustReason, setAdjustReason] = React.useState<StockMovementReason>('adjustment');
  const [adjustNote, setAdjustNote] = React.useState<string>('');
  const [adjustError, setAdjustError] = React.useState<string>('');
  const [adjustLoading, setAdjustLoading] = React.useState<boolean>(false);

  const [historyProduct, setHistoryProduct] = React.useState<Product | null>(null);
  const [historyMovements, setHistoryMovements] = React.useState<StockMovement[]>([]);
  const [historyLoading, setHistoryLoading] = React.useState<boolean>(false);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    const [prods, cats] = await Promise.all([
      getProducts({ status: 'all' }),
      getCategories({ activeOnly: true }),
    ]);
    setProducts(prods.filter((p) => p.status !== 'archived'));
    setCategories(cats);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  React.useEffect(() => {
    if (['all', 'low_stock', 'sold_out'].includes(activeTabParam)) {
      setActiveTab(activeTabParam as any);
    }
  }, [activeTabParam]);

  const categoryMap = React.useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  // Tab Counts
  const counts = React.useMemo(() => {
    const all = products.length;
    const low_stock = products.filter((p) => {
      const threshold = p.lowStockThreshold ?? 3;
      return p.totalStock > 0 && p.totalStock <= threshold;
    }).length;
    const sold_out = products.filter((p) => p.totalStock === 0).length;
    return { all, low_stock, sold_out };
  }, [products]);

  // Filtered Products
  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
      // Tab filter
      const threshold = product.lowStockThreshold ?? 3;
      if (activeTab === 'low_stock' && !(product.totalStock > 0 && product.totalStock <= threshold)) {
        return false;
      }
      if (activeTab === 'sold_out' && product.totalStock !== 0) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesCode = (product.code || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCode) return false;
      }

      return true;
    });
  }, [products, activeTab, searchQuery]);

  const handleTabChange = (tab: 'all' | 'low_stock' | 'sold_out') => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`/admin/inventory?${params.toString()}`);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Product Name',
      'Product Code',
      'Category',
      'Variant SKU',
      'Variant Label',
      'Variant Stock',
      'Total Stock',
      'Price (INR)',
      'Status',
      'Stock Health',
    ];

    const rows: string[][] = [];

    products.forEach((p) => {
      const catName = categoryMap.get(p.categoryId) || 'Uncategorized';
      const threshold = p.lowStockThreshold ?? 3;
      const health =
        p.totalStock === 0 ? 'Sold out' : p.totalStock <= threshold ? 'Low stock' : 'In stock';

      p.variants.forEach((v) => {
        rows.push([
          `"${p.name.replace(/"/g, '""')}"`,
          `"${p.code || ''}"`,
          `"${catName}"`,
          `"${v.sku}"`,
          `"${v.label.replace(/"/g, '""')}"`,
          v.stock.toString(),
          p.totalStock.toString(),
          p.price.toString(),
          p.status,
          health,
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `adi_parva_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Restock Execution
  const openRestock = (product: Product) => {
    setRestockProduct(product);
    setRestockVariantId(product.variants[0]?.id || '');
    setRestockQty(5);
    setRestockNote('');
  };

  const submitRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct || restockQty <= 0) return;
    setRestockLoading(true);

    const token = 'demo-admin-token';
    const res = await serverExecuteStockMovement(token, {
      productId: restockProduct.id,
      variantId: restockVariantId,
      changeQty: restockQty,
      reason: 'restock',
      note: restockNote || 'Restock via Stock Inventory',
    });

    if (res.success) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === restockProduct.id) {
            const updatedVariants = p.variants.map((v) =>
              v.id === restockVariantId ? { ...v, stock: v.stock + restockQty } : v
            );
            const updatedTotal = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
            return { ...p, variants: updatedVariants, totalStock: updatedTotal };
          }
          return p;
        })
      );
      setRestockProduct(null);
    }
    setRestockLoading(false);
  };

  // Adjust Execution
  const openAdjust = (product: Product) => {
    setAdjustProduct(product);
    setAdjustVariantId(product.variants[0]?.id || '');
    setAdjustQty(-1);
    setAdjustReason('adjustment');
    setAdjustNote('');
    setAdjustError('');
  };

  const submitAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProduct) return;

    const targetVariant = adjustProduct.variants.find((v) => v.id === adjustVariantId) || adjustProduct.variants[0];
    const currentStock = targetVariant ? targetVariant.stock : 0;
    const newStock = currentStock + adjustQty;

    if (newStock < 0) {
      setAdjustError(`Stock cannot go below 0. (Current: ${currentStock}, Change: ${adjustQty})`);
      return;
    }

    setAdjustLoading(true);
    setAdjustError('');

    const token = 'demo-admin-token';
    const res = await serverExecuteStockMovement(token, {
      productId: adjustProduct.id,
      variantId: targetVariant.id,
      changeQty: adjustQty,
      reason: adjustReason,
      note: adjustNote,
    });

    if (res.success) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === adjustProduct.id) {
            const updatedVariants = p.variants.map((v) =>
              v.id === targetVariant.id ? { ...v, stock: newStock } : v
            );
            const updatedTotal = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
            return { ...p, variants: updatedVariants, totalStock: updatedTotal };
          }
          return p;
        })
      );
      setAdjustProduct(null);
    } else {
      setAdjustError(res.message || 'Failed to adjust stock');
    }
    setAdjustLoading(false);
  };

  // History Drawer / Modal
  const openHistory = async (product: Product) => {
    setHistoryProduct(product);
    setHistoryLoading(true);
    const movements = await getStockMovements(product.id);
    setHistoryMovements(movements);
    setHistoryLoading(false);
  };

  return (
    <div className="space-y-8">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-cream-200)] pb-6">
        <div>
          <MicroLabel className="text-[var(--color-gold-600)] mb-1">INVENTORY MANAGEMENT</MicroLabel>
          <BicameralHeading italicPart="Stock" romanPart="Inventory" size="xl" />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {canAddEdit && (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setProductToEdit(null);
                setIsFormModalOpen(true);
              }}
              className="inline-flex items-center gap-2 cursor-pointer shrink-0 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="md"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 cursor-pointer shrink-0 min-h-[44px]"
          >
            <Download className="w-4 h-4 text-[var(--color-gold-600)]" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tab Badges */}
        <div className="flex items-center space-x-2 border-b md:border-b-0 border-[var(--color-cream-200)] pb-2 md:pb-0 overflow-x-auto">
          {[
            { id: 'all', label: 'All', count: counts.all },
            { id: 'low_stock', label: 'Low Stock', count: counts.low_stock },
            { id: 'sold_out', label: 'Sold Out', count: counts.sold_out },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`px-4 py-2 rounded-[var(--radius-pill)] font-sans text-xs uppercase tracking-[0.08em] font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#5C1A1B] text-[#FBF7EE] shadow-sm'
                    : 'bg-[var(--color-cream-100)] text-[var(--color-text-700)] hover:bg-[var(--color-cream-200)]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-[#FBF7EE]/20 text-[#FBF7EE]' : 'bg-[var(--color-cream-300)] text-[var(--color-text-900)]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-500)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-cream-200)] rounded-[var(--radius-card)] text-xs text-[var(--color-text-900)] placeholder-[var(--color-text-400)] outline-none focus:border-[var(--color-gold-500)] transition-colors"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <Card padded={false} className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="text" className="h-14 w-full" />
          ))}
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Boxes className="w-10 h-10 text-[var(--color-gold-600)] mx-auto opacity-60" />
          <h4 className="font-serif text-lg font-medium text-[var(--color-text-900)]">No inventory pieces match</h4>
          <p className="text-xs text-[var(--color-text-500)]">Try adjusting your tab selection or search query.</p>
        </Card>
      ) : (
        <>
          {/* Desktop Table View (1440px) */}
          <div className="hidden lg:block bg-[var(--color-surface)] border border-[var(--color-cream-200)] rounded-[var(--radius-card)] overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-cream-100)] border-b border-[var(--color-cream-200)]">
                  <th className="py-3 px-4"><MicroLabel>PIECE & CODE</MicroLabel></th>
                  <th className="py-3 px-4"><MicroLabel>CATEGORY</MicroLabel></th>
                  <th className="py-3 px-4"><MicroLabel>VARIANT BREAKDOWN</MicroLabel></th>
                  <th className="py-3 px-4 text-center"><MicroLabel>TOTAL STOCK</MicroLabel></th>
                  <th className="py-3 px-4"><MicroLabel>STATUS</MicroLabel></th>
                  <th className="py-3 px-4 text-right"><MicroLabel>STOCK ACTIONS</MicroLabel></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-cream-200)]">
                {filteredProducts.map((product) => {
                  const catName = categoryMap.get(product.categoryId) || 'Uncategorized';
                  const threshold = product.lowStockThreshold ?? 3;
                  const isSoldOut = product.totalStock === 0;
                  const isLowStock = product.totalStock > 0 && product.totalStock <= threshold;

                  return (
                    <tr key={product.id} className="hover:bg-[var(--color-cream-50)] transition-colors">
                      {/* Product Name & Image */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-[56px] h-[56px] rounded-[var(--radius-card)] bg-[var(--color-cream-200)] relative overflow-hidden shrink-0 border border-[var(--color-cream-300)]">
                            <Image
                              src={product.images[0] || '/images/products/maharani-temple-necklace-1.jpg'}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-serif font-medium text-sm text-[var(--color-text-900)]">
                              {product.name}
                            </span>
                            <span className="font-sans text-[11px] font-semibold text-[var(--color-gold-600)] tracking-wider">
                              {product.code || `AP-${product.id.slice(-6)}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-sans text-xs text-[var(--color-text-700)]">
                        {catName}
                      </td>

                      {/* Variant Breakdown Chips */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {product.variants.map((v) => (
                            <span
                              key={v.id}
                              className={`px-2 py-0.5 rounded-[2px] font-sans text-[10px] border ${
                                v.stock === 0
                                  ? 'bg-[var(--color-risk-bg)] text-[var(--color-risk-fg)] border-[var(--color-risk-fg)]/30'
                                  : v.stock <= threshold
                                  ? 'bg-[var(--color-warn-bg)] text-[var(--color-warn-fg)] border-[var(--color-warn-fg)]/30'
                                  : 'bg-[var(--color-cream-100)] text-[var(--color-text-700)] border-[var(--color-cream-300)]'
                              }`}
                            >
                              {v.label}: <strong>{v.stock}</strong>
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Total Stock */}
                      <td className="py-3.5 px-4 text-center font-sans font-semibold text-sm text-[var(--color-text-900)]">
                        {product.totalStock}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {isSoldOut ? (
                          <StatusPill variant="risk" dot>
                            Sold out
                          </StatusPill>
                        ) : isLowStock ? (
                          <StatusPill variant="warn" dot>
                            Low stock
                          </StatusPill>
                        ) : (
                          <StatusPill variant="ok" dot>
                            In stock
                          </StatusPill>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {canAddEdit && (
                            <button
                              onClick={() => {
                                setProductToEdit(product);
                                setIsFormModalOpen(true);
                              }}
                              className="group relative p-2 text-[var(--color-text-700)] hover:text-[var(--color-gold-600)] hover:bg-[var(--color-cream-100)] rounded transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                              aria-label={`Edit ${product.name}`}
                            >
                              <Edit2 className="w-4 h-4" />
                              <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[var(--color-ink-900)] text-[#FBF7EE] text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                Edit
                              </span>
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => {
                                setProductToDelete(product);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="group relative p-2 text-[var(--color-text-500)] hover:text-[var(--color-risk-fg)] hover:bg-[var(--color-risk-bg)] rounded transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                              aria-label={`Delete ${product.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[var(--color-ink-900)] text-[#FBF7EE] text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                Delete
                              </span>
                            </button>
                          )}

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => openRestock(product)}
                            className="h-8 px-2.5 text-[10px] cursor-pointer min-h-[44px]"
                          >
                            + Restock
                          </Button>

                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openAdjust(product)}
                            className="h-8 px-2.5 text-[10px] cursor-pointer min-h-[44px]"
                          >
                            Adjust
                          </Button>

                          <button
                            onClick={() => openHistory(product)}
                            className="p-2 text-[var(--color-text-500)] hover:text-[var(--color-gold-600)] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title="View Stock History"
                          >
                            <HistoryIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards View (375px) */}
          <div className="lg:hidden space-y-4">
            {filteredProducts.map((product) => {
              const catName = categoryMap.get(product.categoryId) || 'Uncategorized';
              const threshold = product.lowStockThreshold ?? 3;
              const isSoldOut = product.totalStock === 0;
              const isLowStock = product.totalStock > 0 && product.totalStock <= threshold;

              return (
                <Card key={product.id} className="p-4 space-y-4 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-[var(--radius-card)] bg-[var(--color-cream-200)] relative overflow-hidden shrink-0 border border-[var(--color-cream-300)]">
                        <Image
                          src={product.images[0] || '/images/products/maharani-temple-necklace-1.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-sans text-[10px] font-semibold text-[var(--color-gold-600)] tracking-wider">
                            {product.code || `AP-${product.id.slice(-6)}`}
                          </span>
                          {isSoldOut ? (
                            <StatusPill variant="risk" dot>Sold out</StatusPill>
                          ) : isLowStock ? (
                            <StatusPill variant="warn" dot>Low stock</StatusPill>
                          ) : (
                            <StatusPill variant="ok" dot>In stock</StatusPill>
                          )}
                        </div>
                        <h4 className="font-serif font-medium text-base text-[var(--color-text-900)] truncate">
                          {product.name}
                        </h4>
                        <p className="font-sans text-xs text-[var(--color-text-500)]">{catName}</p>
                      </div>
                    </div>

                    {/* Mobile 3-Dot Options Menu */}
                    <div className="relative shrink-0 ml-1">
                      <button
                        onClick={() => setActiveMobileMenuId(activeMobileMenuId === product.id ? null : product.id)}
                        className="p-2.5 text-[var(--color-text-700)] hover:bg-[var(--color-cream-200)] rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                        aria-label="Product options menu"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeMobileMenuId === product.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded shadow-xl py-1 z-30">
                          {canAddEdit && (
                            <button
                              onClick={() => {
                                setProductToEdit(product);
                                setIsFormModalOpen(true);
                                setActiveMobileMenuId(null);
                              }}
                              className="w-full text-left px-3 py-2.5 text-xs text-[var(--color-text-900)] hover:bg-[var(--color-cream-100)] flex items-center gap-2 min-h-[44px] cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4 text-[var(--color-gold-600)]" />
                              <span>Edit Product</span>
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => {
                                setProductToDelete(product);
                                setIsDeleteDialogOpen(true);
                                setActiveMobileMenuId(null);
                              }}
                              className="w-full text-left px-3 py-2.5 text-xs text-[var(--color-risk-fg)] hover:bg-[var(--color-risk-bg)] flex items-center gap-2 min-h-[44px] cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete Product</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Variant Stock Breakdown */}
                  <div className="bg-[var(--color-cream-50)] p-2.5 rounded border border-[var(--color-cream-200)] space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-[var(--color-text-900)]">
                      <span>Total Stock</span>
                      <span>{product.totalStock} units</span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {product.variants.map((v) => (
                        <span
                          key={v.id}
                          className="px-2 py-0.5 rounded text-[10px] bg-[var(--color-cream-200)] text-[var(--color-text-700)]"
                        >
                          {v.label}: <strong>{v.stock}</strong>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-cream-200)]">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openRestock(product)}
                      className="flex-1 min-h-[44px] text-xs cursor-pointer"
                    >
                      + Restock
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openAdjust(product)}
                      className="flex-1 min-h-[44px] text-xs cursor-pointer"
                    >
                      Adjust
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openHistory(product)}
                      className="min-h-[44px] px-3 text-xs cursor-pointer"
                    >
                      History
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* RESTOCK MODAL */}
      {restockProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded-[var(--radius-card)] p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--color-cream-200)] pb-3">
              <h3 className="font-serif font-medium text-lg text-[var(--color-text-900)]">
                Restock Product
              </h3>
              <button onClick={() => setRestockProduct(null)} className="text-[var(--color-text-500)] hover:text-[var(--color-text-900)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitRestock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-700)] mb-1">
                  Product
                </label>
                <div className="text-sm font-serif font-medium text-[var(--color-text-900)]">
                  {restockProduct.name} ({restockProduct.code})
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-700)] mb-1">
                  Select Variant
                </label>
                <select
                  value={restockVariantId}
                  onChange={(e) => setRestockVariantId(e.target.value)}
                  className="w-full bg-[var(--color-cream-50)] border border-[var(--color-cream-300)] rounded p-2 text-xs text-[var(--color-text-900)] outline-none focus:border-[var(--color-gold-500)]"
                >
                  {restockProduct.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label} (Current: {v.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-700)] mb-1">
                  Quantity to Add (+)
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value) || 1)}
                  className="w-full bg-[var(--color-cream-50)] border border-[var(--color-cream-300)] rounded p-2 text-xs text-[var(--color-text-900)] outline-none focus:border-[var(--color-gold-500)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-700)] mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Atelier delivery intake..."
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  className="w-full bg-[var(--color-cream-50)] border border-[var(--color-cream-300)] rounded p-2 text-xs text-[var(--color-text-900)] outline-none focus:border-[var(--color-gold-500)]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-cream-200)]">
                <Button variant="ghost" size="sm" type="button" onClick={() => setRestockProduct(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={restockLoading}>
                  {restockLoading ? 'Restocking...' : 'Confirm Restock'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST STOCK MODAL */}
      {adjustProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded-[var(--radius-card)] p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--color-cream-200)] pb-3">
              <h3 className="font-serif font-medium text-lg text-[var(--color-text-900)]">
                Adjust Inventory Level
              </h3>
              <button onClick={() => setAdjustProduct(null)} className="text-[var(--color-text-500)] hover:text-[var(--color-text-900)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {adjustError && (
              <div className="p-3 bg-[var(--color-risk-bg)] border border-[var(--color-risk-fg)]/30 rounded text-xs text-[var(--color-risk-fg)] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{adjustError}</span>
              </div>
            )}

            <form onSubmit={submitAdjust} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-700)] mb-1">
                  Product
                </label>
                <div className="text-sm font-serif font-medium text-[var(--color-text-900)]">
                  {adjustProduct.name} ({adjustProduct.code})
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-700)] mb-1">
                  Select Variant
                </label>
                <select
                  value={adjustVariantId}
                  onChange={(e) => setAdjustVariantId(e.target.value)}
                  className="w-full bg-[var(--color-cream-50)] border border-[var(--color-cream-300)] rounded p-2 text-xs text-[var(--color-text-900)] outline-none focus:border-[var(--color-gold-500)]"
                >
                  {adjustProduct.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label} (Current: {v.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-700)] mb-1">
                  Stock Change (+ for add, - for decrease)
                </label>
                <input
                  type="number"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                  className="w-full bg-[var(--color-cream-50)] border border-[var(--color-cream-300)] rounded p-2 text-xs text-[var(--color-text-900)] outline-none focus:border-[var(--color-gold-500)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-700)] mb-1">
                  Reason <span className="text-[var(--color-risk-fg)]">*</span>
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value as StockMovementReason)}
                  className="w-full bg-[var(--color-cream-50)] border border-[var(--color-cream-300)] rounded p-2 text-xs text-[var(--color-text-900)] outline-none focus:border-[var(--color-gold-500)]"
                  required
                >
                  <option value="adjustment">Stock Adjustment</option>
                  <option value="damaged">Damaged / Defective</option>
                  <option value="restock">Restock Intake</option>
                  <option value="return">Return Restoration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-700)] mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Reasoning note..."
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full bg-[var(--color-cream-50)] border border-[var(--color-cream-300)] rounded p-2 text-xs text-[var(--color-text-900)] outline-none focus:border-[var(--color-gold-500)]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-cream-200)]">
                <Button variant="ghost" size="sm" type="button" onClick={() => setAdjustProduct(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={adjustLoading}>
                  {adjustLoading ? 'Applying...' : 'Apply Adjustment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK HISTORY DIALOG */}
      {historyProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded-[var(--radius-card)] p-6 max-w-2xl w-full shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[var(--color-cream-200)] pb-3 shrink-0">
              <div>
                <h3 className="font-serif font-medium text-lg text-[var(--color-text-900)]">
                  Stock Movement History
                </h3>
                <p className="text-xs text-[var(--color-gold-600)] font-semibold">
                  {historyProduct.name} ({historyProduct.code || `AP-${historyProduct.id.slice(-6)}`})
                </p>
              </div>
              <button onClick={() => setHistoryProduct(null)} className="text-[var(--color-text-500)] hover:text-[var(--color-text-900)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {historyLoading ? (
                <div className="space-y-2 py-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} variant="text" className="h-12 w-full" />
                  ))}
                </div>
              ) : historyMovements.length === 0 ? (
                <p className="text-xs text-[var(--color-text-500)] py-8 text-center">
                  No recorded stock movements for this product.
                </p>
              ) : (
                <div className="divide-y divide-[var(--color-cream-200)] border border-[var(--color-cream-200)] rounded">
                  {historyMovements.map((m) => {
                    const isPositive = m.changeQty > 0;
                    return (
                      <div key={m.id} className="p-3 bg-[var(--color-cream-50)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-sans">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[var(--color-text-900)]">
                              {m.variantLabel}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] uppercase tracking-wider font-semibold ${
                                m.reason === 'sale'
                                  ? 'bg-[var(--color-info-bg)] text-[var(--color-info-fg)]'
                                  : m.reason === 'return'
                                  ? 'bg-[var(--color-ok-bg)] text-[var(--color-ok-fg)]'
                                  : m.reason === 'damaged'
                                  ? 'bg-[var(--color-risk-bg)] text-[var(--color-risk-fg)]'
                                  : 'bg-[var(--color-warn-bg)] text-[var(--color-warn-fg)]'
                              }`}
                            >
                              {m.reason}
                            </span>
                            {m.orderId && (
                              <span className="font-mono text-[10px] text-[var(--color-gold-600)]">
                                #{m.orderId}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[var(--color-text-500)]">
                            {m.note || 'No notes'} • Done by {m.adminName}
                          </p>
                          <p className="text-[10px] text-[var(--color-text-400)]">
                            {new Date(m.createdAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={`font-semibold text-sm ${
                              isPositive ? 'text-[var(--color-ok-fg)]' : 'text-[var(--color-risk-fg)]'
                            }`}
                          >
                            {isPositive ? `+${m.changeQty}` : m.changeQty}
                          </div>
                          <div className="text-[11px] text-[var(--color-text-500)]">
                            {m.stockBefore} → <strong>{m.stockAfter}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[var(--color-cream-200)] text-right shrink-0">
              <Button variant="ghost" size="sm" onClick={() => setHistoryProduct(null)}>
                Close History
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Product Form Modal (Add / Edit) */}
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

      {/* Delete Product Dialog */}
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

export default function StockInventoryPage() {
  return (
    <React.Suspense fallback={<div className="p-8">Loading inventory...</div>}>
      <StockInventoryContent />
    </React.Suspense>
  );
}
