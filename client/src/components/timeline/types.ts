export interface TimelineItem {
  id: string;
  title: string;
  startDate: string;
  endDate?: string | undefined;
  description: string;
  bullets: string[];
  icon: 'briefcase' | 'academic' | 'academic-cap' | 'code' | 'star' | 'other';
  location?: string;
  type: 'work' | 'education' | 'achievement' | 'other';
  company?: string;
  skills?: string[];
}
