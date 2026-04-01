'use client';

import { useEffect, useRef, useState } from 'react';
import { Sidebar, Topbar } from '@/components/dashboard';
import { useProduct } from '@/contexts';
import { syncStripeUnmatched } from '@/lib/stripe-sync';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentProduct } = useProduct();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitiatedSync = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!currentProduct?.id || hasInitiatedSync.current) {
      return;
    }

    hasInitiatedSync.current = true;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      await syncStripeUnmatched(currentProduct.id);
    }, 500);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [currentProduct?.id]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar onMenuClick={() => setSidebarOpen(true)} />
      <main className="lg:ml-64 mt-16 p-4 lg:p-8">{children}</main>
    </div>
  );
}
