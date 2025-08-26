import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  BriefcaseIcon,
  AcademicCapIcon,
  StarIcon,
  MapPinIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import { TimelineItem } from './types';

interface TimelineItemComponentProps {
  item: TimelineItem;
  index: number;
  isLast: boolean;
  year: string;
}

// Icon components
const icons = {
  briefcase: BriefcaseIcon,
  academic: AcademicCapIcon,
  'academic-cap': AcademicCapIcon,
  code: BriefcaseIcon, // Use briefcase icon for code as well
  star: StarIcon,
  other: StarIcon
};

// Format date range
function formatDateRange(startDate: string, endDate?: string) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short'
  };

  const startFormatted = start.toLocaleDateString('en-US', formatOptions);
  const endFormatted = end ? end.toLocaleDateString('en-US', formatOptions) : 'Present';

  return `${startFormatted} - ${endFormatted}`;
}

// Calculate duration
function calculateDuration(startDate: string, endDate?: string) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);

  if (years === 0) {
    return months === 1 ? '1 month' : `${months} months`;
  } else if (months === 0) {
    return years === 1 ? '1 year' : `${years} years`;
  } else {
    return `${years} ${years === 1 ? 'year' : 'years'}, ${months} ${months === 1 ? 'month' : 'months'}`;
  }
}

export function TimelineItemComponent({
  item,
  index,
  isLast,
  year
}: TimelineItemComponentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const shouldReduceMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(false);

  const IconComponent = icons[item.icon as keyof typeof icons] || icons.other;
  const isOngoing = !item.endDate;
  const isLeft = index % 2 === 0;

  // Enhanced animation variants
  const containerVariants = {
    hidden: {
      opacity: 0,
      x: isLeft ? -100 : 100,
      y: 20
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.8,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.15 + 0.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.15 + 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const lineVariants = {
    hidden: { scaleY: 0 },
    visible: {
      scaleY: 1,
      transition: {
        duration: 0.8,
        delay: index * 0.15 + 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={cn(
        'relative flex items-center w-full',
        isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
      )}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {/* Content */}
      <div className={cn(
        'w-full md:w-5/12 mb-8',
        isLeft ? 'md:pr-8 md:text-right' : 'md:pl-8 md:text-left'
      )}>
        <motion.div
          className="bg-card rounded-xl p-6 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
          variants={contentVariants}
          whileHover={shouldReduceMotion ? {} : {
            y: -4,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
        >
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <div className={cn('flex-1', isLeft ? 'md:text-right' : 'md:text-left')}>
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {item.title}
                </h3>
                {item.company && (
                  <p className="text-primary font-medium">
                    {item.company}
                  </p>
                )}
              </div>
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium ml-2',
                item.type === 'work' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  item.type === 'education' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    item.type === 'achievement' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              )}>
                {item.type}
              </span>
            </div>

            <div className={cn(
              'text-sm text-muted-foreground space-y-1',
              isLeft ? 'md:text-right' : 'md:text-left'
            )}>
              <p className="flex items-center justify-start md:justify-start">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {formatDateRange(item.startDate, item.endDate)}
                <span className="ml-2 text-xs">
                  ({calculateDuration(item.startDate, item.endDate)})
                </span>
              </p>
              {item.location && (
                <p className="flex items-center justify-start md:justify-start">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  {item.location}
                </p>
              )}
            </div>
          </div>

          <p className="text-muted-foreground mb-4">
            {item.description}
          </p>

          {/* Expandable bullets */}
          <div className="space-y-2">
            <div className={cn(
              'space-y-1 transition-all duration-300',
              isExpanded ? 'max-h-none' : 'max-h-20 overflow-hidden'
            )}>
              {item.bullets.map((bullet, bulletIndex) => (
                <motion.div
                  key={bulletIndex}
                  className="flex items-start"
                  initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.15 + bulletIndex * 0.05 + 0.3
                  }}
                >
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    {bullet}
                  </p>
                </motion.div>
              ))}
            </div>

            {item.bullets.length > 3 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronUpIcon className="h-4 w-4 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="h-4 w-4 mr-1" />
                    Show more
                  </>
                )}
              </button>
            )}
          </div>

          {/* Skills */}
          {item.skills && item.skills.length > 0 && (
            <motion.div
              className="mt-4"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.15 + 0.5 }}
            >
              <div className="flex flex-wrap gap-1">
                {item.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Timeline center - Icon and line */}
      <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-px flex flex-col items-center z-10">
        <motion.div
          className={cn(
            'w-12 h-12 rounded-full border-4 border-background flex items-center justify-center shadow-lg',
            isOngoing ? 'bg-primary animate-pulse' : 'bg-card',
            item.type === 'work' ? 'border-blue-500' :
              item.type === 'education' ? 'border-green-500' :
                item.type === 'achievement' ? 'border-yellow-500' :
                  'border-gray-500'
          )}
          variants={iconVariants}
          whileHover={shouldReduceMotion ? {} : { scale: 1.1, rotate: 5 }}
        >
          <IconComponent className={cn(
            'h-6 w-6',
            isOngoing ? 'text-primary-foreground' : 'text-muted-foreground'
          )} />
        </motion.div>

        {/* Connecting line */}
        {!isLast && (
          <motion.div
            className="w-px h-20 bg-gradient-to-b from-primary/50 to-primary/20 mt-2"
            variants={lineVariants}
            style={{ originY: 0 }}
          />
        )}
      </div>

      {/* Mobile spacing */}
      <div className="w-full md:w-5/12 md:block hidden" />
    </motion.div>
  );
}
