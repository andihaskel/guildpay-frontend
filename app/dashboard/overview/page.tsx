'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProduct } from '@/contexts';

export default function OverviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setPendingProductId } = useProduct();

  useEffect(() => {
    const productId = searchParams.get('product_id');
    if (productId) {
      setPendingProductId(productId);
    }
    router.replace('/dashboard/home');
  }, []);

  return null;
}
