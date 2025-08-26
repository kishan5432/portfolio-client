import { motion, useInView } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import { useRef } from 'react';

interface TimelineYearHeaderProps {
  year: string;
  itemCount: number;
  stickyOffset: number;
}

export function TimelineYearHeader({ year, itemCount, stickyOffset }: TimelineYearHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      data-year-header={year}
      className="sticky top-20 z-20 mb-8 md:mb-12"
      initial={shouldReduceMotion ? false : { opacity: 0, y: -20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-center">
        {/* Year badge */}
        <motion.div
          className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-6 py-3 rounded-full shadow-lg border-2 border-background"
          whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-2xl font-bold tracking-wide">{year}</span>

          {/* Item count badge */}
          <div className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-xs font-medium px-2 py-1 rounded-full border border-background">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </div>
        </motion.div>

        {/* Decorative lines */}
        <div className="hidden md:flex items-center flex-1 max-w-32">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent flex-1" />
        </div>
        <div className="hidden md:flex items-center flex-1 max-w-32">
          <div className="h-px bg-gradient-to-l from-transparent via-primary/50 to-transparent flex-1" />
        </div>
      </div>

      {/* Mobile decorative line */}
      <div className="md:hidden mt-4">
        <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>
    </motion.div>
  );
}
