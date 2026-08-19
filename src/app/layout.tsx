import type { Metadata } from 'next';
import { Bodoni_Moda, Marcellus, Karla, Anek_Tamil } from 'next/font/google';
import './globals.css';

const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni-moda',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const marcellus = Marcellus({
  subsets: ['latin'],
  variable: '--font-marcellus',
  weight: ['400'],
  display: 'swap',
});

const karla = Karla({
  subsets: ['latin'],
  variable: '--font-karla',
  weight: ['400', '500', '600'],
  display: 'swap',
});

const anekTamil = Anek_Tamil({
  subsets: ['tamil', 'latin'],
  variable: '--font-anek-tamil',
  weight: ['400', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Adi Parva — Direct-to-Consumer Temple Jewellery House',
  description: 'Vault & Vitrine editorial house selling antique-finish temple necklaces, harams, jhumkas, bangles and bridal sets.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bodoniModa.variable} ${marcellus.variable} ${karla.variable} ${anekTamil.variable}`}
    >
      <body className="min-h-screen bg-[var(--color-ivory)] text-[var(--color-ink)] antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
