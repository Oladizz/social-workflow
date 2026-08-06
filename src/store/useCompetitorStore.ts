import { create } from 'zustand';

export interface TrendingProduct {
  id: string;
  name: string;
  trendScore: number;
  category: string;
  demand: 'rising' | 'stable' | 'falling';
  sparkline: number[];
}

export interface WatchedStore {
  id: string;
  url: string;
  name: string;
  productCount: number;
  priceRange: string;
  lastChecked: string;
  topProducts: {
    id: string;
    title: string;
    price: string;
    variants: number;
    imageUrl: string;
  }[];
}

export interface SavedAd {
  id: string;
  brand: string;
  copy: string;
  platforms: string[];
  daysActive: number;
  imageUrl: string;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'warning' | 'trend';
}

interface CompetitorState {
  trendingProducts: TrendingProduct[];
  watchedStores: WatchedStore[];
  savedAds: SavedAd[];
  swipeFile: SavedAd[];
  aiInsights: AIInsight[];
  activeTab: 'trending' | 'stores' | 'ads' | 'intelligence';
  isLoading: boolean;
  
  fetchTrends: (query: string) => void;
  analyzeStore: (url: string) => void;
  searchAds: (query: string) => void;
  addToWatchlist: (store: WatchedStore) => void;
  saveAd: (ad: SavedAd) => void;
  setActiveTab: (tab: 'trending' | 'stores' | 'ads' | 'intelligence') => void;
}

const mockTrendingProducts: TrendingProduct[] = [
  { id: '1', name: 'Smart Posture Corrector', trendScore: 92, category: 'Gadgets', demand: 'rising', sparkline: [10, 20, 15, 30, 45, 60, 92] },
  { id: '2', name: 'Minimalist Desk Mat', trendScore: 78, category: 'Home', demand: 'stable', sparkline: [40, 45, 42, 50, 48, 55, 52] },
  { id: '3', name: 'Bamboo Cutlery Set', trendScore: 65, category: 'Home', demand: 'falling', sparkline: [80, 75, 70, 60, 50, 45, 40] },
  { id: '4', name: 'AI Voice Recorder', trendScore: 98, category: 'Electronics', demand: 'rising', sparkline: [5, 10, 25, 40, 60, 85, 98] },
];

const mockInsights: AIInsight[] = [
  { id: '1', title: 'Rising Demand in Gadgets', description: 'AI-powered productivity tools are seeing a 300% spike in search volume this week.', type: 'opportunity' },
  { id: '2', title: 'Ad Spend Saturation', description: 'Facebook ad costs for "desk accessories" have increased by 15%. Consider TikTok ads.', type: 'warning' },
];

export const useCompetitorStore = create<CompetitorState>((set) => {
  const getInitialState = () => {
    try {
      const savedState = localStorage.getItem('sf_competitor_data');
      if (savedState) return JSON.parse(savedState);
    } catch (e) {
      console.warn('Failed to parse local storage', e);
    }
    return {
      trendingProducts: mockTrendingProducts,
      watchedStores: [],
      savedAds: [],
      swipeFile: [],
      aiInsights: mockInsights,
      activeTab: 'trending' as const,
    };
  };

  const persistState = (state: Partial<CompetitorState>) => {
    try {
      const currentState = JSON.parse(localStorage.getItem('sf_competitor_data') || '{}');
      localStorage.setItem('sf_competitor_data', JSON.stringify({ ...currentState, ...state }));
    } catch (e) {
      console.warn('Failed to save to local storage', e);
    }
  };

  return {
    ...getInitialState(),
    isLoading: false,

    fetchTrends: async (query) => {
      set({ isLoading: true });
      try {
        const response = await fetch('http://localhost:8000/api/spy/trends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: query || null, category: null })
        });
        if (!response.ok) throw new Error('Failed to fetch trends');
        const data = await response.json();
        set({ trendingProducts: data, isLoading: false });
      } catch (error) {
        console.error(error);
        set({ isLoading: false });
        // Fallback to mock if backend not running
        set({ trendingProducts: mockTrendingProducts });
      }
    },
    
    analyzeStore: async (url) => {
      set({ isLoading: true });
      try {
        const response = await fetch('http://localhost:8000/api/spy/analyze-store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        if (!response.ok) throw new Error('Failed to analyze store');
        const storeData = await response.json();
        
        set((state) => {
          // Check if already in watchlist to update or add
          const existingIdx = state.watchedStores.findIndex(s => s.id === storeData.id);
          let newWatched = [...state.watchedStores];
          if (existingIdx >= 0) {
            newWatched[existingIdx] = storeData;
          } else {
            newWatched.push(storeData);
          }
          const newState = { isLoading: false, watchedStores: newWatched };
          persistState({ watchedStores: newState.watchedStores });
          return newState;
        });
      } catch (error) {
        console.error(error);
        set({ isLoading: false });
      }
    },

    searchAds: async (query) => {
      set({ isLoading: true });
      try {
        const response = await fetch('http://localhost:8000/api/spy/ad-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });
        if (!response.ok) throw new Error('Failed to search ads');
        const data = await response.json();
        set({ isLoading: false, savedAds: data });
      } catch (error) {
        console.error(error);
        set({ isLoading: false });
      }
    },

    addToWatchlist: (store) => set((state) => {
      if (state.watchedStores.find(s => s.id === store.id)) return state;
      const newState = { watchedStores: [...state.watchedStores, store] };
      persistState(newState);
      return newState;
    }),

    saveAd: (ad) => set((state) => {
      if (state.swipeFile.find(a => a.id === ad.id)) return state;
      const newState = { swipeFile: [...state.swipeFile, ad] };
      persistState(newState);
      return newState;
    }),

    setActiveTab: (tab) => set({ activeTab: tab })
  };
});