'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CommunitySetupPreview } from '@/components/community/CommunitySetupPreview';
import {
  buildCommunityPreviewModel,
  isCommunityPreviewDraftActive,
  loadCommunityPreviewDraft,
} from '@/components/community/community-preview';
import { SetupPreviewModel } from '@/components/community/setup-preview-types';
import { api } from '@/lib/api';
import { Community } from '@/lib/types';

export default function CommunityPreviewPage() {
  const { communityId } = useParams<{ communityId: string }>();
  const [model, setModel] = useState<SetupPreviewModel | null>(null);

  useEffect(() => {
    if (!communityId) return;

    const stored =
      isCommunityPreviewDraftActive(communityId) ? loadCommunityPreviewDraft(communityId) : null;

    if (stored) {
      setModel(stored);
      return;
    }

    let cancelled = false;

    Promise.allSettled([
      api.getCommunity(communityId),
      api.getCommunityPlans(communityId),
      api.getCommunityChannels(communityId),
    ]).then(([comm, plans, channels]) => {
      if (cancelled) return;
      const community = comm.status === 'fulfilled' ? comm.value : null;
      if (!community) {
        setModel(null);
        return;
      }
      const planList = plans.status === 'fulfilled' ? plans.value : [];
      const channelList = channels.status === 'fulfilled' ? channels.value : [];
      setModel(buildCommunityPreviewModel(community as Community, planList, channelList));
    });

    return () => {
      cancelled = true;
    };
  }, [communityId]);

  useEffect(() => {
    if (!model) return;
    const prev = document.title;
    document.title = `${model.page.communityName} — Join the community`;
    return () => {
      document.title = prev;
    };
  }, [model]);

  if (!model) {
    return <div className="community-preview-loading">Loading…</div>;
  }

  return <CommunitySetupPreview model={model} />;
}
