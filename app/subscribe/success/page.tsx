import { Suspense } from 'react';
import { Loader as Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import SubscribeSuccessContent from './success-content';

export const dynamic = 'force-dynamic';

export default function SubscribeSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-slate-900/80 border-slate-800/50 text-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-16 w-16 text-purple-500 animate-spin" />
            <h2 className="text-2xl font-bold">Loading...</h2>
          </div>
        </Card>
      </div>
    }>
      <SubscribeSuccessContent />
    </Suspense>
  );
}
