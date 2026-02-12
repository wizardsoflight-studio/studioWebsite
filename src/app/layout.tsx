import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Providers from '@/components/Providers';
import CartDrawer from '@/components/CartDrawer';

export const metadata: Metadata = {
  title: {
    default: 'Wizard Of Light — Handcrafted Leather Studio',
    template: '%s | Wizard Of Light',
  },
  description:
    'Handcrafted leather goods for cosplay, everyday carry, and the adventurous spirit. Custom leatherwork by Bryan — every piece tells a story.',
  keywords: [
    'leather goods',
    'handcrafted',
    'cosplay',
    'leather armor',
    'custom leather',
    'BDSM leather',
    'leather studio',
  ],
  openGraph: {
    title: 'Wizard Of Light — Handcrafted Leather Studio',
    description:
      'Handcrafted leather goods for cosplay, everyday carry, and the adventurous spirit.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Wizard Of Light',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
