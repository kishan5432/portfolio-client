import { MotionConfig } from 'framer-motion';
import { spring, duration } from './variants';

// Global motion configuration
export const motionConfig = {
  // Reduced motion handling
  reducedMotion: 'user',

  // Global transition defaults
  transition: {
    duration: duration.normal,
    ease: [0.4, 0, 0.2, 1],
  },

  // Global spring defaults
  spring: spring.gentle,
} as const;

// Utility to check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Utility to get appropriate transition based on user preference
export function getTransition(normalTransition: any, reducedTransition?: any) {
  if (prefersReducedMotion()) {
    return reducedTransition || { duration: 0.01 };
  }
  return normalTransition;
}

// Animation presets for common use cases
export const animationPresets = {
  // Quick fade
  quickFade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: getTransition({ duration: duration.fast }),
  },

  // Smooth slide up
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: getTransition({
      duration: duration.normal,
      ease: [0.4, 0, 0.2, 1],
    }),
  },

  // Scale bounce
  scaleBounce: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: getTransition(spring.wobbly),
  },

  // Gentle hover
  gentleHover: {
    scale: 1.02,
    y: -2,
    transition: getTransition(spring.gentle),
  },

  // Strong hover
  strongHover: {
    scale: 1.05,
    y: -4,
    transition: getTransition(spring.wobbly),
  },

  // Tap response
  tap: {
    scale: 0.95,
    transition: getTransition(spring.stiff),
  },
} as const;

// Layout animation configurations
export const layoutAnimations = {
  // Shared layout transitions
  layoutId: 'shared-element',
  layout: true,
  transition: getTransition({
    duration: duration.normal,
    ease: [0.4, 0, 0.2, 1],
  }),
} as const;

// Scroll animation configurations
export const scrollAnimations = {
  // Default viewport settings for scroll animations
  viewport: {
    once: true,
    margin: '-100px 0px',
    amount: 0.3,
  },

  // Stagger for scroll animations
  stagger: {
    children: 0.1,
    delayChildren: 0.2,
  },
} as const;

// Performance optimizations
export const performanceSettings = {
  // Use transform instead of layout-affecting properties
  willChange: 'transform, opacity',

  // Hardware acceleration
  force3d: true,

  // Reduce motion complexity for mobile
  isMobile: typeof window !== 'undefined' && window.innerWidth < 768,
} as const;

