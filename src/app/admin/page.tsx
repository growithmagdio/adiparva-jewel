'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  BicameralHeading,
  MicroLabel,
  StatusPill,
  Price,
  Card,
  Skeleton,
} from '@/components/primitives';
import dynamic from 'next/dynamic';
import { StatCard } from '@/components/admin/stat-card';
import { InventorySnapshot } from '@/components/admin/inventory-snapshot';

const RevenueChart = dynamic(
  () => import('@/components/admin/revenue-chart').then((mod) => mod.RevenueChart),
  { ssr: false }
);
import { getDashboardStats, getOrders, getProducts, getInventoryStats } from '@/lib/data/queries';
import { DashboardStats, Order, Product } from '@/lib/data/types';
import { DollarSign, ShoppingBag, Users, Gem, ArrowRight, Package, Boxes, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [invStats, setInvStats] = React.useState<{
    totalProducts: number;
    totalStockUnits: number;
    lowStockCount: number;
    soldOutCount: number;
  } | null>(null);
  const [recentOrders, setRecentOrders] = React.useState<Order[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const [sData, iData, oData, pData] = await Promise.all([
        getDashboardStats(),
        getInventoryStats(),
        getOrders(),
        getProducts({ status: 'all' }),
      ]);
      setStats(sData);
      setInvStats(iData);
      setRecentOrders(oData.slice(0, 4));
      setProducts(pData);
      setLoading(false);
    }
    loadDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {/* Dashboard Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[var(--color-cream-200)] pb-6">
        <div>
          <MicroLabel className="text-[var(--color-gold-600)] mb-1">OVERVIEW</MicroLabel>
          <BicameralHeading italicPart="Administrative" romanPart="Insights" size="xl" />
        </div>

        <div className="text-left sm:text-right">
          <MicroLabel className="mb-1">SESSION ACTIVITY</MicroLabel>
          <div className="font-sans font-semibold text-[15px] text-[var(--color-text-900)]">
            April 30, 2026 • Live Monitoring
          </div>
        </div>
      </div>

      {/* Main Revenue & Order Stat Cards */}
      {loading || !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rect" className="h-[180px] w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="TOTAL REVENUE"
            value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
            delta={stats.revenueDelta}
            icon={DollarSign}
            index={0}
          />
          <StatCard
            label="ACTIVE ORDERS"
            value={stats.activeOrdersCount.toString()}
            delta={stats.activeOrdersDelta}
            icon={ShoppingBag}
            isEmphasis={true}
            index={1}
          />
          <StatCard
            label="TOTAL CUSTOMERS"
            value={stats.totalCustomersCount.toString()}
            delta={stats.totalCustomersDelta}
            icon={Users}
            index={2}
          />
          <StatCard
            label="MASTERPIECES"
            value={stats.masterpiecesCount.toString()}
            delta={stats.masterpiecesDelta}
            icon={Gem}
            index={3}
          />
        </div>
      )}

      {/* Stock Inventory Summary Row */}
      {loading || !invStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rect" className="h-[120px] w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/admin/products" className="block group">
            <Card className="p-5 flex items-center justify-between border-l-4 border-l-[var(--color-gold-600)] hover:border-[var(--color-gold-500)] transition-all">
              <div>
                <MicroLabel className="text-[var(--color-text-500)]">TOTAL PRODUCTS</MicroLabel>
                <div className="font-serif text-2xl font-semibold text-[var(--color-text-900)] mt-1">
                  {invStats.totalProducts}
                </div>
                <span className="text-[11px] text-[var(--color-gold-600)] font-medium group-hover:underline mt-1 block">
                  View Catalogue →
                </span>
              </div>
              <div className="p-3 bg-[var(--color-cream-100)] rounded-full text-[var(--color-gold-600)]">
                <Package className="w-5 h-5" />
              </div>
            </Card>
          </Link>

          <Link href="/admin/inventory" className="block group">
            <Card className="p-5 flex items-center justify-between border-l-4 border-l-[var(--color-gold-600)] hover:border-[var(--color-gold-500)] transition-all">
              <div>
                <MicroLabel className="text-[var(--color-text-500)]">TOTAL STOCK UNITS</MicroLabel>
                <div className="font-serif text-2xl font-semibold text-[var(--color-text-900)] mt-1">
                  {invStats.totalStockUnits}
                </div>
                <span className="text-[11px] text-[var(--color-gold-600)] font-medium group-hover:underline mt-1 block">
                  Manage Inventory →
                </span>
              </div>
              <div className="p-3 bg-[var(--color-cream-100)] rounded-full text-[var(--color-gold-600)]">
                <Boxes className="w-5 h-5" />
              </div>
            </Card>
          </Link>

          <Link href="/admin/inventory?tab=low_stock" className="block group">
            <Card className="p-5 flex items-center justify-between border-l-4 border-l-[var(--color-warn-fg)] hover:border-[var(--color-warn-fg)] transition-all">
              <div>
                <MicroLabel className="text-[var(--color-warn-fg)] font-semibold">LOW-STOCK COUNT</MicroLabel>
                <div className="font-serif text-2xl font-semibold text-[var(--color-warn-fg)] mt-1">
                  {invStats.lowStockCount}
                </div>
                <span className="text-[11px] text-[var(--color-warn-fg)] font-medium group-hover:underline mt-1 block">
                  View Low Stock Tab →
                </span>
              </div>
              <div className="p-3 bg-[var(--color-warn-bg)] rounded-full text-[var(--color-warn-fg)]">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </Card>
          </Link>

          <Link href="/admin/inventory?tab=sold_out" className="block group">
            <Card className="p-5 flex items-center justify-between border-l-4 border-l-[var(--color-risk-fg)] hover:border-[var(--color-risk-fg)] transition-all">
              <div>
                <MicroLabel className="text-[var(--color-risk-fg)] font-semibold">SOLD-OUT COUNT</MicroLabel>
                <div className="font-serif text-2xl font-semibold text-[var(--color-risk-fg)] mt-1">
                  {invStats.soldOutCount}
                </div>
                <span className="text-[11px] text-[var(--color-risk-fg)] font-medium group-hover:underline mt-1 block">
                  View Sold Out Tab →
                </span>
              </div>
              <div className="p-3 bg-[var(--color-risk-bg)] rounded-full text-[var(--color-risk-fg)]">
                <AlertOctagon className="w-5 h-5" />
              </div>
            </Card>
          </Link>
        </div>
      )}

      {/* Main Grid: Recent Activity (2/3) & Inventory Snapshot (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Recent Activity Table Card (Left ~2/3) */}
        <Card padded={false} className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-medium text-[1.375rem] text-[var(--color-text-900)]">
                Recent Activity
              </h3>
            </div>

            {loading ? (
              <div className="space-y-3 py-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} variant="text" className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-cream-200)]">
                      <th className="py-3 px-3">
                        <MicroLabel>ORDER</MicroLabel>
                      </th>
                      <th className="py-3 px-3">
                        <MicroLabel>CUSTOMER</MicroLabel>
                      </th>
                      <th className="py-3 px-3">
                        <MicroLabel>STATUS</MicroLabel>
                      </th>
                      <th className="py-3 px-3 text-right">
                        <MicroLabel>TOTAL</MicroLabel>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-cream-200)]">
                    {recentOrders.map((order) => {
                      const statusVariant =
                        order.status === 'delivered'
                          ? 'ok'
                          : order.status === 'shipped'
                          ? 'info'
                          : order.status === 'confirmed' || order.status === 'pending'
                          ? 'warn'
                          : 'risk';

                      return (
                        <tr
                          key={order.id}
                          className="h-[68px] hover:bg-[var(--color-cream-50)] transition-colors cursor-pointer group"
                          onClick={() => window.location.href = `/admin/orders/${order.id}`}
                        >
                          <td className="py-4 px-3 font-sans font-medium text-sm text-[var(--color-text-900)] group-hover:text-[var(--color-gold-600)] transition-colors">
                            {order.id}
                          </td>
                          <td className="py-4 px-3 font-sans text-sm text-[var(--color-text-700)]">
                            {order.customerName}
                          </td>
                          <td className="py-4 px-3">
                            <StatusPill variant={statusVariant} dot>
                              {order.status}
                            </StatusPill>
                          </td>
                          <td className="py-4 px-3 text-right">
                            <Price amount={order.total} size="sm" className="font-sans font-medium" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Card Footer Link */}
          <div className="pt-4 border-t border-[var(--color-cream-200)] mt-4 text-right">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 font-sans font-medium text-xs text-[var(--color-gold-600)] hover:text-[var(--color-gold-700)] transition-colors"
            >
              <span>See the full register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Inventory Snapshot Widget (Right ~1/3) */}
        {loading ? (
          <Skeleton variant="rect" className="h-full w-full min-h-[380px]" />
        ) : (
          <InventorySnapshot products={products} />
        )}
      </div>

      {/* Below the Fold Charts */}
      <RevenueChart />
    </div>
  );
}
