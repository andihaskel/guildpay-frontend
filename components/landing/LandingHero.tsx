'use client';

import { useEffect, useRef, useState } from 'react';
import { AccessGateLogoMark } from '@/components/brand/AccessGateLogoMark';
import './landing-hero.css';

interface LandingHeroProps {
  loading: boolean;
  isAuthenticated: boolean;
  onLogin: () => void;
  onGoToDashboard: () => void;
  onRevealed?: () => void;
  scrollLocked?: boolean;
}

const GLOW_MS = 1600;
const ROTATING_WORDS = ['community', 'audience', 'world'] as const;
const WORD_HOLD_MS = 2400;
const WORD_EXIT_MS = 850;
const WORD_ENTER_MS = 950;

type WordPhase = 'stable' | 'exit' | 'enter';

function HeroRotatingWord({ active }: { active: boolean }) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<WordPhase>('stable');

  useEffect(() => {
    if (!active || phase !== 'stable' || index >= ROTATING_WORDS.length - 1) return;

    const holdTimer = window.setTimeout(() => {
      setPhase('exit');
    }, WORD_HOLD_MS);

    return () => window.clearTimeout(holdTimer);
  }, [active, index, phase]);

  useEffect(() => {
    if (phase !== 'exit') return;

    const exitTimer = window.setTimeout(() => {
      setIndex((current) => current + 1);
      setPhase('enter');
    }, WORD_EXIT_MS);

    return () => window.clearTimeout(exitTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'enter') return;

    const enterTimer = window.setTimeout(() => {
      setPhase('stable');
    }, WORD_ENTER_MS);

    return () => window.clearTimeout(enterTimer);
  }, [phase, index]);

  const phaseClass =
    phase === 'exit'
      ? 'landing-hero-word-exit'
      : phase === 'enter'
        ? 'landing-hero-word-enter'
        : '';

  return (
    <span className="landing-hero-word-rotator" aria-live="polite">
      <span key={index} className={`landing-hero-word-current ${phaseClass}`.trim()}>
        <em>{ROTATING_WORDS[index]}.</em>
      </span>
    </span>
  );
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  glowAlpha: number,
) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#05050a';
  ctx.fillRect(0, 0, width, height);

  const rx = width * 0.72;
  const ry = height * 0.5;
  const rr = width * 0.38;
  const gradient = ctx.createRadialGradient(rx, ry, 0, rx, ry, rr);
  gradient.addColorStop(0, `rgba(124,58,237,${glowAlpha * 0.09})`);
  gradient.addColorStop(0.5, `rgba(100,40,200,${glowAlpha * 0.04})`);
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const gradient2 = ctx.createRadialGradient(width * 0.1, height * 0.85, 0, width * 0.1, height * 0.85, width * 0.3);
  gradient2.addColorStop(0, `rgba(76,29,149,${glowAlpha * 0.05})`);
  gradient2.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient2;
  ctx.fillRect(0, 0, width, height);
}

function HeroMobileScrollHint({ visible }: { visible: boolean }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!visible) {
      setShow(false);
      return;
    }

    setShow(true);

    const onScroll = () => {
      if (window.scrollY > 20) {
        setShow(false);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [visible]);

  if (!visible || !show) return null;

  return (
    <div className="landing-hero-page-scroll-hint show" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 9l6 6 6-6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function PhoneMockup({
  revealed,
  heroShellRef,
}: {
  revealed: boolean;
  heroShellRef: React.RefObject<HTMLElement | null>;
}) {
  const screenRef = useRef<HTMLDivElement>(null);
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;

    const onScroll = () => {
      if (screen.scrollTop > 16) {
        setHintVisible(false);
      }
    };

    screen.addEventListener('scroll', onScroll, { passive: true });
    return () => screen.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const hero = heroShellRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && screenRef.current) {
          screenRef.current.scrollTo({ top: 0, behavior: 'auto' });
          setHintVisible(true);
        }
      },
      { threshold: 0 },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [heroShellRef]);

  return (
    <div className={`landing-hero-phone-wrap${revealed ? ' show' : ''}`} id="landing-phone-wrap">
      <div className="landing-hero-phone">
        <div className="landing-hero-phone-notch" aria-hidden="true" />
        <div className="landing-hero-phone-screen" id="landing-phone-screen" ref={screenRef}>
          <div className="landing-hero-phone-content">
            <div className="landing-pc-hero">
              <div className="landing-pc-avatar">S</div>
              <div className="landing-pc-name">Surf Mappers</div>
              <div className="landing-pc-desc">Premium surf forecasting community</div>
              <div className="landing-pc-stats">
                <div className="landing-pc-stat">
                  <span className="landing-pc-stat-dot" aria-hidden="true" />
                  <strong>4</strong> online now
                </div>
                <div className="landing-pc-stat">
                  <strong>28</strong> members
                </div>
              </div>
            </div>

            <div className="landing-pc-section">
              <div className="landing-pc-section-label">Inside the community</div>
              <div className="landing-pc-section-title">A peek at what&apos;s inside</div>
              <div className="landing-pc-section-desc">
                Streams, forecasts, and the kind of stuff you won&apos;t find anywhere else.
              </div>
              <div className="landing-pc-media">
                <div
                  className="landing-pc-media-item"
                  style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)' }}
                >
                  <span>Photo</span>
                </div>
                <div
                  className="landing-pc-media-item"
                  style={{ background: 'linear-gradient(135deg,#1a1a2e,#2d1b69)' }}
                >
                  <span>Photo</span>
                </div>
              </div>
            </div>

            <div className="landing-pc-divider" />

            <div className="landing-pc-plans">
              <div className="landing-pc-plans-label">
                <span>Choose a plan</span>
                <span className="landing-pc-plans-count">2 plans</span>
              </div>
              <div className="landing-pc-plan selected">
                <div className="landing-pc-plan-radio" />
                <div className="landing-pc-plan-info">
                  <div className="landing-pc-plan-name">Regular</div>
                  <div className="landing-pc-plan-desc">Full community access</div>
                </div>
                <div className="landing-pc-plan-price">
                  $15<span>/mo</span>
                </div>
              </div>
              <div className="landing-pc-plan">
                <div className="landing-pc-plan-radio" />
                <div className="landing-pc-plan-info">
                  <div className="landing-pc-plan-name">Pro</div>
                  <div className="landing-pc-plan-desc">1-on-1 coaching included</div>
                </div>
                <div className="landing-pc-plan-price">
                  $29<span>/mo</span>
                </div>
              </div>
              <div className="landing-pc-trial">
                <strong>1-day free trial</strong> · then $15/month
              </div>
              <button type="button" className="landing-pc-cta" tabIndex={-1} aria-hidden="true">
                Start 1-day free trial
              </button>
              <div className="landing-pc-checks">
                <div className="landing-pc-check">Cancel anytime</div>
                <div className="landing-pc-check">Secure payment via Stripe</div>
              </div>
              <div className="landing-pc-powered">Secured by Stripe · Powered by AccessGate</div>
            </div>
          </div>
        </div>
        {hintVisible && (
          <div
            className={`landing-hero-phone-scroll-hint${revealed ? ' show' : ''}`}
            aria-hidden="true"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

export function LandingHero({
  loading,
  isAuthenticated,
  onLogin,
  onGoToDashboard,
  onRevealed,
  scrollLocked = false,
}: LandingHeroProps) {
  const shellRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let lastT: number | null = null;
    let glowProg = 0;
    let done = false;
    let pulseT = 0;
    let frameId = 0;

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    };

    resize();
    window.addEventListener('resize', resize);

    const frame = (timestamp: number) => {
      if (lastT === null) lastT = timestamp;
      const dt = Math.min(timestamp - lastT, 50);
      lastT = timestamp;

      if (!done) {
        glowProg += dt / GLOW_MS;
        if (glowProg >= 1) {
          glowProg = 1;
          done = true;
          setRevealed(true);
          onRevealed?.();
        }
        drawScene(ctx, width, height, easeOut(glowProg));
      } else {
        pulseT += dt * 0.0008;
        drawScene(ctx, width, height, 1 + Math.sin(pulseT) * 0.08);
      }

      frameId = requestAnimationFrame(frame);
    };

    frameId = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <section
      ref={shellRef}
      className={`landing-hero-shell${scrollLocked ? ' landing-hero-locked' : ''}`}
      aria-label="Hero"
    >
      <canvas ref={canvasRef} className="landing-hero-canvas" aria-hidden="true" />

      <div className="landing-hero">
      <div className={`landing-hero-left${revealed ? ' show' : ''}`}>
        <div className="landing-hero-badge">
          <span className="landing-hero-badge-dot" aria-hidden="true" />
          Now in public beta · Free to start
        </div>

        <h1 className="landing-hero-title">
          Open your
          <br />
          <HeroRotatingWord active={revealed} />
        </h1>

        <p className="landing-hero-sub">
          Connect Stripe, set a price — AccessGate handles payments, access, and cancellations
          automatically. For Discord, Telegram, and WhatsApp.
        </p>

        <div className="landing-hero-actions">
          {loading ? (
            <div className="landing-hero-skeleton" aria-hidden="true" />
          ) : isAuthenticated ? (
            <button type="button" className="landing-hero-btn-primary" onClick={onGoToDashboard}>
              <AccessGateLogoMark size={16} />
              Go to dashboard
            </button>
          ) : (
            <button type="button" className="landing-hero-btn-primary" onClick={onLogin}>
              <AccessGateLogoMark size={16} />
              Start for free
            </button>
          )}
          <a href="#how-it-works" className="landing-hero-btn-ghost">
            See how it works
          </a>
        </div>
      </div>

      <PhoneMockup revealed={revealed} heroShellRef={shellRef} />
      </div>

      <HeroMobileScrollHint visible={revealed && !scrollLocked} />
    </section>
  );
}
