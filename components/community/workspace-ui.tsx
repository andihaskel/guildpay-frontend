'use client';

import { CommunityMember } from '@/lib/types';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#5865f2,#7983f5)',
  'linear-gradient(135deg,#2b7a4b,#3fb27a)',
  'linear-gradient(135deg,#b84a3a,#e0735a)',
  'linear-gradient(135deg,#6b3fb2,#9b6de0)',
  'linear-gradient(135deg,#c4963a,#e8b85a)',
];

export function avatarGradient(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
}

export function memberInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0] || '')
    .join('')
    .toUpperCase() || '?';
}

export function fmtAmount(minor: number, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: minor % 100 === 0 ? 0 : 2,
  }).format(minor / 100);
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m || 1}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

export function StatCard({
  label,
  value,
  delta,
  deltaDown,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaDown?: boolean;
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {delta ? (
        <div className={`stat-delta${deltaDown ? ' down' : ''}`}>{delta}</div>
      ) : null}
    </div>
  );
}



export function PaymentStatusChip({ status }: { status: CommunityMember['payment_status'] | string }) {
  const map: Record<string, { className: string; label: string }> = {
    active: { className: 'chip chip-success', label: 'Active' },
    trialing: { className: 'chip chip-accent', label: 'Trialing' },
    canceling: { className: 'chip chip-warning', label: 'Canceling' },
    free: { className: 'chip chip-muted', label: 'Free' },
  };
  const s = map[status] ?? map.free;
  return (
    <span className={s.className}>
      <span className="chip-dot" />
      {s.label}
    </span>
  );
}

export function MemberAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const initials = memberInitials(name);
  const gradient = avatarGradient(name);
  const darkText = gradient.includes('#c4963a');

  return (
    <span
      className="avatar"
      style={{
        background: avatarUrl ? 'transparent' : gradient,
        color: darkText ? '#1a1500' : '#fff',
      }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initials
      )}
    </span>
  );
}

export function BtnSecondary({
  children,
  onClick,
  active,
  disabled,
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      className={`btn-secondary${active ? ' is-active' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
