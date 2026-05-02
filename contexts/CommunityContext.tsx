'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Community, DashboardHome } from '@/lib/types';
import { api } from '@/lib/api';

interface CommunityContextType {
  communities: Community[];
  currentCommunity: Community | null;
  homeStats: DashboardHome | null;
  isLoading: boolean;
  setCurrentCommunityId: (id: string) => void;
  refetchCommunities: () => Promise<void>;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [currentCommunity, setCurrentCommunity] = useState<Community | null>(null);
  const [homeStats, setHomeStats] = useState<DashboardHome | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  const fetchCommunities = async () => {
    try {
      setIsLoading(true);
      const [commData, statsData] = await Promise.allSettled([
        api.getCommunities(),
        api.getDashboardHome(),
      ]);

      const comms = commData.status === 'fulfilled' ? commData.value : [];
      setCommunities(comms);

      if (statsData.status === 'fulfilled') {
        setHomeStats(statsData.value);
      }

      if (comms.length > 0) {
        setCurrentCommunity(prev => {
          if (prev && comms.find(c => c.id === prev.id)) return prev;
          const stored = typeof window !== 'undefined' ? localStorage.getItem('ag.community_id') : null;
          if (stored) {
            const found = comms.find(c => c.id === stored);
            if (found) return found;
          }
          return comms[0];
        });
      }
    } catch {
      setCommunities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const setCurrentCommunityId = (id: string) => {
    const community = communities.find(c => c.id === id);
    if (community) {
      setCurrentCommunity(community);
      try { localStorage.setItem('ag.community_id', id); } catch {}
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchCommunities();
    }
  }, []);

  useEffect(() => {
    if (currentCommunity?.id) {
      try { localStorage.setItem('ag.community_id', currentCommunity.id); } catch {}
    }
  }, [currentCommunity?.id]);

  return (
    <CommunityContext.Provider value={{
      communities,
      currentCommunity,
      homeStats,
      isLoading,
      setCurrentCommunityId,
      refetchCommunities: fetchCommunities,
    }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
}
