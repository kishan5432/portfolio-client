import { ReactNode, useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  FolderIcon,
  AcademicCapIcon,
  ClockIcon,
  CpuChipIcon,
  PhotoIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  UserIcon,
  ChevronDownIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useContactMessages } from '@/lib/queries';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { ThemeToggle, PaletteSelector } from '@/components/providers/ThemeProvider';
import { ReducedMotionToggle } from '@/components/providers/ReducedMotionProvider';

interface AdminLayoutProps {
  children?: ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }> | React.ComponentType<any>;
  count?: number;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: contactMessagesData } = useContactMessages();

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'About', href: '/admin/about', icon: UserIcon },
    { name: 'Projects', href: '/admin/projects', icon: FolderIcon },
    { name: 'Certificates', href: '/admin/certificates', icon: AcademicCapIcon },
    { name: 'Timeline', href: '/admin/timeline', icon: ClockIcon },
    { name: 'Skills', href: '/admin/skills', icon: CpuChipIcon },
    { name: 'Upload Manager', href: '/admin/uploads', icon: PhotoIcon },
    {
      name: 'Contact Messages',
      href: '/admin/messages',
      icon: EnvelopeIcon,
      count: (contactMessagesData?.data as any)?.unreadCount || 0
    },
  ];

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border lg:hidden"
            initial={shouldReduceMotion ? false : { x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <SidebarContent onLinkClick={() => setSidebarOpen(false)} navigation={navigation} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:bg-card lg:border-r lg:border-border">
        <SidebarContent navigation={navigation} />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-5 w-5" />
              <span className="sr-only">Open sidebar</span>
            </Button>

            {/* Page title */}
            <h1 className="text-lg font-semibold text-foreground lg:ml-0 ml-4">
              {navigation.find(item => item.href === location.pathname)?.name || 'Admin'}
            </h1>

            {/* Theme controls */}
            <div className="hidden sm:flex items-center gap-3">
              <PaletteSelector />
              <ThemeToggle />
              <ReducedMotionToggle />
            </div>

            {/* User menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2"
              >
                <UserCircleIcon className="h-5 w-5" />
                <span className="hidden sm:block">{user?.email}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </Button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg"
                    initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-2">
                      <div className="px-3 py-2 text-sm">
                        <p className="font-medium text-foreground">{user?.email}</p>
                        <p className="text-muted-foreground capitalize">{user?.role}</p>
                      </div>
                      <hr className="my-2 border-border" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-start text-destructive hover:text-destructive"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

// Sidebar content component
function SidebarContent({ onLinkClick, navigation }: { onLinkClick?: () => void; navigation: NavItem[] }) {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Link to="/admin" className="flex items-center gap-3" onClick={onLinkClick}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">A</span>
          </div>
          <span className="text-lg font-bold text-foreground">Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item, index) => {
          const isActive = location.pathname === item.href ||
            (item.href !== '/admin' && location.pathname.startsWith(item.href));

          return (
            <motion.div
              key={item.name}
              initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                to={item.href}
                onClick={onLinkClick}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : item.name === 'Contact Messages' && item.count && item.count > 0
                      ? 'text-foreground bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <item.icon className={cn(
                  'h-5 w-5',
                  item.name === 'Contact Messages' && item.count && item.count > 0 && !isActive
                    ? 'text-amber-600 dark:text-amber-400'
                    : ''
                )} />
                {item.name}
                {item.count !== undefined && (
                  <span className={cn(
                    'ml-auto px-2 py-0.5 text-xs rounded-full',
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : item.name === 'Contact Messages' && item.count > 0
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-muted text-muted-foreground'
                  )}>
                    {item.count}
                  </span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {/* Theme controls for mobile */}
        <div className="mb-4 sm:hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Theme</span>
          </div>
          <div className="flex items-center gap-3">
            <PaletteSelector />
            <ThemeToggle />
          </div>
        </div>

        {/* Reduced motion toggle for mobile */}
        <div className="mb-4 sm:hidden">
          <ReducedMotionToggle />
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Portfolio Admin v1.0
        </div>
      </div>
    </div>
  );
}
