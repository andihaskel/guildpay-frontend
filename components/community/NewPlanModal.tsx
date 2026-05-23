'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader as Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { CommunityPlan } from '@/lib/types';
import { fmtAmount, planInitials } from '@/components/community/setup-utils';
import { PlanSellingPoint } from '@/components/community/setup-preview-types';
import { PlanSellingPointsEditor } from '@/components/community/PlanSellingPointsEditor';
import { buildCreateCommunityPlanPayload } from '@/components/community/create-plan-payload';

type BillingType = 'recurring' | 'onetime';

const PLAN_COLORS = [
  '#5865f2',
  '#7c3aed',
  '#2f9d6b',
  '#d97706',
  '#dc2626',
  '#0891b2',
  '#db2777',
  '#475569',
];

const DEFAULT_FORM = {
  name: '',
  billingType: 'recurring' as BillingType,
  currency: 'usd',
  trialDays: '0',
  monthlyEnabled: true,
  monthlyPrice: '29.00',
  annualEnabled: false,
  annualPrice: '',
  oneTimePrice: '499.00',
  description: '',
  seatCap: '',
  color: PLAN_COLORS[0],
};

function parseMoney(value: string): number {
  const n = parseFloat(value.replace(/[^0-9.]/g, ''));
  return Number.isNaN(n) ? 0 : n;
}

interface Props {
  open: boolean;
  communityId: string;
  onClose: () => void;
  onCreated: (plan: CommunityPlan, sellingPoints?: PlanSellingPoint[]) => void;
}

export function NewPlanModal({ open, communityId, onClose, onCreated }: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [sellingPoints, setSellingPoints] = useState<PlanSellingPoint[]>([]);
  const [draftSellingPointIds, setDraftSellingPointIds] = useState<Set<string>>(() => new Set());
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
      setSellingPoints([]);
      setDraftSellingPointIds(new Set());
      setError('');
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
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

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  const displayName = form.name.trim() || 'New plan';
  const displayDescription = form.description.trim() || 'No description yet';
  const initials = form.name.trim() ? planInitials(form.name) : 'NP';

  const previewPrice = useMemo(() => {
    const cur = form.currency;
    if (form.billingType === 'onetime') {
      const minor = Math.round(parseMoney(form.oneTimePrice) * 100);
      return { text: fmtAmount(minor, cur), suffix: '' };
    }
    if (form.monthlyEnabled) {
      const minor = Math.round(parseMoney(form.monthlyPrice) * 100);
      return { text: fmtAmount(minor, cur), suffix: ' / month' };
    }
    if (form.annualEnabled) {
      const minor = Math.round(parseMoney(form.annualPrice) * 100);
      return { text: fmtAmount(minor, cur), suffix: ' / year' };
    }
    return { text: fmtAmount(0, cur), suffix: ' / month' };
  }, [form]);

  const monthlyMinor = Math.round(parseMoney(form.monthlyPrice) * 100);
  const annualMinor = Math.round(parseMoney(form.annualPrice) * 100);
  const oneTimeMinor = Math.round(parseMoney(form.oneTimePrice) * 100);

  const nameOk = form.name.trim().length >= 2;
  const recurringCyclesOk = form.monthlyEnabled || form.annualEnabled;
  const recurringPricesOk =
    (!form.monthlyEnabled || monthlyMinor > 0) && (!form.annualEnabled || annualMinor > 0);
  const pricingOk =
    form.billingType === 'onetime'
      ? oneTimeMinor > 0
      : recurringCyclesOk && recurringPricesOk;

  const canSubmit = nameOk && pricingOk && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const payload = buildCreateCommunityPlanPayload(form, sellingPoints, draftSellingPointIds);
    const confirmedSellingPoints = payload.features?.map(feature => ({
      id: feature.id,
      icon: feature.icon,
      title: feature.title,
      description: feature.description,
    }));

    setLoading(true);
    setError('');
    try {
      const plan = await api.createCommunityPlan(communityId, payload);
      onCreated(plan, confirmedSellingPoints);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create plan. Please try again.';
      setError(message);
      setLoading(false);
    }
  }

  if (!mounted) return null;

  const currencyLabel = form.currency.toUpperCase();

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
      <div className="modal modal-plan" role="document" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-head-info">
            <h2 className="modal-title" id="new-plan-title">
              Create a plan
            </h2>
            <p className="modal-sub">Plans are how members pay to access this community.</p>
          </div>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose} disabled={loading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form className="modal-body" id="new-plan-form" onSubmit={handleSubmit} noValidate>
          <div className="np-preview">
            <span className="np-preview-icon" style={{ background: form.color }}>
              {initials}
            </span>
            <div className="np-preview-text">
              <span className="np-preview-name">{displayName}</span>
              <span className="np-preview-desc">{displayDescription}</span>
            </div>
            <span className="np-preview-price">
              {previewPrice.text}
              {previewPrice.suffix}
            </span>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="np-name">
              Plan name
            </label>
            <input
              id="np-name"
              className="field-input"
              value={form.name}
              onChange={e => update('name', e.target.value)}
              placeholder="e.g. VIP, Premium, Founders"
              autoFocus
              maxLength={60}
              required
            />
          </div>

          <div className="field">
            <span className="field-label">Billing type</span>
            <div className="np-seg" role="tablist" aria-label="Billing type">
              <button
                type="button"
                role="tab"
                aria-selected={form.billingType === 'recurring'}
                className={form.billingType === 'recurring' ? 'is-active' : ''}
                onClick={() => update('billingType', 'recurring')}
              >
                Recurring
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={form.billingType === 'onetime'}
                className={form.billingType === 'onetime' ? 'is-active' : ''}
                onClick={() => update('billingType', 'onetime')}
              >
                One-time
              </button>
            </div>
          </div>

          <div className="modal-field-grid">
            <div className="field">
              <label className="field-label" htmlFor="np-currency">
                Currency
              </label>
              <select
                id="np-currency"
                className="field-input"
                value={form.currency}
                onChange={e => update('currency', e.target.value)}
              >
                <option value="usd">USD</option>
                <option value="eur">EUR</option>
                <option value="ars">ARS</option>
              </select>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="np-trial">
                Trial <span className="optional">Optional</span>
              </label>
              <div className="np-input-suffix">
                <input
                  id="np-trial"
                  className="field-input"
                  type="number"
                  min="0"
                  step="1"
                  value={form.trialDays}
                  onChange={e => update('trialDays', e.target.value)}
                  placeholder="0"
                />
                <span className="np-input-suffix-tag">days</span>
              </div>
            </div>
          </div>

          <div
            className={`np-cycles${form.billingType === 'onetime' ? ' is-dimmed' : ''}`}
            aria-hidden={form.billingType === 'onetime'}
          >
            <div className="np-cycles-head">
              <span className="np-cycles-title">Billing cycles</span>
              <span className="np-cycles-hint">Members choose at checkout</span>
            </div>

            <div className={`np-cycle${form.monthlyEnabled ? ' is-on' : ''}`}>
              <label className="np-cycle-top">
                <input
                  type="checkbox"
                  checked={form.monthlyEnabled}
                  onChange={e => update('monthlyEnabled', e.target.checked)}
                  disabled={form.billingType === 'onetime'}
                />
                <span className="np-cycle-label">
                  <strong>Monthly</strong>
                  <span className="np-cycle-sub">· renews every month</span>
                </span>
                {form.monthlyEnabled && form.billingType === 'recurring' ? (
                  <span className="np-cycle-badge">Default</span>
                ) : null}
              </label>
              {form.monthlyEnabled && form.billingType === 'recurring' ? (
                <div className="np-money">
                  <span className="np-money-prefix">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="np-money-input"
                    value={form.monthlyPrice}
                    onChange={e => update('monthlyPrice', e.target.value)}
                    aria-label="Monthly price"
                  />
                  <span className="np-money-suffix">{currencyLabel} / month</span>
                </div>
              ) : null}
            </div>

            <div className={`np-cycle${form.annualEnabled ? ' is-on' : ''}`}>
              <label className="np-cycle-top">
                <input
                  type="checkbox"
                  checked={form.annualEnabled}
                  onChange={e => update('annualEnabled', e.target.checked)}
                  disabled={form.billingType === 'onetime'}
                />
                <span className="np-cycle-label">
                  <strong>Annual</strong>
                  <span className="np-cycle-sub">· offer a discounted yearly rate</span>
                </span>
              </label>
              {form.annualEnabled && form.billingType === 'recurring' ? (
                <div className="np-money">
                  <span className="np-money-prefix">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="np-money-input"
                    value={form.annualPrice}
                    onChange={e => update('annualPrice', e.target.value)}
                    placeholder="290.00"
                    aria-label="Annual price"
                  />
                  <span className="np-money-suffix">{currencyLabel} / year</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className={`field${form.billingType === 'recurring' ? ' is-dimmed' : ''}`}>
            <label className="field-label" htmlFor="np-onetime-price">
              Price
            </label>
            <div className="np-money">
              <span className="np-money-prefix">$</span>
              <input
                id="np-onetime-price"
                type="text"
                inputMode="decimal"
                className="np-money-input"
                value={form.oneTimePrice}
                onChange={e => update('oneTimePrice', e.target.value)}
                disabled={form.billingType === 'recurring'}
                aria-label="One-time price"
              />
              <span className="np-money-suffix">{currencyLabel} · one-time</span>
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="np-description">
              Description <span className="optional">Optional</span>
            </label>
            <textarea
              id="np-description"
              className="field-textarea"
              rows={2}
              value={form.description}
              onChange={e => update('description', e.target.value)}
              placeholder="One line members read when comparing plans."
            />
          </div>

          <PlanSellingPointsEditor
            points={sellingPoints}
            onChange={setSellingPoints}
            draftIds={draftSellingPointIds}
            onDraftIdsChange={setDraftSellingPointIds}
          />

          <div className="modal-field-grid">
            <div className="field">
              <label className="field-label" htmlFor="np-seat-cap">
                Seat cap <span className="optional">Optional</span>
              </label>
              <input
                id="np-seat-cap"
                className="field-input"
                value={form.seatCap}
                onChange={e => update('seatCap', e.target.value)}
                placeholder="No limit"
              />
            </div>

            <div className="field">
              <span className="field-label">Color</span>
              <div className="np-swatch-row" role="radiogroup" aria-label="Plan color">
                {PLAN_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className="np-swatch"
                    style={{ background: color }}
                    aria-label={`Color ${color}`}
                    aria-pressed={form.color === color}
                    onClick={() => update('color', color)}
                  />
                ))}
              </div>
            </div>
          </div>

          {error ? <p className="modal-error">{error}</p> : null}
        </form>

        <div className="modal-foot">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" form="new-plan-form" className="btn btn-primary" disabled={!canSubmit}>
            {loading ? (
              <>
                <Loader2 size={13} className="modal-btn-spinner" aria-hidden />
                <span className="btn-label">Creating…</span>
              </>
            ) : (
              <span className="btn-label">Create plan</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
