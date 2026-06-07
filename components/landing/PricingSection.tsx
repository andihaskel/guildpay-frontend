'use client';

import { useEffect, useRef, useState } from 'react';
import './pricing-section.css';

interface PricingSectionProps {
  loading: boolean;
  isAuthenticated: boolean;
  onLogin: () => void;
  onGoToDashboard: () => void;
}

const PLANS = [
  {
    tier: 'Free',
    priceMonthly: 0,
    priceAnnual: 0,
    period: 'forever',
    features: [
      'Up to 50 members',
      '1 community',
      '1 access page',
      'Standard Stripe fees',
      'Email support',
    ],
    cta: 'Start free',
    variant: 'outline' as const,
    featured: false,
    delay: 0,
  },
  {
    tier: 'Pro',
    priceMonthly: 9,
    priceAnnual: 7,
    period: 'per month',
    periodAnnual: 'per month, billed annually',
    features: [
      'Up to 500 members',
      '3 communities',
      'Unlimited access pages',
      'Basic analytics',
      'Priority support',
    ],
    cta: 'Get Pro',
    variant: 'violet' as const,
    featured: true,
    delay: 140,
  },
  {
    tier: 'Scale',
    priceMonthly: 19,
    priceAnnual: 15,
    period: 'per month',
    periodAnnual: 'per month, billed annually',
    features: [
      'Unlimited members',
      'Unlimited communities',
      'Custom domain',
      'Advanced analytics',
      'Priority support',
    ],
    cta: 'Get Scale',
    variant: 'outline' as const,
    featured: false,
    delay: 280,
  },
];

function PricingCard({
  plan,
  annual,
  loading,
  isAuthenticated,
  onLogin,
  onGoToDashboard,
}: {
  plan: (typeof PLANS)[number];
  annual: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  onLogin: () => void;
  onGoToDashboard: () => void;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        window.setTimeout(() => setVisible(true), plan.delay);
        observer.disconnect();
      },
      { threshold: 0.12 },
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, [plan.delay]);

  const price = annual ? plan.priceAnnual : plan.priceMonthly;
  const period =
    plan.tier === 'Free'
      ? plan.period
      : annual
        ? plan.periodAnnual
        : plan.period;

  const handleClick = () => {
    if (isAuthenticated) {
      onGoToDashboard();
    } else {
      onLogin();
    }
  };

  return (
    <article
      ref={cardRef}
      className={`pricing-card${plan.featured ? ' pro' : ''}${visible ? ' show' : ''}`}
    >
      {plan.featured && <div className="pricing-pro-tag">Most popular</div>}

      <div className="pricing-tier">{plan.tier}</div>
      <div className="pricing-value">
        <sup>$</sup>
        {price}
      </div>
      <div className="pricing-period">{period}</div>
      <div className="pricing-rule" />
      <ul className="pricing-list">
        {plan.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>

      {loading ? (
        <div className="pricing-skeleton" aria-hidden="true" />
      ) : (
        <button
          type="button"
          className={plan.variant === 'violet' ? 'pricing-btn-violet' : 'pricing-btn-outline'}
          onClick={handleClick}
        >
          {isAuthenticated ? 'Go to dashboard' : plan.cta}
        </button>
      )}
    </article>
  );
}

export function PricingSection({
  loading,
  isAuthenticated,
  onLogin,
  onGoToDashboard,
}: PricingSectionProps) {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="pricing-section">
      <div className="pricing-container">
        <p className="pricing-eyebrow">Pricing</p>
        <h2 className="pricing-title">Simple pricing. No surprises.</h2>

        <div className="pricing-toggle-row">
          <span className={`pricing-toggle-label${!annual ? ' on' : ''}`}>Monthly</span>
          <button
            type="button"
            className={`pricing-toggle-switch${annual ? ' on' : ''}`}
            onClick={() => setAnnual((value) => !value)}
            aria-label={annual ? 'Switch to monthly billing' : 'Switch to annual billing'}
            aria-pressed={annual}
          />
          <span className={`pricing-toggle-label${annual ? ' on' : ''}`}>Annual</span>
          <span className="pricing-save-pill">Save 20%</span>
        </div>

        <div className="pricing-grid">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.tier}
              plan={plan}
              annual={annual}
              loading={loading}
              isAuthenticated={isAuthenticated}
              onLogin={onLogin}
              onGoToDashboard={onGoToDashboard}
            />
          ))}
        </div>

        <p className="pricing-note">
          We never take a cut. You keep <strong>100%</strong>, minus Stripe&apos;s standard fees.
        </p>
      </div>
    </section>
  );
}
