import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ScrollProgressProps {
  className?: string;
  height?: number;
  color?: string;
}

export function ScrollProgress({
  className = '',
  height = 3,
  color = 'hsl(var(--accent))'
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  // Smooth spring animation for scroll progress
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Show progress bar after user starts scrolling
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setIsVisible(latest > 0.01);
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  if (shouldReduceMotion) {
    return (
      <div
        className={`fixed top-0 left-0 right-0 z-[9999] bg-accent origin-left ${className}`}
        style={{
          height: `${height}px`,
          transform: `scaleX(${scrollYProgress.get()})`,
        }}
      />
    );
  }

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 z-[9999] origin-left ${className}`}
      style={{
        height: `${height}px`,
        scaleX,
        background: `linear-gradient(90deg, 
          hsl(var(--accent-400)), 
          hsl(var(--accent-600)), 
          hsl(var(--accent-800))
        )`,
        boxShadow: `0 0 10px hsla(var(--accent), 0.5)`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    />
  );
}

// Hook for scroll progress value
export function useScrollProgress() {
  const { scrollYProgress } = useScroll();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setProgress(Math.round(latest * 100));
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  return progress;
}

// Circular scroll progress indicator
interface CircularScrollProgressProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
}

export function CircularScrollProgress({
  size = 60,
  strokeWidth = 4,
  className = '',
  showPercentage = false
}: CircularScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const progress = useScrollProgress();

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const progressSpring = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className={`fixed bottom-8 right-8 z-50 ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: progress > 5 ? 1 : 0,
        scale: progress > 5 ? 1 : 0.8
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={strokeWidth}
            opacity={0.3}
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{
              strokeDashoffset: shouldReduceMotion
                ? circumference - (scrollYProgress.get() * circumference)
                : progressSpring.to(value => circumference - (value * circumference))
            }}
          />
        </svg>

        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-accent">
              {progress}%
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
