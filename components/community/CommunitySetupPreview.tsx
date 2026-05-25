'use client';

import { useEffect, useMemo, useState } from 'react';
import { SetupPreviewModel } from '@/components/community/setup-preview-types';
import { CommunityPublicPageView } from '@/components/community/CommunityPublicPageView';
import { buildSetupPreviewPageProps } from '@/components/community/public-page-adapters';

export function CommunitySetupPreview({
  model,
  previewFrame = 'desktop',
}: {
  model: SetupPreviewModel;
  previewFrame?: 'desktop' | 'mobile';
}) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(model.selectedPlanId);

  useEffect(() => {
    setSelectedPlanId(model.selectedPlanId);
  }, [model.selectedPlanId]);

  useEffect(() => {
    const visibleIds = model.page.visiblePlanIds ?? model.plans.map(plan => plan.id);
    if (selectedPlanId && !visibleIds.includes(selectedPlanId)) {
      setSelectedPlanId(visibleIds[0] ?? null);
    }
  }, [model.page.visiblePlanIds, model.plans, selectedPlanId]);

  const props = useMemo(
    () => buildSetupPreviewPageProps(model, selectedPlanId ?? model.selectedPlanId, setSelectedPlanId),
    [model, selectedPlanId],
  );

  return (
    <div
      className={`setup-preview-scroll setup-preview-frame setup-preview-frame--${previewFrame}`}
    >
      <CommunityPublicPageView {...props} />
    </div>
  );
}
