import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

function SkipLink({ href, children, className = '' }: SkipLinkProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.a
      href={href}
      className={`
        fixed top-4 left-4 z-[10000] px-4 py-2 
        bg-accent text-accent-foreground rounded-lg font-medium
        transform -translate-y-full opacity-0
        focus:translate-y-0 focus:opacity-100
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-accent-foreground focus:ring-offset-2
        ${className}
      `}
      initial={shouldReduceMotion ? undefined : { y: -100, opacity: 0 }}
      whileFocus={shouldReduceMotion ? undefined : { y: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.a>
  );
}

export function SkipToContent() {
  return (
    <>
      <SkipLink href="#main-content">
        Skip to main content
      </SkipLink>
      <SkipLink href="#navigation" className="left-32">
        Skip to navigation
      </SkipLink>
      <SkipLink href="#footer" className="left-60">
        Skip to footer
      </SkipLink>
    </>
  );
}

// Screen reader only text component
interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

export function VisuallyHidden({
  children,
  as: Component = 'span',
  className = ''
}: VisuallyHiddenProps) {
  return (
    <Component
      className={`
        absolute w-px h-px p-0 -m-px overflow-hidden 
        whitespace-nowrap border-0 clip-rect-0 ${className}
      `}
      style={{
        clip: 'rect(0, 0, 0, 0)',
        clipPath: 'inset(50%)',
      }}
    >
      {children}
    </Component>
  );
}

// Focus trap component for modals/dialogs
interface FocusTrapProps {
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

export function FocusTrap({ children, isActive = true, className = '' }: FocusTrapProps) {
  const trapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isActive) return;

    const trap = trapRef.current;
    if (!trap) return;

    const focusableElements = trap.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return (
    <div ref={trapRef} className={className}>
      {children}
    </div>
  );
}

// Announce changes to screen readers
interface LiveRegionProps {
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
}

export function LiveRegion({
  children,
  politeness = 'polite',
  atomic = false,
  relevant = 'additions text'
}: LiveRegionProps) {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className="sr-only"
    >
      {children}
    </div>
  );
}

// High contrast mode detection
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isHighContrast;
}

// Focus visible utility
export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setIsFocusVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isFocusVisible;
}
