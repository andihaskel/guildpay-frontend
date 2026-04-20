'use client';

import { ChartBar as BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--text)', margin: '0 0 4px', letterSpacing: '-0.015em' }}>
          Analytics
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
          Track your community growth and revenue
        </p>
      </div>

      <div style={{
        padding: '64px 24px', textAlign: 'center',
        background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: '10px',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '8px',
          background: 'rgba(255,255,255,0.04)', border: '0.5px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px',
        }}>
          <BarChart3 size={16} style={{ color: 'var(--text-muted)' }} />
        </div>
        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', margin: '0 0 6px' }}>
          Analytics coming soon
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
          Track your community metrics, revenue trends, and member engagement
        </p>
      </div>
    </div>
  );
}
