'use client';

import * as React from 'react';
import { BicameralHeading, MicroLabel, StatusPill, Button } from '@/components/primitives';
import { getOffers } from '@/lib/data/queries';
import { SeasonalOffer } from '@/lib/data/types';
import { Tag, Plus } from 'lucide-react';

export default function AdminOffersPage() {
  const [offers, setOffers] = React.useState<SeasonalOffer[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadOffers() {
      setLoading(true);
      const data = await getOffers();
      setOffers(data);
      setLoading(false);
    }
    loadOffers();
  }, []);

  return (
    <div className="space-y-8 select-none max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[var(--color-cream-200)] pb-6">
        <div>
          <MicroLabel className="text-[var(--color-gold-600)]">SEASONAL INSTRUMENTS</MicroLabel>
          <BicameralHeading italicPart="Seasonal" romanPart="Offers" size="xl" />
        </div>

        <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
          CREATE NEW OFFER
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map((offer) => {
          const statusVariant = offer.status === 'live' ? 'ok' : offer.status === 'scheduled' ? 'warn' : 'risk';
          return (
            <div key={offer.id} className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-6 rounded-[var(--radius-card)] space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <StatusPill variant={statusVariant} dot>
                  {offer.status}
                </StatusPill>
                <span className="font-serif font-semibold text-lg text-[var(--color-gold-600)]">{offer.discountPercent}% OFF</span>
              </div>

              <div>
                <h4 className="font-serif text-xl font-medium text-[var(--color-text-900)]">{offer.title}</h4>
                <p className="text-xs text-[var(--color-text-500)] mt-1">{offer.subtitle}</p>
              </div>

              <div className="text-[11px] text-[var(--color-text-400)] font-sans border-t border-[var(--color-cream-200)] pt-3">
                Valid: {offer.startsAt} — {offer.endsAt}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
