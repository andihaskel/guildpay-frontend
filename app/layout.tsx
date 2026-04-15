import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider, ProductProvider } from '@/contexts';
import { Toaster } from '@/components/ui/toaster';
import MaintenanceGate from '@/components/MaintenanceGate';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AccessGate - Monetize Your Discord Server',
  description: 'Sell access to exclusive roles with automated Stripe subscriptions. No manual approvals. No hassle.',
  openGraph: {
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MaintenanceGate>
          <AuthProvider>
            <ProductProvider>
              {children}
              <Toaster />
            </ProductProvider>
          </AuthProvider>
        </MaintenanceGate>
      </body>
    </html>
  );
}
