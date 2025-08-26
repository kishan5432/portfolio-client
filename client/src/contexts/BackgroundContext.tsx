import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';

export type BackgroundType =
  | 'auto'
  | 'geometric'
  | 'particles'
  | 'waves'
  | 'grid'
  | 'dots'
  | 'constellation'
  | 'neural'
  | 'flow'
  | 'matrix'
  | 'gradient'
  | 'none';

// Available backgrounds for auto-cycling (only selected backgrounds)
export const CYCLEABLE_BACKGROUNDS: BackgroundType[] = [
  'grid',
  'dots',
  'particles',
  'waves'
];

interface BackgroundContextType {
  backgroundType: BackgroundType;
  setBackgroundType: (type: BackgroundType) => void;
  isAutoCycling: boolean;
  setIsAutoCycling: (enabled: boolean) => void;
  cycleInterval: number;
  setCycleInterval: (seconds: number) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

interface BackgroundProviderProps {
  children: ReactNode;
}

export function BackgroundProvider({ children }: BackgroundProviderProps) {
  const [backgroundType, setBackgroundTypeState] = useState<BackgroundType>(() => {
    if (typeof window === 'undefined') return 'grid';
    const saved = localStorage.getItem('background-preference') as BackgroundType;
    return saved || 'grid';
  });

  const [isAutoCycling, setIsAutoCyclingState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('auto-cycle-backgrounds') === 'true';
  });

  const [cycleInterval, setCycleIntervalState] = useState<number>(() => {
    if (typeof window === 'undefined') return 15;
    return parseInt(localStorage.getItem('cycle-interval') || '15', 10);
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef<number>(0);
  const userSelectedRef = useRef<boolean>(false);

  const setBackgroundType = useCallback((type: BackgroundType) => {
    setBackgroundTypeState(type);
    localStorage.setItem('background-preference', type);

    // Mark as user-selected (not auto-cycled)
    userSelectedRef.current = true;

    // Update current index if the type is in the cycleable list
    const index = CYCLEABLE_BACKGROUNDS.indexOf(type);
    if (index !== -1) {
      currentIndexRef.current = index;
    }

    // Force a re-render by dispatching a custom event
    window.dispatchEvent(new CustomEvent('backgroundChange', { detail: type }));
  }, []);

  const setIsAutoCycling = useCallback((enabled: boolean) => {
    setIsAutoCyclingState(enabled);
    localStorage.setItem('auto-cycle-backgrounds', enabled.toString());
  }, []);

  const setCycleInterval = useCallback((seconds: number) => {
    setCycleIntervalState(seconds);
    localStorage.setItem('cycle-interval', seconds.toString());
  }, []);

  const cycleToNext = useCallback(() => {
    // Don't auto-cycle if user has manually selected a background
    if (userSelectedRef.current) {
      return;
    }

    currentIndexRef.current = (currentIndexRef.current + 1) % CYCLEABLE_BACKGROUNDS.length;
    const nextBackground = CYCLEABLE_BACKGROUNDS[currentIndexRef.current];
    setBackgroundTypeState(nextBackground);
    localStorage.setItem('background-preference', nextBackground);

    // Force a re-render by dispatching a custom event
    window.dispatchEvent(new CustomEvent('backgroundChange', { detail: nextBackground }));
  }, []);

  // Auto-cycling effect (only when isAutoCycling is enabled and backgroundType is not 'auto')
  useEffect(() => {
    if (isAutoCycling && backgroundType !== 'auto' && !userSelectedRef.current) {
      // Initialize current index based on current background
      const currentIndex = CYCLEABLE_BACKGROUNDS.indexOf(backgroundType);
      if (currentIndex !== -1) {
        currentIndexRef.current = currentIndex;
      }

      // Start the interval
      intervalRef.current = setInterval(cycleToNext, cycleInterval * 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      // Clear interval if auto-cycling is disabled, user selected 'auto' mode, or user manually selected a background
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isAutoCycling, cycleInterval, cycleToNext, backgroundType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <BackgroundContext.Provider value={{
      backgroundType,
      setBackgroundType,
      isAutoCycling,
      setIsAutoCycling,
      cycleInterval,
      setCycleInterval
    }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
}
