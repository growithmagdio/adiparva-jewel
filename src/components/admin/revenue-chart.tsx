'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, MicroLabel, Price } from '@/components/primitives';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const chartData = [
  { day: 'Apr 01', revenue: 45000 },
  { day: 'Apr 05', revenue: 38000 },
  { day: 'Apr 10', revenue: 85000 },
  { day: 'Apr 15', revenue: 64000 },
  { day: 'Apr 20', revenue: 52000 },
  { day: 'Apr 25', revenue: 78000 },
  { day: 'Apr 30', revenue: 218700 },
];

const categoryMix = [
  { name: 'Temple Jewellery', percentage: 38, count: '8 pieces' },
  { name: 'Bridal Sets', percentage: 24, count: '6 pieces' },
  { name: 'Kundan & Polki', percentage: 20, count: '11 pieces' },
  { name: 'Haarams & Bangles', percentage: 18, count: '11 pieces' },
];

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--color-ink-900)] text-white p-3 rounded-[var(--radius-card)] shadow-xl border border-[var(--color-ink-700)] text-xs font-sans space-y-1">
        <p className="font-semibold text-[var(--color-gold-400)]">{label}</p>
        <p className="text-white flex items-center gap-1">
          <span>Revenue:</span>
          <Price amount={payload[0].value} size="sm" className="text-white font-sans text-xs" />
        </p>
      </div>
    );
  }
  return null;
}

export function RevenueChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
      {/* 30-Day Revenue Area Chart */}
      <Card className="lg:col-span-2 space-y-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2 mb-0">
          <div>
            <MicroLabel className="text-[var(--color-gold-600)] mb-1">REVENUE TREND</MicroLabel>
            <CardTitle>30-Day Collection Revenue</CardTitle>
          </div>
          <div className="text-right">
            <MicroLabel>PERIOD TOTAL</MicroLabel>
            <Price amount={218700} size="md" className="text-[var(--color-text-900)] font-sans font-semibold" />
          </div>
        </CardHeader>

        <div className="h-[220px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-gold-500)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-gold-500)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                axisLine={{ stroke: 'var(--color-cream-300)', strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: 'var(--color-text-500)', fontSize: 11, fontFamily: 'var(--font-poppins)' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-text-500)', fontSize: 11, fontFamily: 'var(--font-poppins)' }}
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-gold-600)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#goldGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Category Mix Breakdown */}
      <Card className="space-y-4">
        <CardHeader className="pb-2 mb-0">
          <MicroLabel className="text-[var(--color-gold-600)] mb-1">COLLECTION DISTRIBUTION</MicroLabel>
          <CardTitle>Category Mix</CardTitle>
        </CardHeader>

        <div className="space-y-4 pt-2">
          {categoryMix.map((cat) => (
            <div key={cat.name} className="space-y-1.5 font-sans">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[var(--color-text-900)]">{cat.name}</span>
                <span className="text-[var(--color-text-500)]">{cat.percentage}%</span>
              </div>
              <div className="w-full h-2 bg-[var(--color-cream-200)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-gold-600)] rounded-full transition-all duration-500"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
