'use client';

import * as React from 'react';
import { BicameralHeading, MicroLabel, Button, Input, Field } from '@/components/primitives';
import { getHeroSlides, saveHeroSlides } from '@/lib/data/queries';
import { HeroSlide } from '@/lib/data/types';
import { Save, Check } from 'lucide-react';

export default function AdminHeroPage() {
  const [slide, setSlide] = React.useState<HeroSlide | null>(null);
  const [eyebrow, setEyebrow] = React.useState('');
  const [headingItalic, setHeadingItalic] = React.useState('');
  const [headingRoman, setHeadingRoman] = React.useState('');
  const [body, setBody] = React.useState('');
  const [ctaLabel, setCtaLabel] = React.useState('');
  const [ctaHref, setCtaHref] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  React.useEffect(() => {
    async function loadHero() {
      const slides = await getHeroSlides();
      if (slides.length > 0) {
        const s = slides[0];
        setSlide(s);
        setEyebrow(s.eyebrow);
        setHeadingItalic(s.headingItalic);
        setHeadingRoman(s.headingRoman);
        setBody(s.body);
        setCtaLabel(s.ctaLabel);
        setCtaHref(s.ctaHref);
      }
    }
    loadHero();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slide) return;
    setSaving(true);

    const updatedSlide: HeroSlide = {
      ...slide,
      eyebrow,
      headingItalic,
      headingRoman,
      body,
      ctaLabel,
      ctaHref,
    };

    await saveHeroSlides([updatedSlide]);
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 select-none max-w-4xl">
      <div className="border-b border-[var(--color-cream-200)] pb-6">
        <MicroLabel className="text-[var(--color-gold-600)]">HERO CONTROL PANEL</MicroLabel>
        <BicameralHeading italicPart="Hero" romanPart="Settings" size="xl" />
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-8 rounded-[var(--radius-card)] space-y-6 shadow-xs">
        <Field label="EYEBROW MICRO-LABEL">
          <Input value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="HEADING ITALIC WORD (PLAYFAIR)">
            <Input value={headingItalic} onChange={(e) => setHeadingItalic(e.target.value)} />
          </Field>
          <Field label="HEADING ROMAN WORD (POPPINS)">
            <Input value={headingRoman} onChange={(e) => setHeadingRoman(e.target.value)} />
          </Field>
        </div>

        <Field label="HERO POSITIONING COPY">
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full p-3 bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded text-xs text-[var(--color-text-900)] outline-none"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="PRIMARY CTA LABEL">
            <Input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} />
          </Field>
          <Field label="PRIMARY CTA ROUTE">
            <Input value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} />
          </Field>
        </div>

        <div className="pt-4 border-t border-[var(--color-cream-200)] flex items-center justify-between">
          {savedSuccess && <span className="text-xs text-[var(--color-ok-fg)] font-semibold">Hero settings updated on storefront.</span>}
          <div className="ml-auto">
            <Button type="submit" variant="primary" size="lg" disabled={saving} leftIcon={savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}>
              {saving ? 'SAVING...' : savedSuccess ? 'SETTINGS SAVED' : 'SAVE HERO SETTINGS'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
