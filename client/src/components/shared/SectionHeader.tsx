import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import { AnimatedText } from './AnimatedText';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function SectionHeader({
  title,
  subtitle,
  description,
  children,
  className,
  align = 'center'
}: SectionHeaderProps) {
  const shouldReduceMotion = useReducedMotion();

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <motion.div
      className={cn('mb-12 lg:mb-16', alignClasses[align], className)}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {subtitle && (
        <motion.p
          className="text-sm font-semibold tracking-wider text-primary uppercase mb-2"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {subtitle}
        </motion.p>
      )}

      <AnimatedText
        text={title}
        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4"
        delay={0.2}
      />

      {description && (
        <motion.p
          className="text-lg text-muted-foreground max-w-3xl mx-auto"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {description}
        </motion.p>
      )}

      {children && (
        <motion.div
          className="mt-6"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}
