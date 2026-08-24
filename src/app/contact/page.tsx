'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { KolamDivider } from '@/components/storefront/kolam-divider';
import { MapPin, Phone, Mail, Clock, Check, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const ateliers = [
    {
      city: 'Chennai Flagship',
      address: 'No. 42 Khader Nawaz Khan Road, Nungambakkam',
      phone: '+91 44 2833 7700',
      hours: 'Mon - Sat: 10:30 AM - 7:30 PM',
    },
    {
      city: 'Bengaluru Atelier',
      address: 'Lavelle Heights, Lavelle Road, Shanthala Nagar',
      phone: '+91 80 4112 8899',
      hours: 'Mon - Sat: 10:30 AM - 7:30 PM',
    },
    {
      city: 'Mumbai Salon',
      address: 'Kala Ghoda Heritage District, Fort',
      phone: '+91 22 2288 1144',
      hours: 'By Private Appointment Only',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-vault-black)] text-[var(--color-ivory)] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-16">
        {/* Header */}
        <div className="border-b border-[var(--color-temple-gold)]/20 pb-8 space-y-3">
          <div className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[var(--color-temple-gold)]">
            ATELIER & SALON DIRECTORY
          </div>
          <h1 className="font-serif text-[40px] sm:text-[52px] font-light text-[var(--color-ivory)]">
            Contact <em className="italic text-gold-gradient font-normal">Our Concierge</em>
          </h1>
          <p className="font-jost text-sm text-[var(--color-sandal)]/80 max-w-2xl leading-relaxed font-light">
            Visit our private heritage salons in Chennai, Bengaluru, and Mumbai for private viewing, custom bridal commissions, and appraisal.
          </p>
        </div>

        {/* 3 Atelier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ateliers.map((atelier) => (
            <div
              key={atelier.city}
              className="bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 p-8 rounded-[4px] space-y-4 shadow-lg hover:border-[var(--color-temple-gold)]/50 transition-all"
            >
              <div className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[var(--color-temple-gold)]">
                PRIVATE BOUTIQUE
              </div>
              <h3 className="font-serif text-2xl font-light text-[var(--color-ivory)]">{atelier.city}</h3>

              <div className="space-y-3 text-xs text-[var(--color-sandal)]/80 font-jost pt-2">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[var(--color-temple-gold)] shrink-0 mt-0.5" />
                  <span>{atelier.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[var(--color-temple-gold)] shrink-0" />
                  <span>{atelier.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[var(--color-temple-gold)] shrink-0" />
                  <span>{atelier.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp Direct Concierge Card */}
        <div className="bg-[var(--color-burgundy-silk)] border border-[var(--color-temple-gold)]/40 p-8 rounded-[4px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="font-marcellus text-[10px] uppercase tracking-[0.25em] text-[var(--color-gold-light)]">
              INSTANT CONCIERGE
            </div>
            <h3 className="font-serif text-2xl font-light text-[var(--color-ivory)]">Connect Directly on WhatsApp</h3>
            <p className="font-jost text-xs text-[var(--color-sandal)] font-light">Speak with our senior curator for immediate assistance or custom bridal quotes.</p>
          </div>

          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold-sheen h-12 px-8 bg-[var(--color-temple-gold)] text-[var(--color-vault-black)] font-marcellus text-[11px] uppercase tracking-[0.25em] font-semibold flex items-center gap-2 rounded-[2px] shrink-0"
          >
            <MessageSquare className="w-4 h-4 text-[var(--color-vault-black)] stroke-[1.5]" />
            <span>OPEN WHATSAPP CHAT</span>
          </a>
        </div>

        {/* Private Inquiry Form */}
        <div className="max-w-3xl mx-auto bg-[var(--color-sanctum)] border border-[var(--color-temple-gold)]/20 p-8 sm:p-12 rounded-[4px] shadow-2xl space-y-6">
          <div className="space-y-2 text-center">
            <KolamDivider />
            <div className="font-marcellus text-[10px] uppercase tracking-[0.25em] text-[var(--color-temple-gold)]">
              PRIVATE INQUIRY
            </div>
            <h2 className="font-serif text-3xl font-light text-[var(--color-ivory)]">Request an Atelier Appointment</h2>
            <p className="text-xs font-jost text-[var(--color-sandal)]/70 font-light">
              Schedule a private viewing session or inquire about custom temple gold commissions.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 bg-[var(--color-vault-black)] border border-[var(--color-temple-gold)]/40 rounded-[4px] text-center space-y-3">
              <Check className="w-8 h-8 text-[var(--color-gold-light)] mx-auto" />
              <h4 className="font-serif text-xl text-[var(--color-ivory)]">Inquiry Received</h4>
              <p className="text-xs font-jost text-[var(--color-sandal)]">
                Our Senior Curator will reach out within 24 hours to confirm your private viewing date.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-jost text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  className="bg-transparent border border-[#3A2A22] rounded-[2px] px-4 py-3 text-[var(--color-ivory)] outline-none focus:border-[var(--color-temple-gold)] focus:shadow-[0_0_12px_rgba(201,162,75,0.25)] transition-all placeholder-[var(--color-sandal)]/40"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  className="bg-transparent border border-[#3A2A22] rounded-[2px] px-4 py-3 text-[var(--color-ivory)] outline-none focus:border-[var(--color-temple-gold)] focus:shadow-[0_0_12px_rgba(201,162,75,0.25)] transition-all placeholder-[var(--color-sandal)]/40"
                />
              </div>
              <input
                type="tel"
                placeholder="Phone Number"
                required
                className="w-full bg-transparent border border-[#3A2A22] rounded-[2px] px-4 py-3 text-[var(--color-ivory)] outline-none focus:border-[var(--color-temple-gold)] focus:shadow-[0_0_12px_rgba(201,162,75,0.25)] transition-all placeholder-[var(--color-sandal)]/40"
              />
              <textarea
                rows={4}
                placeholder="Your Inquiry or Preferred Viewing Date"
                required
                className="w-full bg-transparent border border-[#3A2A22] rounded-[2px] px-4 py-3 text-[var(--color-ivory)] outline-none focus:border-[var(--color-temple-gold)] focus:shadow-[0_0_12px_rgba(201,162,75,0.25)] transition-all placeholder-[var(--color-sandal)]/40"
              />
              <button
                type="submit"
                className="btn-gold-sheen w-full h-12 bg-[var(--color-temple-gold)] text-[var(--color-vault-black)] font-marcellus text-[11px] uppercase tracking-[0.25em] font-semibold rounded-[2px] shadow-lg cursor-pointer"
              >
                SUBMIT APPOINTMENT REQUEST
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
