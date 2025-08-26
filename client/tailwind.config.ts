import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px',
      },
    },
    fontFamily: {
      sans: [
        'Inter',
        'ui-sans-serif',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'Noto Sans',
        'sans-serif',
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
        'Noto Color Emoji',
      ],
      mono: [
        'ui-monospace',
        'SFMono-Regular',
        'Menlo',
        'Monaco',
        'Consolas',
        'Liberation Mono',
        'Courier New',
        'monospace',
      ],
    },
    extend: {
      colors: {
        // Core theme tokens
        bg: 'hsl(var(--bg))',
        card: 'hsl(var(--card))',
        muted: 'hsl(var(--muted))',
        text: 'hsl(var(--text))',
        border: 'hsl(var(--border))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
        ring: 'hsl(var(--ring))',

        // Extended semantic colors
        background: 'hsl(var(--bg))',
        foreground: 'hsl(var(--text))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--text))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive, 0 84% 60%))',
          foreground: 'hsl(var(--destructive-foreground, 210 40% 98%))',
        },
        popover: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--text))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--text))',
        },
        input: 'hsl(var(--border))',

        // Accent palette variants
        'accent-50': 'hsl(var(--accent-50))',
        'accent-100': 'hsl(var(--accent-100))',
        'accent-200': 'hsl(var(--accent-200))',
        'accent-300': 'hsl(var(--accent-300))',
        'accent-400': 'hsl(var(--accent-400))',
        'accent-500': 'hsl(var(--accent))',
        'accent-600': 'hsl(var(--accent-600))',
        'accent-700': 'hsl(var(--accent-700))',
        'accent-800': 'hsl(var(--accent-800))',
        'accent-900': 'hsl(var(--accent-900))',
        'accent-950': 'hsl(var(--accent-950))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      spacing: {
        // Fluid spacing scale
        'fluid-xs': 'clamp(0.5rem, 2vw, 0.75rem)',
        'fluid-sm': 'clamp(0.75rem, 3vw, 1rem)',
        'fluid-md': 'clamp(1rem, 4vw, 1.5rem)',
        'fluid-lg': 'clamp(1.5rem, 5vw, 2rem)',
        'fluid-xl': 'clamp(2rem, 6vw, 3rem)',
        'fluid-2xl': 'clamp(2.5rem, 8vw, 4rem)',
        'fluid-3xl': 'clamp(3rem, 10vw, 5rem)',
        'fluid-4xl': 'clamp(4rem, 12vw, 6rem)',
        'fluid-5xl': 'clamp(5rem, 15vw, 8rem)',
      },
      fontSize: {
        // Fluid typography scale
        'fluid-xs': ['clamp(0.75rem, 2vw, 0.875rem)', { lineHeight: '1.5' }],
        'fluid-sm': ['clamp(0.875rem, 2.5vw, 1rem)', { lineHeight: '1.5' }],
        'fluid-base': ['clamp(1rem, 3vw, 1.125rem)', { lineHeight: '1.6' }],
        'fluid-lg': ['clamp(1.125rem, 3.5vw, 1.25rem)', { lineHeight: '1.6' }],
        'fluid-xl': ['clamp(1.25rem, 4vw, 1.5rem)', { lineHeight: '1.5' }],
        'fluid-2xl': ['clamp(1.5rem, 5vw, 2rem)', { lineHeight: '1.4' }],
        'fluid-3xl': ['clamp(2rem, 6vw, 2.5rem)', { lineHeight: '1.3' }],
        'fluid-4xl': ['clamp(2.5rem, 7vw, 3.5rem)', { lineHeight: '1.2' }],
        'fluid-5xl': ['clamp(3rem, 8vw, 4.5rem)', { lineHeight: '1.1' }],
        'fluid-6xl': ['clamp(3.5rem, 10vw, 6rem)', { lineHeight: '1' }],
      },
      keyframes: {
        // Enhanced animations
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px hsl(var(--accent))' },
          '50%': { boxShadow: '0 0 20px hsl(var(--accent)), 0 0 30px hsl(var(--accent))' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'fade-in-down': 'fade-in-down 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'bounce-out': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/container-queries'),
  ],
};

export default config;
