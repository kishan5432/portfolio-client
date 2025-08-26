import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SectionFadeProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'top' | 'bottom' | 'sides' | 'all';
  intensity?: 'subtle' | 'medium' | 'strong';
  maskHeight?: number; // percentage of mask height
}

export function SectionFade({
  children,
  className = '',
  direction = 'top',
  intensity = 'medium',
  maskHeight = 20
}: SectionFadeProps) {
  const shouldReduceMotion = useReducedMotion();

  const getMaskStyle = () => {
    if (shouldReduceMotion) return {};

    const maskStyles = {
      top: {
        maskImage: `linear-gradient(to bottom, transparent, black ${maskHeight}%)`,
        WebkitMaskImage: `linear-gradient(to bottom, transparent, black ${maskHeight}%)`,
      },
      bottom: {
        maskImage: `linear-gradient(to top, transparent, black ${maskHeight}%)`,
        WebkitMaskImage: `linear-gradient(to top, transparent, black ${maskHeight}%)`,
      },
      sides: {
        maskImage: `linear-gradient(to right, transparent, black ${maskHeight}%, black ${100 - maskHeight}%, transparent)`,
        WebkitMaskImage: `linear-gradient(to right, transparent, black ${maskHeight}%, black ${100 - maskHeight}%, transparent)`,
      },
      all: {
        maskImage: `
          linear-gradient(to bottom, transparent, black ${maskHeight}%, black ${100 - maskHeight}%, transparent),
          linear-gradient(to right, transparent, black ${maskHeight}%, black ${100 - maskHeight}%, transparent)
        `,
        WebkitMaskImage: `
          linear-gradient(to bottom, transparent, black ${maskHeight}%, black ${100 - maskHeight}%, transparent),
          linear-gradient(to right, transparent, black ${maskHeight}%, black ${100 - maskHeight}%, transparent)
        `,
        maskComposite: 'intersect',
        WebkitMaskComposite: 'source-in',
      },
    };

    return maskStyles[direction];
  };

  return (
    <div
      className={className}
      style={getMaskStyle()}
    >
      {children}
    </div>
  );
}

// Animated section with fade-in effect
interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  fadeDirection?: 'top' | 'bottom' | 'sides' | 'all';
  animationDirection?: 'up' | 'down' | 'left' | 'right' | 'scale';
  delay?: number;
  duration?: number;
  stagger?: boolean;
  staggerDelay?: number;
}

export function AnimatedSection({
  children,
  className = '',
  fadeDirection = 'top',
  animationDirection = 'up',
  delay = 0,
  duration = 0.6,
  stagger = false,
  staggerDelay = 0.1
}: AnimatedSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  const getAnimationVariants = () => {
    const variants = {
      up: {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
      },
      down: {
        initial: { opacity: 0, y: -50 },
        animate: { opacity: 1, y: 0 },
      },
      left: {
        initial: { opacity: 0, x: -50 },
        animate: { opacity: 1, x: 0 },
      },
      right: {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0 },
      },
      scale: {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
      },
    };

    return variants[animationDirection];
  };

  const { initial, animate } = getAnimationVariants();

  if (shouldReduceMotion) {
    return (
      <SectionFade direction={fadeDirection} className={className}>
        {children}
      </SectionFade>
    );
  }

  if (stagger) {
    return (
      <SectionFade direction={fadeDirection} className={className}>
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={{
            animate: {
              transition: {
                staggerChildren: staggerDelay,
                delayChildren: delay,
              },
            },
          }}
        >
          {React.Children.map(children, (child, index) => (
            <motion.div
              key={index}
              variants={{
                initial,
                animate: {
                  ...animate,
                  transition: { duration },
                },
              }}
            >
              {child}
            </motion.div>
          ))}
        </motion.div>
      </SectionFade>
    );
  }

  return (
    <SectionFade direction={fadeDirection} className={className}>
      <motion.div
        initial={initial}
        whileInView={animate}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration, delay }}
      >
        {children}
      </motion.div>
    </SectionFade>
  );
}

// Pre-configured section components
export function FadeInSection({ children, className = '', delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <AnimatedSection
      className={className}
      fadeDirection="top"
      animationDirection="up"
      delay={delay}
    >
      {children}
    </AnimatedSection>
  );
}

export function StaggeredSection({ children, className = '', delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <AnimatedSection
      className={className}
      fadeDirection="top"
      animationDirection="up"
      delay={delay}
      stagger={true}
      staggerDelay={0.1}
    >
      {children}
    </AnimatedSection>
  );
}

// Parallax scroll mask effect
interface ParallaxMaskProps {
  children: React.ReactNode;
  className?: string;
  speed?: number; // Parallax speed multiplier
}

export function ParallaxMask({
  children,
  className = '',
  speed = 0.5
}: ParallaxMaskProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <SectionFade direction="all" className={className}>
        {children}
      </SectionFade>
    );
  }

  return (
    <motion.div
      className={className}
      style={{
        maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
      }}
      initial={{ y: 100 }}
      whileInView={{ y: 0 }}
      viewport={{ once: false }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
