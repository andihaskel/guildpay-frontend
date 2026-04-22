'use client';

import { FileText, CreditCard, Award } from 'lucide-react';
import { OnboardingStatus } from '@/lib/types';

interface OnboardingChecklistProps {
  status: OnboardingStatus | null;
  onDismiss: () => void;
  isLoading?: boolean;
}

export function OnboardingChecklist({ status, onDismiss, isLoading = false }: OnboardingChecklistProps) {
  if (isLoading || !status) {
    return (
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Get started
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border-soft)', borderRadius: '10px', overflow: 'hidden' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ background: 'var(--surface-1)', padding: '20px', minHeight: '120px' }} />
          ))}
        </div>
      </div>
    );
  }

  const steps = [
    {
      id: 'page',
      num: '01',
      icon: FileText,
      title: 'Publish your first page',
      description: 'Create a signup page to allow your users to join your community',
      completed: status.has_page,
      action: status.has_page ? null : {
        label: 'Create Page',
        onClick: () => window.location.href = '/dashboard/pages/edit',
      },
    },
    {
      id: 'stripe',
      num: '02',
      icon: CreditCard,
      title: 'Link your Stripe account',
      description: 'Start accepting payments by connecting your Stripe account',
      completed: status.stripe_connected,
      action: status.stripe_connected ? null : {
        label: 'Link Stripe',
        onClick: () => window.location.href = '/dashboard/billing',
      },
    },
    {
      id: 'trial',
      num: '03',
      icon: Award,
      title: 'Start your 14-day free trial',
      description: 'Enjoy all the benefits of our premium tier free for 14 days',
      completed: status.has_guildpay_subscription,
      action: status.has_guildpay_subscription ? null : {
        label: 'Start now',
        onClick: () => window.location.href = '/dashboard/billing',
      },
    },
  ];

  const allCompleted = steps.every(s => s.completed);

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>
          Get started
        </p>
        <button
          onClick={onDismiss}
          style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', transition: 'color 180ms ease' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          Dismiss
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border-soft)', borderRadius: '10px', overflow: 'hidden' }}>
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              style={{
                background: step.completed ? 'var(--surface-1)' : 'var(--surface-1)',
                padding: '20px',
                position: 'relative',
                opacity: step.completed ? 0.55 : 1,
                transition: 'opacity 180ms ease',
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {step.num}
                </span>
              </div>

              <div style={{
                width: '30px', height: '30px', borderRadius: '8px',
                background: step.completed ? 'rgba(255,255,255,0.04)' : 'var(--accent-soft-bg)',
                border: `0.5px solid ${step.completed ? 'var(--border)' : 'var(--accent-soft-border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '14px',
              }}>
                <Icon size={14} style={{ color: step.completed ? 'var(--text-muted)' : 'var(--accent-soft-text)' }} />
              </div>

              <h3 style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '0 0 6px', lineHeight: 1.4 }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: step.action ? '0 0 14px' : '0', lineHeight: 1.5 }}>
                {step.description}
              </p>

              {step.action && (
                <button
                  onClick={step.action.onClick}
                  style={{
                    fontSize: '12px', fontWeight: 500, padding: '6px 12px',
                    borderRadius: '6px', cursor: 'pointer', border: '0.5px solid var(--border-strong)',
                    background: 'var(--surface-2)', color: 'var(--text)',
                    transition: 'background 180ms ease, border-color 180ms ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--surface-2)';
                    e.currentTarget.style.borderColor = 'var(--border-strong)';
                  }}
                >
                  {step.action.label}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
