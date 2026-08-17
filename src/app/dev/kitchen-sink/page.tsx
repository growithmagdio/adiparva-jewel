'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  StatusPill,
  MicroLabel,
  BicameralHeading,
  ArchFrame,
  Price,
  Field,
  Input,
  Select,
  Textarea,
  EmptyState,
  Skeleton,
  ProductCardSkeleton,
  DataTable,
  Column,
} from '@/components/primitives';
import { ShoppingBag, ArrowRight, Bookmark, ShieldCheck } from 'lucide-react';

interface SampleOrder {
  id: string;
  customer: string;
  status: 'ok' | 'info' | 'warn' | 'risk';
  statusText: string;
  total: number;
}

export default function KitchenSinkPage() {
  const [inputValue, setInputValue] = useState('');
  const [errorInput, setErrorInput] = useState('INVALID_CODE');

  const sampleOrders: SampleOrder[] = [
    { id: 'ORD-7721', customer: 'Priya Sharma', status: 'ok', statusText: 'Delivered', total: 45000 },
    { id: 'ORD-7722', customer: 'Anil Kapoor', status: 'info', statusText: 'Shipped', total: 12500 },
    { id: 'ORD-7723', customer: 'Meera Nair', status: 'warn', statusText: 'Confirmed', total: 85000 },
    { id: 'ORD-7724', customer: 'Rajesh Verma', status: 'risk', statusText: 'Cancelled', total: 18500 },
  ];

  const columns: Column<SampleOrder>[] = [
    {
      key: 'id',
      header: 'Order',
      cell: (item) => <span className="font-sans font-medium text-[var(--color-text-900)]">{item.id}</span>,
    },
    {
      key: 'customer',
      header: 'Customer',
      cell: (item) => <span>{item.customer}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (item) => <StatusPill variant={item.status} dot>{item.statusText}</StatusPill>,
    },
    {
      key: 'total',
      header: 'Total',
      cell: (item) => <Price amount={item.total} size="sm" />,
      align: 'right',
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--color-cream-100)] text-[var(--color-text-700)] p-6 sm:p-12 space-y-16 max-w-7xl mx-auto">
      {/* Header */}
      <header className="border-b border-[var(--color-cream-200)] pb-8 space-y-2">
        <MicroLabel className="text-[var(--color-gold-600)]">DESIGN SYSTEM PLAYGROUND</MicroLabel>
        <BicameralHeading italicPart="Design" romanPart="System" size="xl" />
        <p className="text-sm font-sans text-[var(--color-text-500)] max-w-2xl">
          Phase 1 Primitives Showcase — Adi Parva tokens, focus rings, accessibility, and signature typographic devices.
        </p>
      </header>

      {/* 1. Typography & Headings */}
      <section className="space-y-6">
        <div className="border-b border-[var(--color-cream-200)] pb-3">
          <MicroLabel>01. TYPOGRAPHY & BICAMERAL HEADINGS</MicroLabel>
        </div>
        <div className="space-y-4 bg-[var(--color-surface)] p-6 rounded-[var(--radius-card)] border border-[var(--color-cream-200)]">
          <div>
            <MicroLabel className="mb-1">Size XL (Page Titles)</MicroLabel>
            <BicameralHeading italicPart="Administrative" romanPart="Insights" size="xl" />
          </div>
          <div>
            <MicroLabel className="mb-1">Size LG (Section Titles)</MicroLabel>
            <BicameralHeading italicPart="The" romanPart="Collection" size="lg" />
          </div>
          <div>
            <MicroLabel className="mb-1">Size MD (Card Titles)</MicroLabel>
            <BicameralHeading italicPart="Provenance" romanPart="Notes" size="md" />
          </div>
          <div>
            <MicroLabel className="mb-1">Micro Label Component</MicroLabel>
            <MicroLabel>EST. IN THE TRADITION OF THE SOUTH</MicroLabel>
          </div>
        </div>
      </section>

      {/* 2. Buttons */}
      <section className="space-y-6">
        <div className="border-b border-[var(--color-cream-200)] pb-3">
          <MicroLabel>02. BUTTON PRIMITIVES</MicroLabel>
        </div>
        <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-card)] border border-[var(--color-cream-200)] space-y-6">
          <div className="space-y-3">
            <MicroLabel>Variants (Primary / Secondary / Ghost / Danger)</MicroLabel>
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary">Reserve this piece</Button>
              <Button variant="secondary">View details</Button>
              <Button variant="ghost">Read provenance</Button>
              <Button variant="danger">Remove line item</Button>
            </div>
          </div>

          <div className="space-y-3">
            <MicroLabel>Sizes (SM / MD / LG)</MicroLabel>
            <div className="flex flex-wrap gap-4 items-center">
              <Button size="sm">Small Action</Button>
              <Button size="md">Medium Action</Button>
              <Button size="lg">Large Action</Button>
            </div>
          </div>

          <div className="space-y-3">
            <MicroLabel>States (Icons / Loading / Disabled)</MicroLabel>
            <div className="flex flex-wrap gap-4 items-center">
              <Button leftIcon={<ShoppingBag className="w-4 h-4" />}>Add to cart</Button>
              <Button rightIcon={<ArrowRight className="w-4 h-4" />}>Proceed to checkout</Button>
              <Button isLoading>Processing reservation</Button>
              <Button disabled>Out of availability</Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Status Pills */}
      <section className="space-y-6">
        <div className="border-b border-[var(--color-cream-200)] pb-3">
          <MicroLabel>03. STATUS PILLS</MicroLabel>
        </div>
        <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-card)] border border-[var(--color-cream-200)] space-y-4">
          <MicroLabel>Variants with and without live indicator dots</MicroLabel>
          <div className="flex flex-wrap gap-3 items-center">
            <StatusPill variant="ok" dot>Delivered</StatusPill>
            <StatusPill variant="info" dot>Shipped</StatusPill>
            <StatusPill variant="warn" dot>Confirmed</StatusPill>
            <StatusPill variant="risk" dot>Cancelled</StatusPill>
            <StatusPill variant="neutral">Draft</StatusPill>
          </div>
        </div>
      </section>

      {/* 4. Cards & Elevation */}
      <section className="space-y-6">
        <div className="border-b border-[var(--color-cream-200)] pb-3">
          <MicroLabel>04. CARDS & ELEVATION</MicroLabel>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <MicroLabel>STATIC ELEVATION</MicroLabel>
              <CardTitle>Standard Card Component</CardTitle>
              <CardDescription>Hairline border `--color-cream-200` with subtle elevation.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Every card follows the 4px card radius and clean surface design system.</p>
            </CardContent>
            <CardFooter className="justify-between">
              <span className="text-xs text-[var(--color-text-500)]">Ref: SEC-2.4</span>
              <Button size="sm" variant="ghost">Learn more</Button>
            </CardFooter>
          </Card>

          <Card interactive>
            <CardHeader>
              <MicroLabel className="text-[var(--color-gold-600)]">INTERACTIVE ELEVATION</MicroLabel>
              <CardTitle>Hover Interactive Card</CardTitle>
              <CardDescription>Hover over this card to observe the 180ms ease-out shadow lift.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--color-text-700)]">
                Used across collection product items and administrative dashboard tiles.
              </p>
            </CardContent>
            <CardFooter className="justify-end">
              <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Explore piece
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* 5. Signature Arch Frame */}
      <section className="space-y-6">
        <div className="border-b border-[var(--color-cream-200)] pb-3">
          <MicroLabel>05. STOREFRONT SIGNATURE — GOPURAM ARCH FRAME</MicroLabel>
        </div>
        <div className="bg-[var(--color-surface)] p-8 rounded-[var(--radius-card)] border border-[var(--color-cream-200)] space-y-6">
          <p className="text-sm text-[var(--color-text-700)] max-w-xl">
            Stepped-arch SVG mask frame with a pointed apex and symmetrical shoulder steps, finished with an inset gold hairline stroke.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
            <div>
              <MicroLabel className="mb-3 text-center">Portrait Ratio (Hero & Product)</MicroLabel>
              <ArchFrame ratio="portrait" className="w-full max-w-[240px] mx-auto">
                <div className="w-full h-full bg-gradient-to-b from-[var(--color-ink-800)] to-[var(--color-ink-900)] flex flex-col items-center justify-center p-6 text-center text-white">
                  <span className="font-serif italic text-2xl text-[var(--color-gold-400)]">Maharani</span>
                  <span className="font-sans text-xs tracking-widest text-[var(--color-cream-200)] mt-1 uppercase">
                    Temple Necklace
                  </span>
                </div>
              </ArchFrame>
            </div>

            <div>
              <MicroLabel className="mb-3 text-center">Square Ratio (Portal Tile)</MicroLabel>
              <ArchFrame ratio="square" className="w-full max-w-[240px] mx-auto">
                <div className="w-full h-full bg-gradient-to-b from-[var(--color-gold-700)] to-[var(--color-ink-800)] flex flex-col items-center justify-center p-6 text-center text-white">
                  <ShieldCheck className="w-8 h-8 text-[var(--color-gold-400)] mb-2" />
                  <span className="font-serif text-lg text-white">Kundan & Polki</span>
                </div>
              </ArchFrame>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Prices */}
      <section className="space-y-6">
        <div className="border-b border-[var(--color-cream-200)] pb-3">
          <MicroLabel>06. PRICE FORMATTING (LAKH GROUPING)</MicroLabel>
        </div>
        <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-card)] border border-[var(--color-cream-200)] space-y-4">
          <MicroLabel>Playfair Display lining figures with strict Lakh currency formatting</MicroLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-baseline">
            <div>
              <MicroLabel className="mb-1">Size SM</MicroLabel>
              <Price amount={12500} size="sm" />
            </div>
            <div>
              <MicroLabel className="mb-1">Size MD</MicroLabel>
              <Price amount={45000} size="md" />
            </div>
            <div>
              <MicroLabel className="mb-1">Size LG + Compare At</MicroLabel>
              <Price amount={218700} compareAtAmount={245000} size="lg" />
            </div>
            <div>
              <MicroLabel className="mb-1">Size XL</MicroLabel>
              <Price amount={85000} size="xl" />
            </div>
          </div>
        </div>
      </section>

      {/* 7. Form Fields */}
      <section className="space-y-6">
        <div className="border-b border-[var(--color-cream-200)] pb-3">
          <MicroLabel>07. FORM CONTROLS & FIELD PRIMITIVES</MicroLabel>
        </div>
        <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-card)] border border-[var(--color-cream-200)] grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Full Name" helperText="As it should appear on certificate of authenticity" required>
            <Input
              placeholder="e.g. Priya Sharma"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </Field>

          <Field label="Coupon Code" error="This code has expired or is invalid" required>
            <Input
              hasError
              value={errorInput}
              onChange={(e) => setErrorInput(e.target.value)}
            />
          </Field>

          <Field label="Metal & Finish Selection">
            <Select defaultValue="22k">
              <option value="22k">22K Gold (Traditional Temple Finish)</option>
              <option value="antique">Antique Gold Finish</option>
              <option value="polki">Gold-Plated Silver with Uncut Diamonds</option>
            </Select>
          </Field>

          <Field label="Provenance & Craft Notes">
            <Textarea placeholder="Enter craft notes..." defaultValue="Handcrafted over 6 weeks in Nagercoil, Tamil Nadu using traditional nakashi repoussé work." />
          </Field>
        </div>
      </section>

      {/* 8. Empty State */}
      <section className="space-y-6">
        <div className="border-b border-[var(--color-cream-200)] pb-3">
          <MicroLabel>08. EMPTY STATE PRIMITIVE</MicroLabel>
        </div>
        <EmptyState
          eyebrow="CATALOGUE SEARCH"
          title="No pieces match these filters"
          description="Try adjusting your metal, price, or occasion selections to discover pieces from the collection."
          actionLabel="Clear all filters"
          onAction={() => alert('Filters cleared')}
        />
      </section>

      {/* 9. Skeletons */}
      <section className="space-y-6">
        <div className="border-b border-[var(--color-cream-200)] pb-3">
          <MicroLabel>09. SKELETON PLACEHOLDERS</MicroLabel>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </div>
      </section>

      {/* 10. Data Table */}
      <section className="space-y-6">
        <div className="border-b border-[var(--color-cream-200)] pb-3">
          <MicroLabel>10. DATA TABLE PRIMITIVE</MicroLabel>
        </div>
        <DataTable
          data={sampleOrders}
          columns={columns}
          keyExtractor={(item) => item.id}
          onRowClick={(item) => alert(`Clicked order ${item.id}`)}
        />
      </section>
    </main>
  );
}
