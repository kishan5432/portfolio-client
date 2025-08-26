import React, { createContext, useContext, useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';

interface ReducedMotionContextType {
  shouldReduceMotion: boolean;
  toggleReducedMotion: () => void;
}

const ReducedMotionContext = createContext<ReducedMotionContextType | undefined>(undefined);

interface ReducedMotionProviderProps {
  children: React.ReactNode;
}

export function ReducedMotionProvider({ children }: ReducedMotionProviderProps) {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    // Check user's system preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleReducedMotion = () => {
    setShouldReduceMotion(!shouldReduceMotion);
  };

  // Motion configuration based on reduced motion preference
  const motionConfig = {
    reducedMotion: shouldReduceMotion ? 'always' : 'never',
    transition: shouldReduceMotion
      ? { duration: 0.01 }
      : { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  };

  const value: ReducedMotionContextType = {
    shouldReduceMotion,
    toggleReducedMotion,
  };

  return (
    <ReducedMotionContext.Provider value={value}>
      <MotionConfig
        reducedMotion={motionConfig.reducedMotion as any}
        transition={motionConfig.transition}
      >
        {children}
      </MotionConfig>
    </ReducedMotionContext.Provider>
  );
}

export function useReducedMotion(): ReducedMotionContextType {
  const context = useContext(ReducedMotionContext);
  if (context === undefined) {
    throw new Error('useReducedMotion must be used within a ReducedMotionProvider');
  }
  return context;
}

// Utility hook for conditional animations
export function useAnimation() {
  const { shouldReduceMotion } = useReducedMotion();

  const getTransition = (normalTransition: any, reducedTransition = { duration: 0.01 }) => {
    return shouldReduceMotion ? reducedTransition : normalTransition;
  };

  const getVariants = (normalVariants: any, reducedVariants?: any) => {
    if (shouldReduceMotion && reducedVariants) {
      return reducedVariants;
    }
    if (shouldReduceMotion) {
      // Create reduced variants by removing transitions
      const reduced = { ...normalVariants };
      Object.keys(reduced).forEach(key => {
        if (reduced[key].transition) {
          reduced[key] = { ...reduced[key], transition: { duration: 0.01 } };
        }
      });
      return reduced;
    }
    return normalVariants;
  };

  const getProps = (motionProps: any) => {
    if (shouldReduceMotion) {
      return {
        ...motionProps,
        initial: false,
        animate: motionProps.animate,
        exit: false,
        transition: { duration: 0.01 },
      };
    }
    return motionProps;
  };

  return {
    shouldReduceMotion,
    getTransition,
    getVariants,
    getProps,
  };
}

// Component for toggling reduced motion (for accessibility)
export function ReducedMotionToggle() {
  const { shouldReduceMotion, toggleReducedMotion } = useReducedMotion();

  return (
    <button
      onClick={toggleReducedMotion}
      className="flex items-center gap-2 px-3 py-2 text-sm bg-muted hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
      aria-label={`${shouldReduceMotion ? 'Enable' : 'Disable'} animations`}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {shouldReduceMotion ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        )}
      </svg>
      <span>{shouldReduceMotion ? 'Enable' : 'Disable'} Animations</span>
    </button>
  );
}

