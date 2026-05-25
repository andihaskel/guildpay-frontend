'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Loader as Loader2 } from 'lucide-react';
import { CommunityOverview, CommunityPlan, CommunityChannel } from '@/lib/types';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useSetupWorkspace } from '@/components/community/SetupWorkspaceContext';
import {
  DEFAULT_PLANS_LABEL,
  SetupPageDraft,
  PlanSellingPoint,
} from '@/components/community/setup-preview-types';
import { SetupMediaGallery, type SetupMediaItemsUpdater } from '@/components/community/SetupMediaGallery';
import { SetupImageUpload } from '@/components/community/SetupImageUpload';
import { DEFAULT_IMAGE_FRAME } from '@/lib/image-frame';
import { PlanSellingPointsSection } from '@/components/community/PlanSellingPointsEditor';
import { PageTestimonialsSection } from '@/components/community/PageTestimonialsSection';
import { PageFaqSection } from '@/components/community/PageFaqSection';
import { fmtAmount, mergePlanOrderIds, planInitials, reorderByIndex } from '@/components/community/setup-utils';
import { sanitizeRenderableMediaItems } from '@/components/community/community-page-draft';
import {
  planAccentColor,
  planDisplayPriceMinor,
  planFeaturesToSellingPoints,
  planFrequencyValue,
  planPickSubline,
  planPriceLabel,
  sellingPointsForPlan,
} from '@/components/community/plan-model';
import {
  buildUpdateCommunityPlanPayload,
  UpdateCommunityPlanFormValues,
} from '@/components/community/create-plan-payload';

// ─── types & props ───────────────────────────────────────────────────────────

export type SetupTab = 'page' | 'plans' | 'checkout';

// ─── helpers ─────────────────────────────────────────────────────────────────

const ACCENT_SWATCHES = ['#5865f2', '#7c3aed', '#2f9d6b', '#d97706', '#dc2626', '#0891b2'];

export { fmtAmount, planColor, planInitials } from '@/components/community/setup-utils';
export { planAccentColor, planPriceLabel } from '@/components/community/plan-model';

function planIsLive(plan: CommunityPlan) {
  if (plan.accepts_signups === false) return false;
  return !!plan.published && plan.status !== 'disabled';
}

function planAcceptsSignups(plan: CommunityPlan) {
  if (plan.accepts_signups != null) return plan.accepts_signups;
  return plan.status !== 'disabled';
}

function planHintLine(plan: CommunityPlan, planChannels: CommunityChannel[], benefitCount: number) {
  const providers = Array.from(new Set(planChannels.map(c => c.provider)));
  const provLabel = providers.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' + ') || 'No channels';
  return `${planPriceLabel(plan)} · ${plan.member_counts.active} active · ${provLabel} · ${benefitCount} benefit${benefitCount === 1 ? '' : 's'}`;
}

function channelsForPlan(plan: CommunityPlan, channels: CommunityChannel[]) {
  const ids = new Set(plan.channel_ids ?? []);
  return channels.filter(c => ids.has(c.id));
}

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '13px',
  fontWeight: 500,
  padding: '8px 14px',
  borderRadius: '6px',
  background: '#fff',
  color: '#0a0a0a',
  border: '0.5px solid #fff',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const btnSecondary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12.5px',
  fontWeight: 500,
  padding: '6px 12px',
  borderRadius: '6px',
  background: 'transparent',
  border: '0.5px solid rgba(255,255,255,0.15)',
  color: 'var(--text)',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

// ─── chips ───────────────────────────────────────────────────────────────────

function Chip({ variant, children }: { variant: 'success' | 'muted' | 'accent'; children: React.ReactNode }) {
  const palette: Record<string, React.CSSProperties> = {
    success: { background: 'var(--success-soft-bg)', borderColor: 'var(--success-soft-border)', color: 'var(--success-soft-text)' },
    muted: { background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text-secondary)' },
    accent: { background: 'var(--accent-soft-bg)', borderColor: 'var(--accent-soft-border)', color: 'var(--accent-soft-text)' },
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 8px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 500, border: '0.5px solid', whiteSpace: 'nowrap', ...palette[variant] }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
      {children}
    </span>
  );
}

function ChipLive() { return <Chip variant="success">Live</Chip>; }
function ChipDraft() { return <Chip variant="muted">Draft</Chip>; }
function ChipConnected() { return <Chip variant="success">Connected</Chip>; }
function ChipSynced() { return <Chip variant="success">Synced</Chip>; }
function ChipRequired() { return <Chip variant="accent">Required</Chip>; }

// ─── icons ───────────────────────────────────────────────────────────────────

function AccChevron() {
  return (
    <svg className="setup-acc-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProviderIcon({ id, size = 14 }: { id: string; size?: number }) {
  if (id === 'discord') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.5 4.4a16.5 16.5 0 0 0-4-1.3l-.2.4a15 15 0 0 1 3.7 1.2 14 14 0 0 0-14 0 15 15 0 0 1 3.7-1.2l-.2-.4a16.5 16.5 0 0 0-4 1.3C1.7 9 .9 13.4 1.3 17.8c1.6 1.2 3.2 1.9 4.8 2.4z" />
      </svg>
    );
  }
  if (id === 'telegram') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.7 3.3 2.6 10.7c-1.3.5-1.3 1.3-.2 1.6l4.9 1.5 1.9 5.8c.2.7.4.9.8.9.5 0 .7-.2 1-.5l2.4-2.3 5 3.7c.9.5 1.5.2 1.7-.8L22.7 5z" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 6.5l8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function providerStyle(id: string) {
  if (id === 'discord') return { bg: 'rgba(88,101,242,0.14)', color: '#8b92f8' };
  if (id === 'telegram') return { bg: 'rgba(34,158,217,0.14)', color: '#5cb8e6' };
  return { bg: 'rgba(74,181,133,0.14)', color: '#4ab585' };
}

function PlanPickCheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlanPickDragIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="9" cy="6" r="1.4" />
      <circle cx="15" cy="6" r="1.4" />
      <circle cx="9" cy="12" r="1.4" />
      <circle cx="15" cy="12" r="1.4" />
      <circle cx="9" cy="18" r="1.4" />
      <circle cx="15" cy="18" r="1.4" />
    </svg>
  );
}

function PagePlansPicker({
  plans,
  visiblePlanIds,
  planOrderIds,
  featuredPlanId,
  onVisiblePlanIdsChange,
  onPlanOrderIdsChange,
  onFeaturedPlanIdChange,
  onGoToPlans,
}: {
  plans: CommunityPlan[];
  visiblePlanIds: string[];
  planOrderIds: string[];
  featuredPlanId?: string | null;
  onVisiblePlanIdsChange: (ids: string[]) => void;
  onPlanOrderIdsChange: (ids: string[]) => void;
  onFeaturedPlanIdChange: (planId: string | null) => void;
  onGoToPlans: () => void;
}) {
  const dragIndexRef = useRef<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const visibleSet = useMemo(() => new Set(visiblePlanIds), [visiblePlanIds]);

  const orderedPlans = useMemo(() => {
    const order = mergePlanOrderIds(planOrderIds, plans.map(plan => plan.id));
    return order
      .map(id => plans.find(plan => plan.id === id))
      .filter((plan): plan is CommunityPlan => !!plan);
  }, [plans, planOrderIds]);

  const syncOrder = (nextOrderIds: string[]) => {
    onPlanOrderIdsChange(nextOrderIds);
    onVisiblePlanIdsChange(nextOrderIds.filter(id => visibleSet.has(id)));
  };

  const togglePlan = (planId: string) => {
    const order = mergePlanOrderIds(planOrderIds, plans.map(plan => plan.id));
    if (visibleSet.has(planId)) {
      onVisiblePlanIdsChange(visiblePlanIds.filter(id => id !== planId));
      if (featuredPlanId === planId) onFeaturedPlanIdChange(null);
      return;
    }
    onVisiblePlanIdsChange(order.filter(id => visibleSet.has(id) || id === planId));
  };

  const toggleFeatured = (planId: string) => {
    if (featuredPlanId === planId) {
      onFeaturedPlanIdChange(null);
      return;
    }
    onFeaturedPlanIdChange(planId);
    if (!visibleSet.has(planId)) {
      const order = mergePlanOrderIds(planOrderIds, plans.map(plan => plan.id));
      onVisiblePlanIdsChange(order.filter(id => visibleSet.has(id) || id === planId));
    }
  };

  const handleDragStart = (index: number, planId: string) => {
    dragIndexRef.current = index;
    setDraggingId(planId);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from == null || from === index) return;
    const currentOrder = orderedPlans.map(plan => plan.id);
    const nextOrder = reorderByIndex(currentOrder, from, index);
    dragIndexRef.current = index;
    syncOrder(nextOrder);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDraggingId(null);
  };

  return (
    <>
      <div className="setup-plan-pick-hint">
        Check plans to show on the page. Mark one as <strong>Most popular</strong> or leave none.
      </div>
      {orderedPlans.map((plan, index) => {
        const isOn = visibleSet.has(plan.id);
        const isFeatured = featuredPlanId === plan.id;
        const color = planAccentColor(plan);
        const initials = planInitials(plan.offer_name);
        return (
          <div
            key={plan.id}
            className={`setup-plan-pick${isOn ? ' is-on' : ' is-off'}${isFeatured ? ' is-featured' : ''}${draggingId === plan.id ? ' is-dragging' : ''}`}
            draggable
            role="button"
            tabIndex={0}
            onDragStart={() => handleDragStart(index, plan.id)}
            onDragOver={e => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDrop={e => e.preventDefault()}
            onClick={e => {
              if ((e.target as HTMLElement).closest('.setup-plan-pick-drag, .setup-plan-pick-popular')) return;
              togglePlan(plan.id);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                togglePlan(plan.id);
              }
            }}
          >
            <span className="setup-plan-pick-check" aria-pressed={isOn}>
              <PlanPickCheckIcon />
            </span>
            <span className="setup-plan-pick-thumb" style={{ background: color }}>
              {initials}
            </span>
            <div className="setup-plan-pick-meta">
              <span className="setup-plan-pick-name">
                {plan.offer_name}
                {isFeatured ? <Chip variant="accent">Most popular</Chip> : null}
                {planIsLive(plan) ? <ChipLive /> : <ChipDraft />}
              </span>
              <span className="setup-plan-pick-sub">{planPickSubline(plan)}</span>
            </div>
            <button
              type="button"
              className={`setup-plan-pick-popular${isFeatured ? ' is-on' : ''}`}
              aria-pressed={isFeatured}
              aria-label={isFeatured ? 'Remove most popular badge' : 'Mark as most popular'}
              title={isFeatured ? 'Remove most popular' : 'Mark as most popular'}
              onClick={e => {
                e.stopPropagation();
                toggleFeatured(plan.id);
              }}
            >
              {isFeatured ? 'Popular ✓' : 'Popular'}
            </button>
            <span
              className="setup-plan-pick-drag"
              aria-label="Drag to reorder"
              onMouseDown={e => e.stopPropagation()}
            >
              <PlanPickDragIcon />
            </span>
          </div>
        );
      })}

      <button type="button" className="setup-plan-pick-create" onClick={onGoToPlans}>
        <span className="setup-plan-pick-thumb">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <div className="setup-plan-pick-meta">
          <span className="setup-plan-pick-name">Create new plan</span>
          <span className="setup-plan-pick-sub">
            Add another pricing option, then come back to choose where it shows.
          </span>
        </div>
        <svg className="setup-plan-pick-create-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </>
  );
}


// ─── PagePane ──────────────────────────────────────────────────────────────────

// ─── PagePane ──────────────────────────────────────────────────────────────────

function PageSaveBar() {
  const { pageDraftDirty, isSavingPageDraft, pageDraftSaveError, savePageDraft } = useSetupWorkspace();
  const { toast } = useToast();

  async function handleSave() {
    const error = await savePageDraft();
    if (!error) {
      toast({ title: 'Page saved', description: 'Your public page changes were saved.' });
      return;
    }
    toast({ title: 'Could not save page', description: error, variant: 'destructive' });
  }

  return (
    <div className="setup-page-save-bar">
      <div className="setup-page-save-meta">
        {pageDraftDirty ? (
          <span className="setup-page-save-status is-dirty">Unsaved changes</span>
        ) : (
          <span className="setup-page-save-status">All changes saved</span>
        )}
        {pageDraftSaveError ? <span className="setup-page-save-error">{pageDraftSaveError}</span> : null}
      </div>
      <button
        type="button"
        className="setup-page-save-btn"
        style={{ ...btnPrimary, opacity: !pageDraftDirty || isSavingPageDraft ? 0.45 : 1 }}
        disabled={!pageDraftDirty || isSavingPageDraft}
        onClick={() => void handleSave()}
      >
        {isSavingPageDraft ? (
          <>
            <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} aria-hidden />
            Saving…
          </>
        ) : (
          'Save changes'
        )}
      </button>
    </div>
  );
}

function PagePane({
  communityId,
  pageDraft,
  onPageDraftChange,
  plans,
  onGoToPlans,
}: {
  communityId: string;
  pageDraft: SetupPageDraft;
  onPageDraftChange: (
    patch: Partial<SetupPageDraft> | ((prev: SetupPageDraft) => Partial<SetupPageDraft>),
  ) => void;
  plans: CommunityPlan[];
  onGoToPlans: () => void;
}) {
  const accRef = useRef<HTMLDivElement>(null);
  const {
    communityName,
    subHeadline,
    accentColor,
    coverImageUrl,
    coverImageFrame,
    logoUrl,
    logoImageFrame,
    galleryLabel,
    galleryHeadline,
    galleryDescription,
    mediaItems: rawMediaItems,
    autoplayVideoInHero,
    showMemberStats = true,
    plansLabel = DEFAULT_PLANS_LABEL,
    testimonialsLabel,
    testimonialsHeadline,
    testimonials,
    faqLabel,
    faqHeadline,
    faq,
  } = pageDraft;
  const mediaItems = sanitizeRenderableMediaItems(rawMediaItems ?? []);
  const videoCount = mediaItems.filter(m => m.type === 'video').length;

  const handleMediaItemsChange = useCallback(
    (update: SetupMediaItemsUpdater) => {
      onPageDraftChange(prev => ({
        mediaItems:
          typeof update === 'function' ? update(prev.mediaItems ?? []) : (update ?? []),
      }));
    },
    [onPageDraftChange],
  );
  const visiblePlanIds = pageDraft.visiblePlanIds ?? plans.map(p => p.id);
  const planOrderIds = mergePlanOrderIds(
    pageDraft.planOrderIds,
    plans.map(plan => plan.id),
  );
  const visiblePlans = visiblePlanIds
    .map(id => plans.find(plan => plan.id === id))
    .filter((plan): plan is CommunityPlan => !!plan);
  const visiblePlanNames = visiblePlans.map(p => p.offer_name).join(' · ') || '—';
  const featuredPlanId = pageDraft.featuredPlanId ?? null;
  const featuredPlan = featuredPlanId ? plans.find(p => p.id === featuredPlanId) : null;
  const previewMemberCount = Math.max(
    plans[0]?.member_counts?.active ?? 0,
    28,
  );
  const previewOnlineCount = Math.max(3, Math.round(previewMemberCount * 0.15));

  const expandAll = () => {
    accRef.current?.querySelectorAll('details.setup-acc').forEach(el => { (el as HTMLDetailsElement).open = true; });
  };
  const collapseAll = () => {
    accRef.current?.querySelectorAll('details.setup-acc').forEach(el => { (el as HTMLDetailsElement).open = false; });
  };

  const initial = (communityName.trim()[0] || '?').toUpperCase();

  return (
    <div ref={accRef} className="setup-form-stack">
      <div className="setup-progress">
        <div className="setup-progress-right">
          <button type="button" onClick={expandAll}>Expand all</button>
          <button type="button" onClick={collapseAll}>Collapse all</button>
        </div>
      </div>

      <details className="setup-acc">
        <summary className="setup-acc-head">
          <span className="setup-acc-num done">1</span>
          <div className="setup-acc-titles">
            <span className="setup-acc-title">Hero</span>
            <span className="setup-acc-hint">Name, cover, logo, and accent color.</span>
          </div>
          <span className="setup-acc-summary">{communityName || '—'}</span>
          <AccChevron />
        </summary>
        <div className="setup-acc-body">
          <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <label className="setup-field-label" style={{ marginBottom: '6px' }}>Cover image</label>
                <SetupImageUpload
                  communityId={communityId}
                  variant="cover"
                  label="Upload cover image"
                  hint="1600×400 recommended"
                  value={coverImageUrl}
                  frame={coverImageFrame}
                  onChange={url =>
                    onPageDraftChange({
                      coverImageUrl: url,
                      ...(url ? {} : { coverImageFrame: DEFAULT_IMAGE_FRAME }),
                    })
                  }
                  onFrameChange={frame => onPageDraftChange({ coverImageFrame: frame })}
                  fallback={
                    <div
                      className="setup-hero-upload-fallback"
                      style={{ background: `linear-gradient(135deg, ${accentColor}, #7c3aed)` }}
                    >
                      Click to upload · 1600×400
                    </div>
                  }
                />
              </div>
              <div style={{ width: '96px' }}>
                <label className="setup-field-label" style={{ marginBottom: '6px' }}>Logo</label>
                <SetupImageUpload
                  communityId={communityId}
                  variant="logo"
                  label="Upload logo"
                  hint="Square image recommended"
                  value={logoUrl}
                  frame={logoImageFrame}
                  onChange={url =>
                    onPageDraftChange({
                      logoUrl: url,
                      ...(url ? {} : { logoImageFrame: DEFAULT_IMAGE_FRAME }),
                    })
                  }
                  onFrameChange={frame => onPageDraftChange({ logoImageFrame: frame })}
                  fallback={
                    <div
                      className="setup-hero-upload-fallback setup-hero-upload-fallback-logo"
                      style={{ background: accentColor }}
                    >
                      {initial}
                    </div>
                  }
                />
              </div>
            </div>
            <div>
              <label className="setup-field-label">Accent color</label>
              <div className="setup-swatch-row">
                {ACCENT_SWATCHES.map(c => (
                  <button key={c} type="button" className="setup-swatch" aria-pressed={accentColor === c} style={{ background: c }} onClick={() => onPageDraftChange({ accentColor: c })} />
                ))}
              </div>
            </div>
            <div>
              <label className="setup-field-label">Community name</label>
              <input className="setup-field-input" value={communityName} onChange={e => onPageDraftChange({ communityName: e.target.value })} />
            </div>
            <div>
              <label className="setup-field-label">Sub-headline</label>
              <textarea className="setup-field-textarea" rows={2} value={subHeadline} onChange={e => onPageDraftChange({ subHeadline: e.target.value })} />
            </div>
          </div>
          <div className="setup-settings-row">
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>Member stats</div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '1px' }}>
                Show “{previewOnlineCount} online now · {previewMemberCount.toLocaleString()} members” in the hero.
              </div>
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer', flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={showMemberStats}
                onChange={e => onPageDraftChange({ showMemberStats: e.target.checked })}
                style={{ accentColor: 'var(--accent)' }}
              />
              {showMemberStats ? 'On' : 'Off'}
            </label>
          </div>
        </div>
      </details>

      <details className="setup-acc">
        <summary className="setup-acc-head">
          <span className="setup-acc-num done">2</span>
          <div className="setup-acc-titles">
            <span className="setup-acc-title">Inside the community</span>
            <span className="setup-acc-hint">Gallery copy and media shown on the public page.</span>
          </div>
          <span className="setup-acc-summary">
            <span>{mediaItems.length}</span>
            <span>item{mediaItems.length === 1 ? '' : 's'}</span>
            {videoCount > 0 ? (
              <>
                <span style={{ width: '1px', height: '10px', background: 'var(--border)', display: 'inline-block' }} />
                <span>{videoCount} video{videoCount !== 1 ? 's' : ''}</span>
              </>
            ) : null}
          </span>
          <AccChevron />
        </summary>
        <div className="setup-acc-body">
          <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px', borderBottom: '0.5px solid var(--border-soft)' }}>
            <div>
              <label className="setup-field-label">Section label</label>
              <input
                className="setup-field-input"
                value={galleryLabel}
                onChange={e => onPageDraftChange({ galleryLabel: e.target.value })}
              />
            </div>
            <div>
              <label className="setup-field-label">Headline</label>
              <input
                className="setup-field-input"
                value={galleryHeadline}
                onChange={e => onPageDraftChange({ galleryHeadline: e.target.value })}
              />
            </div>
            <div>
              <label className="setup-field-label">Description</label>
              <textarea
                className="setup-field-textarea"
                rows={3}
                value={galleryDescription}
                onChange={e => onPageDraftChange({ galleryDescription: e.target.value })}
              />
            </div>
          </div>
          <SetupMediaGallery
            communityId={communityId}
            items={mediaItems}
            autoplayVideoInHero={autoplayVideoInHero}
            onItemsChange={handleMediaItemsChange}
            onAutoplayChange={value => onPageDraftChange({ autoplayVideoInHero: value })}
          />
        </div>
      </details>

      <details className="setup-acc">
        <summary className="setup-acc-head">
          <span className="setup-acc-num done">3</span>
          <div className="setup-acc-titles">
            <span className="setup-acc-title">Plans</span>
            <span className="setup-acc-hint">Choose which plans appear on this page and in what order.</span>
          </div>
          <span className="setup-acc-summary">
            <span>{visiblePlans.length}</span>
            <span>of {plans.length} shown</span>
            {visiblePlans.length > 0 ? (
              <>
                <span style={{ width: '1px', height: '10px', background: 'var(--border)', display: 'inline-block' }} />
                <span>{visiblePlanNames}</span>
              </>
            ) : null}
            {featuredPlan ? (
              <>
                <span style={{ width: '1px', height: '10px', background: 'var(--border)', display: 'inline-block' }} />
                <span>{featuredPlan.offer_name} · Most popular</span>
              </>
            ) : null}
          </span>
          <AccChevron />
        </summary>
        <div className="setup-acc-body">
          <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px', borderBottom: '0.5px solid var(--border-soft)' }}>
            <div>
              <label className="setup-field-label">Section label</label>
              <input
                className="setup-field-input"
                value={plansLabel}
                onChange={e => onPageDraftChange({ plansLabel: e.target.value })}
              />
            </div>
          </div>
          <PagePlansPicker
            plans={plans}
            visiblePlanIds={visiblePlanIds}
            planOrderIds={planOrderIds}
            featuredPlanId={featuredPlanId}
            onVisiblePlanIdsChange={ids => onPageDraftChange({ visiblePlanIds: ids })}
            onPlanOrderIdsChange={ids => onPageDraftChange({ planOrderIds: ids })}
            onFeaturedPlanIdChange={id => onPageDraftChange({ featuredPlanId: id })}
            onGoToPlans={onGoToPlans}
          />
        </div>
      </details>

      <details className="setup-acc">
        <summary className="setup-acc-head">
          <span className="setup-acc-num done">4</span>
          <div className="setup-acc-titles">
            <span className="setup-acc-title">Testimonials</span>
            <span className="setup-acc-hint">Social proof on the page.</span>
          </div>
          <span className="setup-acc-summary"><span>{testimonials.length}</span> quotes</span>
          <AccChevron />
        </summary>
        <div className="setup-acc-body">
          <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px', borderBottom: '0.5px solid var(--border-soft)' }}>
            <div>
              <label className="setup-field-label">Section label</label>
              <input
                className="setup-field-input"
                value={testimonialsLabel}
                onChange={e => onPageDraftChange({ testimonialsLabel: e.target.value })}
              />
            </div>
            <div>
              <label className="setup-field-label">Headline</label>
              <input
                className="setup-field-input"
                value={testimonialsHeadline}
                onChange={e => onPageDraftChange({ testimonialsHeadline: e.target.value })}
              />
            </div>
          </div>
          <div style={{ padding: '18px 20px' }}>
            <PageTestimonialsSection
              items={testimonials}
              onChange={items => onPageDraftChange({ testimonials: items })}
            />
          </div>
        </div>
      </details>

      <details className="setup-acc">
        <summary className="setup-acc-head">
          <span className="setup-acc-num done">5</span>
          <div className="setup-acc-titles">
            <span className="setup-acc-title">FAQ</span>
            <span className="setup-acc-hint">Answer the obvious questions.</span>
          </div>
          <span className="setup-acc-summary"><span>{faq.length}</span> questions</span>
          <AccChevron />
        </summary>
        <div className="setup-acc-body">
          <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px', borderBottom: '0.5px solid var(--border-soft)' }}>
            <div>
              <label className="setup-field-label">Section label</label>
              <input
                className="setup-field-input"
                value={faqLabel}
                onChange={e => onPageDraftChange({ faqLabel: e.target.value })}
              />
            </div>
            <div>
              <label className="setup-field-label">Headline</label>
              <input
                className="setup-field-input"
                value={faqHeadline}
                onChange={e => onPageDraftChange({ faqHeadline: e.target.value })}
              />
            </div>
          </div>
          <div style={{ padding: '18px 20px' }}>
            <PageFaqSection items={faq} onChange={items => onPageDraftChange({ faq: items })} />
          </div>
        </div>
      </details>

      <PageSaveBar />
    </div>
  );
}

// ─── PlansPane ─────────────────────────────────────────────────────────────────

function PlanDetailBody({
  plan,
  communityId,
  channels,
  sellingPoints,
  onSellingPointsChange,
  onSaved,
  onDeleted,
}: {
  plan: CommunityPlan;
  communityId: string;
  channels: CommunityChannel[];
  sellingPoints: PlanSellingPoint[];
  onSellingPointsChange: (points: PlanSellingPoint[]) => void;
  onSaved: (plan: CommunityPlan) => void;
  onDeleted: (planId: string) => void;
}) {
  const { toast } = useToast();
  const planChannels = channelsForPlan(plan, channels);
  const displayPrice = (planDisplayPriceMinor(plan) / 100).toFixed(2);
  const frequency = planFrequencyValue(plan);
  const [form, setForm] = useState<UpdateCommunityPlanFormValues>(() => ({
    offerName: plan.offer_name,
    description: plan.description ?? '',
    trialDays: String(plan.trial_days ?? 0),
    seatCap: plan.seat_cap ? String(plan.seat_cap) : '',
    currency: plan.currency.toLowerCase(),
    acceptsSignups: planAcceptsSignups(plan),
  }));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({
      offerName: plan.offer_name,
      description: plan.description ?? '',
      trialDays: String(plan.trial_days ?? 0),
      seatCap: plan.seat_cap ? String(plan.seat_cap) : '',
      currency: plan.currency.toLowerCase(),
      acceptsSignups: planAcceptsSignups(plan),
    });
    setError('');
  }, [
    plan.id,
    plan.updated_at,
    plan.offer_name,
    plan.description,
    plan.trial_days,
    plan.seat_cap,
    plan.currency,
    plan.accepts_signups,
    plan.status,
  ]);

  async function handleSave() {
    if (form.offerName.trim().length < 2) {
      setError('Plan name must be at least 2 characters.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = buildUpdateCommunityPlanPayload(plan, form, sellingPoints);
      const updated = await api.updateCommunityPlan(communityId, plan.id, payload);
      toast({ title: 'Plan saved', description: `${updated.offer_name} was updated.` });
      onSaved(updated);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save plan. Please try again.';
      setError(message);
      toast({ title: 'Could not save plan', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Delete "${plan.offer_name}"? Existing members keep access until their subscription ends.`,
      )
    ) {
      return;
    }

    setDeleting(true);
    setError('');
    try {
      await api.deleteCommunityPlan(communityId, plan.id);
      toast({ title: 'Plan deleted', description: `${plan.offer_name} was removed.` });
      onDeleted(plan.id);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete plan. Please try again.';
      setError(message);
      toast({ title: 'Could not delete plan', description: message, variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  }

  const busy = saving || deleting;

  return (
    <>
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid var(--border-soft)' }}>
        <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Changes apply to new sign-ups; existing members keep their price.</span>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)', cursor: busy ? 'not-allowed' : 'pointer' }}>
          <input
            type="checkbox"
            checked={form.acceptsSignups}
            disabled={busy}
            onChange={e => setForm(prev => ({ ...prev, acceptsSignups: e.target.checked }))}
            style={{ accentColor: 'var(--accent)' }}
          />
          Active
        </label>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Pricing &amp; details</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label className="setup-field-label">Name</label>
            <input
              className="setup-field-input"
              value={form.offerName}
              disabled={busy}
              onChange={e => setForm(prev => ({ ...prev, offerName: e.target.value }))}
            />
          </div>
          <div>
            <label className="setup-field-label">Frequency</label>
            <select className="setup-field-input" value={frequency} disabled>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
              <option value="onetime">One-time</option>
            </select>
          </div>
          <div>
            <label className="setup-field-label">Price ({form.currency.toUpperCase()})</label>
            <input className="setup-field-input" value={displayPrice} readOnly />
          </div>
          <div>
            <label className="setup-field-label">Trial (days)</label>
            <input
              className="setup-field-input"
              value={form.trialDays}
              disabled={busy}
              onChange={e => setForm(prev => ({ ...prev, trialDays: e.target.value }))}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="setup-field-label">Description</label>
            <textarea
              className="setup-field-textarea"
              rows={2}
              value={form.description}
              disabled={busy}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="setup-field-label">
              Seat cap <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Optional</span>
            </label>
            <input
              className="setup-field-input"
              placeholder="No limit"
              value={form.seatCap}
              disabled={busy}
              onChange={e => setForm(prev => ({ ...prev, seatCap: e.target.value }))}
            />
          </div>
          <div>
            <label className="setup-field-label">Currency</label>
            <select
              className="setup-field-input"
              value={form.currency}
              disabled={busy}
              onChange={e => setForm(prev => ({ ...prev, currency: e.target.value }))}
            >
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
              <option value="ars">ARS</option>
            </select>
          </div>
        </div>
      </div>
      <div style={{ padding: '16px 20px 0', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
        What&apos;s included
      </div>
      <div className="setup-incl-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text)' }}>Channels granted <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '18px', height: '18px', padding: '0 6px', borderRadius: '999px', background: 'var(--surface-2)', border: '0.5px solid var(--border)', fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '6px' }}>{planChannels.length}</span></span>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Members get access the moment they pay.</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {planChannels.map(ch => {
            const ps = providerStyle(ch.provider);
            return (
              <div key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', background: 'var(--surface-2)' }}>
                <span style={{ width: '26px', height: '26px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: ps.bg, color: ps.color }}>
                  <ProviderIcon id={ch.provider} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.provider.charAt(0).toUpperCase() + ch.provider.slice(1)} — {ch.name}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    {ch.provider === 'discord' ? <>Role <code style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '11px' }}>@VIP</code></> : 'Private group'}
                    {ch.members_synced != null ? <> · {ch.members_synced} members</> : null}
                  </div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <ChipSynced />
                  <button type="button" className="btn-icon" aria-label="Remove"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></button>
                </div>
              </div>
            );
          })}
          {planChannels.length === 0 && <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', padding: '4px 0' }}>No channels linked to this plan yet.</div>}
        </div>
        <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 10px', border: '0.5px dashed var(--border)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '12.5px', fontWeight: 500, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          Add channel
        </button>
      </div>
      <PlanSellingPointsSection points={sellingPoints} onChange={onSellingPointsChange} />
      {error ? (
        <div style={{ padding: '0 20px 8px', color: 'var(--danger, #e06a6a)', fontSize: '12.5px' }}>{error}</div>
      ) : null}
      <div
        style={{
          padding: '14px 20px 18px',
          borderTop: '0.5px solid var(--border-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <button
          type="button"
          style={{ ...btnSecondary, color: 'var(--danger, #e06a6a)', opacity: busy ? 0.6 : 1 }}
          disabled={busy}
          onClick={handleDelete}
        >
          {deleting ? 'Deleting…' : 'Delete plan'}
        </button>
        <button
          type="button"
          style={{ ...btnPrimary, opacity: busy ? 0.7 : 1 }}
          disabled={busy}
          onClick={handleSave}
        >
          {saving ? (
            <>
              <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} aria-hidden />
              Saving…
            </>
          ) : (
            'Save changes'
          )}
        </button>
      </div>
    </>
  );
}

function PlansPane({
  plans,
  communityId,
  channels,
  openPlanId,
  onToggle,
  onNewPlan,
  planSellingPoints,
  updatePlanSellingPoints,
  refreshPlans,
}: {
  plans: CommunityPlan[];
  communityId: string;
  channels: CommunityChannel[];
  openPlanId: string | null;
  onToggle: (planId: string) => void;
  onNewPlan: () => void;
  planSellingPoints: Record<string, PlanSellingPoint[]>;
  updatePlanSellingPoints: (planId: string, points: PlanSellingPoint[]) => void;
  refreshPlans: () => void;
}) {

  return (
  <div className="setup-form-stack">
    <div className="setup-progress">
      <button type="button" style={btnPrimary} onClick={onNewPlan}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        New plan
      </button>
    </div>

    {plans.length === 0 ? (
      <div className="setup-acc">
        <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--surface-2)', border: '0.5px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>No plans yet</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '1px' }}>Create one to start accepting members.</div>
          </div>
        </div>
      </div>
    ) : plans.map(plan => {
      const color = planAccentColor(plan);
      const initials = planInitials(plan.offer_name);
      const pc = channelsForPlan(plan, channels);
      const isOpen = openPlanId === plan.id;
      const provNames = Array.from(new Set(pc.map(c => c.provider.charAt(0).toUpperCase() + c.provider.slice(1))));
      const sellingPoints = sellingPointsForPlan(plan, planSellingPoints[plan.id]);

      return (
        <details key={plan.id} className="setup-acc" open={isOpen}>
          <summary
            className="setup-acc-head"
            onClick={e => {
              e.preventDefault();
              onToggle(plan.id);
            }}
          >
            <span className="setup-acc-num done" style={{ background: color, borderColor: color, color: '#fff' }}>{initials}</span>
            <div className="setup-acc-titles">
              <span className="setup-acc-title" style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                {plan.offer_name}
                <span style={{ marginLeft: '2px' }}>{planIsLive(plan) ? <ChipLive /> : <ChipDraft />}</span>
              </span>
              <span className="setup-acc-hint">{planHintLine(plan, pc, sellingPoints.length)}</span>
            </div>
            <span className="setup-acc-summary">
              {planPriceLabel(plan)}
              {provNames.map((p, i) => (
                <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  {i > 0 && <span style={{ width: '1px', height: '10px', background: 'var(--border)', display: 'inline-block' }} />}
                  {p}
                </span>
              ))}
              {provNames.length > 0 && <span style={{ width: '1px', height: '10px', background: 'var(--border)', display: 'inline-block' }} />}
              <span>{plan.member_counts.active}</span>
            </span>
            <AccChevron />
          </summary>
          <div className="setup-acc-body">
            {isOpen ? (
              <PlanDetailBody
                plan={plan}
                communityId={communityId}
                channels={channels}
                sellingPoints={sellingPoints}
                onSellingPointsChange={points => updatePlanSellingPoints(plan.id, points)}
                onSaved={updated => {
                  updatePlanSellingPoints(updated.id, planFeaturesToSellingPoints(updated));
                  refreshPlans();
                }}
                onDeleted={() => refreshPlans()}
              />
            ) : (
              <div style={{ padding: '18px 20px', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                Tap to edit {plan.offer_name} — pricing, what&apos;s included, channels, and selling points.
              </div>
            )}
          </div>
        </details>
      );
    })}
  </div>
  );
}

// ─── CheckoutPane ──────────────────────────────────────────────────────────────

function CheckoutPane({ overview }: { overview: CommunityOverview | null }) {
  const stripeConnected = overview?.onboarding.stripe_connected ?? false;

  return (
  <div className="setup-form-stack">
    <details className="setup-acc">
      <summary className="setup-acc-head">
        <span className="setup-acc-num done">1</span>
        <div className="setup-acc-titles">
          <span className="setup-acc-title">Buyer fields</span>
          <span className="setup-acc-hint">What you collect at checkout.</span>
        </div>
        <span className="setup-acc-summary"><span>3</span> on · 1 custom</span>
        <AccChevron />
      </summary>
      <div className="setup-acc-body">
        <div className="setup-settings-row"><div><div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>Email</div><div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '1px' }}>Required · used to deliver access</div></div><ChipRequired /></div>
        <div className="setup-settings-row"><div><div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>Discord username</div><div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '1px' }}>Needed to auto-assign roles</div></div><label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}><input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)' }} />On</label></div>
        <div className="setup-settings-row"><div><div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>Full name</div><div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '1px' }}>Shown on invoice</div></div><label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}><input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)' }} />On</label></div>
        <div className="setup-settings-row"><div><div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>Phone</div><div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '1px' }}>Optional</div></div><label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}><input type="checkbox" style={{ accentColor: 'var(--accent)' }} />Off</label></div>
        <div className="setup-settings-row"><div><div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>Custom question</div><div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '1px' }}>“What do you trade?”</div></div><button type="button" style={btnSecondary}>Edit</button></div>
      </div>
    </details>

    <details className="setup-acc">
      <summary className="setup-acc-head">
        <span className="setup-acc-num done">2</span>
        <div className="setup-acc-titles">
          <span className="setup-acc-title">Payment methods</span>
          <span className="setup-acc-hint">Money goes to the Stripe account connected at the account level.</span>
        </div>
        <span className="setup-acc-summary">
          Stripe
          {stripeConnected ? (
            <>
              <span style={{ width: '1px', height: '10px', background: 'var(--border)', display: 'inline-block' }} />
              <span style={{ color: 'var(--success-soft-text)' }}>● Connected</span>
            </>
          ) : null}
        </span>
        <AccChevron />
      </summary>
      <div className="setup-acc-body">
        <div className="setup-settings-row" style={{ alignItems: 'flex-start' }}>
          <span style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '0.5px solid rgba(99,91,255,0.25)', background: 'rgba(99,91,255,0.12)', color: '#8d87ff', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13.4 10.2c0-.7.6-1 1.5-1 1.3 0 3 .4 4.3 1.1V6.4a11.4 11.4 0 0 0-4.3-.8c-3.5 0-5.9 1.8-5.9 4.9 0 4.7 6.5 4 6.5 6 0 .8-.7 1.1-1.7 1.1-1.4 0-3.3-.6-4.7-1.4v3.9c1.6.7 3.2 1 4.7 1 3.6 0 6.1-1.8 6.1-4.9 0-5.1-6.5-4.3-6.5-6z" /></svg>
          </span>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>Stripe</span>
              {stripeConnected ? <ChipConnected /> : <Chip variant="muted">Not connected</Chip>}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Card, Apple Pay, Google Pay · USD</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {overview?.stripe_dashboard_url ? (
              <a href={overview.stripe_dashboard_url} target="_blank" rel="noopener noreferrer" style={btnSecondary}>Settings</a>
            ) : overview?.stripe_connect_url && !stripeConnected ? (
              <a href={overview.stripe_connect_url} target="_blank" rel="noopener noreferrer" style={btnSecondary}>Connect</a>
            ) : (
              <button type="button" style={btnSecondary}>Settings</button>
            )}
          </div>
        </div>
        <div className="setup-settings-row" style={{ alignItems: 'flex-start' }}>
          <span style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '0.5px solid var(--border)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z" stroke="currentColor" strokeWidth="1.6" /></svg>
          </span>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>Mercado Pago</span>
              <Chip variant="muted">Coming soon</Chip>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Local payments for LATAM members.</span>
          </div>
          <button type="button" style={{ ...btnSecondary, opacity: 0.4, cursor: 'not-allowed' }} disabled>Connect</button>
        </div>
      </div>
    </details>
  </div>
  );
}

// ─── Setup section pages (routed) ────────────────────────────────────────────

export function SetupPageSection() {
  const { communityId, pageDraft, updatePageDraft, plans, goToPlans } = useSetupWorkspace();
  return (
    <PagePane
      communityId={communityId}
      pageDraft={pageDraft}
      onPageDraftChange={updatePageDraft}
      plans={plans}
      onGoToPlans={goToPlans}
    />
  );
}

export function SetupPlansSection() {
  const {
    communityId,
    plans,
    channels,
    openPlanId,
    handlePlanToggle,
    onNewPlan,
    planSellingPoints,
    updatePlanSellingPoints,
    refreshPlans,
  } = useSetupWorkspace();
  return (
    <PlansPane
      communityId={communityId}
      plans={plans}
      channels={channels}
      openPlanId={openPlanId}
      onToggle={handlePlanToggle}
      onNewPlan={onNewPlan}
      planSellingPoints={planSellingPoints}
      updatePlanSellingPoints={updatePlanSellingPoints}
      refreshPlans={refreshPlans}
    />
  );
}

export function SetupCheckoutSection() {
  const { overview } = useSetupWorkspace();
  return <CheckoutPane overview={overview} />;
}
