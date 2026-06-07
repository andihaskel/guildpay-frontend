'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingHero } from '@/components/landing/LandingHero';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { LandingCtaSection } from '@/components/landing/LandingCtaSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import '@/components/landing/landing-page.css';
import '@/components/landing/landing-bottom.css';

const LANDING_DIVIDER = (
  <hr
    style={{
      height: '1px',
      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
      border: 0,
      margin: 0,
    }}
  />
);

interface User {
  id: string;
  email: string | null;
  avatar: string | null;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [heroRevealed, setHeroRevealed] = useState(false);
  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const applyScrollLock = () => {
      const locked = mq.matches && !heroRevealed;
      document.documentElement.classList.toggle('landing-scroll-locked', locked);
    };

    applyScrollLock();
    mq.addEventListener('change', applyScrollLock);
    return () => {
      document.documentElement.classList.remove('landing-scroll-locked');
      mq.removeEventListener('change', applyScrollLock);
    };
  }, [heroRevealed]);

  const checkAuthAndRedirect = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromDiscord = urlParams.get('from') === 'discord';

    if (fromDiscord) {
      setIsRedirecting(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { credentials: 'include' });
        if (response.ok) {
          const productsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/creator/products`, { credentials: 'include' });
          if (productsResponse.ok) {
            const products = await productsResponse.json();
            router.push(products?.length > 0 ? '/dashboard/overview' : '/select-server');
          } else {
            router.push('/select-server');
          }
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      }
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { credentials: 'include' });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleGoToDashboard = () => router.push('/dashboard/overview');

  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
      setUser(null);
      router.push('/');
    } catch {}
  };

  if (isRedirecting) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: '2px solid var(--accent-soft-border)',
            borderTopColor: 'var(--accent)',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page" style={{ minHeight: '100vh', background: '#05050a', color: 'var(--text)' }}>

      <LandingNav
        loading={loading}
        user={user}
        heroRevealed={heroRevealed}
        onLogin={handleLogin}
        onGoToDashboard={handleGoToDashboard}
        onSignOut={handleSignOut}
      />

      <LandingHero
        loading={loading}
        isAuthenticated={!!user}
        onLogin={handleLogin}
        onGoToDashboard={handleGoToDashboard}
        onRevealed={() => setHeroRevealed(true)}
        scrollLocked={!heroRevealed}
      />

      {LANDING_DIVIDER}

      <HowItWorksSection />

      {LANDING_DIVIDER}

      <FeaturesSection />

      {LANDING_DIVIDER}

      <PricingSection
        loading={loading}
        isAuthenticated={!!user}
        onLogin={handleLogin}
        onGoToDashboard={handleGoToDashboard}
      />

      {LANDING_DIVIDER}

      <FaqSection />

      <LandingCtaSection
        loading={loading}
        isAuthenticated={!!user}
        onLogin={handleLogin}
        onGoToDashboard={handleGoToDashboard}
      />

      <LandingFooter />
    </div>
  );
}
