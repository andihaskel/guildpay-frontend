'use client';

import { useState, useEffect } from 'react';
import { Check, ExternalLink, RefreshCw, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts';
import { api } from '@/lib/api';
import { IntegrationProvider } from '@/lib/types';

const DiscordIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.5 4.4a16.5 16.5 0 0 0-4-1.3l-.2.4a15 15 0 0 1 3.7 1.2 14 14 0 0 0-14 0 15 15 0 0 1 3.7-1.2l-.2-.4a16.5 16.5 0 0 0-4 1.3C1.7 9 .9 13.4 1.3 17.8c1.6 1.2 3.2 1.9 4.8 2.4.4-.5.7-1.1 1-1.7a10 10 0 0 1-1.6-.8l.4-.3a10 10 0 0 0 12.2 0l.4.3a10 10 0 0 1-1.6.8c.3.6.6 1.2 1 1.7 1.6-.5 3.2-1.2 4.8-2.4.5-5-1-9.4-3.2-13.4zM8.5 15.2c-1 0-1.8-1-1.8-2.1 0-1.2.8-2.2 1.8-2.2s1.8 1 1.8 2.2c0 1.2-.8 2.1-1.8 2.1zm7 0c-1 0-1.8-1-1.8-2.1 0-1.2.8-2.2 1.8-2.2s1.8 1 1.8 2.2c0 1.2-.8 2.1-1.8 2.1z" />
  </svg>
);

const StripeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.4 10.2c0-.7.6-1 1.5-1 1.3 0 3 .4 4.3 1.1V6.4a11.4 11.4 0 0 0-4.3-.8c-3.5 0-5.9 1.8-5.9 4.9 0 4.7 6.5 4 6.5 6 0 .8-.7 1.1-1.7 1.1-1.4 0-3.3-.6-4.7-1.4v3.9c1.6.7 3.2 1 4.7 1 3.6 0 6.1-1.8 6.1-4.9 0-5.1-6.5-4.3-6.5-6z" />
  </svg>
);

const TelegramIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.7 3.3 2.6 10.7c-1.3.5-1.3 1.3-.2 1.6l4.9 1.5 1.9 5.8c.2.7.4.9.8.9.5 0 .7-.2 1-.5l2.4-2.3 5 3.7c.9.5 1.5.2 1.7-.8L22.7 5c.3-1.3-.5-1.9-1-1.7zM18 7l-8 7.3-.4 4.3-1.3-4.2 9.7-7.4z" />
  </svg>
);

const EmailIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3.5 6.5l8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function ProviderIconBox({ id, connected }: { id: string; connected: boolean }) {
  const configs: Record<string, { bg: string; border: string; color: string; Icon: React.FC<{ size?: number }> }> = {
    stripe: {
      bg: 'rgba(99,91,255,0.12)', border: 'rgba(99,91,255,0.25)', color: '#8d87ff',
      Icon: StripeIcon,
    },
    discord: {
      bg: 'rgba(88,101,242,0.12)', border: 'rgba(88,101,242,0.25)', color: '#8b92f8',
      Icon: DiscordIcon,
    },
    telegram: {
      bg: 'rgba(34,158,217,0.10)', border: 'rgba(34,158,217,0.20)', color: '#5cb8e6',
      Icon: TelegramIcon,
    },
    email: {
      bg: 'rgba(74,181,133,0.10)', border: 'rgba(74,181,133,0.20)', color: '#4ab585',
      Icon: EmailIcon,
    },
  };
  const cfg = configs[id] ?? configs.discord;
  return (
    <span style={{
      width: 36, height: 36, borderRadius: 8,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: cfg.bg, border: `0.5px solid ${cfg.border}`, color: cfg.color,
      flexShrink: 0,
      opacity: connected ? 1 : 0.85,
    }}>
      <cfg.Icon size={18} />
    </span>
  );
}

function Chip({ variant, children }: { variant: 'success' | 'muted'; children: React.ReactNode }) {
  const styles = {
    success: { bg: 'rgba(47,157,107,0.10)', border: 'rgba(47,157,107,0.22)', color: '#4ab585' },
    muted: { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' },
  };
  const s = styles[variant];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', borderRadius: 999,
      fontSize: 11.5, fontWeight: 500,
      background: s.bg, border: `0.5px solid ${s.border}`, color: s.color,
      whiteSpace: 'nowrap',
    }}>
      {variant === 'success' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />}
      {children}
    </span>
  );
}

function SettingsRow({ title, desc, right, mono }: { title: string; desc?: string; right?: React.ReactNode; mono?: boolean }) {
  return (
    <div style={{
      padding: '14px 20px', borderBottom: '0.5px solid var(--border-soft)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.005em' }}>{title}</div>
        {desc && <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 1, fontFamily: mono ? 'var(--font-mono)' : undefined }}>{desc}</div>}
      </div>
      {right}
    </div>
  );
}

function SecondaryBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '7px 13px', borderRadius: 6,
        fontSize: 13, fontWeight: 500,
        background: hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        border: hovered ? '0.5px solid rgba(255,255,255,0.3)' : '0.5px solid rgba(255,255,255,0.15)',
        color: 'var(--text)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 180ms ease',
        whiteSpace: 'nowrap' as const,
      }}
    >
      {children}
    </button>
  );
}

const PROVIDER_META: Record<string, { label: string; desc: string }> = {
  stripe: { label: 'Stripe', desc: 'Payments and subscriptions' },
  discord: { label: 'Discord', desc: 'Role-based access control' },
  telegram: { label: 'Telegram', desc: 'Auto-invite paying members to your private group or channel.' },
  email: { label: 'Email list', desc: 'Sync members to ConvertKit, Mailchimp, or Resend.' },
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [providers, setProviders] = useState<IntegrationProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getIntegrations()
      .then(res => setProviders(res.providers ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const card = {
    background: 'var(--surface-1)',
    border: '0.5px solid var(--border)',
    borderRadius: 10,
    overflow: 'hidden',
  } as React.CSSProperties;

  const cardHead = (title: string, sub: string) => (
    <div style={{ padding: '16px 20px', borderBottom: '0.5px solid var(--border-soft)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.005em', margin: 0, color: 'var(--text)' }}>{title}</h3>
        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: '2px 0 0' }}>{sub}</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: 'var(--text)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>Settings</h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0 }}>Account-wide preferences. Per-community settings live inside each community.</p>
      </div>

      {/* Profile */}
      <div style={card}>
        {cardHead('Profile', 'Your name, email, and avatar.')}
        <div>
          <SettingsRow title="Name" desc={user?.username || '—'} right={<SecondaryBtn>Edit</SecondaryBtn>} />
          <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.005em' }}>Email</div>
              {user?.email && <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 1 }}>{user.email}</div>}
            </div>
            <SecondaryBtn>Edit</SecondaryBtn>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div style={card}>
        {cardHead('Integrations', 'Connect the tools you use to charge members and deliver access.')}
        <div>
          {loading ? (
            <div style={{ padding: '28px 20px', display: 'flex', justifyContent: 'center' }}>
              <span style={{
                width: 18, height: 18, borderRadius: '50%',
                border: '2px solid var(--border-strong)', borderTopColor: 'var(--text-secondary)',
                display: 'inline-block',
                animation: 'ag-spin 0.7s linear infinite',
              }} />
              <style>{`@keyframes ag-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : providers.length === 0 ? (
            <div style={{ padding: '20px', color: 'var(--text-muted)', fontSize: 13 }}>No integrations found.</div>
          ) : (
            providers.map((p) => {
              const meta = PROVIDER_META[p.id] ?? { label: p.label, desc: '' };
              const isComingSoon = p.status === 'coming_soon';
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 20px',
                  borderBottom: '0.5px solid var(--border-soft)',
                  opacity: isComingSoon ? 0.85 : 1,
                }}>
                  <ProviderIconBox id={p.id} connected={p.has_connection} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.005em' }}>{meta.label}</span>
                      {isComingSoon && <Chip variant="muted">Coming soon</Chip>}
                      {!isComingSoon && p.has_connection && <Chip variant="success">Connected</Chip>}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{meta.desc}</span>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {isComingSoon ? (
                      <SecondaryBtn disabled>Connect</SecondaryBtn>
                    ) : p.has_connection ? (
                      <>
                        <SecondaryBtn>
                          <ExternalLink size={12} /> Open dashboard
                        </SecondaryBtn>
                        <SecondaryBtn>
                          <RefreshCw size={12} /> Switch account
                        </SecondaryBtn>
                      </>
                    ) : (
                      <SecondaryBtn>
                        <ChevronRight size={13} /> Connect
                      </SecondaryBtn>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Security */}
      <div style={card}>
        {cardHead('Security', 'Sign-in method and active sessions.')}
        <div>
          <SettingsRow
            title="Sign-in"
            desc="Email + 6-digit code"
            right={<Chip variant="success">Active</Chip>}
          />
          <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.005em' }}>Active sessions</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 1 }}>Your current signed-in devices</div>
            </div>
            <SecondaryBtn>Review</SecondaryBtn>
          </div>
        </div>
      </div>
    </div>
  );
}
