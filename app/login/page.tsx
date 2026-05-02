'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

type Screen = 'email' | 'verify' | 'success';

export default function LoginPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [countdown, setCountdown] = useState(600);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const startCountdown = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(600);
    setResendEnabled(false);
    let remaining = 600;
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 570) setResendEnabled(true);
      if (remaining <= 0) {
        clearInterval(countdownRef.current!);
        setResendEnabled(true);
      }
    }, 1000);
  }, []);

  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current); }, []);

  const fmtCountdown = (s: number) => {
    const m = Math.floor(Math.max(0, s) / 60);
    const sec = Math.max(0, s) % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!v) { setEmailError('Please enter your email.'); return; }
    if (!validateEmail(v)) { setEmailError("That doesn't look like a valid email."); return; }
    setEmailLoading(true);
    try {
      await fetch(`${API_BASE}/auth/email-otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: v }),
        credentials: 'include',
      });
    } catch { /* always advance */ }
    setEmailLoading(false);
    setScreen('verify');
    startCountdown();
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  };

  const handleResend = async () => {
    if (!resendEnabled) return;
    setResendSent(true);
    try {
      await fetch(`${API_BASE}/auth/email-otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
        credentials: 'include',
      });
    } catch { /* ignore */ }
    startCountdown();
    setTimeout(() => setResendSent(false), 1800);
  };

  const submitOtp = useCallback(async (code: string) => {
    if (code.length !== 6) return;
    setVerifyLoading(true);
    setOtpError(false);
    try {
      const res = await fetch(`${API_BASE}/auth/email-otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code }),
        credentials: 'include',
      });
      if (res.ok) {
        setScreen('success');
        if (countdownRef.current) clearInterval(countdownRef.current);
        setTimeout(() => router.push('/dashboard/home'), 900);
      } else {
        setOtpError(true);
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => otpRefs.current[0]?.focus(), 30);
      }
    } catch {
      setOtpError(true);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 30);
    }
    setVerifyLoading(false);
  }, [email, router]);

  const handleOtpChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    setOtpError(false);
    if (digit && idx < 5) setTimeout(() => otpRefs.current[idx + 1]?.focus(), 0);
    const code = next.join('');
    if (code.length === 6) setTimeout(() => submitOtp(code), 120);
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      otpRefs.current[idx - 1]?.focus(); e.preventDefault();
    } else if (e.key === 'ArrowRight' && idx < 5) {
      otpRefs.current[idx + 1]?.focus(); e.preventDefault();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!digits) return;
    e.preventDefault();
    const next = ['', '', '', '', '', ''];
    digits.split('').forEach((d, i) => { next[i] = d; });
    setOtp(next);
    setOtpError(false);
    const focusIdx = Math.min(digits.length, 5);
    setTimeout(() => otpRefs.current[focusIdx]?.focus(), 0);
    if (digits.length === 6) setTimeout(() => submitOtp(digits), 120);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitOtp(otp.join(''));
  };

  const handleBack = () => {
    setOtp(['', '', '', '', '', '']);
    setOtpError(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setScreen('email');
    setTimeout(() => {
      const input = document.getElementById('email-input') as HTMLInputElement;
      input?.focus();
    }, 50);
  };

  const font = 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif';

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f0f0f0', display: 'flex', flexDirection: 'column', fontFamily: font }}>

      {/* Nav */}
      <header style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,10,0.82)', backdropFilter: 'saturate(140%) blur(10px)', WebkitBackdropFilter: 'saturate(140%) blur(10px)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 600, fontSize: '15px', letterSpacing: '-0.01em', color: '#f0f0f0', textDecoration: 'none' }}>
            <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'linear-gradient(135deg, #5865f2, #7983f5)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '12px' }}>A</span>
            AccessGate
          </Link>
          <a href="mailto:support@accessgate.io" style={{ fontSize: '13.5px', color: '#888', textDecoration: 'none', transition: 'color 200ms' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f0f0f0')}
            onMouseLeave={e => (e.currentTarget.style.color = '#888')}>
            Need help?
          </a>
        </div>
      </header>

      {/* Stage */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', position: 'relative', overflow: 'hidden' }}>
        {/* Grid */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '72px 72px', WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, black 35%, transparent 70%)', maskImage: 'radial-gradient(ellipse at center, black 0%, black 35%, transparent 70%)' }} />
        {/* Orbs */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '8%', left: '14%', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(88,101,242,0.5) 0%, transparent 70%)', filter: 'blur(70px)', opacity: 0.45, animation: 'drift-a 20s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '6%', right: '12%', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,146,248,0.4) 0%, transparent 70%)', filter: 'blur(70px)', opacity: 0.45, animation: 'drift-b 24s ease-in-out infinite' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>

          {/* EMAIL SCREEN */}
          {screen === 'email' && (
            <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '40px 36px 32px', boxShadow: '0 30px 60px -30px rgba(0,0,0,0.6)', position: 'relative', animation: 'fadeUp 280ms ease' }}>
              {/* Step dots */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                <span style={{ width: '28px', height: '4px', borderRadius: '2px', background: '#5865f2' }} />
                <span style={{ width: '18px', height: '4px', borderRadius: '2px', background: '#2a2a2a' }} />
              </div>

              <h1 style={{ fontSize: '24px', fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.2, margin: '0 0 8px', textAlign: 'center' }}>Sign in to AccessGate</h1>
              <p style={{ fontSize: '14.5px', color: '#888', margin: '0 0 28px', textAlign: 'center', lineHeight: 1.5 }}>Enter your email and we&apos;ll send you a 6-digit code.</p>

              <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} noValidate>
                <label htmlFor="email-input" style={{ fontSize: '12.5px', fontWeight: 500, color: '#888', letterSpacing: '0.005em' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#555', pointerEvents: 'none', display: 'inline-flex' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3.5 6.5l8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <input
                    id="email-input"
                    type="email"
                    autoComplete="email"
                    spellCheck={false}
                    value={email}
                    onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                    placeholder="you@domain.com"
                    style={{ width: '100%', background: '#0d0d0d', border: `0.5px solid ${emailError ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', color: '#f0f0f0', fontSize: '15px', padding: '13px 14px 13px 42px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', boxShadow: emailError ? '0 0 0 3px rgba(248,113,113,0.12)' : 'none', transition: 'border-color 180ms, box-shadow 180ms' }}
                    onFocus={e => { if (!emailError) e.currentTarget.style.borderColor = '#5865f2'; e.currentTarget.style.boxShadow = emailError ? '0 0 0 3px rgba(248,113,113,0.12)' : '0 0 0 3px rgba(88,101,242,0.12)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = emailError ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = emailError ? '0 0 0 3px rgba(248,113,113,0.12)' : 'none'; }}
                  />
                </div>

                {emailError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#f87171', background: 'rgba(248,113,113,0.06)', border: '0.5px solid rgba(248,113,113,0.18)', borderRadius: '6px', padding: '9px 12px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M12 8v5M12 16.5v.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    {emailError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={emailLoading}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '13px 18px', fontSize: '14.5px', fontWeight: 500, letterSpacing: '-0.005em', borderRadius: '6px', background: emailLoading ? 'rgba(255,255,255,0.18)' : '#ffffff', color: emailLoading ? '#555' : '#0a0a0a', border: '0.5px solid rgba(255,255,255,0.9)', cursor: emailLoading ? 'not-allowed' : 'pointer', transition: 'transform 180ms, opacity 180ms', fontFamily: 'inherit' }}
                  onMouseEnter={e => { if (!emailLoading) { e.currentTarget.style.transform = 'scale(1.005)'; e.currentTarget.style.opacity = '0.96'; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
                >
                  {emailLoading ? (
                    <span style={{ width: '14px', height: '14px', border: '1.6px solid rgba(0,0,0,0.18)', borderTopColor: '#0a0a0a', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  ) : (
                    <>Send verification code <ArrowRight size={14} /></>
                  )}
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: '13.5px', color: '#555', marginTop: '18px' }}>
                New to AccessGate?{' '}
                <Link href="/" style={{ color: '#f0f0f0', fontWeight: 500, textDecoration: 'none' }}>Learn more</Link>
              </p>
            </div>
          )}

          {/* VERIFY SCREEN */}
          {screen === 'verify' && (
            <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '40px 36px 32px', boxShadow: '0 30px 60px -30px rgba(0,0,0,0.6)', animation: 'fadeUp 280ms ease' }}>
              {/* Step dots */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                <span style={{ width: '18px', height: '4px', borderRadius: '2px', background: '#8b92f8' }} />
                <span style={{ width: '28px', height: '4px', borderRadius: '2px', background: '#5865f2' }} />
              </div>

              <h1 style={{ fontSize: '24px', fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.2, margin: '0 0 8px', textAlign: 'center' }}>Check your email</h1>
              <p style={{ fontSize: '14.5px', color: '#888', margin: '0 0 28px', textAlign: 'center', lineHeight: 1.5 }}>
                We sent a 6-digit code to <strong style={{ color: '#f0f0f0', fontWeight: 500, wordBreak: 'break-all' }}>{email}</strong>
              </p>

              <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} noValidate>
                <label style={{ fontSize: '12.5px', fontWeight: 500, color: '#888', letterSpacing: '0.005em' }}>Verification code</label>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }} onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => { otpRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(idx, e)}
                      onFocus={e => e.currentTarget.select()}
                      aria-label={`Digit ${idx + 1}`}
                      style={{
                        width: '48px', height: '56px', textAlign: 'center',
                        fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: '22px', fontWeight: 500,
                        background: '#0d0d0d', color: '#f0f0f0', outline: 'none',
                        border: `0.5px solid ${otpError ? 'rgba(248,113,113,0.55)' : digit ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '10px', caretColor: '#5865f2', boxSizing: 'border-box',
                        boxShadow: otpError ? '0 0 0 2px rgba(248,113,113,0.10)' : 'none',
                        transition: 'border-color 180ms, box-shadow 180ms',
                        animation: otpError ? 'shake 360ms ease' : 'none',
                      }}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', color: '#555', marginTop: '4px' }}>
                  <span>{countdown > 0 ? `Code expires in ${fmtCountdown(countdown)}` : 'Code expired.'}</span>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={!resendEnabled}
                    style={{ color: resendEnabled ? '#8b92f8' : '#555', background: 'none', border: 0, cursor: resendEnabled ? 'pointer' : 'not-allowed', fontFamily: 'inherit', fontSize: '12.5px', padding: 0, transition: 'color 180ms' }}
                  >
                    {resendSent ? 'Sent ✓' : 'Resend code'}
                  </button>
                </div>

                {otpError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#f87171', background: 'rgba(248,113,113,0.06)', border: '0.5px solid rgba(248,113,113,0.18)', borderRadius: '6px', padding: '9px 12px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M12 8v5M12 16.5v.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    Invalid or expired code. Try again.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={verifyLoading || otp.join('').length !== 6}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '13px 18px', fontSize: '14.5px', fontWeight: 500, letterSpacing: '-0.005em', borderRadius: '6px', background: verifyLoading || otp.join('').length !== 6 ? 'rgba(255,255,255,0.18)' : '#ffffff', color: verifyLoading || otp.join('').length !== 6 ? '#555' : '#0a0a0a', border: '0.5px solid transparent', cursor: verifyLoading || otp.join('').length !== 6 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: '6px', transition: 'transform 180ms, opacity 180ms' }}
                  onMouseEnter={e => { if (!verifyLoading && otp.join('').length === 6) { e.currentTarget.style.transform = 'scale(1.005)'; e.currentTarget.style.opacity = '0.96'; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
                >
                  {verifyLoading ? (
                    <span style={{ width: '14px', height: '14px', border: '1.6px solid rgba(0,0,0,0.18)', borderTopColor: '#0a0a0a', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  ) : (
                    <>Verify and continue <ArrowRight size={14} /></>
                  )}
                </button>
              </form>

              <button
                onClick={handleBack}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#888', background: 'none', border: 0, cursor: 'pointer', margin: '18px auto 0', fontFamily: 'inherit', transition: 'color 180ms', padding: 0 }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f0f0f0')}
                onMouseLeave={e => (e.currentTarget.style.color = '#888')}
              >
                <ArrowLeft size={14} />
                Use a different email
              </button>
            </div>
          )}

          {/* SUCCESS SCREEN */}
          {screen === 'success' && (
            <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '40px 36px 32px', boxShadow: '0 30px 60px -30px rgba(0,0,0,0.6)', textAlign: 'center', animation: 'fadeUp 280ms ease' }}>
              <div style={{ width: '56px', height: '56px', margin: '0 auto 18px', borderRadius: '50%', background: 'rgba(88,101,242,0.12)', border: '0.5px solid rgba(88,101,242,0.25)', color: '#8b92f8', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pop 380ms cubic-bezier(.2,.8,.2,1.2)' }}>
                <Check size={26} strokeWidth={2.2} />
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.2, margin: '0 0 8px' }}>You&apos;re signed in</h1>
              <p style={{ fontSize: '14.5px', color: '#888', margin: 0 }}>Taking you to your dashboard&hellip;</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', padding: '18px 0', background: '#0a0a0a' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', fontSize: '12.5px', color: '#555', flexWrap: 'wrap' }}>
          <span>&copy; {new Date().getFullYear()} AccessGate</span>
          <div style={{ display: 'flex', gap: '22px' }}>
            {['Terms', 'Privacy', 'Status'].map(l => (
              <a key={l} href="#" style={{ color: '#555', textDecoration: 'none', transition: 'color 180ms' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f0f0f0')}
                onMouseLeave={e => (e.currentTarget.style.color = '#555')}>{l}</a>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pop { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-4px); } 40% { transform: translateX(4px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
        @keyframes drift-a { 0%, 100% { transform: translate(0,0) scale(1); } 33% { transform: translate(60px, 30px) scale(1.08); } 66% { transform: translate(-30px, 50px) scale(0.96); } }
        @keyframes drift-b { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-70px, -40px) scale(1.12); } }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
        @media (max-width: 480px) {
          .otp-input { width: 42px !important; height: 52px !important; font-size: 20px !important; }
        }
      `}</style>
    </div>
  );
}
