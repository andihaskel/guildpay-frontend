'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Chrome as Home, FileText, Users, CreditCard, Settings, X, ChevronDown, Hash } from 'lucide-react';
import { useProduct } from '@/contexts';
import { useAuth } from '@/contexts/AuthContext';

const DiscordIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.5 4.4a16.5 16.5 0 0 0-4-1.3l-.2.4a15 15 0 0 1 3.7 1.2 14 14 0 0 0-14 0 15 15 0 0 1 3.7-1.2l-.2-.4a16.5 16.5 0 0 0-4 1.3C1.7 9 .9 13.4 1.3 17.8c1.6 1.2 3.2 1.9 4.8 2.4.4-.5.7-1.1 1-1.7a10 10 0 0 1-1.6-.8l.4-.3a10 10 0 0 0 12.2 0l.4.3a10 10 0 0 1-1.6.8c.3.6.6 1.2 1 1.7 1.6-.5 3.2-1.2 4.8-2.4.5-5-1-9.4-3.2-13.4zM8.5 15.2c-1 0-1.8-1-1.8-2.1 0-1.2.8-2.2 1.8-2.2s1.8 1 1.8 2.2c0 1.2-.8 2.1-1.8 2.1zm7 0c-1 0-1.8-1-1.8-2.1 0-1.2.8-2.2 1.8-2.2s1.8 1 1.8 2.2c0 1.2-.8 2.1-1.8 2.1z" />
  </svg>
);

const LogoMark = () => (
  <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden="true" style={{ display: 'inline-block', flexShrink: 0 }}>
    <path d="M10 6 L5 6 L5 26 L10 26" fill="none" stroke="#f0f0f0" strokeWidth="1.8" />
    <path d="M22 6 L27 6 L27 26 L22 26" fill="none" stroke="#f0f0f0" strokeWidth="1.8" />
    <circle cx="16" cy="16" r="3.2" fill="#5865f2" />
  </svg>
);

const navigation = [
  { name: 'Home', href: '/dashboard/home', icon: Home },
  { name: 'Pages', href: '/dashboard/pages', icon: FileText },
  { name: 'Members', href: '/dashboard/members', icon: Users },
  { name: 'Communities', href: '/dashboard/communities', icon: Hash },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const SERVER_COLORS = [
  '#5865f2', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#14b8a6',
];

function serverColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return SERVER_COLORS[Math.abs(hash) % SERVER_COLORS.length];
}

function serverInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || name[0]?.toUpperCase() || '?';
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { products, currentProduct, setCurrentProductId } = useProduct();
  const { user } = useAuth();
  const [discordOpen, setDiscordOpen] = useState(true);

  const userInitials = (user?.username || user?.email || 'U')
    .split(/[\s@.]+/).slice(0, 2).map((w: string) => w[0] || '').join('').toUpperCase() || 'U';

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
        {/* Logo */}
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
          <button onClick={onClose} className="lg:hidden" style={{ padding: '6px', borderRadius: '6px', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', border: 'none' }}>
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', padding: '12px 12px 0', overflowY: 'auto' }}>
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
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; } }}
              >
                {isActive && (
                  <div style={{ position: 'absolute', left: '-12px', top: '50%', transform: 'translateY(-50%)', width: '2px', height: '16px', background: 'var(--accent)', borderRadius: '0 2px 2px 0' }} />
                )}
                <item.icon size={16} style={{ color: isActive ? 'var(--accent-soft-text)' : 'currentColor', opacity: 0.9, flexShrink: 0 }} />
                {item.name}
              </Link>
            );
          })}

          {/* Communities section */}
          <div style={{ marginTop: '16px' }}>
            <div style={{ padding: '0 10px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                Communities
              </span>
            </div>

            {/* Discord group */}
            <button
              onClick={() => setDiscordOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                padding: '6px 10px', borderRadius: '6px', background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '12.5px', fontWeight: 500,
                transition: 'color 180ms ease, background 180ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'none'; }}
            >
              <span style={{
                width: '22px', height: '22px', borderRadius: '5px', flexShrink: 0,
                background: 'rgba(88,101,242,0.12)', border: '0.5px solid rgba(88,101,242,0.25)',
                color: 'var(--accent-soft-text)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <DiscordIcon />
              </span>
              <span style={{ flex: 1, textAlign: 'left' }}>Discord</span>
              <ChevronDown
                size={12}
                style={{
                  color: 'var(--text-muted)',
                  transition: 'transform 200ms ease',
                  transform: discordOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                }}
              />
            </button>

            {discordOpen && (
              <div style={{ marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {products.map((product) => {
                  const isSelected = currentProduct?.id === product.id;
                  const color = serverColor(product.name);
                  const initials = serverInitials(product.name);
                  return (
                    <div
                      key={product.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '5px 10px 5px 18px', borderRadius: '6px',
                        cursor: 'pointer', transition: 'background 180ms ease',
                        background: isSelected ? 'var(--surface-1)' : 'transparent',
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span style={{
                        width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0,
                        background: color, display: 'inline-flex', alignItems: 'center',
                        justifyContent: 'center', color: '#fff', fontSize: '9px', fontWeight: 700,
                        letterSpacing: '-0.01em',
                      }}>
                        {initials}
                      </span>
                      <span
                        style={{
                          flex: 1, fontSize: '12.5px', fontWeight: isSelected ? 500 : 400,
                          color: isSelected ? 'var(--text)' : 'var(--text-secondary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          letterSpacing: '-0.005em',
                        }}
                        onClick={() => { setCurrentProductId(product.id); onClose?.(); }}
                      >
                        {product.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* User chip at bottom */}
        <div style={{ padding: '12px', borderTop: '0.5px solid var(--border-soft)', flexShrink: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 10px', borderRadius: '6px', cursor: 'pointer',
            transition: 'background 180ms ease',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{
              width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 600, color: '#fff',
              background: 'linear-gradient(135deg, #5865f2, #7983f5)',
            }}>
              {userInitials}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, minWidth: 0, flex: 1 }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.005em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.username || user?.email?.split('@')[0] || 'Account'}
              </span>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email || ''}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
