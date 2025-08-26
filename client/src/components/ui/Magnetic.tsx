import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  springConfig?: {
    damping: number;
    stiffness: number;
    mass: number;
  };
  disabled?: boolean;
}

export function Magnetic({
  children,
  className = '',
  strength = 0.3,
  springConfig = { damping: 15, stiffness: 150, mass: 0.1 },
  disabled = false
}: MagneticProps) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || disabled) return;

    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    x.set(deltaX * strength);
    y.set(deltaY * strength);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <motion.div
      ref={ref}
      className={`magnetic-container ${className}`}
      style={{
        x: springX,
        y: springY,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      whileHover={!shouldReduceMotion && !disabled ? { scale: 1.02 } : undefined}
      whileTap={!shouldReduceMotion && !disabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// Specialized magnetic button component
interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  magneticStrength?: number;
}

export function MagneticButton({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  magneticStrength = 0.2,
  disabled,
  ...props
}: MagneticButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-ring';

  const variants = {
    primary: 'bg-accent text-accent-foreground hover:bg-accent/90',
    secondary: 'bg-muted text-text hover:bg-accent hover:text-accent-foreground',
    ghost: 'text-text hover:bg-muted',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <Magnetic
      strength={magneticStrength}
      disabled={disabled}
      className="inline-block"
    >
      <button
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    </Magnetic>
  );
}

// Hook for applying magnetic effect to custom elements
export function useMagnetic(strength = 0.3, springConfig = { damping: 15, stiffness: 150, mass: 0.1 }) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: MouseEvent) => {
    if (shouldReduceMotion) return;

    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    x.set(deltaX * strength);
    y.set(deltaY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const bind = {
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };

  return {
    ref,
    x: springX,
    y: springY,
    bind,
  };
}

// CSS class utility for magnetic hover effects
export const magneticStyles = `
  .magnetic-hover {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .magnetic-hover:hover {
    transform: scale(1.02) translateY(-2px);
  }
  
  .magnetic-hover:active {
    transform: scale(0.98) translateY(0px);
  }
  
  @media (prefers-reduced-motion: reduce) {
    .magnetic-hover,
    .magnetic-hover:hover,
    .magnetic-hover:active {
      transform: none !important;
      transition: none !important;
    }
  }
`;

