'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AccessGateLogoMark } from '@/components/brand/AccessGateLogoMark';
import './access-gate-wordmark.css';

interface AccessGateWordmarkProps {
  href?: string;
  className?: string;
  animate?: boolean;
  expanded?: boolean;
}

export function AccessGateWordmark({
  href = '/',
  className = '',
  animate = true,
  expanded = false,
}: AccessGateWordmarkProps) {
  const [skipMotion, setSkipMotion] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) setSkipMotion(true);
  }, []);

  const isExpanded = !animate || skipMotion || expanded;

  return (
    <Link
      href={href}
      className={`access-gate-wordmark landing-logo ${className}`.trim()}
      aria-label="AccessGate home"
    >
      <AccessGateLogoMark />
      <span
        className={`access-gate-wordmark-text${isExpanded ? ' expanded' : ''}`}
        aria-hidden="true"
      >
        <span className="access-gate-wordmark-a">A</span>
        <span className="access-gate-wordmark-ccess">ccess</span>
        <span className="access-gate-wordmark-g">G</span>
        <span className="access-gate-wordmark-ate">ate</span>
      </span>
      <span className="access-gate-wordmark-sr">AccessGate</span>
    </Link>
  );
}
