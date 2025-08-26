import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBackground } from './AnimatedBackground';
import { CanvasBackground } from './CanvasBackground';
import { useReducedMotion } from '@/hooks/useReducedMotion';

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

interface BackgroundManagerProps {
  type?: BackgroundType;
  className?: string;
  children?: React.ReactNode;
}

export function BackgroundManager({
  type = 'grid',
  className = '',
  children
}: BackgroundManagerProps) {
  const shouldReduceMotion = useReducedMotion();
  const [currentType, setCurrentType] = useState<BackgroundType>(type);
  const [previousType, setPreviousType] = useState<BackgroundType | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update current type when prop changes with smooth transition
  useEffect(() => {
    if (type !== currentType) {
      // Start transition
      setPreviousType(currentType);
      setIsTransitioning(true);

      // Clear any existing timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      // Set new type after a brief delay to ensure smooth transition
      transitionTimeoutRef.current = setTimeout(() => {
        setCurrentType(type);

        // End transition after animation completes
        setTimeout(() => {
          setIsTransitioning(false);
          setPreviousType(null);
        }, shouldReduceMotion ? 0 : 1500); // 1500ms for complete transition
      }, 50);
    }
  }, [type, currentType, shouldReduceMotion]);

  // Listen for background change events
  useEffect(() => {
    const handleBackgroundChange = (event: CustomEvent) => {
      const newType = event.detail;
      if (newType !== currentType) {
        // Start transition
        setPreviousType(currentType);
        setIsTransitioning(true);

        // Clear any existing timeout
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }

        // Set new type after a brief delay
        transitionTimeoutRef.current = setTimeout(() => {
          setCurrentType(newType);

          // End transition after animation completes
          setTimeout(() => {
            setIsTransitioning(false);
            setPreviousType(null);
          }, shouldReduceMotion ? 0 : 1500);
        }, 50);
      }
    };

    window.addEventListener('backgroundChange', handleBackgroundChange as EventListener);

    return () => {
      window.removeEventListener('backgroundChange', handleBackgroundChange as EventListener);
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [currentType, shouldReduceMotion]);

  const renderBackgroundComponent = (backgroundType: BackgroundType, key: string, isExiting = false) => {
    if (backgroundType === 'none') return null;

    const transitionDuration = shouldReduceMotion ? 0 : 1.2;
    const exitDelay = shouldReduceMotion ? 0 : 0.3;

    if (backgroundType === 'gradient') {
      return (
        <motion.div
          key={key}
          className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background/95 to-muted/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: transitionDuration,
            delay: isExiting ? exitDelay : 0,
            ease: "easeInOut"
          }}
        />
      );
    }

    // Canvas-based backgrounds
    if (['constellation', 'neural', 'flow', 'matrix'].includes(backgroundType)) {
      return (
        <motion.div
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: transitionDuration,
            delay: isExiting ? exitDelay : 0,
            ease: "easeInOut"
          }}
          className="fixed inset-0"
        >
          <div className="fixed inset-0 -z-20 bg-gradient-to-br from-background via-background/95 to-muted/15" />
          <CanvasBackground
            variant={backgroundType as 'constellation' | 'neural' | 'flow' | 'matrix'}
            className="opacity-80"
          />
        </motion.div>
      );
    }

    // CSS/Framer Motion backgrounds
    return (
      <motion.div
        key={key}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: transitionDuration,
          delay: isExiting ? exitDelay : 0,
          ease: "easeInOut"
        }}
        className="fixed inset-0"
      >
        <AnimatedBackground
          variant={backgroundType as 'auto' | 'geometric' | 'particles' | 'waves' | 'grid' | 'dots'}
          className={className}
        />
      </motion.div>
    );
  };

  return (
    <div className="relative min-h-screen">
      <AnimatePresence>
        {/* Previous background (fading out) */}
        {isTransitioning && previousType && (
          renderBackgroundComponent(previousType, `previous-${previousType}`, true)
        )}

        {/* Current background (fading in) */}
        {renderBackgroundComponent(currentType, `current-${currentType}`, false)}
      </AnimatePresence>

      {children}
    </div>
  );
}

// Hook for managing background preferences
export function useBackgroundPreference() {
  const [backgroundType, setBackgroundType] = useState<BackgroundType>(() => {
    if (typeof window === 'undefined') return 'grid';
    return (localStorage.getItem('background-preference') as BackgroundType) || 'grid';
  });

  const updateBackgroundType = (type: BackgroundType) => {
    console.log('🔄 useBackgroundPreference: Setting type to', type);
    setBackgroundType(type);
    localStorage.setItem('background-preference', type);
  };

  return [backgroundType, updateBackgroundType] as const;
}

// Preset configurations for different pages
export const backgroundPresets = {
  home: 'constellation' as BackgroundType,
  about: 'geometric' as BackgroundType,
  projects: 'neural' as BackgroundType,
  certificates: 'particles' as BackgroundType,
  timeline: 'flow' as BackgroundType,
  contact: 'waves' as BackgroundType,
  admin: 'grid' as BackgroundType,
} as const;
