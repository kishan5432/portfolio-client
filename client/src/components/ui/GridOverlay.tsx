import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface GridOverlayProps {
  gridSize?: number;
  color?: string;
  opacity?: number;
  className?: string;
}

export function GridOverlay({
  gridSize = 20,
  color = 'rgba(255, 255, 255, 0.1)',
  opacity = 0.3,
  className = ''
}: GridOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Keyboard shortcut to toggle grid (Ctrl/Cmd + G)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
        event.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`fixed inset-0 pointer-events-none z-[9998] ${className}`}
            style={{
              opacity,
              backgroundImage: `
                linear-gradient(${color} 1px, transparent 1px),
                linear-gradient(90deg, ${color} 1px, transparent 1px)
              `,
              backgroundSize: `${gridSize}px ${gridSize}px`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: shouldReduceMotion ? opacity : opacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-8 left-8 z-50 p-3 bg-card border border-border rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        whileHover={!shouldReduceMotion ? { scale: 1.05 } : undefined}
        whileTap={!shouldReduceMotion ? { scale: 0.95 } : undefined}
        title="Toggle Grid Overlay (Ctrl/Cmd + G)"
      >
        <GridIcon className={`w-5 h-5 transition-colors ${isVisible ? 'text-accent' : 'text-muted-foreground'}`} />
      </motion.button>
    </>
  );
}

// Grid icon component
function GridIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

// Hook for grid overlay state
export function useGridOverlay() {
  const [isVisible, setIsVisible] = useState(false);

  const toggle = () => setIsVisible(!isVisible);
  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);

  return {
    isVisible,
    toggle,
    show,
    hide,
  };
}

// Different grid patterns
export const gridPatterns = {
  square: (size: number, color: string) => ({
    backgroundImage: `
      linear-gradient(${color} 1px, transparent 1px),
      linear-gradient(90deg, ${color} 1px, transparent 1px)
    `,
    backgroundSize: `${size}px ${size}px`,
  }),

  dots: (size: number, color: string) => ({
    backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
    backgroundSize: `${size}px ${size}px`,
  }),

  diagonal: (size: number, color: string) => ({
    backgroundImage: `
      linear-gradient(45deg, ${color} 1px, transparent 1px),
      linear-gradient(-45deg, ${color} 1px, transparent 1px)
    `,
    backgroundSize: `${size}px ${size}px`,
  }),

  baseline: (size: number, color: string) => ({
    backgroundImage: `linear-gradient(${color} 1px, transparent 1px)`,
    backgroundSize: `100% ${size}px`,
  }),
};

// Grid overlay with different patterns
interface PatternGridOverlayProps extends GridOverlayProps {
  pattern?: keyof typeof gridPatterns;
}

export function PatternGridOverlay({
  gridSize = 20,
  color = 'rgba(255, 255, 255, 0.1)',
  opacity = 0.3,
  pattern = 'square',
  className = ''
}: PatternGridOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentPattern, setCurrentPattern] = useState(pattern);
  const shouldReduceMotion = useReducedMotion();

  const patternStyles = gridPatterns[currentPattern](gridSize, color);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
        event.preventDefault();
        setIsVisible(prev => !prev);
      }

      // Cycle through patterns with Shift + G
      if (event.shiftKey && event.key === 'G') {
        event.preventDefault();
        const patterns = Object.keys(gridPatterns) as Array<keyof typeof gridPatterns>;
        const currentIndex = patterns.indexOf(currentPattern);
        const nextIndex = (currentIndex + 1) % patterns.length;
        setCurrentPattern(patterns[nextIndex]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentPattern]);

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`fixed inset-0 pointer-events-none z-[9998] ${className}`}
            style={{
              opacity,
              ...patternStyles,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: shouldReduceMotion ? opacity : opacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.3 }}
          />
        )}
      </AnimatePresence>

      <motion.div className="fixed bottom-8 left-8 z-50 flex flex-col gap-2">
        <motion.button
          onClick={() => setIsVisible(!isVisible)}
          className="p-3 bg-card border border-border rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          whileHover={!shouldReduceMotion ? { scale: 1.05 } : undefined}
          whileTap={!shouldReduceMotion ? { scale: 0.95 } : undefined}
          title="Toggle Grid Overlay (Ctrl/Cmd + G)"
        >
          <GridIcon className={`w-5 h-5 transition-colors ${isVisible ? 'text-accent' : 'text-muted-foreground'}`} />
        </motion.button>

        {isVisible && (
          <motion.button
            onClick={() => {
              const patterns = Object.keys(gridPatterns) as Array<keyof typeof gridPatterns>;
              const currentIndex = patterns.indexOf(currentPattern);
              const nextIndex = (currentIndex + 1) % patterns.length;
              setCurrentPattern(patterns[nextIndex]);
            }}
            className="p-2 bg-card border border-border rounded text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            title={`Current: ${currentPattern} (Shift + G to cycle)`}
          >
            {currentPattern}
          </motion.button>
        )}
      </motion.div>
    </>
  );
}
