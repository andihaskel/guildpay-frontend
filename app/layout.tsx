import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider, ProductProvider } from '@/contexts';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GuildPay - Monetize Your Discord Server',
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
        <AuthProvider>
          <ProductProvider>{children}</ProductProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
