'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const from = params.get('from');

      if (from === 'discord') {
        const meResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          credentials: 'include',
        });

        if (!meResponse.ok) {
          setError('Authentication failed. Please try again.');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        await meResponse.json();

        const countResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/creator/products/count`, {
          credentials: 'include',
        });

        if (countResponse.ok) {
          const { count } = await countResponse.json();

          if (count === 0) {
            router.push('/select-server');
          } else {
            router.push('/dashboard/overview');
          }
        } else {
          router.push('/select-server');
        }
      } else {
        router.push('/dashboard/overview');
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      setError('Something went wrong. Redirecting...');
      setTimeout(() => router.push('/login'), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-destructive mb-4">{error}</div>
            <p className="text-sm text-muted-foreground">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-lg font-semibold mb-2">Completing authentication...</h2>
            <p className="text-sm text-muted-foreground">Please wait while we set up your account.</p>
          </>
        )}
      </div>
    </div>
  );
}
