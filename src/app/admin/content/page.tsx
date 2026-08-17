'use client';

import * as React from 'react';
import { BicameralHeading, MicroLabel, Button, Input, Field } from '@/components/primitives';
import { getSiteContent, saveSiteContent } from '@/lib/data/queries';
import { SiteContent } from '@/lib/data/types';
import { Save, Check } from 'lucide-react';

export default function AdminContentPage() {
  const [content, setContent] = React.useState<SiteContent | null>(null);
  const [announcementMsg, setAnnouncementMsg] = React.useState('');
  const [houseStoryHeading, setHouseStoryHeading] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  React.useEffect(() => {
    async function loadContent() {
      const data = await getSiteContent();
      setContent(data);
      setAnnouncementMsg(data.announcementBar.message);
      setHouseStoryHeading(data.houseStory.heading);
    }
    loadContent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    setSaving(true);

    const updated: SiteContent = {
      ...content,
      announcementBar: {
        ...content.announcementBar,
        message: announcementMsg,
      },
      houseStory: {
        ...content.houseStory,
        heading: houseStoryHeading,
      },
    };

    await saveSiteContent(updated);
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 select-none max-w-4xl">
      <div className="border-b border-[var(--color-cream-200)] pb-6">
        <MicroLabel className="text-[var(--color-gold-600)]">SITE EDITORIAL CONTROL</MicroLabel>
        <BicameralHeading italicPart="Site" romanPart="Content" size="xl" />
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-8 rounded-[var(--radius-card)] space-y-6 shadow-xs">
        <Field label="ANNOUNCEMENT BAR MESSAGE">
          <Input value={announcementMsg} onChange={(e) => setAnnouncementMsg(e.target.value)} />
        </Field>

        <Field label="HOUSE STORY EDITORIAL HEADING">
          <Input value={houseStoryHeading} onChange={(e) => setHouseStoryHeading(e.target.value)} />
        </Field>

        <div className="pt-4 border-t border-[var(--color-cream-200)] flex items-center justify-between">
          {savedSuccess && <span className="text-xs text-[var(--color-ok-fg)] font-semibold">Site editorial content updated.</span>}
          <div className="ml-auto">
            <Button type="submit" variant="primary" size="lg" disabled={saving} leftIcon={savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}>
              {saving ? 'SAVING...' : savedSuccess ? 'CONTENT SAVED' : 'SAVE SITE CONTENT'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
