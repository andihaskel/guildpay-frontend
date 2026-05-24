'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageTestimonial } from '@/components/community/setup-preview-types';

type TestimonialDraft = {
  quote: string;
  author: string;
  since: string;
};

const EMPTY_DRAFT: TestimonialDraft = {
  quote: '',
  author: '',
  since: '',
};

type Props = {
  open: boolean;
  mode?: 'add' | 'edit';
  initial?: PageTestimonial | null;
  onClose: () => void;
  onSubmit: (item: Omit<PageTestimonial, 'id'> & { id?: string }) => void;
};

export function TestimonialModal({
  open,
  mode = 'add',
  initial = null,
  onClose,
  onSubmit,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState<TestimonialDraft>(EMPTY_DRAFT);

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
      quote: initial?.quote ?? '',
      author: initial?.author ?? '',
      since: initial?.since ?? '',
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

  const previewQuote = draft.quote.trim() || 'A short quote from a happy member.';
  const previewAuthor = draft.author.trim() || 'Member name';
  const previewSince = draft.since.trim() || 'Jan 2026';
  const canSubmit = draft.quote.trim().length >= 2 && draft.author.trim().length >= 1;

  if (!mounted) return null;

  return (
    <div
      className={`modal-backdrop modal-backdrop-nested${visible ? ' is-open' : ''}`}
      aria-hidden={!visible}
      role="dialog"
      aria-modal="true"
      aria-labelledby="testimonial-modal-title"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="document" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-head-info">
            <h2 className="modal-title" id="testimonial-modal-title">
              {mode === 'edit' ? 'Edit testimonial' : 'Add a testimonial'}
            </h2>
            <p className="modal-sub">Social proof shown in the testimonials carousel on your page.</p>
          </div>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form
          className="modal-body"
          id="testimonial-form"
          noValidate
          onSubmit={e => {
            e.preventDefault();
            if (!canSubmit) return;
            onSubmit({
              id: initial?.id,
              quote: draft.quote.trim(),
              author: draft.author.trim(),
              since: draft.since.trim(),
            });
            onClose();
          }}
        >
          <div className="plan-preview plan-preview-compact">
            <span className="plan-preview-thumb sp-preview-icon">&ldquo;</span>
            <div className="plan-preview-meta">
              <div className="plan-preview-name">{previewQuote}</div>
              <div className="plan-preview-sub">
                {previewAuthor}
                {previewSince ? ` · Member since ${previewSince}` : ''}
              </div>
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="testimonial-quote-input">
              Quote
            </label>
            <textarea
              id="testimonial-quote-input"
              className="field-textarea"
              rows={3}
              value={draft.quote}
              onChange={e => setDraft(prev => ({ ...prev, quote: e.target.value }))}
              placeholder="What did they say about your community?"
              maxLength={280}
              autoFocus
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="testimonial-author-input">
              Author
            </label>
            <input
              id="testimonial-author-input"
              className="field-input"
              value={draft.author}
              onChange={e => setDraft(prev => ({ ...prev, author: e.target.value }))}
              placeholder="e.g. Jorge T."
              maxLength={60}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="testimonial-since-input">
              Member since <span className="optional">Optional</span>
            </label>
            <input
              id="testimonial-since-input"
              className="field-input"
              value={draft.since}
              onChange={e => setDraft(prev => ({ ...prev, since: e.target.value }))}
              placeholder="e.g. Oct 2025"
              maxLength={40}
            />
          </div>
        </form>

        <div className="modal-foot">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="testimonial-form" className="btn btn-primary" disabled={!canSubmit}>
            <span className="btn-label">{mode === 'edit' ? 'Save changes' : 'Add testimonial'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
