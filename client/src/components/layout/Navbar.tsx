import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ThemeToggle, PaletteSelector } from '@/components/providers/ThemeProvider';
import { ReducedMotionToggle } from '@/components/providers/ReducedMotionProvider';
import { Magnetic, MagneticButton } from '@/components/ui/Magnetic';
import { useBackground } from '@/contexts/BackgroundContext';
import { BackgroundSelector } from '@/components/ui/BackgroundSelector';
import { navVariants, mobileMenuVariants } from '@/lib/motion/variants';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Projects', href: '/projects' },
  { name: 'Certificates', href: '/certificates' },
  { name: 'Timeline', href: '/timeline' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { backgroundType, setBackgroundType } = useBackground();

  // Scroll progress
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Handle scroll state
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-background/90 backdrop-blur-lg border-b border-border/50 shadow-lg shadow-black/5'
          : 'bg-background/5 backdrop-blur-sm'
          }`}
        variants={navVariants}
        initial="hidden"
        animate="visible"
      >
        <nav id="navigation" className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 relative">
            {/* Logo */}
            <Magnetic strength={0.15}>
              <Link
                to="/"
                className="text-fluid-lg font-bold text-accent hover:text-accent/80 transition-colors"
              >
                Portfolio
              </Link>
            </Magnetic>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center flex-1 mx-8">
              <div className="flex items-center space-x-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Magnetic key={item.name} strength={0.1}>
                      <Link
                        to={item.href}
                        className={`relative px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 select-none min-w-[80px] text-center ${isActive
                          ? 'text-accent bg-accent/10 shadow-sm'
                          : 'text-foreground/70 hover:text-accent hover:bg-muted/50'
                          }`}
                      >
                        {item.name}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 bg-accent/5 rounded-lg border border-accent/20"
                            layoutId="activeNavTab"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                      </Link>
                    </Magnetic>
                  );
                })}
              </div>
            </div>

            {/* Desktop Controls */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-muted/30 border border-border/50">
                <BackgroundSelector
                  currentType={backgroundType}
                  onTypeChange={setBackgroundType}
                />
                <div className="w-px h-4 bg-border/50" />
                <PaletteSelector />
                <div className="w-px h-4 bg-border/50" />
                <ThemeToggle />
                <ReducedMotionToggle />
              </div>

              {/* Admin Link */}
              <MagneticButton
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/admin'}
                className="select-none"
              >
                Admin
              </MagneticButton>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Magnetic strength={0.15}>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-2.5 rounded-lg text-foreground/70 hover:text-accent hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-border/50"
                  aria-label="Toggle menu"
                  aria-expanded={isOpen}
                >
                  <motion.div
                    animate={isOpen ? 'open' : 'closed'}
                    className="w-6 h-6 flex flex-col justify-center space-y-1"
                  >
                    <motion.span
                      className="block w-full h-0.5 bg-current rounded-full"
                      variants={{
                        closed: { rotate: 0, y: 0, width: '100%' },
                        open: { rotate: 45, y: 6, width: '100%' },
                      }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    />
                    <motion.span
                      className="block w-full h-0.5 bg-current rounded-full"
                      variants={{
                        closed: { opacity: 1, x: 0 },
                        open: { opacity: 0, x: -10 },
                      }}
                      transition={{ duration: 0.2 }}
                    />
                    <motion.span
                      className="block w-full h-0.5 bg-current rounded-full"
                      variants={{
                        closed: { rotate: 0, y: 0, width: '100%' },
                        open: { rotate: -45, y: -6, width: '100%' },
                      }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    />
                  </motion.div>
                </button>
              </Magnetic>
            </div>
          </div>
        </nav>

        {/* Scroll Progress Bar */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent origin-left"
          style={{ scaleX }}
        />
      </motion.header>

      {/* Mobile Menu with AnimatePresence */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Menu Overlay */}
            <motion.div
              className="fixed inset-0 z-40 bg-background/90 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Mobile Menu */}
            <motion.div
              className="fixed top-16 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-lg md:hidden"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="px-4 py-6 space-y-4">
                {/* Navigation Links */}
                {navigation.map((item, index) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.href}
                        className={`relative block px-4 py-3.5 text-base font-medium rounded-lg transition-all duration-200 select-none ${isActive
                          ? 'text-accent bg-accent/10 border border-accent/20 shadow-sm'
                          : 'text-foreground/80 hover:text-accent hover:bg-muted/70 border border-transparent hover:border-border/50'
                          }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 bg-accent/5 rounded-lg"
                            layoutId="activeMobileTab"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Mobile Controls */}
                <motion.div
                  className="pt-4 border-t border-border space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between px-4">
                    <span className="text-sm font-medium">Background</span>
                    <BackgroundSelector
                      currentType={backgroundType}
                      onTypeChange={setBackgroundType}
                    />
                  </div>

                  <div className="flex items-center justify-between px-4">
                    <span className="text-sm font-medium">Theme</span>
                    <div className="flex items-center gap-3">
                      <PaletteSelector />
                      <ThemeToggle />
                    </div>
                  </div>

                  <div className="px-4">
                    <ReducedMotionToggle />
                  </div>

                  <div className="px-4">
                    <Link
                      to="/admin"
                      className="block w-full px-4 py-3 text-center bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

