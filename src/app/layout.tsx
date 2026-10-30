import type { Metadata } from 'next';
import { Cormorant_Garamond, Marcellus, Jost, Noto_Serif_Tamil, Playfair_Display, Poppins, DM_Sans } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dmsans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

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
  title: {
    default: 'ADI PARVA | The Temple of Tradition',
    template: '%s | ADI PARVA',
  },
  description: 'Living archive of handcrafted South Indian temple gold, Kundan, Polki, and bridal heirloom jewellery.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${cormorant.variable} ${playfair.variable} ${poppins.variable} ${marcellus.variable} ${jost.variable} ${notoTamil.variable}`}
    >
      <body className="min-h-screen bg-[#FAF5EC] text-[#5B1018] antialiased font-sans selection:bg-[#5B1018] selection:text-[#FAF5EC]">
        {children}
      </body>
    </html>
  );
}
