import type { Metadata } from 'next';
import { Alice, Charm, Comforter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Providers from '@/components/Providers';
import CartDrawer from '@/components/CartDrawer';

// Self-hosted via next/font — eliminates the external Google Fonts request
const alice = Alice({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-alice',
  display: 'swap',
});

const charm = Charm({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-charm',
  display: 'swap',
});

const comforter = Comforter({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-comforter',
  display: 'swap',
});

const SITE_URL = 'https://wizardoflight-studio.netlify.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Wizard Of Light — Handcrafted Leather Studio',
    template: '%s | Wizard Of Light',
  },
  description:
    'Handcrafted leather goods for everyday carry, armor, and the 18+ adventurer. Custom leatherwork by Bryan, Nebraska — every piece tells a story.',
  keywords: [
    'leather goods',
    'handcrafted leather',
    'leather armor',
    'custom leather',
    'BDSM leather',
    'leather studio',
    'Nebraska leather',
    'everyday carry leather',
  ],
  openGraph: {
    title: 'Wizard Of Light — Handcrafted Leather Studio',
    description:
      'Handcrafted leather goods for everyday carry, armor, and the 18+ adventurer. Custom leatherwork from Nebraska.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Wizard Of Light',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wizard Of Light — Handcrafted Leather Studio',
    description: 'Custom leatherwork from Nebraska. Everyday carry, armor, and 18+ pieces.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${alice.variable} ${charm.variable} ${comforter.variable}`}>
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
