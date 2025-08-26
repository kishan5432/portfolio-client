import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface CursorFollowerProps {
  className?: string;
  size?: number;
  springConfig?: {
    damping: number;
    stiffness: number;
    mass: number;
  };
}

export function CursorFollower({
  className = '',
  size = 20,
  springConfig = { damping: 25, stiffness: 700, mass: 0.5 }
}: CursorFollowerProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorType, setCursorType] = useState('default');
  const cursorRef = useRef<HTMLDivElement>(null);

  // Motion values for smooth cursor movement
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Spring animation for smooth following
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const updateCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - size / 2);
      cursorY.set(e.clientY - size / 2);

      if (!isVisible) {
        setIsVisible(true);
      }
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Check for interactive elements and cursor types
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isButton = target.matches('button, [role="button"]');
      const isLink = target.matches('a, [href]');
      const isInput = target.matches('input, textarea, select');
      const isClickable = target.matches('[onclick], [tabindex="0"]');

      if (isButton) {
        setCursorType('button');
        setIsHovering(true);
      } else if (isLink) {
        setCursorType('link');
        setIsHovering(true);
      } else if (isInput) {
        setCursorType('input');
        setIsHovering(true);
      } else if (isClickable) {
        setCursorType('clickable');
        setIsHovering(true);
      } else {
        setCursorType('default');
        setIsHovering(false);
      }
    };

    // Add event listeners
    document.addEventListener('mousemove', updateCursor);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY, size, isVisible, shouldReduceMotion]);

  // Hide on touch devices or if reduced motion is preferred
  if (shouldReduceMotion || 'ontouchstart' in window) {
    return null;
  }

  return (
    <motion.div
      ref={cursorRef}
      className={`fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference ${className}`}
      style={{
        x: springX,
        y: springY,
      }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isHovering ? (cursorType === 'button' ? 2 : 1.5) : 1,
      }}
      transition={{
        opacity: { duration: 0.2 },
        scale: { duration: 0.15 },
      }}
    >
      <div
        className={`rounded-full transition-colors duration-200 ${cursorType === 'button'
            ? 'bg-accent'
            : cursorType === 'link'
              ? 'bg-blue-500'
              : cursorType === 'input'
                ? 'bg-green-500'
                : 'bg-white'
          }`}
        style={{
          width: size,
          height: size,
        }}
      >
        {/* Inner dot for visual interest */}
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/20 rounded-full"
          style={{
            width: size * 0.3,
            height: size * 0.3,
          }}
        />
      </div>
    </motion.div>
  );
}

// Hook for cursor interactions
export function useCursor() {
  const [cursorVariant, setCursorVariant] = useState('default');
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    default: {
      scale: 1,
      backgroundColor: '#ffffff',
    },
    hover: {
      scale: 1.5,
      backgroundColor: '#ffffff',
    },
    click: {
      scale: 0.8,
      backgroundColor: '#ffffff',
    },
    hidden: {
      scale: 0,
      backgroundColor: '#ffffff',
    },
  };

  const mouseEnter = () => !shouldReduceMotion && setCursorVariant('hover');
  const mouseLeave = () => !shouldReduceMotion && setCursorVariant('default');
  const mouseDown = () => !shouldReduceMotion && setCursorVariant('click');
  const mouseUp = () => !shouldReduceMotion && setCursorVariant('hover');

  return {
    cursorVariant,
    variants,
    mouseEnter,
    mouseLeave,
    mouseDown,
    mouseUp,
  };
}

