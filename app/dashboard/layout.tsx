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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }} className="lg:ml-60">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main style={{ flex: 1, padding: '32px 28px 64px', maxWidth: '1100px', width: '100%' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
