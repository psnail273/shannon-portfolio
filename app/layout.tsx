import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/appShell/appShell';
import { Playfair_Display } from 'next/font/google';
import DevBanner from '@/components/devBanner/devBanner';
import { cookies } from 'next/headers';
import PasswordForm from '@/components/passwordForm/passwordForm';
import { verifyAuthToken } from '@/lib/auth';
import BackgroundLogo from '@/components/backgroundLogo/backgroundLogo';
import BackgroundCorner from '@/components/backgroundCorner/backgroundCorner';

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  const isAuthenticated = token ? verifyAuthToken(token) : false;

  return (
    <html lang="en">
      <body className={ `${playfair.variable} antialiased` }>
        <div className="min-h-screen flex flex-col relative">
          <DevBanner />
          <BackgroundLogo />
          <div className='mx-auto max-w-[1200px] flex-grow w-full'>
            <AppShell isAuthenticated={ isAuthenticated }>
              { isAuthenticated ? children : (
                <div className="relative w-full flex flex-col items-center space-y-4 px-8">
                  <div className="w-full">
                    <PasswordForm />
                  </div>
                </div>
              ) }
            </AppShell>
          </div>
          <BackgroundCorner />
        </div>
      </body>
    </html>
  );
}
