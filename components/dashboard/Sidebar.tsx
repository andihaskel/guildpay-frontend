'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Chrome as Home, FileText, Users, ChartBar as BarChart4, CreditCard, Settings, X } from 'lucide-react';
import { useProduct } from '@/contexts';
import { ProductSwitcher } from './ProductSwitcher';

const navigation = [
  { name: 'Home', href: '/dashboard/home', icon: Home },
  { name: 'Pages', href: '/dashboard/pages', icon: FileText },
  { name: 'Members', href: '/dashboard/members', icon: Users },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart4 },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const LogoMark = () => (
  <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden="true" style={{ display: 'inline-block', flexShrink: 0 }}>
    <path d="M10 6 L5 6 L5 26 L10 26" fill="none" stroke="#f0f0f0" strokeWidth="1.8" />
    <path d="M22 6 L27 6 L27 26 L22 26" fill="none" stroke="#f0f0f0" strokeWidth="1.8" />
    <circle cx="16" cy="16" r="3.2" fill="#5865f2" />
  </svg>
);

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
          className="lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        style={{
          position: 'fixed', left: 0, top: 0, height: '100vh', width: '240px',
          background: 'var(--bg)', borderRight: '0.5px solid var(--border-soft)',
          zIndex: 50, display: 'flex', flexDirection: 'column',
          transition: 'transform 300ms ease',
        }}
        className={`lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div style={{
          display: 'flex', height: '60px', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', borderBottom: '0.5px solid var(--border-soft)', flexShrink: 0,
        }}>
          <Link
            href="/dashboard/home"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 600, fontSize: '14.5px', letterSpacing: '-0.01em', color: 'var(--text)', textDecoration: 'none' }}
          >
            <LogoMark />
            AccessGate
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden"
            style={{
              padding: '6px', borderRadius: '6px', background: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', border: 'none',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', padding: '12px 12px', overflowY: 'auto' }}>
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                style={{
                  position: 'relative', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 10px', borderRadius: '6px', fontSize: '13.5px', fontWeight: 500,
                  textDecoration: 'none', letterSpacing: '-0.005em',
                  color: isActive ? 'var(--text)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--surface-1)' : 'transparent',
                  transition: 'background 180ms ease, color 180ms ease',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute', left: '-12px', top: '50%', transform: 'translateY(-50%)',
                    width: '2px', height: '16px', background: 'var(--accent)', borderRadius: '0 2px 2px 0',
                  }} />
                )}
                <item.icon size={16} style={{ color: isActive ? 'var(--accent-soft-text)' : 'currentColor', opacity: 0.9, flexShrink: 0 }} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '14px 12px', borderTop: '0.5px solid var(--border-soft)', flexShrink: 0 }}>
          <ProductSwitcher />
        </div>
      </aside>
    </>
  );
}
