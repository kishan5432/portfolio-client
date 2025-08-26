import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface RippleProps {
  x: number;
  y: number;
  size: number;
  color?: string;
  duration?: number;
}

interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
  rippleColor?: string;
  duration?: number;
  disabled?: boolean;
  maxRipples?: number;
}

// Individual ripple component
function Ripple({ x, y, size, color = 'rgba(255, 255, 255, 0.6)', duration = 600 }: RippleProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <motion.span
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        backgroundColor: color,
      }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 4, opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: duration / 1000,
        ease: 'easeOut'
      }}
    />
  );
}

// Main ripple effect component
export function RippleEffect({
  children,
  className = '',
  rippleColor = 'rgba(255, 255, 255, 0.6)',
  duration = 600,
  disabled = false,
  maxRipples = 3
}: RippleEffectProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  const nextRippleId = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const createRipple = (event: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || disabled) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Calculate size based on distance to furthest corner
    const size = Math.sqrt(
      Math.pow(Math.max(x, rect.width - x), 2) +
      Math.pow(Math.max(y, rect.height - y), 2)
    ) * 2;

    const newRipple = {
      id: nextRippleId.current++,
      x,
      y,
      size
    };

    setRipples(prevRipples => {
      const updatedRipples = [...prevRipples, newRipple];
      // Limit the number of ripples
      return updatedRipples.slice(-maxRipples);
    });

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prevRipples =>
        prevRipples.filter(ripple => ripple.id !== newRipple.id)
      );
    }, duration);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseDown={createRipple}
    >
      {children}

      <AnimatePresence>
        {ripples.map(ripple => (
          <Ripple
            key={ripple.id}
            x={ripple.x}
            y={ripple.y}
            size={ripple.size}
            color={rippleColor}
            duration={duration}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Button with built-in ripple effect
interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  rippleColor?: string;
  children: React.ReactNode;
}

export function RippleButton({
  variant = 'primary',
  size = 'md',
  rippleColor,
  className = '',
  children,
  disabled,
  ...props
}: RippleButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-ring disabled:pointer-events-none disabled:opacity-50';

  const variants = {
    primary: 'bg-accent text-accent-foreground hover:bg-accent/90',
    secondary: 'bg-muted text-text hover:bg-accent hover:text-accent-foreground',
    ghost: 'text-text hover:bg-muted',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  // Auto-determine ripple color based on variant
  const defaultRippleColor = rippleColor || (
    variant === 'primary' ? 'rgba(255, 255, 255, 0.3)' :
      variant === 'destructive' ? 'rgba(255, 255, 255, 0.3)' :
        'rgba(0, 0, 0, 0.1)'
  );

  return (
    <RippleEffect
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      rippleColor={defaultRippleColor}
      disabled={disabled}
    >
      <button
        className="w-full h-full flex items-center justify-center"
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    </RippleEffect>
  );
}

// Hook for programmatic ripple effects
export function useRipple() {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  const nextRippleId = useRef(0);
  const shouldReduceMotion = useReducedMotion();

  const createRipple = (x: number, y: number, containerSize: { width: number; height: number }) => {
    if (shouldReduceMotion) return;

    const size = Math.sqrt(
      Math.pow(Math.max(x, containerSize.width - x), 2) +
      Math.pow(Math.max(y, containerSize.height - y), 2)
    ) * 2;

    const newRipple = {
      id: nextRippleId.current++,
      x,
      y,
      size
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const clearRipples = () => setRipples([]);

  return {
    ripples,
    createRipple,
    clearRipples
  };
}

// Higher-order component for adding ripple to any element
export function withRipple<T extends React.ComponentType<any>>(
  Component: T,
  rippleConfig?: Partial<RippleEffectProps>
) {
  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => (
    <RippleEffect {...rippleConfig}>
      <Component {...props} ref={ref} />
    </RippleEffect>
  ));
}
