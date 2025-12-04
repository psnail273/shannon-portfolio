import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/header/header';
import { Playfair_Display } from 'next/font/google';
import DevBanner from '@/components/devBanner/devBanner';

export const metadata: Metadata = {
  title: 'Shannon Portfolio',
  description: 'The work of Shannon',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={ `${playfair.variable} antialiased` }>
        <DevBanner />
        <Header />
        { children }
      </body>
    </html>
  );
}
