'use client';

import * as React from 'react';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { BicameralHeading, MicroLabel, Button, Input, Field } from '@/components/primitives';
import { MapPin, Phone, Mail, Clock, Check } from 'lucide-react';

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
    <div className="min-h-screen bg-[var(--color-cream-100)] text-[var(--color-text-700)] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-10 space-y-16">
        {/* Header */}
        <div className="border-b border-[var(--color-cream-200)] pb-8 space-y-3">
          <MicroLabel className="text-[var(--color-gold-600)]">CUSTODIAL ATELIERS</MicroLabel>
          <BicameralHeading italicPart="Atelier" romanPart="Locations & Inquiries" size="xl" />
          <p className="font-sans text-sm text-[var(--color-text-500)] max-w-2xl leading-relaxed">
            Visit our private heritage salons in Chennai, Bengaluru, and Mumbai for private viewing, custom bridal commissions, and valuation.
          </p>
        </div>

        {/* 3 Atelier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ateliers.map((atelier) => (
            <div
              key={atelier.city}
              className="bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-8 rounded-[var(--radius-card)] space-y-4 shadow-xs"
            >
              <MicroLabel className="text-[var(--color-gold-600)]">PRIVATE BOUTIQUE</MicroLabel>
              <h3 className="font-serif text-2xl font-medium text-[var(--color-text-900)]">{atelier.city}</h3>

              <div className="space-y-2.5 text-xs text-[var(--color-text-700)] font-sans pt-2">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[var(--color-gold-600)] shrink-0 mt-0.5" />
                  <span>{atelier.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[var(--color-gold-600)] shrink-0" />
                  <span>{atelier.phone}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[var(--color-gold-600)] shrink-0" />
                  <span>{atelier.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Private Inquiry Form */}
        <div className="max-w-3xl mx-auto bg-[var(--color-surface)] border border-[var(--color-cream-200)] p-8 sm:p-12 rounded-[var(--radius-card)] shadow-md space-y-6">
          <div className="space-y-1 text-center">
            <MicroLabel className="text-[var(--color-gold-600)]">PRIVATE RESERVATION</MicroLabel>
            <h2 className="font-serif text-3xl font-medium text-[var(--color-text-900)]">Request an Atelier Appointment</h2>
            <p className="text-xs font-sans text-[var(--color-text-500)]">
              Schedule a private viewing session or inquire about custom temple gold commissions.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 bg-[var(--color-ok-bg)] border border-[var(--color-ok-fg)]/30 rounded-[var(--radius-card)] text-center space-y-3">
              <Check className="w-8 h-8 text-[var(--color-ok-fg)] mx-auto" />
              <h4 className="font-serif text-xl text-[var(--color-text-900)]">Inquiry Received</h4>
              <p className="text-xs text-[var(--color-text-700)]">
                Our Chief Curator will reach out within 24 hours to confirm your private viewing date.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="FULL NAME" required>
                  <Input placeholder="Priya Sharma" required />
                </Field>
                <Field label="EMAIL ADDRESS" required>
                  <Input type="email" placeholder="priya@example.com" required />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="PHONE NUMBER" required>
                  <Input placeholder="+91 98765 43210" required />
                </Field>
                <Field label="PREFERRED ATELIER">
                  <select className="w-full h-[40px] px-3 bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded-[var(--radius-card)] text-xs text-[var(--color-text-900)] outline-none">
                    <option>Chennai Flagship</option>
                    <option>Bengaluru Atelier</option>
                    <option>Mumbai Salon</option>
                  </select>
                </Field>
              </div>

              <Field label="INQUIRY NOTES / INTEREST">
                <textarea
                  rows={4}
                  placeholder="Tell us about the pieces or bridal parure you would like to view..."
                  className="w-full p-3 bg-[var(--color-surface)] border border-[var(--color-cream-300)] rounded-[var(--radius-card)] text-xs text-[var(--color-text-900)] outline-none"
                />
              </Field>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="lg" className="w-full justify-center">
                  SUBMIT ATELIER INQUIRY
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
