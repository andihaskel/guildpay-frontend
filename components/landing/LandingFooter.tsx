'use client';

import Link from 'next/link';
import { AccessGateLogoMark } from '@/components/brand/AccessGateLogoMark';

const FOOTER_LINKS = ['Terms', 'Privacy', 'Contact'] as const;

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <Link href="/" className="landing-footer-logo" aria-label="AccessGate home">
          <AccessGateLogoMark size={22} />
          AccessGate
          <span className="landing-footer-copy">© {year}</span>
        </Link>

        <nav className="landing-footer-links" aria-label="Footer">
          {FOOTER_LINKS.map(label => (
            <a key={label} href="#">
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
