import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { TimelineItem } from './types';
import { TimelineYearHeader } from './TimelineYearHeader';
import { TimelineItemComponent } from './TimelineItemComponent';

interface TimelineContainerProps {
  items: TimelineItem[];
  className?: string;
}

export function TimelineContainer({ items, className = '' }: TimelineContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [yearHeaders, setYearHeaders] = useState<{ [key: string]: number }>({});
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  // Transform scroll progress to gradient fill
  const gradientFill = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  // Group items by year
  const groupedItems = items.reduce((groups, item) => {
    const year = new Date(item.startDate).getFullYear().toString();
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(item);
    return groups;
  }, {} as { [year: string]: TimelineItem[] });

  // Sort years in descending order
  const sortedYears = Object.keys(groupedItems).sort((a, b) => parseInt(b) - parseInt(a));

  // Track year header positions for sticky behavior
  useEffect(() => {
    const updateYearHeaderPositions = () => {
      const headers = containerRef.current?.querySelectorAll('[data-year-header]');
      const positions: { [key: string]: number } = {};

      headers?.forEach((header) => {
        const year = header.getAttribute('data-year-header');
        if (year) {
          positions[year] = header.getBoundingClientRect().top + window.scrollY;
        }
      });

      setYearHeaders(positions);
    };

    updateYearHeaderPositions();
    window.addEventListener('resize', updateYearHeaderPositions);
    window.addEventListener('scroll', updateYearHeaderPositions);

    return () => {
      window.removeEventListener('resize', updateYearHeaderPositions);
      window.removeEventListener('scroll', updateYearHeaderPositions);
    };
  }, [items]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Gradient timeline line */}
      <div className="hidden md:block absolute left-1/2 transform -translate-x-px h-full w-1 bg-gradient-to-b from-primary/20 via-primary to-primary/20">
        {/* Filling gradient overlay */}
        <motion.div
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-primary via-primary to-primary/80"
          style={{ height: gradientFill }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Mobile timeline line */}
      <div className="md:hidden absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary to-primary/20">
        <motion.div
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-primary via-primary to-primary/80"
          style={{ height: gradientFill }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Timeline items grouped by year */}
      <div className="space-y-0">
        {sortedYears.map((year) => {
          const yearItems = groupedItems[year];
          return (
            <div key={year} className="relative">
              {/* Year header */}
              <TimelineYearHeader
                year={year}
                itemCount={yearItems.length}
                stickyOffset={yearHeaders[year] || 0}
              />

              {/* Items for this year */}
              <div className="space-y-0">
                {yearItems.map((item, index) => (
                  <TimelineItemComponent
                    key={item._id}
                    item={item}
                    index={index}
                    isLast={index === yearItems.length - 1}
                    year={year}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
