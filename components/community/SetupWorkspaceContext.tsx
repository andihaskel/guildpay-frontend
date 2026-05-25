'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  loadCommunityPreviewDraft,
  saveCommunityPreviewDraft,
} from '@/components/community/community-preview';
import { mergePlanSellingPointsMapFromPlans, sellingPointsForPlan } from '@/components/community/plan-model';
import {
  mergePlanFieldsIntoPageDraft,
  pageDraftFromCommunity,
  pageDraftsEqual,
} from '@/components/community/community-page-draft';
import { buildCommunityPageUpdate } from '@/components/community/community-page-api';
import { SetupPageDraft, SetupPreviewModel, PlanSellingPoint } from '@/components/community/setup-preview-types';
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
  updatePageDraft: (patch: Partial<SetupPageDraft> | ((prev: SetupPageDraft) => Partial<SetupPageDraft>)) => void;
  pageDraftDirty: boolean;
  isSavingPageDraft: boolean;
  pageDraftSaveError: string | null;
  savePageDraft: () => Promise<string | null>;
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
  planSellingPoints: Record<string, PlanSellingPoint[]>;
  updatePlanSellingPoints: (planId: string, points: PlanSellingPoint[]) => void;
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
  const [previewDevice, setPreviewDeviceState] = useState<'desktop' | 'mobile'>(() => {
    if (typeof window === 'undefined') return 'mobile';
    try {
      return localStorage.getItem('ag.preview.device') === 'desktop' ? 'desktop' : 'mobile';
    } catch {
      return 'mobile';
    }
  });
  const [openPlanId, setOpenPlanId] = useState<string | null>(null);
  const [pageDraft, setPageDraft] = useState<SetupPageDraft | null>(null);
  const [savedPageDraft, setSavedPageDraft] = useState<SetupPageDraft | null>(null);
  const [isSavingPageDraft, setIsSavingPageDraft] = useState(false);
  const [pageDraftSaveError, setPageDraftSaveError] = useState<string | null>(null);
  const [planSellingPoints, setPlanSellingPoints] = useState<Record<string, PlanSellingPoint[]>>({});
  const hasInitializedPageDraft = useRef(false);

  const setPreviewDevice = useCallback((device: 'desktop' | 'mobile') => {
    setPreviewDeviceState(device);
    try {
      localStorage.setItem('ag.preview.device', device);
    } catch {
      /* private mode */
    }
  }, []);

  const focusPlanId = searchParams.get('focus');

  useEffect(() => {
    if (!communityId) return;
    sessionStorage.setItem(COMMUNITY_PREVIEW_ACTIVE_KEY, communityId);
    const draft = loadCommunityPreviewDraft(communityId);
    if (draft?.planSellingPoints) {
      setPlanSellingPoints(draft.planSellingPoints);
    }
    return () => sessionStorage.removeItem(COMMUNITY_PREVIEW_ACTIVE_KEY);
  }, [communityId]);

  useEffect(() => {
    hasInitializedPageDraft.current = false;
    setPageDraft(null);
    setSavedPageDraft(null);
    setPageDraftSaveError(null);
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
        setCommunity(comm.value);
      }
      if (ovr.status === 'fulfilled') setOverview(ovr.value);
      if (pl.status === 'fulfilled') setPlans(pl.value);
      if (ch.status === 'fulfilled') setChannels(ch.value);
      setIsLoading(false);
    });
  }, [communityId, setCurrentCommunityId]);

  useEffect(() => {
    if (!community || isLoading || hasInitializedPageDraft.current) return;
    const draft = pageDraftFromCommunity(community, plans);
    setPageDraft(draft);
    setSavedPageDraft(draft);
    hasInitializedPageDraft.current = true;
  }, [community, plans, isLoading]);

  useEffect(() => {
    if (!hasInitializedPageDraft.current || plans.length === 0) return;
    setPageDraft(prev => (prev ? mergePlanFieldsIntoPageDraft(prev, plans) : prev));
    setSavedPageDraft(prev => (prev ? mergePlanFieldsIntoPageDraft(prev, plans) : prev));
  }, [plans]);

  useEffect(() => {
    if (plans.length === 0) return;
    setPlanSellingPoints(prev => mergePlanSellingPointsMapFromPlans(prev, plans));
  }, [plans]);

  useEffect(() => {
    if (!focusPlanId) return;
    setOpenPlanId(focusPlanId);
    router.replace(`/dashboard/community/${communityId}/setup/plans`);
  }, [focusPlanId, communityId, router]);

  useEffect(() => {
    if (openPlanId && plans.length > 0 && !plans.some(p => p.id === openPlanId)) {
      setOpenPlanId(null);
    }
  }, [plans, openPlanId]);

  const comm = community ?? communities.find(c => c.id === communityId) ?? null;

  const updatePageDraft = useCallback(
    (patch: Partial<SetupPageDraft> | ((prev: SetupPageDraft) => Partial<SetupPageDraft>)) => {
      setPageDraftSaveError(null);
      setPageDraft(prev => {
        if (!prev) return prev;
        const nextPatch = typeof patch === 'function' ? patch(prev) : patch;
        return { ...prev, ...nextPatch };
      });
    },
    [],
  );

  const pageDraftDirty = useMemo(() => {
    if (!pageDraft || !savedPageDraft) return false;
    return !pageDraftsEqual(pageDraft, savedPageDraft);
  }, [pageDraft, savedPageDraft]);

  const savePageDraft = useCallback(async (): Promise<string | null> => {
    if (!community || !pageDraft || !pageDraftDirty) return null;

    setIsSavingPageDraft(true);
    setPageDraftSaveError(null);
    try {
      const payload = buildCommunityPageUpdate(community, pageDraft);
      await api.updateCommunity(communityId, payload);
      const refreshed = await api.getCommunity(communityId);
      setCommunity(refreshed);
      const nextSaved = pageDraftFromCommunity(refreshed, plans);
      setPageDraft(nextSaved);
      setSavedPageDraft(nextSaved);
      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save page changes.';
      setPageDraftSaveError(message);
      return message;
    } finally {
      setIsSavingPageDraft(false);
    }
  }, [community, communityId, pageDraft, pageDraftDirty, plans]);

  const handlePlanToggle = useCallback((planId: string) => {
    setOpenPlanId(prev => (prev === planId ? null : planId));
  }, []);

  const refreshPlans = useCallback(() => {
    api.getCommunityPlans(communityId).then(setPlans).catch(() => {});
  }, [communityId]);

  const refreshChannels = useCallback(() => {
    api.getCommunityChannels(communityId).then(setChannels).catch(() => {});
  }, [communityId]);

  const updatePlanSellingPoints = useCallback((planId: string, points: PlanSellingPoint[]) => {
    setPlanSellingPoints(prev => ({ ...prev, [planId]: points }));
  }, []);

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
      planSellingPoints,
    };
  }, [comm, pageDraft, plans, channels, openPlanId, planSellingPoints]);

  useEffect(() => {
    if (previewModel) saveCommunityPreviewDraft(communityId, previewModel);
  }, [communityId, previewModel]);

  function handlePlanCreated(plan: CommunityPlan, sellingPoints?: PlanSellingPoint[]) {
    refreshPlans();
    const points = sellingPointsForPlan(plan, sellingPoints);
    setPlanSellingPoints(prev => ({ ...prev, [plan.id]: points }));
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
      pageDraftDirty,
      isSavingPageDraft,
      pageDraftSaveError,
      savePageDraft,
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
      planSellingPoints,
      updatePlanSellingPoints,
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
    pageDraftDirty,
    isSavingPageDraft,
    pageDraftSaveError,
    savePageDraft,
    openPlanId,
    handlePlanToggle,
    previewDevice,
    goToPlans,
    refreshPlans,
    refreshChannels,
    setPreviewDevice,
    planSellingPoints,
    updatePlanSellingPoints,
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
