'use client';

import { useRef, useState } from 'react';
import { PageFaqItem } from '@/components/community/setup-preview-types';
import { createPageContentId } from '@/components/community/page-content';
import { reorderByIndex } from '@/components/community/setup-utils';
import { FaqModal } from '@/components/community/FaqModal';

function FeatDragIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="9" cy="6" r="1.4" />
      <circle cx="15" cy="6" r="1.4" />
      <circle cx="9" cy="12" r="1.4" />
      <circle cx="15" cy="12" r="1.4" />
      <circle cx="9" cy="18" r="1.4" />
      <circle cx="15" cy="18" r="1.4" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14.7 4.3l5 5L8.5 20.5H3.5v-5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PageFaqSection({
  items,
  onChange,
}: {
  items: PageFaqItem[];
  onChange: (items: PageFaqItem[]) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PageFaqItem | null>(null);
  const dragIndexRef = useRef<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  function handleDragStart(index: number) {
    dragIndexRef.current = index;
    setDraggingId(items[index]?.id ?? null);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from == null || from === index) return;
    onChange(reorderByIndex(items, from, index));
    dragIndexRef.current = index;
  }

  function handleDragEnd() {
    dragIndexRef.current = null;
    setDraggingId(null);
  }

  function handleSubmit(item: Omit<PageFaqItem, 'id'> & { id?: string }) {
    if (item.id) {
      onChange(
        items.map(existing =>
          existing.id === item.id
            ? {
                id: existing.id,
                q: item.q,
                a: item.a,
              }
            : existing,
        ),
      );
      return;
    }

    onChange([
      ...items,
      {
        id: createPageContentId(),
        q: item.q,
        a: item.a,
      },
    ]);
  }

  return (
    <>
      <div className="setup-incl-section">
        <div className="incl-head">
          <span className="incl-title">
            Questions <span className="count">{items.length}</span>
          </span>
          <span className="incl-hint">Shown in the FAQ accordion on the public page.</span>
        </div>

        {items.length > 0 ? (
          <div className="incl-list">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`incl-feat is-confirmed${draggingId === item.id ? ' is-dragging' : ''}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={e => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDrop={e => e.preventDefault()}
              >
                <span className="incl-feat-icon">?</span>
                <div className="incl-feat-body">
                  <span className="incl-feat-title">{item.q}</span>
                  <span className="incl-feat-desc">{item.a}</span>
                </div>
                <div className="incl-feat-actions incl-feat-actions-visible">
                  <button type="button" className="btn-icon feat-drag" aria-label="Reorder" tabIndex={-1}>
                    <FeatDragIcon />
                  </button>
                  <button
                    type="button"
                    className="btn-icon"
                    aria-label="Edit"
                    onClick={() => {
                      setEditingItem(item);
                      setModalOpen(true);
                    }}
                  >
                    <EditIcon />
                  </button>
                  <button
                    type="button"
                    className="btn-icon"
                    aria-label="Remove"
                    onClick={() => onChange(items.filter(existing => existing.id !== item.id))}
                  >
                    <RemoveIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="incl-empty">
            <span className="incl-empty-icon" aria-hidden>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12l5 5L20 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="incl-empty-text">
              No questions yet. Answer the obvious objections before members ask them.
            </span>
          </div>
        )}

        <button
          type="button"
          className="incl-add"
          onClick={() => {
            setEditingItem(null);
            setModalOpen(true);
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add question
        </button>
      </div>

      <FaqModal
        open={modalOpen}
        mode={editingItem ? 'edit' : 'add'}
        initial={editingItem}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
