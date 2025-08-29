import React, { createContext, useContext, useEffect, useState } from 'react';
import { useThemeStore, applyTheme, type ThemeMode, type AccentPalette } from '@/lib/theme';

interface ThemeContextType {
  mode: ThemeMode;
  palette: AccentPalette;
  actualMode: 'light' | 'dark';
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  setPalette: (palette: AccentPalette) => void;
  toggleMode: () => void;
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  defaultPalette?: AccentPalette;
}

export function ThemeProvider({
  children,
  defaultMode = 'dark',
  defaultPalette = 'teal',
}: ThemeProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { mode, palette, setMode, setPalette, toggleMode } = useThemeStore();

  // Initialize theme on mount
  useEffect(() => {
    // Set defaults if not already set
    if (!mode) {
      setMode(defaultMode);
    }
    if (!palette) {
      setPalette(defaultPalette);
    }

    // Apply theme immediately
    applyTheme(mode || defaultMode, palette || defaultPalette);
    setIsLoaded(true);
  }, []);

  // Listen for reduced motion changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = () => {
      const root = document.documentElement;
      root.classList.toggle('reduce-motion', mediaQuery.matches);
    };

    // Set initial state
    handleChange();

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const actualMode = mode;
  const isDark = actualMode === 'dark';

  const value: ThemeContextType = {
    mode,
    palette,
    actualMode,
    isDark,
    setMode,
    setPalette,
    toggleMode,
    isLoaded,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme toggle component
interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { mode, toggleMode, isLoaded } = useTheme();

  if (!isLoaded) {
    return (
      <button
        className={`p-2 rounded-md border transition-colors ${className}`}
        disabled
      >
        <div className="w-4 h-4 animate-pulse bg-muted rounded" />
      </button>
    );
  }

  const getIcon = () => {
    switch (mode) {
      case 'light':
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        );
      case 'dark':
      default:
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        );
    }
  };

  const getLabel = () => {
    switch (mode) {
      case 'light':
        return 'Switch to dark mode';
      case 'dark':
      default:
        return 'Switch to light mode';
    }
  };

  return (
    <button
      onClick={toggleMode}
      className={`p-2 rounded-md border border-border bg-card hover:bg-muted transition-colors ${className}`}
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
    </button>
  );
}

// Palette selector component
interface PaletteSelectorProps {
  className?: string;
}

export function PaletteSelector({ className }: PaletteSelectorProps) {
  const { palette, setPalette, isLoaded } = useTheme();

  if (!isLoaded) {
    return (
      <div className={`flex gap-2 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full animate-pulse bg-muted"
          />
        ))}
      </div>
    );
  }

  const palettes: AccentPalette[] = ['indigo', 'teal', 'amber'];

  return (
    <div className={`flex gap-2 ${className}`}>
      {palettes.map((paletteOption) => (
        <button
          key={paletteOption}
          onClick={() => setPalette(paletteOption)}
          className={`w-6 h-6 rounded-full border-2 transition-all ${palette === paletteOption
            ? 'border-accent scale-110'
            : 'border-border hover:border-accent/50'
            }`}
          style={{
            background: paletteOption === 'indigo'
              ? 'linear-gradient(135deg, hsl(224 71% 66%), hsl(262 71% 66%))'
              : paletteOption === 'teal'
                ? 'linear-gradient(135deg, hsl(173 58% 39%), hsl(186 58% 39%))'
                : 'linear-gradient(135deg, hsl(27 96% 53%), hsl(330 81% 60%))'
          }}
          aria-label={`Switch to ${paletteOption} palette`}
          title={`Switch to ${paletteOption} palette`}
        />
      ))}
    </div>
  );
}

