'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CommunityPublicPageViewProps,
  GALLERY_BG_GRADIENTS,
  PublicPageMediaItem,
} from '@/components/community/community-public-page-types';
import '@/components/community/community-public-page.css';

function CheckIcon({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="11" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function DiscordMiniIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.5 4.4a16.5 16.5 0 0 0-4-1.3l-.2.4a15 15 0 0 1 3.7 1.2 14 14 0 0 0-14 0 15 15 0 0 1 3.7-1.2l-.2-.4a16.5 16.5 0 0 0-4 1.3C1.7 9 .9 13.4 1.3 17.8c1.6 1.2 3.2 1.9 4.8 2.4z" />
    </svg>
  );
}

function TelegramMiniIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21.7 3.3 2.6 10.7c-1.3.5-1.3 1.3-.2 1.6l4.9 1.5 1.9 5.8c.2.7.4.9.8.9.5 0 .7-.2 1-.5l2.4-2.3 5 3.7c.9.5 1.5.2 1.7-.8L22.7 5z" />
    </svg>
  );
}

function PhotoChipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M21 17l-5-5-9 9" />
    </svg>
  );
}

function VideoChipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PlayIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function mediaBgStyle(item: PublicPageMediaItem, index: number) {
  if (item.url) return undefined;
  if (item.gradient) return { background: item.gradient };
  const idx = item.bgIndex ?? ((index % 8) + 1);
  return { background: GALLERY_BG_GRADIENTS[idx] ?? GALLERY_BG_GRADIENTS[1] };
}

function mediaSpanClasses(item: PublicPageMediaItem, index: number) {
  const classes = ['media'];
  const wide = item.wide ?? (index === 0 || index === 3 || index === 7);
  const tall = item.tall ?? (index === 0);
  if (wide) classes.push('w2');
  if (tall) classes.push('h2');
  return classes.join(' ');
}

export function CommunityPublicPageView({
  accentColor = '#5865f2',
  compact = false,
  communityName,
  handle,
  tagline,
  heroImageUrl,
  avatarInitial,
  onlineCount,
  memberCount,
  showMemberStats = true,
  sinceLabel,
  mediaItems = [],
  galleryCountLabel,
  features = [],
  plans = [],
  selectedPlanId,
  onSelectPlan,
  priceSubHtml,
  ctaLabel,
  onCtaClick,
  ctaDisabled,
  ctaLoading,
  perks = [],
  testimonials = [],
  faq = [],
  emptyPlansMessage = 'Add a plan to preview pricing.',
  showFooterLinks = true,
  showTopChrome = true,
  interactive = true,
}: CommunityPublicPageViewProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const tmTrackRef = useRef<HTMLDivElement>(null);

  const selectedPlan = useMemo(
    () => plans.find(p => p.id === selectedPlanId) ?? plans[0] ?? null,
    [plans, selectedPlanId],
  );

  const resolvedPriceSub = priceSubHtml ?? selectedPlan?.subHtml ?? '';
  const resolvedCta = ctaLabel ?? selectedPlan?.ctaLabel ?? 'Get access';

  const avatarLetter = avatarInitial ?? (communityName.trim()[0] || '?').toUpperCase();
  const displayOnline = onlineCount ?? Math.max(3, Math.round((memberCount ?? 28) * 0.15));
  const displayMembers = memberCount ?? 28;

  const openLightbox = useCallback(
    (index: number) => {
      if (!interactive || mediaItems.length === 0) return;
      setLightboxIdx(index);
      setLightboxOpen(true);
    },
    [interactive, mediaItems.length],
  );

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const nextLightbox = useCallback(() => {
    setLightboxIdx(prev => (prev + 1) % Math.max(mediaItems.length, 1));
  }, [mediaItems.length]);
  const prevLightbox = useCallback(() => {
    setLightboxIdx(prev => (prev - 1 + Math.max(mediaItems.length, 1)) % Math.max(mediaItems.length, 1));
  }, [mediaItems.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextLightbox();
      if (e.key === 'ArrowLeft') prevLightbox();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, closeLightbox, nextLightbox, prevLightbox]);

  const scrollTestimonials = (dir: -1 | 1) => {
    const track = tmTrackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('.tm-card');
    const delta = (card?.offsetWidth ?? 280) + 14;
    track.scrollBy({ left: dir * delta, behavior: 'smooth' });
  };

  const safeLightboxIdx = mediaItems.length
    ? ((lightboxIdx % mediaItems.length) + mediaItems.length) % mediaItems.length
    : 0;
  const lightboxItem = mediaItems[safeLightboxIdx];

  return (
    <div
      className={`pub${compact ? ' pub--compact' : ''}`}
      style={{ ['--pub-accent' as string]: accentColor }}
    >
      {showTopChrome ? (
        <header className="top">
          <div className="brand-ticker">
            <span className="brand brand-ticker-track">
              <span className="brand-mark">A</span>
              Secured by AccessGate
            </span>
          </div>
        </header>
      ) : null}

      <section className="hero">
        <div className="wrap">
          <div className="hero-inner">
            <div
              className="avatar"
              style={
                heroImageUrl
                  ? undefined
                  : {
                      background: `linear-gradient(135deg, ${accentColor}, color-mix(in srgb, ${accentColor} 55%, #7c3aed))`,
                    }
              }
            >
              {heroImageUrl ? (
                <img src={heroImageUrl} alt={communityName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                avatarLetter
              )}
            </div>
            {handle ? <p className="handle">@{handle}</p> : null}
            <h1>{communityName}</h1>
            {tagline ? <p className="tagline">{tagline}</p> : null}

            {showMemberStats ? (
              <div className="trust-row">
                <span className="trust-item">
                  <span className="live-dot" />
                  <span>
                    <strong>{displayOnline}</strong> online now
                  </span>
                </span>
                <span className="trust-sep" />
                <span className="trust-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                  <span>
                    <strong>{displayMembers.toLocaleString()}</strong> members
                  </span>
                </span>
                {sinceLabel ? (
                  <>
                    <span className="trust-sep" />
                    <span className="trust-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M16 3v4M8 3v4M3 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                      <span>
                        Since <strong>{sinceLabel}</strong>
                      </span>
                    </span>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {mediaItems.length > 0 ? (
        <section className="gallery">
          <div className="wrap">
            <span className="gallery-label">Inside the community</span>
            <div className="gallery-head">
              <div>
                <h2>A peek at what&apos;s inside</h2>
                <p>Streams, behind-the-scenes clips, screenshots, and the kind of stuff you won&apos;t find anywhere else.</p>
              </div>
              <span className="gallery-count">
                {galleryCountLabel ?? `${mediaItems.length} item${mediaItems.length === 1 ? '' : 's'}`}
              </span>
            </div>

            <div className="gallery-grid">
              {mediaItems.map((item, index) => (
                <div
                  key={item.id}
                  className={mediaSpanClasses(item, index)}
                  data-bg={String(item.bgIndex ?? ((index % 8) + 1))}
                  data-type={item.type === 'video' ? 'video' : 'photo'}
                  onClick={() => openLightbox(index)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openLightbox(index);
                    }
                  }}
                  role={interactive ? 'button' : undefined}
                  tabIndex={interactive ? 0 : undefined}
                >
                  {item.url ? (
                    item.type === 'video' ? (
                      <video src={item.url} muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src={item.url} alt={item.caption || item.id} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    )
                  ) : (
                    <div className="media-placeholder" style={mediaBgStyle(item, index)} />
                  )}

                  <span className={`media-chip${item.type === 'video' ? ' video' : ''}`}>
                    {item.type === 'video' ? <VideoChipIcon /> : <PhotoChipIcon />}
                    {item.type === 'video' ? 'Video' : 'Photo'}
                  </span>

                  {item.type === 'video' && item.duration ? (
                    <span className="media-duration">{item.duration}</span>
                  ) : null}

                  {item.type === 'video' ? (
                    <span className="media-play" aria-hidden>
                      <PlayIcon />
                    </span>
                  ) : null}

                  {item.caption ? <span className="media-caption">{item.caption}</span> : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="wrap">
        <div className="content">
          <div className="left-col">
            {features.length > 0 ? (
              <div className="card">
                <div className="card-head">
                  <h2>
                    What&apos;s <span className="accent">included</span>
                  </h2>
                  <span className="card-count">
                    {features.length} benefit{features.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="features">
                  {features.map(feature => (
                    <div key={feature.id ?? feature.title} className="feature">
                      <span className="feature-icon">{feature.icon}</span>
                      <div className="feature-body">
                        <p className="feature-title">{feature.title}</p>
                        {feature.description ? <p className="feature-desc">{feature.description}</p> : null}
                      </div>
                      <span className="feature-check">
                        <CheckIcon />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="pricing-col">
            {plans.length > 0 && selectedPlan ? (
              <div className="pricing">
                <div className="pricing-head">
                  <p className="pricing-title">Choose a plan</p>
                  <span className="pricing-count">
                    {plans.length} plan{plans.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="plans" role="radiogroup" aria-label="Available plans">
                  {plans.map(plan => (
                    <button
                      key={plan.id}
                      type="button"
                      className="plan"
                      role="radio"
                      aria-pressed={plan.id === selectedPlan.id}
                      onClick={() => onSelectPlan?.(plan.id)}
                      disabled={!onSelectPlan}
                    >
                      <span className="radio" />
                      <span className="plan-name">
                        {plan.name}
                        {plan.tag ? (
                          <span className={`plan-tag${plan.tagVariant === 'save' ? ' save' : ''}`}>{plan.tag}</span>
                        ) : null}
                      </span>
                      {plan.description ? <span className="plan-desc">{plan.description}</span> : null}
                      <span className="plan-price">
                        {plan.strikeAmount ? <span className="plan-price-strike">{plan.strikeAmount}</span> : null}
                        <span className="plan-price-amount">{plan.amount}</span>
                        <span className="plan-price-period">{plan.period}</span>
                      </span>
                    </button>
                  ))}
                </div>

                {resolvedPriceSub ? (
                  <p className="price-sub" dangerouslySetInnerHTML={{ __html: resolvedPriceSub }} />
                ) : null}

                <button
                  type="button"
                  className="cta-primary"
                  onClick={onCtaClick}
                  disabled={ctaDisabled || ctaLoading || !onCtaClick}
                >
                  {ctaLoading ? 'Processing…' : resolvedCta}
                </button>

                {perks.length > 0 ? (
                  <div className="perks">
                    {perks.map(perk => (
                      <div key={`${perk.type}-${perk.label}`} className="perk">
                        {perk.type === 'discord' ? (
                          <span className="perk-icon perk-icon--discord">
                            <DiscordMiniIcon />
                          </span>
                        ) : perk.type === 'telegram' ? (
                          <span className="perk-icon perk-icon--telegram">
                            <TelegramMiniIcon />
                          </span>
                        ) : (
                          <CheckIcon size={14} />
                        )}
                        {perk.label}
                        {perk.muted ? <span className="muted">{perk.muted}</span> : null}
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="secure-note">
                  <LockIcon />
                  Secured by Stripe · Powered by AccessGate
                </div>
              </div>
            ) : (
              <div className="pricing pub-empty-plan">{emptyPlansMessage}</div>
            )}
          </div>
        </div>
      </section>

      {testimonials.length > 0 ? (
        <section className="testimonials">
          <div className="wrap">
            <div className="tm-head">
              <div>
                <span className="tm-label">Testimonials</span>
                <h2>What members are saying</h2>
              </div>
              {interactive ? (
                <div className="tm-nav">
                  <button type="button" aria-label="Previous testimonials" onClick={() => scrollTestimonials(-1)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M15 6l-6 6 6 6" />
                    </svg>
                  </button>
                  <button type="button" aria-label="Next testimonials" onClick={() => scrollTestimonials(1)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </button>
                </div>
              ) : null}
            </div>

            <div className="tm-viewport">
              <div className="tm-track" ref={tmTrackRef}>
                {testimonials.map(item => (
                  <article key={`${item.author}-${item.quote.slice(0, 24)}`} className="tm-card">
                    <span className="tm-quote-mark">&ldquo;</span>
                    <p className="tm-body">{item.quote}</p>
                    <div className="tm-foot">
                      <span className="tm-avatar" style={{ background: item.avatarGradient }}>
                        {item.initials}
                      </span>
                      <div className="tm-meta">
                        <span className="tm-name">{item.author}</span>
                        <span className="tm-role">{item.role}</span>
                      </div>
                      <span className="tm-stars" aria-label="5 out of 5 stars">
                        ★★★★★
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {faq.length > 0 ? (
        <section className="faq">
          <div className="wrap">
            <div className="faq-head">
              <span className="faq-label">Common questions</span>
              <h2>Everything you need to know</h2>
            </div>
            <div className="faq-list">
              {faq.map((item, index) => {
                const open = openFaqIndex === index;
                return (
                  <div key={item.q} className="faq-item" data-open={open ? 'true' : 'false'}>
                    <button
                      type="button"
                      className="faq-trigger"
                      aria-expanded={open}
                      onClick={() => setOpenFaqIndex(open ? -1 : index)}
                    >
                      <p className="faq-q">{item.q}</p>
                      <span className="faq-chev" aria-hidden>
                        <ChevronDownIcon />
                      </span>
                    </button>
                    <div className="faq-panel">
                      <div className="faq-panel-inner">
                        <p className="faq-a">{item.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <footer className="wrap">
        <span>
          © {new Date().getFullYear()} {communityName} · Powered by AccessGate
        </span>
        {showFooterLinks ? (
          <span className="links">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
          </span>
        ) : null}
      </footer>

      {interactive && lightboxOpen && lightboxItem ? (
        <div
          className={`lb open`}
          role="dialog"
          aria-modal="true"
          aria-label="Media viewer"
          onClick={e => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          <span className="lb-counter">
            {safeLightboxIdx + 1} / {mediaItems.length}
          </span>
          <button type="button" className="lb-close" aria-label="Close" onClick={closeLightbox}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <button type="button" className="lb-nav prev" aria-label="Previous" onClick={prevLightbox}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button type="button" className="lb-nav next" aria-label="Next" onClick={nextLightbox}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
          <div className="lb-frame">
            {lightboxItem.url ? (
              lightboxItem.type === 'video' ? (
                <video src={lightboxItem.url} controls style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <img src={lightboxItem.url} alt={lightboxItem.caption || ''} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
              )
            ) : (
              <div className="media-placeholder" style={mediaBgStyle(lightboxItem, safeLightboxIdx)} />
            )}
            {lightboxItem.type === 'video' && !lightboxItem.url ? (
              <div className="lb-play-big">
                <PlayIcon size={22} />
              </div>
            ) : null}
            <div className="lb-caption">
              <span className="lb-caption-meta">
                {lightboxItem.type === 'video'
                  ? `Video${lightboxItem.duration ? ` · ${lightboxItem.duration}` : ''}`
                  : 'Photo'}
              </span>
              <span>{lightboxItem.caption || (lightboxItem.type === 'video' ? 'Video' : 'Photo')}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
