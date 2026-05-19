'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader as Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { CommunityPlan } from '@/lib/types';

type PlanFrequency = 'monthly' | 'annual' | 'onetime';

const DEFAULT_FORM = {
  name: '',
  frequency: 'monthly' as PlanFrequency,
  price: '29.00',
  trialDays: '7',
  description: '',
  seatCap: '',
  currency: 'usd',
};

interface Props {
  open: boolean;
  communityId: string;
  onClose: () => void;
  onCreated: (plan: CommunityPlan) => void;
}

export function NewPlanModal({ open, communityId, onClose, onCreated }: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setForm(DEFAULT_FORM);
      setError('');
      setLoading(false);
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    },
    [onClose, loading],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  const nameOk = form.name.trim().length >= 2;
  const priceNum = parseFloat(form.price);
  const priceOk = !Number.isNaN(priceNum) && priceNum > 0;
  const canSubmit = nameOk && priceOk && !loading;

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const priceMinor = Math.round(priceNum * 100);
    const trial = parseInt(form.trialDays, 10);
    const trialDays = !Number.isNaN(trial) && trial > 0 ? trial : undefined;

    const payload: Parameters<typeof api.createCommunityPlan>[1] =
      form.frequency === 'annual'
        ? {
            offer_name: form.name.trim(),
            currency: form.currency,
            trial_days: trialDays,
            yearly_amount_minor: priceMinor,
            monthly_amount_minor: 0,
          }
        : {
            offer_name: form.name.trim(),
            currency: form.currency,
            trial_days: trialDays,
            monthly_amount_minor: priceMinor,
          };

    setLoading(true);
    setError('');
    try {
      const plan = await api.createCommunityPlan(communityId, payload);
      onCreated(plan);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create plan. Please try again.';
      setError(message);
      setLoading(false);
    }
  }

  if (!mounted) return null;

  const priceLabel =
    form.frequency === 'annual'
      ? 'Price (USD / year)'
      : form.frequency === 'onetime'
        ? 'Price (USD)'
        : 'Price (USD / month)';

  return (
    <div
      className={`modal-backdrop${visible ? ' is-open' : ''}`}
      aria-hidden={!visible}
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-plan-title"
      onClick={e => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="modal modal-wide" role="document" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-head-info">
            <h2 className="modal-title" id="new-plan-title">
              Create a plan
            </h2>
            <p className="modal-sub">Set pricing and details. You can add channels and selling points after.</p>
          </div>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose} disabled={loading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit} noValidate>
          <div>
            <p className="modal-section-label">Pricing &amp; details</p>
            <div className="modal-field-grid">
              <div>
                <label className="setup-field-label" htmlFor="np-name">
                  Name <span style={{ color: 'var(--accent-soft-text)' }}>*</span>
                </label>
                <input
                  id="np-name"
                  className="setup-field-input"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="VIP Monthly"
                  autoFocus
                  maxLength={60}
                  required
                />
              </div>

              <div>
                <label className="setup-field-label" htmlFor="np-frequency">
                  Frequency
                </label>
                <select
                  id="np-frequency"
                  className="setup-field-input"
                  value={form.frequency}
                  onChange={e => update('frequency', e.target.value as PlanFrequency)}
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                  <option value="onetime">One-time</option>
                </select>
              </div>

              <div>
                <label className="setup-field-label" htmlFor="np-price">
                  {priceLabel} <span style={{ color: 'var(--accent-soft-text)' }}>*</span>
                </label>
                <input
                  id="np-price"
                  className="setup-field-input"
                  type="number"
                  min="0.5"
                  step="0.01"
                  value={form.price}
                  onChange={e => update('price', e.target.value)}
                  placeholder="29.00"
                  required
                />
              </div>

              <div>
                <label className="setup-field-label" htmlFor="np-trial">
                  Trial (days)
                </label>
                <input
                  id="np-trial"
                  className="setup-field-input"
                  type="number"
                  min="0"
                  step="1"
                  value={form.trialDays}
                  onChange={e => update('trialDays', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="span-full">
                <label className="setup-field-label" htmlFor="np-description">
                  Description
                </label>
                <textarea
                  id="np-description"
                  className="setup-field-textarea"
                  rows={2}
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  placeholder="Daily signals, live sessions, and the private Discord."
                />
              </div>

              <div>
                <label className="setup-field-label" htmlFor="np-seat-cap">
                  Seat cap <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Optional</span>
                </label>
                <input
                  id="np-seat-cap"
                  className="setup-field-input"
                  value={form.seatCap}
                  onChange={e => update('seatCap', e.target.value)}
                  placeholder="No limit"
                />
              </div>

              <div>
                <label className="setup-field-label" htmlFor="np-currency">
                  Currency
                </label>
                <select
                  id="np-currency"
                  className="setup-field-input"
                  value={form.currency}
                  onChange={e => update('currency', e.target.value)}
                >
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                  <option value="ars">ARS</option>
                </select>
              </div>
            </div>
          </div>

          {error ? <p className="modal-error">{error}</p> : null}
        </form>

        <div className="modal-foot">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            onClick={handleSubmit}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              background: '#fff',
              color: '#0a0a0a',
              border: '0.5px solid #fff',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              opacity: canSubmit ? 1 : 0.4,
              fontFamily: 'inherit',
            }}
          >
            {loading && <Loader2 size={13} style={{ animation: 'np-spin 0.8s linear infinite' }} />}
            Create plan
          </button>
        </div>
      </div>

      <style>{`@keyframes np-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
