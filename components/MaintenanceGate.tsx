'use client';

import { useState, useEffect } from 'react';

const MAINTENANCE_KEY = 'maintenance_bypass';
const PASSWORD = 'Andihas123';

export default function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(MAINTENANCE_KEY);
    if (stored === 'true') setUnlocked(true);
    setChecking(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === PASSWORD) {
      sessionStorage.setItem(MAINTENANCE_KEY, 'true');
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setShake(true);
      setInput('');
      setTimeout(() => setShake(false), 500);
    }
  };

  if (checking) return null;
  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.8) 0.5px, transparent 0.5px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
            </svg>
          </div>

          <div className="text-center">
            <h1 className="text-xl font-semibold text-white mb-2">Under Maintenance</h1>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              We're working on some improvements. The system will be back shortly.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className={`transition-transform duration-100 ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
            <input
              type="password"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(false); }}
              placeholder="Enter access password"
              autoFocus
              className={`w-full h-11 px-4 rounded-lg bg-white/5 border text-sm text-white placeholder:text-white/25 outline-none transition-all
                ${error
                  ? 'border-red-500/60 focus:border-red-500/80'
                  : 'border-white/10 focus:border-white/25'
                }`}
            />
            {error && (
              <p className="text-xs text-red-400/80 mt-2 px-1">Incorrect password. Try again.</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 active:scale-[0.98] transition-all"
          >
            Access System
          </button>
        </form>

        <p className="text-center text-xs text-white/20 mt-8">
          AccessGate &mdash; Maintenance Mode
        </p>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
