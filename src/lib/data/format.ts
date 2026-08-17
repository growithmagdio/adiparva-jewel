import { Currency } from './types';

export function formatCurrency(amount: Currency): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string, style: 'long' | 'compact' | 'iso' = 'long'): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  if (style === 'compact') {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  }

  if (style === 'iso') {
    return date.toISOString().split('T')[0];
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatOrderId(id: string): string {
  if (id.startsWith('#')) return id;
  return `#${id}`;
}

export function formatPercentage(val: number): string {
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
}
