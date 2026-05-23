'use client';

import { useMemo, useRef, useState } from 'react';
import { PlanSellingPoint } from '@/components/community/setup-preview-types';
import { createSellingPointId, SELLING_POINT_ICONS } from '@/components/community/plan-selling-points';
import { reorderByIndex } from '@/components/community/setup-utils';
import { SellingPointModal } from '@/components/community/SellingPointModal';

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

function SaveIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12l5 5L20 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

function DraftSellingPointRow({
  point,
  onChange,
  onConfirm,
  onRemove,
}: {
  point: PlanSellingPoint;
  onChange: (point: PlanSellingPoint) => void;
  onConfirm: () => void;
  onRemove: () => void;
}) {
  const canConfirm = point.title.trim().length >= 2;

  return (
    <div className="incl-feat incl-feat-editable is-draft">
      <div className="incl-feat-editable-body">
        <div className="icon-picker icon-picker-inline" role="radiogroup" aria-label="Icon">
          {SELLING_POINT_ICONS.map(icon => (
            <button
              key={icon}
              type="button"
              className="icon-opt"
              aria-pressed={point.icon === icon}
              onClick={() => onChange({ ...point, icon })}
            >
              {icon}
            </button>
          ))}
        </div>
        <input
          className="field-input incl-feat-title-input"
          value={point.title}
          onChange={e => onChange({ ...point, title: e.target.value })}
          placeholder="e.g. Daily trade signals"
          maxLength={80}
        />
        <input
          className="field-input incl-feat-desc-input"
          value={point.description ?? ''}
          onChange={e => onChange({ ...point, description: e.target.value || undefined })}
          placeholder="One line that explains the value. (optional)"
          maxLength={200}
        />
      </div>
      <div className="incl-feat-actions incl-feat-actions-visible">
        <button
          type="button"
          className="btn-icon btn-icon-success"
          aria-label="Save selling point"
          disabled={!canConfirm}
          onClick={onConfirm}
        >
          <SaveIcon />
        </button>
        <button type="button" className="btn-icon" aria-label="Remove" onClick={onRemove}>
          <RemoveIcon />
        </button>
      </div>
    </div>
  );
}

function ConfirmedSellingPointRow({
  point,
  index,
  dragging,
  onEdit,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
}: {
  point: PlanSellingPoint;
  index: number;
  dragging: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      className={`incl-feat is-confirmed${dragging ? ' is-dragging' : ''}`}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={e => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onDrop={e => e.preventDefault()}
    >
      <span className="incl-feat-icon">{point.icon}</span>
      <div className="incl-feat-body">
        <span className="incl-feat-title">{point.title}</span>
        {point.description ? <span className="incl-feat-desc">{point.description}</span> : null}
      </div>
      <div className="incl-feat-actions incl-feat-actions-visible">
        <button type="button" className="btn-icon feat-drag" aria-label="Reorder" tabIndex={-1}>
          <FeatDragIcon />
        </button>
        <button type="button" className="btn-icon" aria-label="Edit" onClick={onEdit}>
          <EditIcon />
        </button>
        <button type="button" className="btn-icon" aria-label="Remove" onClick={onRemove}>
          <RemoveIcon />
        </button>
      </div>
    </div>
  );
}

type EditorProps = {
  points: PlanSellingPoint[];
  onChange: (points: PlanSellingPoint[]) => void;
  showEmptyState?: boolean;
  draftIds?: Set<string>;
  onDraftIdsChange?: (ids: Set<string>) => void;
};

export function PlanSellingPointsEditor({
  points,
  onChange,
  showEmptyState = true,
  draftIds: draftIdsProp,
  onDraftIdsChange,
}: EditorProps) {
  const [internalDraftIds, setInternalDraftIds] = useState<Set<string>>(() => new Set());
  const draftIds = draftIdsProp ?? internalDraftIds;
  const dragIndexRef = useRef<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  function setDraftIds(updater: Set<string> | ((prev: Set<string>) => Set<string>)) {
    const next = typeof updater === 'function' ? updater(draftIds) : updater;
    if (onDraftIdsChange) {
      onDraftIdsChange(next);
    } else {
      setInternalDraftIds(next);
    }
  }

  const confirmedPoints = useMemo(
    () => points.filter(point => !draftIds.has(point.id)),
    [points, draftIds],
  );

  const countLabel = useMemo(
    () => (confirmedPoints.length === 1 ? '1 item' : `${confirmedPoints.length} items`),
    [confirmedPoints.length],
  );

  function addPoint() {
    const id = createSellingPointId();
    onChange([
      ...points,
      {
        id,
        icon: SELLING_POINT_ICONS[0],
        title: '',
        description: '',
      },
    ]);
    setDraftIds(prev => new Set(prev).add(id));
  }

  function updatePoint(id: string, next: PlanSellingPoint) {
    onChange(points.map(point => (point.id === id ? next : point)));
  }

  function removePoint(id: string) {
    onChange(points.filter(point => point.id !== id));
    setDraftIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function confirmPoint(id: string) {
    const point = points.find(item => item.id === id);
    if (!point || point.title.trim().length < 2) return;
    setDraftIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function editPoint(id: string) {
    setDraftIds(prev => new Set(prev).add(id));
  }

  function handlePointDragStart(index: number) {
    const point = points[index];
    if (!point || draftIds.has(point.id)) return;
    dragIndexRef.current = index;
    setDraggingId(point.id);
  }

  function handlePointDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from == null || from === index) return;
    const fromPoint = points[from];
    const toPoint = points[index];
    if (!fromPoint || !toPoint || draftIds.has(fromPoint.id) || draftIds.has(toPoint.id)) return;
    onChange(reorderByIndex(points, from, index));
    dragIndexRef.current = index;
  }

  function handlePointDragEnd() {
    dragIndexRef.current = null;
    setDraggingId(null);
  }

  return (
    <div className="field">
      <label className="field-label">
        <span>
          What&apos;s included <span className="optional sp-count-label">{countLabel}</span>
        </span>
        <span className="optional">Shown on the public page</span>
      </label>

      {points.length > 0 ? (
        <div className="incl-list">
          {points.map((point, index) =>
            draftIds.has(point.id) ? (
              <DraftSellingPointRow
                key={point.id}
                point={point}
                onChange={next => updatePoint(point.id, next)}
                onConfirm={() => confirmPoint(point.id)}
                onRemove={() => removePoint(point.id)}
              />
            ) : (
              <ConfirmedSellingPointRow
                key={point.id}
                point={point}
                index={index}
                dragging={draggingId === point.id}
                onEdit={() => editPoint(point.id)}
                onRemove={() => removePoint(point.id)}
                onDragStart={handlePointDragStart}
                onDragOver={handlePointDragOver}
                onDragEnd={handlePointDragEnd}
              />
            ),
          )}
        </div>
      ) : showEmptyState ? (
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
            No selling points yet. Add icons with short descriptions so members see exactly what
            they&apos;re getting.
          </span>
        </div>
      ) : null}

      <button type="button" className="incl-add" onClick={addPoint}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Add selling point
      </button>
    </div>
  );
}

export function PlanSellingPointsSection({
  points,
  onChange,
}: {
  points: PlanSellingPoint[];
  onChange: (points: PlanSellingPoint[]) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<PlanSellingPoint | null>(null);
  const dragIndexRef = useRef<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  function handlePointDragStart(index: number) {
    dragIndexRef.current = index;
    setDraggingId(points[index]?.id ?? null);
  }

  function handlePointDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from == null || from === index) return;
    onChange(reorderByIndex(points, from, index));
    dragIndexRef.current = index;
  }

  function handlePointDragEnd() {
    dragIndexRef.current = null;
    setDraggingId(null);
  }

  function handleSubmit(point: Omit<PlanSellingPoint, 'id'> & { id?: string }) {
    if (point.id) {
      onChange(
        points.map(existing =>
          existing.id === point.id
            ? {
                id: existing.id,
                icon: point.icon,
                title: point.title,
                description: point.description,
              }
            : existing,
        ),
      );
      return;
    }

    onChange([
      ...points,
      {
        id: createSellingPointId(),
        icon: point.icon,
        title: point.title,
        description: point.description,
      },
    ]);
  }

  return (
    <>
      <div className="setup-incl-section">
        <div className="incl-head">
          <span className="incl-title">
            Selling points <span className="count">{points.length}</span>
          </span>
          <span className="incl-hint">Shown on the public page as the plan&apos;s checklist.</span>
        </div>

        {points.length > 0 ? (
          <div className="incl-list">
            {points.map((point, index) => (
              <div
                key={point.id}
                className={`incl-feat is-confirmed${draggingId === point.id ? ' is-dragging' : ''}`}
                draggable
                onDragStart={() => handlePointDragStart(index)}
                onDragOver={e => handlePointDragOver(e, index)}
                onDragEnd={handlePointDragEnd}
                onDrop={e => e.preventDefault()}
              >
                <span className="incl-feat-icon">{point.icon}</span>
                <div className="incl-feat-body">
                  <span className="incl-feat-title">{point.title}</span>
                  {point.description ? (
                    <span className="incl-feat-desc">{point.description}</span>
                  ) : null}
                </div>
                <div className="incl-feat-actions">
                  <button type="button" className="btn-icon feat-drag" aria-label="Reorder" tabIndex={-1}>
                    <FeatDragIcon />
                  </button>
                  <button
                    type="button"
                    className="btn-icon"
                    aria-label="Edit"
                    onClick={() => {
                      setEditingPoint(point);
                      setModalOpen(true);
                    }}
                  >
                    <EditIcon />
                  </button>
                  <button
                    type="button"
                    className="btn-icon"
                    aria-label="Remove"
                    onClick={() => onChange(points.filter(item => item.id !== point.id))}
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
              No selling points yet. Add icons with short descriptions so members see exactly what
              they&apos;re getting.
            </span>
          </div>
        )}

        <button
          type="button"
          className="incl-add"
          onClick={() => {
            setEditingPoint(null);
            setModalOpen(true);
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add selling point
        </button>
      </div>

      <SellingPointModal
        open={modalOpen}
        mode={editingPoint ? 'edit' : 'add'}
        initial={editingPoint}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
