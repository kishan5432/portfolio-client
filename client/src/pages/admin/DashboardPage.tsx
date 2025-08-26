import { motion } from 'framer-motion';
import {
  FolderIcon,
  AcademicCapIcon,
  ClockIcon,
  CpuChipIcon,
  EnvelopeIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  useProjects,
  useCertificates,
  useTimelineItems,
  useSkills,
  useContactMessages
} from '@/lib/queries';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href?: string;
  loading?: boolean;
}

function StatCard({ title, value, icon: Icon, color, href, loading }: StatCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const content = (
    <motion.div
      className={cn(
        'bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200',
        href && 'cursor-pointer hover:border-primary/20'
      )}
      whileHover={shouldReduceMotion ? {} : { y: -2 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-muted rounded animate-pulse mt-2" />
          ) : (
            <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', color)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  return href ? <Link to={href}>{content}</Link> : content;
}

interface RecentItem {
  id: string;
  title: string;
  date: string;
  type: 'project' | 'certificate' | 'timeline' | 'message';
}

function RecentActivity({ items, loading }: { items: RecentItem[]; loading: boolean }) {
  const getTypeIcon = (type: RecentItem['type']) => {
    switch (type) {
      case 'project':
        return FolderIcon;
      case 'certificate':
        return AcademicCapIcon;
      case 'timeline':
        return ClockIcon;
      case 'message':
        return EnvelopeIcon;
      default:
        return FolderIcon;
    }
  };

  const getTypeColor = (type: RecentItem['type']) => {
    switch (type) {
      case 'project':
        return 'text-blue-600';
      case 'certificate':
        return 'text-green-600';
      case 'timeline':
        return 'text-purple-600';
      case 'message':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 bg-muted rounded-lg" />
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const Icon = getTypeIcon(item.type);
        const colorClass = getTypeColor(item.type);

        return (
          <motion.div
            key={item._id}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className={cn('p-2 bg-muted rounded-lg', colorClass)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{item.title}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(item.date).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function DashboardPage() {
  const shouldReduceMotion = useReducedMotion();

  // Fetch data for stats
  const { data: projectsData, isLoading: projectsLoading } = useProjects();
  const { data: certificatesData, isLoading: certificatesLoading } = useCertificates();
  const { data: timelineData, isLoading: timelineLoading } = useTimelineItems();
  const { data: skillsData, isLoading: skillsLoading } = useSkills();
  const { data: messagesData, isLoading: messagesLoading } = useContactMessages();

  // Calculate stats
  const stats = [
    {
      title: 'Total Projects',
      value: projectsData?.data?.length || 0,
      icon: FolderIcon,
      color: 'bg-blue-500',
      href: '/admin/projects',
      loading: projectsLoading,
    },
    {
      title: 'Certificates',
      value: certificatesData?.data?.length || 0,
      icon: AcademicCapIcon,
      color: 'bg-green-500',
      href: '/admin/certificates',
      loading: certificatesLoading,
    },
    {
      title: 'Timeline Items',
      value: timelineData?.data?.length || 0,
      icon: ClockIcon,
      color: 'bg-purple-500',
      href: '/admin/timeline',
      loading: timelineLoading,
    },
    {
      title: 'Skills',
      value: skillsData?.data?.length || 0,
      icon: CpuChipIcon,
      color: 'bg-indigo-500',
      href: '/admin/skills',
      loading: skillsLoading,
    },
    {
      title: 'Messages',
      value: messagesData?.data?.messages?.length || 0,
      icon: EnvelopeIcon,
      color: 'bg-orange-500',
      href: '/admin/messages',
      loading: messagesLoading,
    },
    {
      title: 'Unread Messages',
      value: messagesData?.data?.unreadCount || 0,
      icon: EyeIcon,
      color: 'bg-red-500',
      loading: messagesLoading,
    },
  ];

  // Generate recent activity
  const recentItems: RecentItem[] = [
    ...(projectsData?.data || []).slice(0, 2).map((item: any) => ({
      id: item._id,
      title: item.title,
      date: item.createdAt,
      type: 'project' as const,
    })),
    ...(certificatesData?.data || []).slice(0, 2).map((item: any) => ({
      id: item._id,
      title: item.title,
      date: item.createdAt,
      type: 'certificate' as const,
    })),
    ...(timelineData?.data || []).slice(0, 2).map((item: any) => ({
      id: item._id,
      title: item.title,
      date: item.createdAt,
      type: 'timeline' as const,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your portfolio content.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <motion.div
          className="bg-card border border-border rounded-xl p-6"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            <ArrowTrendingUpIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <RecentActivity
            items={recentItems}
            loading={projectsLoading || certificatesLoading || timelineLoading}
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="bg-card border border-border rounded-xl p-6"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
            <UsersIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link to="/admin/projects/new">
                <FolderIcon className="h-4 w-4 mr-2" />
                Create New Project
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/admin/certificates/new">
                <AcademicCapIcon className="h-4 w-4 mr-2" />
                Add Certificate
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/admin/timeline/new">
                <ClockIcon className="h-4 w-4 mr-2" />
                Add Timeline Item
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/admin/uploads">
                <EyeIcon className="h-4 w-4 mr-2" />
                Manage Uploads
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Messages Preview */}
      {messagesData?.data?.messages && messagesData.data.messages.length > 0 && (
        <motion.div
          className="bg-card border border-border rounded-xl p-6"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Messages</h2>
            <Link to="/admin/messages">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {messagesData.data.messages.slice(0, 3).map((message: any) => (
              <div
                key={message._id}
                className={cn(
                  'p-4 rounded-lg border transition-colors',
                  message.read ? 'bg-background border-border' : 'bg-primary/5 border-primary/20'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-foreground">{message.name}</h3>
                  <span className="text-sm text-muted-foreground">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {message.message}
                </p>
                {!message.read && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-xs text-primary font-medium">Unread</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
