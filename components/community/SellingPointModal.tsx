'use client';

import { useCallback, useEffect, useState } from 'react';
import { PlanSellingPoint } from '@/components/community/setup-preview-types';
import { SELLING_POINT_ICONS } from '@/components/community/plan-selling-points';

type SellingPointDraft = {
  icon: string;
  title: string;
  description: string;
};

const EMPTY_DRAFT: SellingPointDraft = {
  icon: SELLING_POINT_ICONS[0],
  title: '',
  description: '',
};

type Props = {
  open: boolean;
  mode?: 'add' | 'edit';
  initial?: PlanSellingPoint | null;
  onClose: () => void;
  onSubmit: (point: Omit<PlanSellingPoint, 'id'> & { id?: string }) => void;
};

export function SellingPointModal({
  open,
  mode = 'add',
  initial = null,
  onClose,
  onSubmit,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState<SellingPointDraft>(EMPTY_DRAFT);

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
    if (!open) return;
    setDraft({
      icon: initial?.icon ?? SELLING_POINT_ICONS[0],
      title: initial?.title ?? '',
      description: initial?.description ?? '',
    });
  }, [open, initial]);

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
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  const previewTitle = draft.title.trim() || 'Your benefit title';
  const previewDesc = draft.description.trim() || 'Optional explanation members read.';
  const canSubmit = draft.title.trim().length >= 2;

  if (!mounted) return null;

  return (
    <div
      className={`modal-backdrop modal-backdrop-nested${visible ? ' is-open' : ''}`}
      aria-hidden={!visible}
      role="dialog"
      aria-modal="true"
      aria-labelledby="selling-point-title"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="document" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-head-info">
            <h2 className="modal-title" id="selling-point-title">
              {mode === 'edit' ? 'Edit selling point' : 'Add a selling point'}
            </h2>
            <p className="modal-sub">A short benefit shown on the public page under this plan.</p>
          </div>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form
          className="modal-body"
          id="selling-point-form"
          noValidate
          onSubmit={e => {
            e.preventDefault();
            if (!canSubmit) return;
            onSubmit({
              id: initial?.id,
              icon: draft.icon,
              title: draft.title.trim(),
              description: draft.description.trim() || undefined,
            });
            onClose();
          }}
        >
          <div className="plan-preview plan-preview-compact">
            <span className="plan-preview-thumb sp-preview-icon">{draft.icon}</span>
            <div className="plan-preview-meta">
              <div className="plan-preview-name">{previewTitle}</div>
              <div className="plan-preview-sub">{previewDesc}</div>
            </div>
          </div>

          <div className="field">
            <span className="field-label">Icon</span>
            <div className="icon-picker" role="radiogroup" aria-label="Icon">
              {SELLING_POINT_ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  className="icon-opt"
                  aria-pressed={draft.icon === icon}
                  onClick={() => setDraft(prev => ({ ...prev, icon }))}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="sp-title-input">
              Title
            </label>
            <input
              id="sp-title-input"
              className="field-input"
              value={draft.title}
              onChange={e => setDraft(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Daily trade signals"
              maxLength={80}
              autoFocus
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="sp-desc-input">
              Description <span className="optional">Optional</span>
            </label>
            <textarea
              id="sp-desc-input"
              className="field-textarea"
              rows={2}
              value={draft.description}
              onChange={e => setDraft(prev => ({ ...prev, description: e.target.value }))}
              placeholder="One line that explains the value."
              maxLength={200}
            />
          </div>
        </form>

        <div className="modal-foot">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="selling-point-form" className="btn btn-primary" disabled={!canSubmit}>
            <span className="btn-label">{mode === 'edit' ? 'Save changes' : 'Add selling point'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
