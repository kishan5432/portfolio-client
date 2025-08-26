import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { Container } from '@/components/shared/Container';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { TimelineContainer } from '@/components/timeline';
import type { TimelineItem } from '@/components/timeline';
import { cn } from '@/lib/utils';
import { useTimelineItems } from '@/hooks/useDataFetching';

// Update the interface to match the database schema and expected TimelineItem interface
interface TimelineItemData {
  _id: string;
  title: string;
  startDate: string;
  endDate?: string;
  description: string;
  bullets: string[];
  icon?: 'briefcase' | 'academic' | 'star' | 'other';
  location?: string;
  type?: 'work' | 'education' | 'achievement' | 'other';
  company?: string;
  skills?: string[];
  createdAt: string;
  updatedAt: string;
}

// Helper function to convert TimelineItemData to TimelineItem
const convertToTimelineItem = (item: TimelineItemData): TimelineItem => {
  const timelineItem: TimelineItem = {
    id: item._id,
    title: item.title,
    startDate: item.startDate,
    endDate: item.endDate,
    description: item.description,
    bullets: item.bullets,
    icon: item.icon || 'other',
    type: item.type || 'other'
  };

  if (item.location) timelineItem.location = item.location;
  if (item.company) timelineItem.company = item.company;
  if (item.skills) timelineItem.skills = item.skills;

  return timelineItem;
};

export function TimelinePage() {
  const { data: timelineResponse, loading, error } = useTimelineItems();
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Extract timeline items from API response and ensure proper typing
  const timelineItems: TimelineItemData[] = Array.isArray(timelineResponse?.data) ? timelineResponse.data : [];

  // Sort items by date (newest first)
  const sortedItems = [...timelineItems].sort((a, b) =>
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  // Filter items
  const filteredItems = sortedItems.filter(item => {
    const year = new Date(item.startDate).getFullYear().toString();
    const matchesYear = !selectedYear || year === selectedYear;
    // Note: The database schema doesn't have a 'type' field, so we'll remove this filter for now
    // const matchesType = !selectedType || item.type === selectedType;
    return matchesYear; // && matchesType;
  });

  // Get unique years for filters
  const years = Array.from(new Set(timelineItems.map(item =>
    new Date(item.startDate).getFullYear().toString()
  ))).sort((a, b) => parseInt(b) - parseInt(a));

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <Container>
          <Breadcrumbs />
          <SectionHeader
            title="My Journey"
            subtitle="Timeline"
            description="A chronological overview of my professional journey, education, and key achievements."
          />
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Loading timeline...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8">
        <Container>
          <Breadcrumbs />
          <SectionHeader
            title="My Journey"
            subtitle="Timeline"
            description="A chronological overview of my professional journey, education, and key achievements."
          />
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Error loading timeline: {error}</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <Container>
        <Breadcrumbs />

        <SectionHeader
          title="My Journey"
          subtitle="Timeline"
          description="A chronological overview of my professional journey, education, and key achievements."
        />

        {/* Filters */}
        <div className="mb-12 space-y-4">
          <div className="flex flex-wrap gap-4">
            {/* Year Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedYear('')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedYear === ''
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                All Years
              </button>
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    selectedYear === year
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Enhanced Timeline */}
        {filteredItems.length > 0 ? (
          <TimelineContainer items={filteredItems.map(convertToTimelineItem)} />
        ) : (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <CalendarIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No timeline items found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters to see more results.
            </p>
          </motion.div>
        )}
      </Container>
    </div>
  );
}
