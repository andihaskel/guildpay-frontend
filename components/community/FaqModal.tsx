'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageFaqItem } from '@/components/community/setup-preview-types';

type FaqDraft = {
  q: string;
  a: string;
};

const EMPTY_DRAFT: FaqDraft = {
  q: '',
  a: '',
};

type Props = {
  open: boolean;
  mode?: 'add' | 'edit';
  initial?: PageFaqItem | null;
  onClose: () => void;
  onSubmit: (item: Omit<PageFaqItem, 'id'> & { id?: string }) => void;
};

export function FaqModal({
  open,
  mode = 'add',
  initial = null,
  onClose,
  onSubmit,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState<FaqDraft>(EMPTY_DRAFT);

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
      q: initial?.q ?? '',
      a: initial?.a ?? '',
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

  const previewQuestion = draft.q.trim() || 'Your question here';
  const previewAnswer = draft.a.trim() || 'A clear, helpful answer.';
  const canSubmit = draft.q.trim().length >= 2 && draft.a.trim().length >= 2;

  if (!mounted) return null;

  return (
    <div
      className={`modal-backdrop modal-backdrop-nested${visible ? ' is-open' : ''}`}
      aria-hidden={!visible}
      role="dialog"
      aria-modal="true"
      aria-labelledby="faq-modal-title"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="document" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-head-info">
            <h2 className="modal-title" id="faq-modal-title">
              {mode === 'edit' ? 'Edit question' : 'Add a question'}
            </h2>
            <p className="modal-sub">Answers shown in the FAQ accordion on your public page.</p>
          </div>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form
          className="modal-body"
          id="faq-form"
          noValidate
          onSubmit={e => {
            e.preventDefault();
            if (!canSubmit) return;
            onSubmit({
              id: initial?.id,
              q: draft.q.trim(),
              a: draft.a.trim(),
            });
            onClose();
          }}
        >
          <div className="plan-preview plan-preview-compact">
            <div className="plan-preview-meta">
              <div className="plan-preview-name">{previewQuestion}</div>
              <div className="plan-preview-sub">{previewAnswer}</div>
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="faq-question-input">
              Question
            </label>
            <input
              id="faq-question-input"
              className="field-input"
              value={draft.q}
              onChange={e => setDraft(prev => ({ ...prev, q: e.target.value }))}
              placeholder="e.g. Can I cancel anytime?"
              maxLength={160}
              autoFocus
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="faq-answer-input">
              Answer
            </label>
            <textarea
              id="faq-answer-input"
              className="field-textarea"
              rows={4}
              value={draft.a}
              onChange={e => setDraft(prev => ({ ...prev, a: e.target.value }))}
              placeholder="Give a direct, reassuring answer."
              maxLength={600}
            />
          </div>
        </form>

        <div className="modal-foot">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="faq-form" className="btn btn-primary" disabled={!canSubmit}>
            <span className="btn-label">{mode === 'edit' ? 'Save changes' : 'Add question'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
