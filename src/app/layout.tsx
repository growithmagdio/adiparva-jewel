import type { Metadata } from 'next';
import { Cormorant_Garamond, Marcellus, Jost, Noto_Serif_Tamil, Playfair_Display, Poppins } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  style: ['normal', 'italic'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

const marcellus = Marcellus({
  subsets: ['latin'],
  variable: '--font-marcellus',
  weight: ['400'],
  display: 'swap',
});

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

const notoTamil = Noto_Serif_Tamil({
  subsets: ['tamil', 'latin'],
  variable: '--font-tamil',
  weight: ['400', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Adi Parva — The Temple of Tradition | Royal Heritage Jewellery',
  description: 'Living archive of handcrafted temple gold, Kundan, Polki, and bridal heirloom jewellery.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${playfair.variable} ${poppins.variable} ${marcellus.variable} ${jost.variable} ${notoTamil.variable}`}
    >
      <body className="min-h-screen bg-[var(--color-vault-black,#120D0E)] text-[var(--color-ivory,#FAF0E4)] antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
