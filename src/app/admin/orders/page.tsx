'use client';

import * as React from 'react';
import Link from 'next/link';
import { BicameralHeading, MicroLabel, Price, StatusPill, Input } from '@/components/primitives';
import { getOrders } from '@/lib/data/queries';
import { Order } from '@/lib/data/types';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch = ord.id.toLowerCase().includes(search.toLowerCase()) || ord.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ord.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 select-none">
      <div className="border-b border-[var(--color-cream-200)] pb-6">
        <MicroLabel className="text-[var(--color-gold-600)] mb-1">RESERVATION REGISTER</MicroLabel>
        <BicameralHeading italicPart="Order" romanPart="Register" size="xl" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-4 rounded-[var(--radius-card)]">
        <div className="w-full sm:w-80">
          <Input placeholder="Search order ID or patron name..." value={search} onChange={(e) => setSearch(e.target.value)} className="py-1.5 text-xs" />
        </div>

        <div className="flex items-center gap-3 text-xs font-sans">
          <span className="text-[var(--color-text-500)]">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[var(--color-cream-100)] border border-[var(--color-cream-300)] rounded px-3 py-1.5 text-xs text-[var(--color-text-900)] outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] rounded-[var(--radius-card)] overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-cream-200)] bg-[var(--color-cream-50)]">
              <th className="py-3 px-4"><MicroLabel>ORDER ID</MicroLabel></th>
              <th className="py-3 px-4"><MicroLabel>PATRON</MicroLabel></th>
              <th className="py-3 px-4"><MicroLabel>STATUS</MicroLabel></th>
              <th className="py-3 px-4"><MicroLabel>DATE</MicroLabel></th>
              <th className="py-3 px-4 text-right"><MicroLabel>TOTAL</MicroLabel></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-cream-200)] text-xs font-sans">
            {filteredOrders.map((ord) => {
              const statusVariant =
                ord.status === 'delivered' ? 'ok' : ord.status === 'shipped' ? 'info' : ord.status === 'confirmed' || ord.status === 'pending' ? 'warn' : 'risk';

              return (
                <tr
                  key={ord.id}
                  className="h-16 hover:bg-[var(--color-cream-50)] transition-colors cursor-pointer group"
                  onClick={() => (window.location.href = `/admin/orders/${ord.id}`)}
                >
                  <td className="py-3 px-4 font-semibold text-[var(--color-text-900)] group-hover:text-[var(--color-gold-600)] transition-colors">
                    #{ord.id}
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-900)] font-medium">{ord.customerName}</td>
                  <td className="py-3 px-4">
                    <StatusPill variant={statusVariant} dot>
                      {ord.status}
                    </StatusPill>
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-500)]">{ord.placedAt}</td>
                  <td className="py-3 px-4 text-right font-semibold">
                    <Price amount={ord.total} size="sm" />
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
