import type { Variants, Transition } from 'framer-motion';

// Easing curves for natural motion
export const easing = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  sharp: [0.4, 0, 0.6, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  elastic: [0.175, 0.885, 0.32, 1.275],
  back: [0.68, -0.6, 0.32, 1.6],
} as const;

// Duration constants
export const duration = {
  instant: 0.01,
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
  slowest: 1.2,
} as const;

// Spring configurations for different motion feels
export const spring = {
  gentle: {
    type: 'spring' as const,
    stiffness: 120,
    damping: 14,
    mass: 0.8,
  },
  wobbly: {
    type: 'spring' as const,
    stiffness: 180,
    damping: 12,
    mass: 0.6,
  },
  stiff: {
    type: 'spring' as const,
    stiffness: 210,
    damping: 20,
    mass: 0.4,
  },
  slow: {
    type: 'spring' as const,
    stiffness: 80,
    damping: 14,
    mass: 1.2,
  },
  bouncy: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 8,
    mass: 0.8,
  },
  snappy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
    mass: 0.5,
  },
} as const;

// Transition presets
export const transitions = {
  default: {
    duration: duration.normal,
    ease: easing.easeOut,
  },
  smooth: {
    duration: duration.slow,
    ease: easing.easeInOut,
  },
  quick: {
    duration: duration.fast,
    ease: easing.easeOut,
  },
  bouncy: spring.bouncy,
  gentle: spring.gentle,
  snappy: spring.snappy,
} as const;

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.default,
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: duration.fast,
      ease: easing.easeIn,
    },
  },
};

// Enhanced slide variants with multiple directions
export const slideVariants: Variants = {
  slideInLeft: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
  },
  slideInRight: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
  },
  slideInUp: {
    initial: { y: 100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 100, opacity: 0 },
  },
  slideInDown: {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -100, opacity: 0 },
  },
  slideInFromBottom: {
    initial: { y: '100vh', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100vh', opacity: 0 },
  },
  slideInFromTop: {
    initial: { y: '-100vh', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100vh', opacity: 0 },
  },
};

// Enhanced fade variants
export const fadeVariants: Variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeInScale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  fadeInScaleRotate: {
    initial: { opacity: 0, scale: 0.8, rotate: -10 },
    animate: { opacity: 1, scale: 1, rotate: 0 },
    exit: { opacity: 0, scale: 0.8, rotate: 10 },
  },
  fadeInBlur: {
    initial: { opacity: 0, filter: 'blur(4px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(4px)' },
  },
  fadeInZoom: {
    initial: { opacity: 0, scale: 1.2 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.2 },
  },
};

// Stagger containers with different timing
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

export const staggerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.1,
      staggerDirection: -1,
    },
  },
};

// Individual item variants for stagger animations
export const itemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.default,
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: duration.fast,
      ease: easing.easeIn,
    },
  },
};

export const itemVariantsScale: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: transitions.bouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: transitions.quick,
  },
};

// Navigation-specific variants
export const navVariants: Variants = {
  hidden: {
    y: -100,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitions.default,
  },
  exit: {
    y: -100,
    opacity: 0,
    transition: transitions.quick,
  },
};

// Mobile menu variants with smooth height animation
export const mobileMenuVariants: Variants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: transitions.quick,
  },
  open: {
    opacity: 1,
    height: 'auto',
    transition: transitions.default,
  },
};

// Modal and overlay variants
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.bouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: transitions.quick,
  },
};

export const backdropVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: { duration: duration.normal },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast },
  },
};

export const drawerVariants: Variants = {
  hidden: {
    x: '100%',
  },
  visible: {
    x: 0,
    transition: transitions.smooth,
  },
  exit: {
    x: '100%',
    transition: transitions.quick,
  },
};

// Interactive animation variants
export const hoverVariants = {
  scale: {
    scale: 1.05,
    transition: spring.gentle,
  },
  lift: {
    y: -4,
    scale: 1.02,
    transition: spring.gentle,
  },
  glow: {
    boxShadow: '0 0 20px hsl(var(--accent) / 0.3)',
    transition: spring.gentle,
  },
  magnetic: {
    scale: 1.02,
    y: -2,
    transition: spring.gentle,
  },
  rotate: {
    rotate: 5,
    scale: 1.02,
    transition: spring.gentle,
  },
  float: {
    y: -8,
    transition: spring.bouncy,
  },
} as const;

export const tapVariants = {
  scale: {
    scale: 0.95,
    transition: spring.stiff,
  },
  push: {
    scale: 0.98,
    y: 1,
    transition: spring.stiff,
  },
  shrink: {
    scale: 0.9,
    transition: spring.snappy,
  },
} as const;

// Loading and feedback animations
export const loadingVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: easing.easeInOut,
    },
  },
  bounce: {
    y: [-10, 0, -10],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: easing.easeInOut,
    },
  },
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
  dots: {
    scale: [0, 1, 0],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: easing.easeInOut,
    },
  },
  shimmer: {
    x: ['-100%', '100%'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Scroll-triggered animations
export const scrollVariants: Variants = {
  fadeInUp: {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-100px' },
    transition: transitions.smooth,
  },
  fadeInDown: {
    initial: { opacity: 0, y: -60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-100px' },
    transition: transitions.smooth,
  },
  slideInLeft: {
    initial: { opacity: 0, x: -60 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, margin: '-100px' },
    transition: transitions.smooth,
  },
  slideInRight: {
    initial: { opacity: 0, x: 60 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, margin: '-100px' },
    transition: transitions.smooth,
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true, margin: '-100px' },
    transition: transitions.bouncy,
  },
  rotateIn: {
    initial: { opacity: 0, rotate: -10, scale: 0.8 },
    whileInView: { opacity: 1, rotate: 0, scale: 1 },
    viewport: { once: true, margin: '-100px' },
    transition: transitions.bouncy,
  },
};

// Card and grid animations
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.bouncy,
  },
  hover: {
    y: -4,
    scale: 1.02,
    boxShadow: '0 10px 25px hsl(var(--accent) / 0.15)',
    transition: spring.gentle,
  },
  tap: {
    scale: 0.98,
    transition: spring.stiff,
  },
};

// Text animations
export const textVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.normal,
      ease: easing.easeOut,
    },
  },
  typewriter: {
    width: ['0%', '100%'],
    transition: {
      duration: 2,
      ease: easing.easeOut,
    },
  },
  glow: {
    textShadow: [
      '0 0 4px hsl(var(--accent))',
      '0 0 8px hsl(var(--accent))',
      '0 0 4px hsl(var(--accent))',
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: easing.easeInOut,
    },
  },
};

// Progress and loading bars
export const progressVariants: Variants = {
  loading: {
    width: ['0%', '100%'],
    transition: {
      duration: 2,
      ease: easing.easeInOut,
    },
  },
  indeterminate: {
    x: ['-100%', '100%'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: easing.easeInOut,
    },
  },
};

// Notification variants
export const toastVariants: Variants = {
  initial: {
    opacity: 0,
    y: 50,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.bouncy,
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.9,
    transition: transitions.quick,
  },
};

// Utility function to create reduced motion variants
export const createReducedMotionVariant = (variants: Variants): Variants => {
  const reduced: Variants = {};

  Object.keys(variants).forEach(key => {
    reduced[key] = {
      ...variants[key],
      transition: { duration: duration.instant },
    };
  });

  return reduced;
};

// Presets for common animation patterns
export const animationPresets = {
  slideInFromBottom: {
    initial: { y: 100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 100, opacity: 0 },
    transition: transitions.smooth,
  },
  fadeInScale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: transitions.bouncy,
  },
  slideAndFade: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
    transition: transitions.default,
  },
} as const;
