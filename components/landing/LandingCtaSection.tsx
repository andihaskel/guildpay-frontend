'use client';

import { AccessGateLogoMark } from '@/components/brand/AccessGateLogoMark';

interface LandingCtaSectionProps {
  loading: boolean;
  isAuthenticated: boolean;
  onLogin: () => void;
  onGoToDashboard: () => void;
}

export function LandingCtaSection({
  loading,
  isAuthenticated,
  onLogin,
  onGoToDashboard,
}: LandingCtaSectionProps) {
  return (
    <section className="landing-cta">
      <div className="landing-cta-inner">
        <h2 className="landing-cta-title">Start monetizing today.</h2>
        <p className="landing-cta-subtitle">
          Free to start. No credit card required. Setup in 2 minutes — and you keep 100% of your revenue.
        </p>

        {loading ? (
          <div className="landing-cta-skeleton" aria-hidden />
        ) : isAuthenticated ? (
          <button type="button" className="landing-cta-btn" onClick={onGoToDashboard}>
            <AccessGateLogoMark size={16} />
            Go to dashboard
          </button>
        ) : (
          <button type="button" className="landing-cta-btn" onClick={onLogin}>
            <AccessGateLogoMark size={16} />
            Start for free
          </button>
        )}
      </div>
    </section>
  );
}
