'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Chrome as HomeIcon, Users, ChartBar as BarChart3, CreditCard, Settings, FileText, X } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/dashboard/home', icon: HomeIcon },
  { name: 'Pages', href: '/dashboard/pages', icon: FileText },
  { name: 'Members', href: '/dashboard/members', icon: Users },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const LogoMark = () => (
  <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden="true" style={{ display: 'inline-block', flexShrink: 0 }}>
    <path d="M6 28 L6 14 A10 10 0 0 1 26 14 L26 28" stroke="#f0f0f0" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 28 L28 28" stroke="#f0f0f0" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M11 20 L21 20" stroke="#5865f2" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="16" cy="12" r="1.8" fill="#5865f2" />
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
          position: 'fixed', left: 0, top: 0, height: '100vh', width: '256px',
          background: 'var(--surface-1)', borderRight: '0.5px solid var(--border-soft)',
          zIndex: 50, transition: 'transform 300ms ease',
        }}
        className={`lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div style={{
          display: 'flex', height: '64px', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', borderBottom: '0.5px solid var(--border-soft)',
        }}>
          <Link
            href="/dashboard/home"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 600, fontSize: '15px', letterSpacing: '-0.01em', color: 'var(--text)', textDecoration: 'none' }}
          >
            <LogoMark />
            AccessGate
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden"
            style={{
              padding: '6px', borderRadius: '6px', background: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', transition: 'color 200ms ease, background 200ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
          >
            <X size={18} />
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '12px 8px' }}>
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                style={{
                  position: 'relative', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: 500,
                  textDecoration: 'none', transition: 'background 200ms ease, color 200ms ease',
                  color: isActive ? 'var(--text)' : 'var(--text-muted)',
                  background: isActive ? 'var(--surface-2)' : 'transparent',
                  letterSpacing: '-0.005em',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.color = 'var(--text)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: '2px', height: '18px', background: '#5865f2', borderRadius: '0 2px 2px 0',
                  }} />
                )}
                <item.icon size={16} style={{ color: isActive ? '#8b92f8' : 'var(--text-muted)', flexShrink: 0 }} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
