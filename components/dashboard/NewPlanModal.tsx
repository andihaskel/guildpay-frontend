'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Loader as Loader2, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';
import { DiscordRole } from '@/lib/types';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
const TRIAL_OPTIONS = [
  { label: 'No trial', value: 0 },
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
];

interface Props {
  open: boolean;
  communityId: string;
  onClose: () => void;
  onCreated: () => void;
}

function fieldStyle(focused: boolean): React.CSSProperties {
  return {
    width: '100%', padding: '9px 12px', borderRadius: '7px',
    background: 'var(--surface-2)', border: `0.5px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
    color: 'var(--text)', fontSize: '13.5px', outline: 'none',
    transition: 'border-color 160ms ease', boxSizing: 'border-box',
    fontFamily: 'inherit',
  };
}

function selectStyle(focused: boolean): React.CSSProperties {
  return {
    ...fieldStyle(focused),
    appearance: 'none', WebkitAppearance: 'none',
    paddingRight: '32px', cursor: 'pointer',
  };
}

function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>{children}</label>;
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative' }}>
      {children}
      <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
    </div>
  );
}

export function NewPlanModal({ open, communityId, onClose, onCreated }: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const [offerName, setOfferName] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [yearlyEnabled, setYearlyEnabled] = useState(false);
  const [yearlyPrice, setYearlyPrice] = useState('');
  const [trialDays, setTrialDays] = useState(0);
  const [discordRoleId, setDiscordRoleId] = useState('');
  const [discordRoles, setDiscordRoles] = useState<DiscordRole[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [focusedField, setFocusedField] = useState('');

  // Open/close animation
  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 260);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Reset and load roles on open
  useEffect(() => {
    if (open) {
      setOfferName('');
      setPrice('');
      setCurrency('USD');
      setYearlyEnabled(false);
      setYearlyPrice('');
      setTrialDays(0);
      setDiscordRoleId('');
      setError('');
      setLoading(false);

      setLoadingRoles(true);
      api.getCommunityOverview(communityId).then(async overview => {
        if (overview?.onboarding) {
          // Try to fetch discord roles via community channels or overview
        }
        // Fall through — roles loaded below via community
      }).catch(() => {}).finally(() => {});

      // Load discord roles from community overview
      api.getCommunity(communityId).then(comm => {
        if (comm.discord_guild_id) {
          api.getDiscordGuildRoles(comm.discord_guild_id).then(roles => {
            setDiscordRoles(roles);
            if (roles.length > 0) setDiscordRoleId(roles[0].id);
          }).catch(() => {}).finally(() => setLoadingRoles(false));
        } else {
          setLoadingRoles(false);
        }
      }).catch(() => setLoadingRoles(false));
    }
  }, [open, communityId]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  const priceMinor = Math.round(parseFloat(price || '0') * 100);
  const yearlyPriceMinor = Math.round(parseFloat(yearlyPrice || '0') * 100);
  const canSubmit = offerName.trim().length >= 2 && priceMinor > 0 && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      await api.createCommunityPlan(communityId, {
        offer_name: offerName.trim(),
        monthly_amount_minor: priceMinor,
        currency: currency.toLowerCase(),
        yearly_amount_minor: yearlyEnabled && yearlyPriceMinor > 0 ? yearlyPriceMinor : undefined,
        trial_days: trialDays > 0 ? trialDays : undefined,
        discord_role_id: discordRoleId || undefined,
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create plan. Please try again.');
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        background: visible ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(6px)' : 'blur(0px)',
        WebkitBackdropFilter: visible ? 'blur(6px)' : 'blur(0px)',
        transition: 'background 260ms ease, backdrop-filter 260ms ease',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'var(--surface-1)',
          border: '0.5px solid var(--border)',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
          opacity: visible ? 1 : 0,
          transition: 'transform 260ms cubic-bezier(0.16,1,0.3,1), opacity 260ms ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 22px 16px', borderBottom: '0.5px solid var(--border-soft)' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', margin: 0, letterSpacing: '-0.01em' }}>New plan</h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Create a subscription plan for this community</p>
          </div>
          <button
            onClick={onClose}
            style={{ padding: '6px', borderRadius: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', transition: 'color 160ms ease, background 160ms ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Offer name */}
          <div>
            <Label>Plan name <span style={{ color: '#e06a6a' }}>*</span></Label>
            <input
              type="text"
              value={offerName}
              onChange={e => setOfferName(e.target.value)}
              placeholder="e.g. Monthly Access"
              autoFocus
              maxLength={80}
              className="ag-modal-input"
              style={fieldStyle(focusedField === 'name')}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField('')}
            />
          </div>

          {/* Price row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '10px' }}>
            <div>
              <Label>Monthly price <span style={{ color: '#e06a6a' }}>*</span></Label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="29.00"
                min="0.50"
                step="0.01"
                className="ag-modal-input"
                style={fieldStyle(focusedField === 'price')}
                onFocus={() => setFocusedField('price')}
                onBlur={() => setFocusedField('')}
              />
            </div>
            <div>
              <Label>Currency</Label>
              <SelectWrapper>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  style={selectStyle(focusedField === 'currency')}
                  onFocus={() => setFocusedField('currency')}
                  onBlur={() => setFocusedField('')}
                >
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </SelectWrapper>
            </div>
          </div>

          {/* Yearly option */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: yearlyEnabled ? '10px' : 0 }}>
              <button
                type="button"
                onClick={() => setYearlyEnabled(!yearlyEnabled)}
                style={{
                  width: '36px', height: '20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: yearlyEnabled ? 'var(--accent, #5865f2)' : 'rgba(255,255,255,0.12)',
                  position: 'relative', flexShrink: 0, transition: 'background 180ms ease',
                }}
              >
                <span style={{
                  position: 'absolute', top: '2px', left: yearlyEnabled ? 'calc(100% - 18px)' : '2px',
                  width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
                  transition: 'left 180ms ease',
                }} />
              </button>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Offer yearly billing</span>
            </div>
            {yearlyEnabled && (
              <div>
                <Label>Yearly price</Label>
                <input
                  type="number"
                  value={yearlyPrice}
                  onChange={e => setYearlyPrice(e.target.value)}
                  placeholder="290.00"
                  min="0.50"
                  step="0.01"
                  className="ag-modal-input"
                  style={fieldStyle(focusedField === 'yearly')}
                  onFocus={() => setFocusedField('yearly')}
                  onBlur={() => setFocusedField('')}
                />
              </div>
            )}
          </div>

          {/* Trial + Role row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <Label>Free trial</Label>
              <SelectWrapper>
                <select
                  value={trialDays}
                  onChange={e => setTrialDays(Number(e.target.value))}
                  style={selectStyle(focusedField === 'trial')}
                  onFocus={() => setFocusedField('trial')}
                  onBlur={() => setFocusedField('')}
                >
                  {TRIAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </SelectWrapper>
            </div>
            <div>
              <Label>Discord role</Label>
              {loadingRoles ? (
                <div style={{ ...fieldStyle(false), display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                  <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px' }}>Loading...</span>
                </div>
              ) : discordRoles.length === 0 ? (
                <div style={{ ...fieldStyle(false), color: 'var(--text-muted)', fontSize: '13px' }}>No roles found</div>
              ) : (
                <SelectWrapper>
                  <select
                    value={discordRoleId}
                    onChange={e => setDiscordRoleId(e.target.value)}
                    style={selectStyle(focusedField === 'role')}
                    onFocus={() => setFocusedField('role')}
                    onBlur={() => setFocusedField('')}
                  >
                    <option value="">No role</option>
                    {discordRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </SelectWrapper>
              )}
            </div>
          </div>

          {error && (
            <div style={{ fontSize: '12.5px', color: '#e06a6a', background: 'rgba(224,106,106,0.08)', border: '0.5px solid rgba(224,106,106,0.2)', borderRadius: '6px', padding: '9px 12px' }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, background: 'none', border: '0.5px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'background 160ms ease, color 160ms ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
                background: '#fff', color: '#0a0a0a', border: 'none',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                opacity: canSubmit ? 1 : 0.35,
                transition: 'opacity 160ms ease',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
              }}
            >
              {loading && <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />}
              Create plan
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .ag-modal-input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}
