'use client';

import { useState, useEffect } from 'react';
import { Check, RefreshCw, ExternalLink, Trash2, TriangleAlert as AlertTriangle, Loader as Loader2, Zap, Link as LinkIcon } from 'lucide-react';
import { useProduct } from '@/contexts';
import { ProductOverview } from '@/lib/types';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const { currentProduct } = useProduct();
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<ProductOverview | null>(null);

  useEffect(() => {
    if (currentProduct?.id) {
      loadOverview();
    }
  }, [currentProduct?.id]);

  const loadOverview = async () => {
    if (!currentProduct?.id) return;
    try {
      setIsLoading(true);
      const data = await api.getProductOverview(currentProduct.id);
      setOverview(data);
    } catch (error) {
      console.error('Failed to load overview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stripeConnected = overview?.onboarding.stripe_connected ?? false;

  const permissions = [
    { name: 'Manage Roles' },
    { name: 'Send Messages' },
    { name: 'Read Messages' },
    { name: 'Manage Members' },
  ];

  const card = { background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: '10px', padding: '20px 24px' } as React.CSSProperties;
  const sectionTitle = (text: string) => (
    <p style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)', margin: '0 0 16px' }}>{text}</p>
  );
  const statusRow = (ok: boolean, okLabel: string, okSub: string, badLabel: string, badSub: string, badColor: string) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px',
      borderRadius: '8px',
      background: ok ? 'rgba(34,197,94,0.05)' : `rgba(${badColor},0.05)`,
      border: `0.5px solid ${ok ? 'rgba(34,197,94,0.15)' : `rgba(${badColor},0.15)`}`,
      marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: ok ? 'rgba(34,197,94,0.1)' : `rgba(${badColor},0.1)`, border: `0.5px solid ${ok ? 'rgba(34,197,94,0.2)' : `rgba(${badColor},0.2)`}`, flexShrink: 0 }}>
          {ok ? <Check size={13} style={{ color: '#4ade80' }} /> : <Zap size={13} style={{ color: `rgb(${badColor})` }} />}
        </div>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '0 0 2px' }}>{ok ? okLabel : badLabel}</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{ok ? okSub : badSub}</p>
        </div>
      </div>
      <span style={{ fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '20px', background: ok ? 'rgba(34,197,94,0.08)' : `rgba(${badColor},0.08)`, border: `0.5px solid ${ok ? 'rgba(34,197,94,0.2)' : `rgba(${badColor},0.2)`}`, color: ok ? '#4ade80' : `rgb(${badColor})` }}>
        {ok ? 'Active' : 'Required'}
      </span>
    </div>
  );

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <Loader2 size={20} style={{ color: 'var(--text-muted)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ marginBottom: '12px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--text)', margin: '0 0 4px', letterSpacing: '-0.015em' }}>Settings</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Manage your product configuration and integrations</p>
      </div>

      <div style={card}>
        {sectionTitle('Product Information')}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--surface-2)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--text-secondary)' }}>
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', margin: '0 0 4px' }}>
              {currentProduct?.guildName || currentProduct?.name || 'Discord Server'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', margin: '0 0 10px' }}>
              {overview?.discord_guild_id || currentProduct?.discord_guild_id}
            </p>
            <span style={{ fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '20px', background: 'rgba(34,197,94,0.08)', border: '0.5px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>Active</span>
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          {sectionTitle('Discord Integration')}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--text-muted)', marginTop: '-16px' }}>
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
        </div>

        {statusRow(true, 'Bot installed & active', 'All required permissions are granted', '', '', '34,197,94')}

        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 10px' }}>Required permissions</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {permissions.map((permission, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={12} style={{ color: '#4ade80', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{permission.name}</span>
              </div>
            ))}
          </div>
        </div>

        {!currentProduct?.bot_installed && (
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, background: 'none', border: '0.5px solid var(--border-strong)', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 180ms ease' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <RefreshCw size={13} /> Reauthorize Discord
          </button>
        )}
      </div>

      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          {sectionTitle('Stripe Integration')}
          <svg width="48" height="20" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginTop: '-16px' }}>
            <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.93 0 1.85 6.29.97 6.29 5.88z" fill="var(--text-muted)"/>
          </svg>
        </div>

        {stripeConnected ? (
          <>
            {statusRow(true, 'Account connected', 'Payments are enabled on your pages', '', '', '34,197,94')}
            <div style={{ display: 'flex', gap: '8px' }}>
              {overview?.stripe_dashboard_url && (
                <a href={overview.stripe_dashboard_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: 'none' }}>
                  <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, background: 'none', border: '0.5px solid var(--border-strong)', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 180ms ease' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    <ExternalLink size={13} /> Manage in Stripe
                  </button>
                </a>
              )}
              {overview?.stripe_connect_url && (
                <a href={overview.stripe_connect_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, background: 'none', border: '0.5px solid var(--border-strong)', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 180ms ease' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    <RefreshCw size={13} /> Reconnect
                  </button>
                </a>
              )}
            </div>
          </>
        ) : (
          <>
            {statusRow(false, '', '', 'Not connected', 'Connect Stripe to enable payments on your pages', '245,158,11')}
            {overview?.stripe_connect_url && (
              <a href={overview.stripe_connect_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
                <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '9px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', transition: 'opacity 180ms ease' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <LinkIcon size={13} /> Connect Stripe Account
                </button>
              </a>
            )}
          </>
        )}
      </div>

      <div style={{ background: 'rgba(239,68,68,0.03)', border: '0.5px solid rgba(239,68,68,0.12)', borderRadius: '10px', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <AlertTriangle size={14} style={{ color: '#f87171' }} />
          <p style={{ fontSize: '13.5px', fontWeight: 500, color: '#f87171', margin: 0 }}>Danger Zone</p>
        </div>
        <div style={{ padding: '14px 16px', background: 'rgba(239,68,68,0.05)', border: '0.5px solid rgba(239,68,68,0.12)', borderRadius: '8px' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '0 0 6px' }}>Delete Product</p>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '0 0 14px', lineHeight: 1.5 }}>
            Permanently removes all monetized roles and member associations. This action cannot be undone.
          </p>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 500, background: 'none', border: '0.5px solid rgba(239,68,68,0.25)', color: '#f87171', cursor: 'pointer', transition: 'all 180ms ease' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; }}
          >
            <Trash2 size={13} /> Delete Product
          </button>
        </div>
      </div>
    </div>
  );
}
