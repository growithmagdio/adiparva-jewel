'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { KolamDivider } from '@/components/storefront/kolam-divider';
import { MapPin, Phone, Mail, Clock, Check, MessageSquare } from 'lucide-react';

import { getSiteConfig } from '@/lib/config/site-config';

export default function ContactPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const siteConfig = getSiteConfig();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const ateliers = [
    {
      city: 'Chennai Flagship',
      address: 'No. 42 Khader Nawaz Khan Road, Nungambakkam',
      phone: siteConfig.displayPhone || '+91 97917 77949',
      hours: 'Mon - Sat: 10:30 AM - 7:30 PM',
    },
    {
      city: 'Bengaluru Atelier',
      address: 'Lavelle Heights, Lavelle Road, Shanthala Nagar',
      phone: siteConfig.displayPhone || '+91 97917 77949',
      hours: 'Mon - Sat: 10:30 AM - 7:30 PM',
    },
    {
      city: 'Mumbai Salon',
      address: 'Kala Ghoda Heritage District, Fort',
      phone: siteConfig.displayPhone || '+91 97917 77949',
      hours: 'By Private Appointment Only',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF5EC] text-[#765E55] flex flex-col font-sans select-none">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-8 py-12 space-y-16">
        {/* Header */}
        <div className="border-b border-[#E7D7C0] pb-8 space-y-3">
          <div className="font-marcellus text-[11px] uppercase tracking-[0.35em] text-[#B68A3A] font-semibold">
            ATELIER & SALON DIRECTORY
          </div>
          <h1 className="font-serif text-[40px] sm:text-[52px] font-normal text-[#5B1018]">
            Contact <em className="italic font-normal text-[#B68A3A]">Our Concierge</em>
          </h1>
          <p className="font-jost text-sm text-[#765E55] max-w-2xl leading-relaxed">
            Visit our private heritage salons in Chennai, Bengaluru, and Mumbai for private viewing, custom bridal commissions, and appraisal.
          </p>
        </div>

        {/* 3 Atelier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ateliers.map((atelier) => (
            <div
              key={atelier.city}
              className="bg-white border border-[#E7D7C0] p-8 rounded-[4px] space-y-4 shadow-xs hover:border-[#B68A3A] transition-all"
            >
              <div className="font-marcellus text-[10px] uppercase tracking-[0.2em] text-[#B68A3A] font-semibold">
                PRIVATE BOUTIQUE
              </div>
              <h3 className="font-serif text-2xl font-normal text-[#5B1018]">{atelier.city}</h3>

              <div className="space-y-3 text-xs text-[#765E55] font-jost pt-2">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#B68A3A] shrink-0 mt-0.5" />
                  <span>{atelier.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#B68A3A] shrink-0" />
                  <span>{atelier.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#B68A3A] shrink-0" />
                  <span>{atelier.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp Direct Concierge Card */}
        {siteConfig.isWhatsAppEnabled && (
          <div className="bg-[#5B1018] border border-[#B68A3A] p-8 rounded-[4px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-md text-[#FAF5EC]">
            <div className="space-y-2 text-center md:text-left">
              <div className="font-marcellus text-[10px] uppercase tracking-[0.25em] text-[#D7B56D] font-semibold">
                INSTANT CONCIERGE
              </div>
              <h3 className="font-serif text-2xl font-normal text-[#FAF5EC]">Connect Directly on WhatsApp</h3>
              <p className="font-jost text-xs text-[#FAF5EC]/80 font-light">Speak with our senior curator for immediate assistance or custom bridal quotes.</p>
            </div>

            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 px-8 bg-[#FAF5EC] text-[#5B1018] hover:bg-white font-marcellus text-[11px] uppercase tracking-[0.25em] font-semibold flex items-center gap-2 rounded-[2px] shrink-0 transition-colors shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-[#5B1018] stroke-[1.5]" />
              <span>OPEN WHATSAPP CHAT</span>
            </a>
          </div>
        )}

        {/* Private Inquiry Form */}
        <div className="max-w-3xl mx-auto bg-white border border-[#E7D7C0] p-8 sm:p-12 rounded-[4px] shadow-sm space-y-6">
          <div className="space-y-2 text-center">
            <KolamDivider />
            <div className="font-marcellus text-[10px] uppercase tracking-[0.25em] text-[#B68A3A] font-semibold">
              PRIVATE INQUIRY
            </div>
            <h2 className="font-serif text-3xl font-normal text-[#5B1018]">Request an Atelier Appointment</h2>
            <p className="text-xs font-jost text-[#765E55]">
              Schedule a private viewing session or inquire about custom temple gold commissions.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 bg-[#FAF5EC] border border-[#E7D7C0] rounded-[4px] text-center space-y-3">
              <Check className="w-8 h-8 text-[#B68A3A] mx-auto" />
              <h4 className="font-serif text-xl text-[#5B1018]">Inquiry Received</h4>
              <p className="text-xs font-jost text-[#765E55]">
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
                  className="bg-[#FAF5EC] border border-[#E7D7C0] rounded-[2px] px-4 py-3 text-[#5B1018] outline-none focus:border-[#B68A3A] transition-all placeholder-[#765E55]/60"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  className="bg-[#FAF5EC] border border-[#E7D7C0] rounded-[2px] px-4 py-3 text-[#5B1018] outline-none focus:border-[#B68A3A] transition-all placeholder-[#765E55]/60"
                />
              </div>
              <input
                type="tel"
                placeholder="Phone Number"
                required
                className="w-full bg-[#FAF5EC] border border-[#E7D7C0] rounded-[2px] px-4 py-3 text-[#5B1018] outline-none focus:border-[#B68A3A] transition-all placeholder-[#765E55]/60"
              />
              <textarea
                rows={4}
                placeholder="Your Inquiry or Preferred Viewing Date"
                required
                className="w-full bg-[#FAF5EC] border border-[#E7D7C0] rounded-[2px] px-4 py-3 text-[#5B1018] outline-none focus:border-[#B68A3A] transition-all placeholder-[#765E55]/60"
              />
              <button
                type="submit"
                className="w-full h-12 bg-[#5B1018] text-[#FAF5EC] hover:bg-[#3B090D] font-sans text-xs uppercase tracking-[0.2em] font-semibold rounded-[2px] shadow-sm cursor-pointer transition-colors"
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
