import { useRef, useEffect, useState } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface MagneticOptions {
  strength?: number;
  radius?: number;
  damping?: number;
  stiffness?: number;
  mass?: number;
}

interface MagneticReturn {
  ref: React.RefObject<HTMLElement>;
  x: any;
  y: any;
  isHovering: boolean;
}

/**
 * Hook that creates magnetic attraction effect for elements
 * @param options Configuration options for magnetic behavior
 * @returns Object with ref, motion values, and hover state
 */
export function useMagnetic(options: MagneticOptions = {}): MagneticReturn {
  const {
    strength = 0.3,
    radius = 100,
    damping = 25,
    stiffness = 400,
    mass = 0.1
  } = options;

  const ref = useRef<HTMLElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Motion values for magnetic movement
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring animations for smooth magnetic effect
  const springX = useSpring(x, { damping, stiffness, mass });
  const springY = useSpring(y, { damping, stiffness, mass });

  useEffect(() => {
    if (shouldReduceMotion) return;

    const element = ref.current;
    if (!element) return;

    let animationFrameId: number;
    let mouseX = 0;
    let mouseY = 0;

    const updateMagneticEffect = () => {
      if (!isHovering || !element) return;

      const rect = element.getBoundingClientRect();
      const elementCenterX = rect.left + rect.width / 2;
      const elementCenterY = rect.top + rect.height / 2;

      // Calculate distance from cursor to element center
      const deltaX = mouseX - elementCenterX;
      const deltaY = mouseY - elementCenterY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < radius) {
        // Calculate magnetic force based on distance
        const force = (1 - distance / radius) * strength;
        const magneticX = deltaX * force;
        const magneticY = deltaY * force;

        x.set(magneticX);
        y.set(magneticY);
      } else {
        // Reset position when outside radius
        x.set(0);
        y.set(0);
      }

      animationFrameId = requestAnimationFrame(updateMagneticEffect);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (isHovering) {
        updateMagneticEffect();
      }
    };

    const handleMouseEnter = () => {
      setIsHovering(true);
      updateMagneticEffect();
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      // Spring back to original position
      x.set(0);
      y.set(0);
    };

    // Add event listeners
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovering, radius, strength, x, y, shouldReduceMotion]);

  return {
    ref,
    x: shouldReduceMotion ? 0 : springX,
    y: shouldReduceMotion ? 0 : springY,
    isHovering
  };
}

/**
 * Higher-order component that adds magnetic effect to any element
 * @param Component The component to wrap
 * @param options Magnetic configuration options
 * @returns Wrapped component with magnetic effect
 */
export function withMagnetic<P extends object>(
  Component: React.ComponentType<P>,
  options: MagneticOptions = {}
) {
  return function MagneticComponent(props: P) {
    const magnetic = useMagnetic(options);

    return (
      <Component
        {...props}
        ref={magnetic.ref}
        style={{
          ...(props as any).style,
          x: magnetic.x,
          y: magnetic.y,
          transform: 'translate3d(0, 0, 0)' // Force hardware acceleration
        }}
      />
    );
  };
}

/**
 * Utility function to create magnetic effect for DOM elements
 * @param element DOM element to apply magnetic effect to
 * @param options Magnetic configuration options
 * @returns Cleanup function
 */
export function createMagneticEffect(
  element: HTMLElement,
  options: MagneticOptions = {}
): () => void {
  const {
    strength = 0.3,
    radius = 100,
    damping = 25,
    stiffness = 400
  } = options;

  let animationFrameId: number;
  let isHovering = false;
  let mouseX = 0;
  let mouseY = 0;

  const updateMagneticEffect = () => {
    if (!isHovering) return;

    const rect = element.getBoundingClientRect();
    const elementCenterX = rect.left + rect.width / 2;
    const elementCenterY = rect.top + rect.height / 2;

    const deltaX = mouseX - elementCenterX;
    const deltaY = mouseY - elementCenterY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < radius) {
      const force = (1 - distance / radius) * strength;
      const magneticX = deltaX * force;
      const magneticY = deltaY * force;

      element.style.transform = `translate(${magneticX}px, ${magneticY}px)`;
    } else {
      element.style.transform = 'translate(0px, 0px)';
    }

    animationFrameId = requestAnimationFrame(updateMagneticEffect);
  };

  const handleMouseMove = (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (isHovering) {
      updateMagneticEffect();
    }
  };

  const handleMouseEnter = () => {
    isHovering = true;
    updateMagneticEffect();
  };

  const handleMouseLeave = () => {
    isHovering = false;
    element.style.transform = 'translate(0px, 0px)';
  };

  // Add event listeners
  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);
  document.addEventListener('mousemove', handleMouseMove);

  // Return cleanup function
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    element.removeEventListener('mouseenter', handleMouseEnter);
    element.removeEventListener('mouseleave', handleMouseLeave);
    document.removeEventListener('mousemove', handleMouseMove);

    // Reset transform
    element.style.transform = 'translate(0px, 0px)';
  };
}
