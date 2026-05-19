'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCommunity } from '@/contexts/CommunityContext';
import { api } from '@/lib/api';
import {
  Community,
  CommunityChannel,
  CommunityOverview,
  CommunityPlan,
} from '@/lib/types';
import {
  COMMUNITY_PREVIEW_ACTIVE_KEY,
  DEFAULT_COMMUNITY_FAQ,
  DEFAULT_COMMUNITY_SELLING_POINTS,
  DEFAULT_COMMUNITY_TESTIMONIALS,
  saveCommunityPreviewDraft,
} from '@/components/community/community-preview';
import { SetupPageDraft, SetupPreviewModel } from '@/components/community/setup-preview-types';
import { planColor } from '@/components/community/setup-utils';
import { NewPlanModal } from '@/components/community/NewPlanModal';

export type SetupSection = 'page' | 'plans' | 'checkout';

type SetupWorkspaceValue = {
  communityId: string;
  community: Community;
  overview: CommunityOverview | null;
  plans: CommunityPlan[];
  channels: CommunityChannel[];
  isLoading: boolean;
  pageDraft: SetupPageDraft;
  updatePageDraft: (patch: Partial<SetupPageDraft>) => void;
  openPlanId: string | null;
  setOpenPlanId: (id: string | null) => void;
  handlePlanToggle: (planId: string) => void;
  previewDevice: 'desktop' | 'mobile';
  setPreviewDevice: (d: 'desktop' | 'mobile') => void;
  previewModel: SetupPreviewModel;
  onNewPlan: () => void;
  goToPlans: () => void;
  refreshPlans: () => void;
  refreshChannels: () => void;
};

const SetupWorkspaceContext = createContext<SetupWorkspaceValue | null>(null);

export function useSetupWorkspace() {
  const ctx = useContext(SetupWorkspaceContext);
  if (!ctx) throw new Error('useSetupWorkspace must be used within SetupWorkspaceProvider');
  return ctx;
}

export function SetupWorkspaceProvider({ children }: { children: ReactNode }) {
  const { communityId } = useParams<{ communityId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { communities, setCurrentCommunityId } = useCommunity();

  const [community, setCommunity] = useState<Community | null>(null);
  const [overview, setOverview] = useState<CommunityOverview | null>(null);
  const [plans, setPlans] = useState<CommunityPlan[]>([]);
  const [channels, setChannels] = useState<CommunityChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [openPlanId, setOpenPlanId] = useState<string | null>(null);
  const [pageDraft, setPageDraft] = useState<SetupPageDraft | null>(null);

  const focusPlanId = searchParams.get('focus');

  useEffect(() => {
    if (!communityId) return;
    sessionStorage.setItem(COMMUNITY_PREVIEW_ACTIVE_KEY, communityId);
    return () => sessionStorage.removeItem(COMMUNITY_PREVIEW_ACTIVE_KEY);
  }, [communityId]);

  useEffect(() => {
    if (!communityId) return;
    setCurrentCommunityId(communityId);
    setIsLoading(true);

    Promise.allSettled([
      api.getCommunity(communityId),
      api.getCommunityOverview(communityId),
      api.getCommunityPlans(communityId),
      api.getCommunityChannels(communityId),
    ]).then(([comm, ovr, pl, ch]) => {
      if (comm.status === 'fulfilled') {
        const c = comm.value;
        setCommunity(c);
        setPageDraft(prev =>
          prev ?? {
            communityName: c.name,
            tagline: c.tagline || 'Daily signals + live sessions',
            headline: 'Trade alongside a proven desk.',
            subHeadline:
              'Real-time alerts, weekly sessions, and a no-noise Discord. Cancel anytime.',
            accentColor: planColor(c.name),
          },
        );
      }
      if (ovr.status === 'fulfilled') setOverview(ovr.value);
      if (pl.status === 'fulfilled') setPlans(pl.value);
      if (ch.status === 'fulfilled') setChannels(ch.value);
      setIsLoading(false);
    });
  }, [communityId, setCurrentCommunityId]);

  useEffect(() => {
    if (!focusPlanId) return;
    setOpenPlanId(focusPlanId);
    router.replace(`/dashboard/community/${communityId}/setup/plans`);
  }, [focusPlanId, communityId, router]);

  useEffect(() => {
    if (plans.length > 0 && (!openPlanId || !plans.some(p => p.id === openPlanId))) {
      setOpenPlanId(plans[0].id);
    }
  }, [plans, openPlanId]);

  const comm = community ?? communities.find(c => c.id === communityId) ?? null;

  const updatePageDraft = useCallback((patch: Partial<SetupPageDraft>) => {
    setPageDraft(prev => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const handlePlanToggle = useCallback((planId: string) => {
    setOpenPlanId(prev => (prev === planId ? null : planId));
  }, []);

  const refreshPlans = useCallback(() => {
    api.getCommunityPlans(communityId).then(setPlans).catch(() => {});
  }, [communityId]);

  const refreshChannels = useCallback(() => {
    api.getCommunityChannels(communityId).then(setChannels).catch(() => {});
  }, [communityId]);

  const goToPlans = useCallback(() => {
    router.push(`/dashboard/community/${communityId}/setup/plans`);
  }, [communityId, router]);

  const previewModel = useMemo<SetupPreviewModel | null>(() => {
    if (!comm || !pageDraft) return null;
    return {
      slug: comm.slug,
      page: pageDraft,
      plans,
      channels,
      selectedPlanId: openPlanId,
      sellingPoints: DEFAULT_COMMUNITY_SELLING_POINTS,
      faq: DEFAULT_COMMUNITY_FAQ,
      testimonials: DEFAULT_COMMUNITY_TESTIMONIALS,
    };
  }, [comm, pageDraft, plans, channels, openPlanId]);

  useEffect(() => {
    if (previewModel) saveCommunityPreviewDraft(communityId, previewModel);
  }, [communityId, previewModel]);

  function handlePlanCreated(plan: { id: string }) {
    refreshPlans();
    router.push(`/dashboard/community/${communityId}/setup/plans?focus=${plan.id}`);
  }

  const value = useMemo<SetupWorkspaceValue | null>(() => {
    if (!comm || !pageDraft || !previewModel) return null;
    return {
      communityId,
      community: comm,
      overview,
      plans,
      channels,
      isLoading,
      pageDraft,
      updatePageDraft,
      openPlanId,
      setOpenPlanId,
      handlePlanToggle,
      previewDevice,
      setPreviewDevice,
      previewModel,
      onNewPlan: () => setPlanModalOpen(true),
      goToPlans,
      refreshPlans,
      refreshChannels,
    };
  }, [
    comm,
    pageDraft,
    previewModel,
    communityId,
    overview,
    plans,
    channels,
    isLoading,
    updatePageDraft,
    openPlanId,
    handlePlanToggle,
    previewDevice,
    goToPlans,
    refreshPlans,
    refreshChannels,
  ]);

  if (!comm && isLoading) {
    return (
      <div className="setup-workspace-loading">
        {[1, 2, 3].map(i => (
          <div key={i} className="setup-workspace-skeleton" />
        ))}
      </div>
    );
  }

  if (!comm || !value) {
    return <div style={{ color: 'var(--text-muted)', padding: '32px' }}>Community not found.</div>;
  }

  return (
    <SetupWorkspaceContext.Provider value={value}>
      {children}
      <NewPlanModal
        open={planModalOpen}
        communityId={communityId}
        onClose={() => setPlanModalOpen(false)}
        onCreated={handlePlanCreated}
      />
    </SetupWorkspaceContext.Provider>
  );
}
