'use client';

import { useEffect, useRef, useState } from 'react';
import './how-it-works.css';

const STEPS = [
  {
    num: '01',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    title: 'Connect your channel',
    desc: 'Authorize Discord, Telegram, or WhatsApp with one click. No server config, no webhooks.',
  },
  {
    num: '02',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: 'Set your price',
    desc: 'Monthly, annual, or one-time. Payments go straight to your own Stripe account.',
  },
  {
    num: '03',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
    title: 'Share your link',
    desc: 'Members pay, get access. Cancel, lose access. We handle everything automatically.',
  },
];

const STAGGER_MS = 650;

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [litCount, setLitCount] = useState(0);
  const triggeredRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || triggeredRef.current) return;

        triggeredRef.current = true;

        STEPS.forEach((_, index) => {
          const timeoutId = window.setTimeout(() => {
            setLitCount((prev) => Math.max(prev, index + 1));
          }, index * STAGGER_MS);
          timeoutsRef.current.push(timeoutId);
        });
      },
      { threshold: 0.22, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="hiw-section">
      <div className="hiw-container">
        <div className="hiw-header">
          <div className="hiw-eyebrow">How it works</div>
          <h2 className="hiw-title">Up and running in minutes.</h2>
        </div>

        <div className="hiw-grid">
          {STEPS.map((step, index) => (
            <div key={step.num} className="hiw-step">
              <span
                className={`hiw-step-num${index < litCount ? ' is-lit' : ''}`}
                aria-hidden="true"
              >
                {step.num}
              </span>
              <span className="hiw-step-icon">{step.icon}</span>
              <h3 className="hiw-step-heading">{step.title}</h3>
              <p className="hiw-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
