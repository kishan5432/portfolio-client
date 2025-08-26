import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface CursorProps {
  className?: string;
}

export function Cursor({ className }: CursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorType, setCursorType] = useState<'default' | 'magnet' | 'view'>('default');

  const shouldReduceMotion = useReducedMotion();

  // Motion values for smooth cursor movement
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // Spring animations for smooth following
  const springConfig = { damping: 25, stiffness: 700 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  // Transform values for hover effects
  const scale = useTransform(springX, [0, 1], [1, isHovering ? 1.5 : 1]);
  const opacity = useTransform(springX, [0, 1], [0.8, 1]);

  // Cursor states based on type
  const cursorStates = {
    default: {
      size: 'w-4 h-4',
      bg: 'bg-primary/80',
      border: 'border-2 border-primary/20',
      scale: 1
    },
    magnet: {
      size: 'w-6 h-6',
      bg: 'bg-primary/60',
      border: 'border-2 border-primary/40',
      scale: 1.2
    },
    view: {
      size: 'w-8 h-8',
      bg: 'bg-secondary/40',
      border: 'border-2 border-secondary/60',
      scale: 1.5
    }
  };

  const currentState = cursorStates[cursorType];

  useEffect(() => {
    if (shouldReduceMotion) {
      setIsVisible(false);
      return;
    }

    let animationFrameId: number;
    let mouseX = 0;
    let mouseY = 0;

    const updateCursor = () => {
      cursorX.set(mouseX);
      cursorY.set(mouseY);
      animationFrameId = requestAnimationFrame(updateCursor);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        setIsVisible(true);
        updateCursor();
      }
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cursorAttr = target.getAttribute('data-cursor');

      if (cursorAttr === 'magnet' || cursorAttr === 'view') {
        setCursorType(cursorAttr as 'magnet' | 'view');
        setIsHovering(true);
      } else {
        setCursorType('default');
        setIsHovering(false);
      }
    };

    const handleElementLeave = () => {
      setCursorType('default');
      setIsHovering(false);
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleElementHover);
    document.addEventListener('mouseout', handleElementLeave);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleElementHover);
      document.removeEventListener('mouseout', handleElementLeave);
    };
  }, [cursorX, cursorY, isVisible, shouldReduceMotion]);

  if (shouldReduceMotion || !isVisible) {
    return null;
  }

  return (
    <motion.div
      ref={cursorRef}
      className={cn(
        'fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference',
        currentState.size,
        className
      )}
      style={{
        x: springX,
        y: springY,
        scale: scale,
        opacity: opacity
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: currentState.scale,
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      exit={{ opacity: 0, scale: 0 }}
    >
      {/* Main cursor circle */}
      <div className={cn(
        'w-full h-full rounded-full transition-all duration-300 ease-out',
        currentState.bg,
        currentState.border
      )} />

      {/* Trailing effect for magnet and view states */}
      {(cursorType === 'magnet' || cursorType === 'view') && (
        <motion.div
          className={cn(
            'absolute inset-0 rounded-full transition-all duration-500 ease-out',
            cursorType === 'magnet'
              ? 'bg-primary/20 border border-primary/30'
              : 'bg-secondary/20 border border-secondary/30'
          )}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1.5,
            opacity: [0, 0.6, 0],
            transition: {
              duration: 1.5,
              ease: 'easeOut',
              repeat: Infinity,
              repeatDelay: 0.5
            }
          }}
        />
      )}

      {/* Additional trailing effect for view state */}
      {cursorType === 'view' && (
        <motion.div
          className="absolute inset-0 rounded-full bg-secondary/10 border border-secondary/20"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 2,
            opacity: [0, 0.4, 0],
            transition: {
              duration: 2,
              ease: 'easeOut',
              repeat: Infinity,
              repeatDelay: 1
            }
          }}
        />
      )}
    </motion.div>
  );
}
