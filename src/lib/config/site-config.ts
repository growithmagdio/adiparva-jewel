export interface SiteConfig {
  whatsappNumber: string;
  displayPhone: string;
  contactEmail: string;
  isWhatsAppEnabled: boolean;
}

export function getSiteConfig(): SiteConfig {
  const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919791777949';
  const displayPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '+91 97917 77949';
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'atelier@adaparva.com';

  return {
    whatsappNumber: rawNumber.trim(),
    displayPhone: displayPhone.trim(),
    contactEmail: contactEmail.trim(),
    isWhatsAppEnabled: Boolean(rawNumber && rawNumber.trim().length >= 10),
  };
}
