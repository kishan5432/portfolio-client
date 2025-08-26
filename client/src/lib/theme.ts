import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentPalette = 'indigo' | 'teal' | 'amber';

// Accent color palettes
export const accentPalettes = {
  indigo: {
    name: 'Indigo/Purple',
    description: 'Sleek tech',
    light: {
      '--accent-50': '240 100% 97%',
      '--accent-100': '238 100% 94%',
      '--accent-200': '236 84% 88%',
      '--accent-300': '232 79% 81%',
      '--accent-400': '226 71% 73%',
      '--accent': '224 71% 66%', // main accent
      '--accent-500': '224 71% 66%', // alias for main accent
      '--accent-600': '220 57% 53%',
      '--accent-700': '217 49% 44%',
      '--accent-800': '215 42% 36%',
      '--accent-900': '213 39% 30%',
      '--accent-950': '212 50% 18%',
      '--accent-foreground': '0 0% 100%',
      '--ring': '224 71% 66%',
    },
    dark: {
      '--accent-50': '212 50% 18%',
      '--accent-100': '213 39% 30%',
      '--accent-200': '215 42% 36%',
      '--accent-300': '217 49% 44%',
      '--accent-400': '220 57% 53%',
      '--accent': '224 71% 66%', // main accent
      '--accent-500': '224 71% 66%', // alias for main accent
      '--accent-600': '226 71% 73%',
      '--accent-700': '232 79% 81%',
      '--accent-800': '236 84% 88%',
      '--accent-900': '238 100% 94%',
      '--accent-950': '240 100% 97%',
      '--accent-foreground': '212 50% 18%',
      '--ring': '224 71% 66%',
    },
  },
  teal: {
    name: 'Teal/Cyan',
    description: 'Calm modern',
    light: {
      '--accent-50': '166 76% 97%',
      '--accent-100': '167 85% 89%',
      '--accent-200': '168 84% 78%',
      '--accent-300': '171 77% 64%',
      '--accent-400': '172 66% 50%',
      '--accent': '173 58% 39%', // main accent
      '--accent-500': '173 58% 39%', // alias for main accent
      '--accent-600': '175 77% 32%',
      '--accent-700': '175 84% 32%',
      '--accent-800': '176 69% 30%',
      '--accent-900': '175 60% 25%',
      '--accent-950': '176 84% 15%',
      '--accent-foreground': '0 0% 100%',
      '--ring': '173 58% 39%',
    },
    dark: {
      '--accent-50': '176 84% 15%',
      '--accent-100': '175 60% 25%',
      '--accent-200': '176 69% 30%',
      '--accent-300': '175 84% 32%',
      '--accent-400': '175 77% 32%',
      '--accent': '173 58% 39%', // main accent
      '--accent-500': '173 58% 39%', // alias for main accent
      '--accent-600': '172 66% 50%',
      '--accent-700': '171 77% 64%',
      '--accent-800': '168 84% 78%',
      '--accent-900': '167 85% 89%',
      '--accent-950': '166 76% 97%',
      '--accent-foreground': '176 84% 15%',
      '--ring': '173 58% 39%',
    },
  },
  amber: {
    name: 'Amber/Rose',
    description: 'Warm creative',
    light: {
      '--accent-50': '33 100% 96%',
      '--accent-100': '34 100% 92%',
      '--accent-200': '32 98% 83%',
      '--accent-300': '31 97% 72%',
      '--accent-400': '29 96% 61%',
      '--accent': '27 96% 53%', // main accent
      '--accent-500': '27 96% 53%', // alias for main accent
      '--accent-600': '25 95% 53%',
      '--accent-700': '21 90% 48%',
      '--accent-800': '17 88% 40%',
      '--accent-900': '15 86% 30%',
      '--accent-950': '13 81% 17%',
      '--accent-foreground': '0 0% 100%',
      '--ring': '27 96% 53%',
    },
    dark: {
      '--accent-50': '13 81% 17%',
      '--accent-100': '15 86% 30%',
      '--accent-200': '17 88% 40%',
      '--accent-300': '21 90% 48%',
      '--accent-400': '25 95% 53%',
      '--accent': '27 96% 53%', // main accent
      '--accent-500': '27 96% 53%', // alias for main accent
      '--accent-600': '29 96% 61%',
      '--accent-700': '31 97% 72%',
      '--accent-800': '32 98% 83%',
      '--accent-900': '34 100% 92%',
      '--accent-950': '33 100% 96%',
      '--accent-foreground': '13 81% 17%',
      '--ring': '27 96% 53%',
    },
  },
} as const;

// Base theme colors (consistent across palettes)
export const baseColors = {
  light: {
    '--bg': '0 0% 100%',
    '--card': '0 0% 100%',
    '--muted': '210 40% 96%',
    '--text': '222.2 84% 4.9%',
    '--border': '214.3 31.8% 91.4%',
    '--radius': '0.5rem',
    '--destructive': '0 84% 60%',
    '--destructive-foreground': '210 40% 98%',
  },
  dark: {
    '--bg': '222.2 84% 4.9%',
    '--card': '222.2 84% 4.9%',
    '--muted': '217.2 32.6% 17.5%',
    '--text': '210 40% 98%',
    '--border': '217.2 32.6% 17.5%',
    '--radius': '0.5rem',
    '--destructive': '0 62.8% 30.6%',
    '--destructive-foreground': '210 40% 98%',
  },
} as const;

// Utility functions
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function applyTheme(mode: ThemeMode, palette: AccentPalette): void {
  const root = document.documentElement;
  const actualMode = mode === 'system' ? getSystemTheme() : mode;

  // Apply base colors
  const baseTheme = baseColors[actualMode];
  Object.entries(baseTheme).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Apply accent palette
  const accentTheme = accentPalettes[palette][actualMode];
  Object.entries(accentTheme).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Set class for dark mode
  root.classList.toggle('dark', actualMode === 'dark');

  // Apply reduced motion preference
  const prefersReducedMotion = getReducedMotion();
  root.classList.toggle('reduce-motion', prefersReducedMotion);

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', `hsl(${baseTheme['--bg']})`);
  } else {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = `hsl(${baseTheme['--bg']})`;
    document.head.appendChild(meta);
  }
}

// Theme store
interface ThemeStore {
  mode: ThemeMode;
  palette: AccentPalette;
  setMode: (mode: ThemeMode) => void;
  setPalette: (palette: AccentPalette) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: 'system',
      palette: 'indigo',
      setMode: (mode) => {
        set({ mode });
        applyTheme(mode, get().palette);
      },
      setPalette: (palette) => {
        set({ palette });
        applyTheme(get().mode, palette);
      },
      toggleMode: () => {
        const { mode } = get();
        const newMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
        get().setMode(newMode);
      },
    }),
    {
      name: 'portfolio-theme',
      onRehydrate: (state) => {
        if (state) {
          applyTheme(state.mode, state.palette);
        }
      },
    }
  )
);

// React hook for theme
export function useTheme() {
  const { mode, palette, setMode, setPalette, toggleMode } = useThemeStore();

  const actualMode = mode === 'system' ? getSystemTheme() : mode;
  const isDark = actualMode === 'dark';

  return {
    mode,
    palette,
    actualMode,
    isDark,
    setMode,
    setPalette,
    toggleMode,
    accentPalettes,
  };
}

