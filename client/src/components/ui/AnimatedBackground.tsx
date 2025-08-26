import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedBackgroundProps {
  variant?: 'auto' | 'geometric' | 'particles' | 'waves' | 'grid' | 'dots';
  className?: string;
}

// Auto-cycling background component
function AutoBackground({ className }: { className: string }) {
  const [currentVariant, setCurrentVariant] = useState<'grid' | 'dots' | 'particles' | 'waves'>('grid');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const variants: ('grid' | 'dots' | 'particles' | 'waves')[] = ['grid', 'dots', 'particles', 'waves'];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentVariant(prev => {
          const currentIndex = variants.indexOf(prev);
          const nextIndex = (currentIndex + 1) % variants.length;
          return variants[nextIndex];
        });

        setTimeout(() => {
          setIsTransitioning(false);
        }, 600); // Half of transition duration
      }, 600); // Half of transition duration
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const renderCurrentBackground = () => {
    switch (currentVariant) {
      case 'grid':
        return <GridBackground className={className} />;
      case 'dots':
        return <DotsBackground className={className} />;
      case 'particles':
        return <ParticlesBackground className={className} />;
      case 'waves':
        return <WavesBackground className={className} />;
      default:
        return <GridBackground className={className} />;
    }
  };

  return (
    <motion.div
      key={currentVariant}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 1.2,
        ease: "easeInOut"
      }}
      className="fixed inset-0 -z-10"
    >
      {renderCurrentBackground()}
    </motion.div>
  );
}

export function AnimatedBackground({ variant = 'geometric', className = '' }: AnimatedBackgroundProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <StaticBackground variant={variant} className={className} />;
  }

  switch (variant) {
    case 'auto':
      return <AutoBackground className={className} />;
    case 'geometric':
      return <GeometricBackground className={className} />;
    case 'particles':
      return <ParticlesBackground className={className} />;
    case 'waves':
      return <WavesBackground className={className} />;
    case 'grid':
      return <GridBackground className={className} />;
    case 'dots':
      return <DotsBackground className={className} />;
    default:
      return <GeometricBackground className={className} />;
  }
}

// Static fallback for reduced motion
function StaticBackground({ variant, className }: { variant: string; className: string }) {
  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5" />
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
    </div>
  );
}

// Optimized geometric shapes background
function GeometricBackground({ className }: { className: string }) {
  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Base gradient with theme colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/98 to-primary/8" />

      {/* Animated geometric shapes with theme colors */}
      <motion.div
        className="absolute top-[20%] left-[20%] w-40 h-40 rounded-full blur-3xl"
        style={{ backgroundColor: 'hsl(var(--primary) / 0.08)' }}
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 40, 0],
          scale: [1, 1.3, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute top-[40%] right-[25%] w-32 h-32 rounded-xl blur-2xl rotate-45"
        style={{ backgroundColor: 'hsl(var(--accent) / 0.06)' }}
        animate={{
          rotate: [45, 135, 225, 45],
          x: [0, -60, 30, 0],
          y: [0, 80, -20, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute bottom-[30%] left-[35%] w-48 h-48 rounded-full blur-3xl"
        style={{ backgroundColor: 'hsl(var(--secondary) / 0.05)' }}
        animate={{
          x: [0, -100, 50, 0],
          y: [0, 60, -30, 0],
          scale: [1, 0.8, 1.2, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute top-[60%] right-[30%] w-24 h-24 rounded-lg blur-xl"
        style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}
        animate={{
          rotate: [0, 180, 360],
          x: [0, 40, -20, 0],
          y: [0, -50, 25, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Subtle radial overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,background_100%)] opacity-40" />
    </div>
  );
}

// Enhanced floating particles background
function ParticlesBackground({ className }: { className: string }) {
  const particles = Array.from({ length: 80 }, (_, i) => i);

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/10" />

      {/* Main particles with enhanced visibility */}
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 8 + 3,
            height: Math.random() * 8 + 3,
            backgroundColor: `hsl(var(--primary) / ${Math.random() * 0.6 + 0.3})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: `0 0 ${Math.random() * 20 + 10}px hsl(var(--primary) / 0.4)`,
            filter: 'blur(0.5px)',
          }}
          animate={{
            y: [0, -200, 0],
            x: [0, Math.random() * 150 - 75, 0],
            opacity: [0.3, 1, 0.3],
            scale: [0.5, 2, 0.5],
          }}
          transition={{
            duration: Math.random() * 12 + 8,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Larger glowing accent particles */}
      {Array.from({ length: 15 }, (_, i) => (
        <motion.div
          key={`accent-${i}`}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 16 + 8,
            height: Math.random() * 16 + 8,
            backgroundColor: `hsl(var(--accent) / ${Math.random() * 0.4 + 0.2})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: `0 0 ${Math.random() * 40 + 20}px hsl(var(--accent) / 0.6)`,
            filter: 'blur(1px)',
          }}
          animate={{
            y: [0, -300, 0],
            x: [0, Math.random() * 200 - 100, 0],
            scale: [0.3, 2.5, 0.3],
            opacity: [0.2, 0.8, 0.2],
            rotate: [0, 360],
          }}
          transition={{
            duration: Math.random() * 25 + 15,
            repeat: Infinity,
            delay: Math.random() * 8,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Secondary smaller sparkles */}
      {Array.from({ length: 40 }, (_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            backgroundColor: `hsl(var(--secondary) / ${Math.random() * 0.8 + 0.4})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: `0 0 ${Math.random() * 15 + 5}px hsl(var(--secondary) / 0.8)`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: Math.random() * 8 + 4,
            repeat: Infinity,
            delay: Math.random() * 6,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

// Enhanced animated waves background
function WavesBackground({ className }: { className: string }) {
  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Theme-aware base background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/8" />

      {/* Real wave patterns - sine wave like */}
      <div className="absolute inset-0">
        {Array.from({ length: 12 }, (_, i) => (
          <motion.div
            key={`wave-${i}`}
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 200% 30% at 0% ${20 + i * 8}%, 
                  hsl(var(--primary) / ${0.3 + (i % 3) * 0.1}) 0%, 
                  hsl(var(--accent) / ${0.2 + (i % 4) * 0.05}) 25%, 
                  hsl(var(--secondary) / ${0.15 + (i % 2) * 0.05}) 50%, 
                  transparent 75%),
                radial-gradient(ellipse 200% 30% at 100% ${25 + i * 8}%, 
                  hsl(var(--accent) / ${0.25 + (i % 3) * 0.1}) 0%, 
                  hsl(var(--primary) / ${0.2 + (i % 4) * 0.05}) 25%, 
                  hsl(var(--secondary) / ${0.15 + (i % 2) * 0.05}) 50%, 
                  transparent 75%)
              `,
              filter: 'blur(1px)',
            }}
            animate={{
              backgroundPosition: [
                '0% 0%, 100% 0%',
                '100% 0%, 0% 0%',
                '0% 0%, 100% 0%'
              ],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 8 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Circular wave ripples */}
      <div className="absolute inset-0">
        {Array.from({ length: 6 }, (_, i) => (
          <motion.div
            key={`ripple-${i}`}
            className="absolute rounded-full"
            style={{
              width: '300px',
              height: '300px',
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
              background: `
                conic-gradient(
                  hsl(var(--primary) / 0.4) 0deg,
                  hsl(var(--accent) / 0.3) 60deg,
                  hsl(var(--secondary) / 0.35) 120deg,
                  hsl(var(--primary) / 0.3) 180deg,
                  hsl(var(--accent) / 0.4) 240deg,
                  hsl(var(--secondary) / 0.3) 300deg,
                  hsl(var(--primary) / 0.4) 360deg
                )
              `,
              borderRadius: '50%',
              filter: 'blur(2px)',
              maskImage: 'radial-gradient(circle, transparent 40%, black 45%, black 55%, transparent 60%)',
              WebkitMaskImage: 'radial-gradient(circle, transparent 40%, black 45%, black 55%, transparent 60%)',
            }}
            animate={{
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8],
              opacity: [0.2, 0.7, 0.2],
            }}
            transition={{
              duration: 12 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Traveling wave pulses */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={`pulse-${i}`}
            className="absolute h-1"
            style={{
              width: '100%',
              top: `${15 + i * 12}%`,
              left: '-100%',
              background: `
                linear-gradient(90deg,
                  transparent 0%,
                  hsl(var(--primary) / ${0.6 + (i % 3) * 0.1}) 20%,
                  hsl(var(--accent) / ${0.5 + (i % 4) * 0.1}) 40%,
                  hsl(var(--secondary) / ${0.4 + (i % 2) * 0.1}) 60%,
                  hsl(var(--primary) / ${0.5 + (i % 3) * 0.1}) 80%,
                  transparent 100%
                )
              `,
              boxShadow: `
                0 0 20px hsl(var(--primary) / 0.5),
                0 0 40px hsl(var(--accent) / 0.3)
              `,
              borderRadius: '50px',
              filter: 'blur(0.5px)',
            }}
            animate={{
              x: ['0%', '200%', '0%'],
              opacity: [0, 1, 0],
              scaleY: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 6 + i * 0.8,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Multi-colored wave particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }, (_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 8 + 4,
              height: Math.random() * 8 + 4,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `
                radial-gradient(circle,
                  hsl(var(--${['primary', 'accent', 'secondary'][Math.floor(Math.random() * 3)]}) / ${0.7 + Math.random() * 0.3}) 0%,
                  hsl(var(--${['primary', 'accent', 'secondary'][Math.floor(Math.random() * 3)]}) / ${0.5 + Math.random() * 0.3}) 30%,
                  hsl(var(--${['primary', 'accent', 'secondary'][Math.floor(Math.random() * 3)]}) / ${0.3 + Math.random() * 0.3}) 60%,
                  transparent 100%
                )
              `,
              boxShadow: `
                0 0 15px hsl(var(--primary) / 0.6),
                0 0 30px hsl(var(--accent) / 0.4)
              `,
            }}
            animate={{
              x: [0, Math.random() * 400 - 200, 0],
              y: [0, Math.random() * 300 - 150, 0],
              opacity: [0, 1, 0],
              scale: [0, 2, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 8,
              repeat: Infinity,
              delay: Math.random() * 12,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Frequency spectrum bars */}
      <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-center gap-1">
        {Array.from({ length: 24 }, (_, i) => (
          <motion.div
            key={`freq-${i}`}
            className="w-2 bg-gradient-to-t"
            style={{
              background: `
                linear-gradient(to top,
                  hsl(var(--primary) / ${0.5 + (i % 3) * 0.1}) 0%,
                  hsl(var(--accent) / ${0.4 + (i % 4) * 0.1}) 50%,
                  hsl(var(--secondary) / ${0.3 + (i % 2) * 0.1}) 100%
                )
              `,
              boxShadow: `
                0 0 10px hsl(var(--primary) / 0.5),
                0 -5px 20px hsl(var(--accent) / 0.3)
              `,
              borderRadius: '2px 2px 0 0',
            }}
            animate={{
              height: [
                `${Math.random() * 20 + 10}px`,
                `${Math.random() * 80 + 20}px`,
                `${Math.random() * 40 + 15}px`,
                `${Math.random() * 60 + 25}px`,
                `${Math.random() * 20 + 10}px`
              ],
              opacity: [0.4, 1, 0.6, 0.8, 0.4],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Subtle theme-aware overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-background/10 pointer-events-none" />
    </div>
  );
}

// Enhanced animated grid background
function GridBackground({ className }: { className: string }) {
  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/92 to-primary/12" />

      {/* Main grid with enhanced visibility */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.15) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
        animate={{
          backgroundPosition: ['0px 0px', '50px 50px', '0px 0px'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Secondary grid overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--accent) / 0.08) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--accent) / 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
        animate={{
          backgroundPosition: ['0px 0px', '-100px -100px', '0px 0px'],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Enhanced grid intersection highlights */}
      {Array.from({ length: 25 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 8 + 4,
            height: Math.random() * 8 + 4,
            backgroundColor: `hsl(var(--primary) / ${Math.random() * 0.6 + 0.4})`,
            left: `${(i * 7) % 100}%`,
            top: `${Math.floor(i / 10) * 25 + Math.random() * 50}%`,
            boxShadow: `0 0 ${Math.random() * 30 + 15}px hsl(var(--primary) / 0.7)`,
            filter: 'blur(0.5px)',
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.5, 2, 0.5],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Grid energy pulses */}
      {Array.from({ length: 8 }, (_, i) => (
        <motion.div
          key={`pulse-${i}`}
          className="absolute"
          style={{
            width: '2px',
            height: '100vh',
            backgroundColor: `hsl(var(--accent) / 0.3)`,
            left: `${i * 12.5}%`,
            boxShadow: `0 0 20px hsl(var(--accent) / 0.5)`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scaleX: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 6,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Horizontal grid energy pulses */}
      {Array.from({ length: 6 }, (_, i) => (
        <motion.div
          key={`h-pulse-${i}`}
          className="absolute"
          style={{
            width: '100vw',
            height: '2px',
            backgroundColor: `hsl(var(--secondary) / 0.25)`,
            top: `${i * 16.66}%`,
            boxShadow: `0 0 15px hsl(var(--secondary) / 0.4)`,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scaleY: [0.5, 2, 0.5],
          }}
          transition={{
            duration: 5 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

// Enhanced animated dots pattern
function DotsBackground({ className }: { className: string }) {
  const dots = Array.from({ length: 120 }, (_, i) => i);

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-secondary/15" />

      {/* Main dot matrix */}
      {dots.map((i) => {
        const row = Math.floor(i / 12);
        const col = i % 12;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 8 + 4,
              height: Math.random() * 8 + 4,
              backgroundColor: `hsl(var(--primary) / ${Math.random() * 0.6 + 0.3})`,
              left: `${col * 8 + 4}%`,
              top: `${row * 10 + 5}%`,
              boxShadow: `0 0 ${Math.random() * 20 + 10}px hsl(var(--primary) / 0.6)`,
              filter: 'blur(0.5px)',
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.5, 2, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: (row + col) * 0.15,
              ease: "easeInOut"
            }}
          />
        );
      })}

      {/* Larger accent dots */}
      {Array.from({ length: 30 }, (_, i) => (
        <motion.div
          key={`accent-${i}`}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 12 + 6,
            height: Math.random() * 12 + 6,
            backgroundColor: `hsl(var(--accent) / ${Math.random() * 0.4 + 0.2})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: `0 0 ${Math.random() * 35 + 20}px hsl(var(--accent) / 0.7)`,
            filter: 'blur(1px)',
          }}
          animate={{
            opacity: [0.1, 0.8, 0.1],
            scale: [0.3, 2.5, 0.3],
            rotate: [0, 360],
          }}
          transition={{
            duration: 6 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 8,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Enhanced flowing connection lines */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(45deg, transparent 48%, hsl(var(--primary) / 0.15) 50%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, hsl(var(--accent) / 0.1) 50%, transparent 52%)
          `,
          backgroundSize: '80px 80px',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Secondary connection pattern */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(30deg, transparent 49%, hsl(var(--secondary) / 0.08) 50%, transparent 51%),
            linear-gradient(-30deg, transparent 49%, hsl(var(--primary) / 0.06) 50%, transparent 51%)
          `,
          backgroundSize: '150px 150px',
        }}
        animate={{
          backgroundPosition: ['100% 0%', '0% 100%', '100% 0%'],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Floating connector dots */}
      {Array.from({ length: 15 }, (_, i) => (
        <motion.div
          key={`connector-${i}`}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            backgroundColor: `hsl(var(--secondary) / ${Math.random() * 0.7 + 0.4})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: `0 0 ${Math.random() * 15 + 8}px hsl(var(--secondary) / 0.8)`,
          }}
          animate={{
            x: [0, Math.random() * 200 - 100, 0],
            y: [0, Math.random() * 150 - 75, 0],
            opacity: [0.3, 1, 0.3],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: Math.random() * 12 + 8,
            repeat: Infinity,
            delay: Math.random() * 6,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}