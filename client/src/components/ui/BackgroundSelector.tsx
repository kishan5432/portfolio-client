import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cog6ToothIcon,
  EyeIcon,
  SparklesIcon,
  CpuChipIcon,
  BeakerIcon,
  PlayIcon,
  PauseIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { BackgroundType } from './BackgroundManager';
import { useBackground } from '@/contexts/BackgroundContext';

interface BackgroundSelectorProps {
  currentType: BackgroundType;
  onTypeChange: (type: BackgroundType) => void;
  className?: string;
}

export function BackgroundSelector({
  currentType,
  onTypeChange,
  className = ''
}: BackgroundSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAutoCycling, setIsAutoCycling, cycleInterval, setCycleInterval } = useBackground();
  const [localInterval, setLocalInterval] = useState(cycleInterval);

  // Handle escape key to close the menu
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen]);

  const backgrounds = [
    {
      type: 'auto' as BackgroundType,
      name: 'Auto',
      description: 'Cycles through Grid, Dots, Particles & Waves every 30s',
      icon: ClockIcon,
      preview: 'bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20'
    },
    {
      type: 'constellation' as BackgroundType,
      name: 'Constellation',
      description: 'Connected nodes with floating particles',
      icon: SparklesIcon,
      preview: 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
    },
    {
      type: 'geometric' as BackgroundType,
      name: 'Geometric',
      description: 'Floating geometric shapes',
      icon: CpuChipIcon,
      preview: 'bg-gradient-to-br from-green-500/20 to-blue-500/20'
    },
    {
      type: 'neural' as BackgroundType,
      name: 'Neural Network',
      description: 'AI-inspired neural connections',
      icon: CpuChipIcon,
      preview: 'bg-gradient-to-br from-cyan-500/20 to-teal-500/20'
    },
    {
      type: 'particles' as BackgroundType,
      name: 'Particles',
      description: 'Floating particle system',
      icon: SparklesIcon,
      preview: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
    },
    {
      type: 'flow' as BackgroundType,
      name: 'Flow Field',
      description: 'Organic flowing patterns',
      icon: BeakerIcon,
      preview: 'bg-gradient-to-br from-orange-500/20 to-red-500/20'
    },
    {
      type: 'waves' as BackgroundType,
      name: 'Waves',
      description: 'Smooth animated waves',
      icon: BeakerIcon,
      preview: 'bg-gradient-to-br from-indigo-500/20 to-blue-500/20'
    },
    {
      type: 'grid' as BackgroundType,
      name: 'Grid',
      description: 'Animated grid pattern',
      icon: CpuChipIcon,
      preview: 'bg-gradient-to-br from-gray-500/20 to-slate-500/20'
    },
    {
      type: 'dots' as BackgroundType,
      name: 'Dots',
      description: 'Pulsing dot matrix',
      icon: SparklesIcon,
      preview: 'bg-gradient-to-br from-emerald-500/20 to-green-500/20'
    },
    {
      type: 'gradient' as BackgroundType,
      name: 'Simple',
      description: 'Clean gradient background',
      icon: EyeIcon,
      preview: 'bg-gradient-to-br from-muted/20 to-muted/5'
    },
    {
      type: 'none' as BackgroundType,
      name: 'None',
      description: 'Plain background',
      icon: EyeIcon,
      preview: 'bg-background'
    }
  ];

  const currentBackground = backgrounds.find(bg => bg.type === currentType);

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Cog6ToothIcon className="w-4 h-4" />
        Background
        {isAutoCycling && (
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        )}
        {currentBackground && (
          <span className="text-xs text-muted-foreground">
            ({currentBackground.name})
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Selector Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 z-50 w-80 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4"
            >
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-sm">Choose Background Style</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6 p-0 hover:bg-muted/50 transition-colors duration-200 rounded-md"
                    aria-label="Close background selector"
                  >
                    <XMarkIcon className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors duration-200" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select an animated background that matches your preference
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {backgrounds.map((background) => {
                  const Icon = background.icon;
                  const isSelected = currentType === background.type;

                  return (
                    <motion.button
                      key={background.type}
                      onClick={() => {
                        onTypeChange(background.type);
                        setIsOpen(false);
                      }}
                      className={`
                        relative p-3 rounded-lg border text-left transition-all
                        ${isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border hover:border-border/80 hover:bg-muted/50'
                        }
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Preview */}
                      <div className={`w-full h-8 rounded mb-2 ${background.preview} relative overflow-hidden`}>
                        {background.type === 'auto' ? (
                          <div className="absolute inset-0 opacity-80">
                            <div className="absolute top-1 left-1 w-1 h-1 bg-primary rounded-full animate-pulse" />
                            <div className="absolute top-1 left-4 w-1 h-1 bg-accent rounded-full animate-pulse delay-300" />
                            <div className="absolute top-1 left-7 w-1 h-1 bg-secondary rounded-full animate-pulse delay-600" />
                            <div className="absolute top-1 left-10 w-1 h-1 bg-primary rounded-full animate-pulse delay-900" />
                            <div className="absolute bottom-1 right-1 w-2 h-0.5 bg-primary/70 rounded animate-pulse delay-150" />
                            <div className="absolute bottom-1 right-4 w-2 h-0.5 bg-accent/70 rounded animate-pulse delay-450" />
                            <div className="absolute bottom-1 right-7 w-2 h-0.5 bg-secondary/70 rounded animate-pulse delay-750" />
                          </div>
                        ) : background.type !== 'none' && background.type !== 'gradient' ? (
                          <div className="absolute inset-0 opacity-60">
                            <div className="absolute top-1 left-1 w-1 h-1 bg-current rounded-full animate-pulse" />
                            <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-current rounded-full animate-pulse delay-300" />
                            <div className="absolute bottom-1 left-1/2 w-1 h-1 bg-current rounded-full animate-pulse delay-700" />
                          </div>
                        ) : null}
                      </div>

                      {/* Info */}
                      <div className="flex items-start gap-2">
                        <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm">{background.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {background.description}
                          </div>
                        </div>
                      </div>

                      {/* Selection indicator */}
                      {isSelected && (
                        <motion.div
                          layoutId="selected-background"
                          className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none"
                          initial={false}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Auto-cycle Controls */}
              <div className="mt-4 pt-3 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Auto-cycle</span>
                  </div>
                  <Button
                    variant={isAutoCycling ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsAutoCycling(!isAutoCycling)}
                    className="h-8 px-3"
                  >
                    {isAutoCycling ? (
                      <>
                        <PauseIcon className="w-3 h-3 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <PlayIcon className="w-3 h-3 mr-1" />
                        Start
                      </>
                    )}
                  </Button>
                </div>

                {/* Interval Selector */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">
                    Change every {localInterval} seconds
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={localInterval}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setLocalInterval(value);
                        setCycleInterval(value);
                      }}
                      className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {localInterval}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Fast</span>
                    <span>Slow</span>
                  </div>
                </div>

                {isAutoCycling && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-xs text-primary font-medium">
                      Auto-cycling active
                    </span>
                  </motion.div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  💡 Backgrounds automatically respect your motion preferences
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Mini background selector for quick switching
export function MiniBackgroundSelector({
  currentType,
  onTypeChange
}: Pick<BackgroundSelectorProps, 'currentType' | 'onTypeChange'>) {
  const quickOptions: BackgroundType[] = ['constellation', 'geometric', 'neural', 'particles'];

  return (
    <div className="flex gap-1">
      {quickOptions.map((type) => (
        <button
          key={type}
          onClick={() => onTypeChange(type)}
          className={`
            w-6 h-6 rounded border-2 transition-all
            ${currentType === type
              ? 'border-primary bg-primary/20'
              : 'border-border hover:border-border/60'
            }
          `}
          title={type.charAt(0).toUpperCase() + type.slice(1)}
        >
          <div className={`w-full h-full rounded-sm ${type === 'constellation' ? 'bg-gradient-to-br from-blue-500/40 to-purple-500/40' :
            type === 'geometric' ? 'bg-gradient-to-br from-green-500/40 to-blue-500/40' :
              type === 'neural' ? 'bg-gradient-to-br from-cyan-500/40 to-teal-500/40' :
                'bg-gradient-to-br from-purple-500/40 to-pink-500/40'
            }`} />
        </button>
      ))}
    </div>
  );
}

// Mobile background selector popup
// Mobile background selector popup
export function MobileBackgroundSelector({
  currentType,
  onTypeChange
}: Pick<BackgroundSelectorProps, 'currentType' | 'onTypeChange'>) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAutoCycling, setIsAutoCycling, cycleInterval, setCycleInterval } = useBackground();
  const [localInterval, setLocalInterval] = useState(cycleInterval);

  // Handle escape key to close the menu
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen]);

  const backgrounds = [
    {
      type: 'auto' as BackgroundType,
      name: 'Auto',
      description: 'Cycles through Grid, Dots, Particles & Waves every 30s',
      icon: ClockIcon,
      preview: 'bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20'
    },
    {
      type: 'constellation' as BackgroundType,
      name: 'Constellation',
      description: 'Connected nodes with floating particles',
      icon: SparklesIcon,
      preview: 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
    },
    {
      type: 'geometric' as BackgroundType,
      name: 'Geometric',
      description: 'Floating geometric shapes',
      icon: CpuChipIcon,
      preview: 'bg-gradient-to-br from-green-500/20 to-blue-500/20'
    },
    {
      type: 'neural' as BackgroundType,
      name: 'Neural Network',
      description: 'AI-inspired neural connections',
      icon: CpuChipIcon,
      preview: 'bg-gradient-to-br from-cyan-500/20 to-teal-500/20'
    },
    {
      type: 'particles' as BackgroundType,
      name: 'Particles',
      description: 'Floating particle system',
      icon: SparklesIcon,
      preview: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
    },
    {
      type: 'flow' as BackgroundType,
      name: 'Flow Field',
      description: 'Organic flowing patterns',
      icon: BeakerIcon,
      preview: 'bg-gradient-to-br from-orange-500/20 to-red-500/20'
    },
    {
      type: 'waves' as BackgroundType,
      name: 'Waves',
      description: 'Smooth animated waves',
      icon: BeakerIcon,
      preview: 'bg-gradient-to-br from-indigo-500/20 to-blue-500/20'
    },
    {
      type: 'grid' as BackgroundType,
      name: 'Grid',
      description: 'Animated grid pattern',
      icon: CpuChipIcon,
      preview: 'bg-gradient-to-br from-gray-500/20 to-slate-500/20'
    },
    {
      type: 'dots' as BackgroundType,
      name: 'Dots',
      description: 'Pulsing dot matrix',
      icon: SparklesIcon,
      preview: 'bg-gradient-to-br from-emerald-500/20 to-green-500/20'
    },
    {
      type: 'gradient' as BackgroundType,
      name: 'Simple',
      description: 'Clean gradient background',
      icon: EyeIcon,
      preview: 'bg-gradient-to-br from-muted/20 to-muted/5'
    },
    {
      type: 'none' as BackgroundType,
      name: 'None',
      description: 'Plain background',
      icon: EyeIcon,
      preview: 'bg-background'
    }
  ];

  const currentBackground = backgrounds.find(bg => bg.type === currentType);

  return (
    <div className="">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded text-xs font-medium border border-border/50 bg-muted hover:bg-muted/80 text-foreground/80 hover:text-accent transition-colors shadow-sm flex items-center justify-center min-w-[28px] relative"
        title="Background Settings"
      >
        BG
        {isAutoCycling && (
          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Mobile Selector Panel - positioned like desktop but full width on mobile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="fixed right-2 top-16 z-50 w-[calc(100vw-16px)] max-w-sm bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="mb-3 flex-shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-sm">Choose Background Style</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6 p-0 hover:bg-muted/50 transition-colors duration-200 rounded-md"
                    aria-label="Close background selector"
                  >
                    <XMarkIcon className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors duration-200" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select an animated background that matches your preference
                </p>
              </div>

              {/* Scrollable background grid */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 gap-2">
                  {backgrounds.map((background) => {
                    const Icon = background.icon;
                    const isSelected = currentType === background.type;

                    return (
                      <motion.button
                        key={background.type}
                        onClick={() => {
                          onTypeChange(background.type);
                          setIsOpen(false);
                        }}
                        className={`
                          relative p-3 rounded-lg border text-left transition-all
                          ${isSelected
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'border-border hover:border-border/80 hover:bg-muted/50'
                          }
                        `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Preview */}
                        <div className={`w-full h-8 rounded mb-2 ${background.preview} relative overflow-hidden`}>
                          {background.type === 'auto' ? (
                            <div className="absolute inset-0 opacity-80">
                              <div className="absolute top-1 left-1 w-1 h-1 bg-primary rounded-full animate-pulse" />
                              <div className="absolute top-1 left-4 w-1 h-1 bg-accent rounded-full animate-pulse delay-300" />
                              <div className="absolute top-1 left-7 w-1 h-1 bg-secondary rounded-full animate-pulse delay-600" />
                              <div className="absolute top-1 left-10 w-1 h-1 bg-primary rounded-full animate-pulse delay-900" />
                              <div className="absolute bottom-1 right-1 w-2 h-0.5 bg-primary/70 rounded animate-pulse delay-150" />
                              <div className="absolute bottom-1 right-4 w-2 h-0.5 bg-accent/70 rounded animate-pulse delay-450" />
                              <div className="absolute bottom-1 right-7 w-2 h-0.5 bg-secondary/70 rounded animate-pulse delay-750" />
                            </div>
                          ) : background.type !== 'none' && background.type !== 'gradient' ? (
                            <div className="absolute inset-0 opacity-60">
                              <div className="absolute top-1 left-1 w-1 h-1 bg-current rounded-full animate-pulse" />
                              <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-current rounded-full animate-pulse delay-300" />
                              <div className="absolute bottom-1 left-1/2 w-1 h-1 bg-current rounded-full animate-pulse delay-700" />
                            </div>
                          ) : null}
                        </div>

                        {/* Info */}
                        <div className="flex items-start gap-2">
                          <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm">{background.name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {background.description}
                            </div>
                          </div>
                        </div>

                        {/* Selection indicator */}
                        {isSelected && (
                          <motion.div
                            layoutId="selected-mobile-background"
                            className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none"
                            initial={false}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Auto-cycle Controls - same as desktop */}
              <div className="mt-4 pt-3 border-t border-border space-y-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Auto-cycle</span>
                  </div>
                  <Button
                    variant={isAutoCycling ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsAutoCycling(!isAutoCycling)}
                    className="h-8 px-3"
                  >
                    {isAutoCycling ? (
                      <>
                        <PauseIcon className="w-3 h-3 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <PlayIcon className="w-3 h-3 mr-1" />
                        Start
                      </>
                    )}
                  </Button>
                </div>

                {/* Interval Selector */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">
                    Change every {localInterval} seconds
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={localInterval}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setLocalInterval(value);
                        setCycleInterval(value);
                      }}
                      className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {localInterval}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Fast</span>
                    <span>Slow</span>
                  </div>
                </div>

                {isAutoCycling && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-xs text-primary font-medium">
                      Auto-cycling active
                    </span>
                  </motion.div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-border flex-shrink-0">
                <p className="text-xs text-muted-foreground">
                  💡 Backgrounds automatically respect your motion preferences
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
