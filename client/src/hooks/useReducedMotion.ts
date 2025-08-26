import { useState, useEffect, useRef } from 'react';

// Media query for reduced motion preference
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// Hook to detect user's reduced motion preference
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add event listener (try both new and legacy methods)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
}

// Hook to get motion-safe animation properties
export function useMotionSafe() {
  const prefersReducedMotion = useReducedMotion();

  const getTransition = (
    normalTransition: any,
    reducedTransition: any = { duration: 0.01 }
  ) => {
    return prefersReducedMotion ? reducedTransition : normalTransition;
  };

  const getVariants = (normalVariants: any, reducedVariants?: any) => {
    if (prefersReducedMotion) {
      if (reducedVariants) return reducedVariants;

      // Create reduced motion variants automatically
      const reduced: any = {};
      Object.keys(normalVariants).forEach(key => {
        reduced[key] = {
          ...normalVariants[key],
          transition: { duration: 0.01 }
        };
      });
      return reduced;
    }
    return normalVariants;
  };

  const shouldAnimate = !prefersReducedMotion;

  return {
    prefersReducedMotion,
    shouldAnimate,
    getTransition,
    getVariants,
  };
}

// Hook for conditional animation props
export function useAnimationProps(
  normalProps: any,
  reducedProps?: any
) {
  const { prefersReducedMotion } = useMotionSafe();

  if (prefersReducedMotion) {
    return reducedProps || {
      initial: false,
      animate: normalProps.animate,
      exit: false,
      transition: { duration: 0.01 },
    };
  }

  return normalProps;
}

// Hook to manage animation state based on viewport and reduced motion
export function useViewportAnimation(threshold = 0.1) {
  const [isInView, setIsInView] = useState(false);
  const { shouldAnimate } = useMotionSafe();

  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !shouldAnimate) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      {
        threshold,
        rootMargin: '50px',
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, shouldAnimate]);

  return {
    ref,
    isInView: shouldAnimate ? isInView : true,
    shouldAnimate,
  };
}

export default useReducedMotion;
