import { SeasonalOffer } from '../types';

export const seedOffers: SeasonalOffer[] = [
  {
    id: 'off-1',
    title: 'Wedding Season Edit',
    subtitle: 'Curated bridal parures and temple heirlooms for auspicious unions',
    bannerImage: '/images/offers/wedding-season-edit.jpg',
    discountPercent: 12,
    categoryIds: ['cat-bridal-sets', 'cat-temple', 'cat-jadau'],
    startsAt: '2026-04-01T00:00:00Z',
    endsAt: '2026-05-31T23:59:59Z',
    status: 'live',
  },
  {
    id: 'off-2',
    title: 'Aadi Temple Collection',
    subtitle: 'Honouring the sacred monsoon heritage of South Indian temple crafts',
    bannerImage: '/images/offers/aadi-collection.jpg',
    discountPercent: 10,
    categoryIds: ['cat-temple', 'cat-haarams', 'cat-jhumkas'],
    startsAt: '2026-07-01T00:00:00Z',
    endsAt: '2026-08-15T23:59:59Z',
    status: 'scheduled',
  },
  {
    id: 'off-3',
    title: 'Akshaya Tritiya Royal Edit',
    subtitle: 'Golden prosperity pieces with complimentary atelier hallmarking scroll',
    bannerImage: '/images/offers/akshaya-tritiya.jpg',
    discountPercent: 8,
    categoryIds: ['cat-bangles-kada', 'cat-kundan', 'cat-polki'],
    startsAt: '2026-03-01T00:00:00Z',
    endsAt: '2026-04-15T23:59:59Z',
    status: 'ended',
  },
];
