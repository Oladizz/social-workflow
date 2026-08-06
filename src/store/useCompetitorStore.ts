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

    fetchTrends: (query) => {
      set({ isLoading: true });
      setTimeout(() => set({ isLoading: false }), 800);
    },
    
    analyzeStore: (url) => {
      set({ isLoading: true });
      setTimeout(() => {
        const mockStore: WatchedStore = {
          id: Date.now().toString(),
          url,
          name: url.replace('https://', '').split('.')[0].toUpperCase(),
          productCount: Math.floor(Math.random() * 200) + 10,
          priceRange: '$15 - $250',
          lastChecked: new Date().toISOString(),
          topProducts: [
            { id: 'p1', title: 'Best Seller Alpha', price: '$49.99', variants: 3, imageUrl: 'https://via.placeholder.com/150' },
            { id: 'p2', title: 'Premium Bundle', price: '$99.99', variants: 1, imageUrl: 'https://via.placeholder.com/150' },
          ]
        };
        set((state) => {
          const newState = { isLoading: false, watchedStores: [...state.watchedStores, mockStore] };
          persistState({ watchedStores: newState.watchedStores });
          return newState;
        });
      }, 1000);
    },

    searchAds: (query) => {
      set({ isLoading: true });
      setTimeout(() => {
        const mockAds: SavedAd[] = [
          { id: 'a1', brand: query || 'CoolBrand', copy: 'Stop wasting time. Try our new tool today and save hours!', platforms: ['FB', 'IG'], daysActive: 14, imageUrl: 'https://via.placeholder.com/300x200' },
          { id: 'a2', brand: query || 'TrendyTech', copy: 'The ultimate gadget for your workspace. 50% off for 24 hours.', platforms: ['TikTok'], daysActive: 5, imageUrl: 'https://via.placeholder.com/300x200' },
        ];
        set({ isLoading: false, savedAds: mockAds });
      }, 800);
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