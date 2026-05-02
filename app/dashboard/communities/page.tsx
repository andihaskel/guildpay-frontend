'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { useProduct } from '@/contexts';
import { Product } from '@/lib/types';

const DiscordIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.5 4.4a16.5 16.5 0 0 0-4-1.3l-.2.4a15 15 0 0 1 3.7 1.2 14 14 0 0 0-14 0 15 15 0 0 1 3.7-1.2l-.2-.4a16.5 16.5 0 0 0-4 1.3C1.7 9 .9 13.4 1.3 17.8c1.6 1.2 3.2 1.9 4.8 2.4.4-.5.7-1.1 1-1.7a10 10 0 0 1-1.6-.8l.4-.3a10 10 0 0 0 12.2 0l.4.3a10 10 0 0 1-1.6.8c.3.6.6 1.2 1 1.7 1.6-.5 3.2-1.2 4.8-2.4.5-5-1-9.4-3.2-13.4zM8.5 15.2c-1 0-1.8-1-1.8-2.1 0-1.2.8-2.2 1.8-2.2s1.8 1 1.8 2.2c0 1.2-.8 2.1-1.8 2.1zm7 0c-1 0-1.8-1-1.8-2.1 0-1.2.8-2.2 1.8-2.2s1.8 1 1.8 2.2c0 1.2-.8 2.1-1.8 2.1z" />
  </svg>
);

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

function ServerStatusChip({ product }: { product: Product }) {
  const hasPages = (product.pages_count ?? 0) > 0;
  const hasMembers = (product.members_count ?? 0) > 0;

  if (hasMembers) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '2px 8px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 500,
        background: 'var(--success-soft-bg)', border: '0.5px solid var(--success-soft-border)',
        color: 'var(--success-soft-text)', whiteSpace: 'nowrap',
      }}>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
        Active
      </span>
    );
  }
  if (hasPages) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '2px 8px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 500,
        background: 'var(--accent-soft-bg)', border: '0.5px solid var(--accent-soft-border)',
        color: 'var(--accent-soft-text)', whiteSpace: 'nowrap',
      }}>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
        Connected
      </span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '2px 8px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 500,
      background: 'var(--warning-soft-bg)', border: '0.5px solid var(--warning-soft-border)',
      color: 'var(--warning-soft-text)', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
      Not in use
    </span>
  );
}

function ServerRow({ product, isSelected, onSelect }: { product: Product; isSelected: boolean; onSelect: () => void }) {
  const router = useRouter();
  const color = serverColor(product.name);
  const initials = serverInitials(product.name);
  const members = product.members_count ?? 0;
  const roles = product.roles_count ?? 0;
  const pages = product.pages_count ?? 0;

  const subParts: string[] = [];
  if (members > 0) subParts.push(`${members} member${members !== 1 ? 's' : ''}`);
  if (roles > 0) subParts.push(`${roles} role${roles !== 1 ? 's' : ''}`);
  if (pages > 0) subParts.push(`${pages} page${pages !== 1 ? 's' : ''}`);
  if (subParts.length === 0) subParts.push('No pages yet');

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '14px 20px',
        borderBottom: '0.5px solid var(--border-soft)',
        transition: 'background 180ms ease',
        cursor: 'default',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Server icon */}
      <span style={{
        width: '36px', height: '36px', borderRadius: '9px', flexShrink: 0,
        background: color, display: 'inline-flex', alignItems: 'center',
        justifyContent: 'center', color: '#fff', fontSize: '13px',
        fontWeight: 700, letterSpacing: '-0.01em',
      }}>
        {initials}
      </span>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.005em' }}>
            {product.name}
          </span>
          <ServerStatusChip product={product} />
          {isSelected && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '2px 8px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 500,
              background: 'var(--accent-soft-bg)', border: '0.5px solid var(--accent-soft-border)',
              color: 'var(--accent-soft-text)', whiteSpace: 'nowrap',
            }}>
              Current
            </span>
          )}
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {subParts.join(' · ')}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <button
          onClick={() => { onSelect(); router.push('/dashboard/home'); }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '12.5px', fontWeight: 500, padding: '6px 12px', borderRadius: '6px',
            background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)',
            color: 'var(--text)', cursor: 'pointer', transition: 'border-color 180ms ease, background 180ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'transparent'; }}
        >
          Manage
        </button>
      </div>
    </div>
  );
}

function ComingSoonBlock({ title, icon, description }: { title: string; icon: React.ReactNode; description: string }) {
  return (
    <div style={{
      background: 'var(--surface-1)', border: '0.5px solid var(--border)',
      borderRadius: '10px', overflow: 'hidden', marginBottom: '16px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '16px', padding: '16px 20px',
        borderBottom: '0.5px solid var(--border-soft)', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.04)', border: '0.5px solid var(--border)',
            color: 'var(--text-muted)',
          }}>
            {icon}
          </span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', margin: 0, letterSpacing: '-0.01em' }}>
                {title}
              </h2>
              <span style={{
                display: 'inline-flex', alignItems: 'center', padding: '1px 7px',
                borderRadius: '999px', fontSize: '11px', fontWeight: 500,
                background: 'rgba(255,255,255,0.04)', border: '0.5px solid var(--border)',
                color: 'var(--text-muted)',
              }}>
                Coming soon
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              {description}
            </p>
          </div>
        </div>
        <button
          disabled
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '12.5px', fontWeight: 500, padding: '7px 13px', borderRadius: '6px',
            background: 'transparent', border: '0.5px solid var(--border)',
            color: 'var(--text-muted)', cursor: 'not-allowed', opacity: 0.5,
          }}
        >
          Connect
        </button>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{
          width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)',
          color: 'var(--text-muted)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </span>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
          Integration coming soon — we'll let you know when it's ready.
        </p>
      </div>
    </div>
  );
}

export default function CommunitiesPage() {
  const { products, currentProduct, setCurrentProductId } = useProduct();
  const [discordOpen, setDiscordOpen] = useState(true);

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--text)', margin: '0 0 4px', letterSpacing: '-0.015em' }}>
          Communities
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
          Connect the places where your paying members get access.
        </p>
      </div>

      {/* Discord block */}
      <div style={{
        background: 'var(--surface-1)', border: '0.5px solid var(--border)',
        borderRadius: '10px', overflow: 'hidden', marginBottom: '16px',
      }}>
        {/* Block header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '16px', padding: '16px 20px',
          borderBottom: discordOpen ? '0.5px solid var(--border-soft)' : 'none',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => setDiscordOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, flex: 1, minWidth: 0, textAlign: 'left',
            }}
          >
            <span style={{
              width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(88,101,242,0.12)', border: '0.5px solid rgba(88,101,242,0.25)',
              color: 'var(--accent-soft-text)',
            }}>
              <DiscordIcon size={16} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', margin: 0, letterSpacing: '-0.01em' }}>
                  Discord
                </h2>
                <ChevronDown
                  size={13}
                  style={{
                    color: 'var(--text-muted)',
                    transition: 'transform 200ms ease',
                    transform: discordOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                  }}
                />
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '1px 0 0' }}>
                {products.length} server{products.length !== 1 ? 's' : ''} connected
              </p>
            </div>
          </button>

          <a
            href={`https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '12.5px', fontWeight: 500, padding: '7px 13px', borderRadius: '6px',
              background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)',
              color: 'var(--text)', cursor: 'pointer', textDecoration: 'none',
              transition: 'border-color 180ms ease, background 180ms ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.03)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
          >
            <ExternalLink size={12} />
            Add server
          </a>
        </div>

        {/* Server list */}
        {discordOpen && (
          <div>
            {products.length === 0 ? (
              <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                <span style={{
                  width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)',
                  color: 'var(--text-muted)',
                }}>
                  <DiscordIcon size={16} />
                </span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '0 0 2px' }}>No Discord servers yet</p>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
                    Add a server to start accepting members via Discord roles.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {products.map((product, idx) => (
                  <div key={product.id} style={{ borderBottom: idx < products.length - 1 ? '0.5px solid var(--border-soft)' : 'none' }}>
                    <ServerRow
                      product={product}
                      isSelected={currentProduct?.id === product.id}
                      onSelect={() => setCurrentProductId(product.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Telegram coming soon */}
      <ComingSoonBlock
        title="Telegram"
        description="Auto-add paying members to private groups and channels."
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.7 3.3 2.6 10.7c-1.3.5-1.3 1.3-.2 1.6l4.9 1.5 1.9 5.8c.2.7.4.9.8.9.5 0 .7-.2 1-.5l2.4-2.3 5 3.7c.9.5 1.5.2 1.7-.8L22.7 5c.3-1.3-.5-1.9-1-1.7zM18 7l-8 7.3-.4 4.3-1.3-4.2 9.7-7.4z" />
          </svg>
        }
      />

      {/* Email list coming soon */}
      <ComingSoonBlock
        title="Email list"
        description="Sync paying members to your newsletter and broadcast to subscribers only."
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3.5 6.5l8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
      />

      {/* Footer note */}
      <div style={{
        marginTop: '8px', padding: '12px 14px',
        background: 'var(--accent-soft-bg)', border: '0.5px solid var(--accent-soft-border)',
        borderRadius: '8px', color: 'var(--accent-soft-text)',
        fontSize: '12.5px', lineHeight: '1.55',
        display: 'flex', alignItems: 'flex-start', gap: '9px',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 8v5M12 16.5v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span>
          A page can connect to multiple communities. When someone pays, they get access to{' '}
          <strong style={{ color: 'var(--text)', fontWeight: 500 }}>all of them</strong> — automatically.
        </span>
      </div>
    </div>
  );
}
