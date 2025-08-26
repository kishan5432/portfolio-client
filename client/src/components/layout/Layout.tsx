import React from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CursorFollower } from '@/components/ui/CursorFollower';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { GridOverlay } from '@/components/ui/GridOverlay';
import { SkipToContent } from '@/components/a11y/SkipToContent';
import { BackgroundManager } from '@/components/ui/BackgroundManager';
import { useBackground } from '@/contexts/BackgroundContext';

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { backgroundType } = useBackground();

  return (
    <BackgroundManager type={backgroundType}>
      <div className="min-h-screen flex flex-col relative z-10">
        {/* Accessibility */}
        <SkipToContent />

        {/* Global UI Components */}
        <ScrollProgress />
        <CursorFollower />
        <GridOverlay />

        {/* Navigation */}
        <Navbar />

        {/* Main Content with Page Transitions */}
        <main id="main-content" className="flex-1 pt-16" role="main" tabIndex={-1}>
          <AnimatePresence mode="wait" initial={false}>
            {children || <Outlet />}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </BackgroundManager>
  );
}

// Layout wrapper for route components
export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {children}
    </div>
  );
}

