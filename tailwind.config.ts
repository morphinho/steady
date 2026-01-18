import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-cascadia-code)'],
        mono: ['var(--font-cascadia-code)'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'rgb(var(--background))',
        foreground: 'rgb(var(--text-primary))',
        surface: 'rgb(var(--surface))',
        surfaceMuted: 'rgb(var(--surface-muted))',
        surfaceElevated: 'rgb(var(--surface-elevated))',
        textPrimary: 'rgb(var(--text-primary))',
        textSecondary: 'rgb(var(--text-secondary))',
        textTertiary: 'rgb(var(--text-tertiary))',
        brandPrimary: 'rgb(var(--brand-primary))',
        brandSecondary: 'rgb(var(--brand-secondary))',
        brandAccent: 'rgb(var(--brand-accent))',
        success: 'rgb(var(--success))',
        warning: 'rgb(var(--warning))',
        error: 'rgb(var(--error))',
        card: {
          DEFAULT: 'rgb(var(--surface))',
          foreground: 'rgb(var(--text-primary))',
        },
        popover: {
          DEFAULT: 'rgb(var(--surface-elevated))',
          foreground: 'rgb(var(--text-primary))',
        },
        primary: {
          DEFAULT: 'rgb(var(--brand-primary))',
          foreground: 'rgb(255 255 255)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--surface-muted))',
          foreground: 'rgb(var(--text-primary))',
        },
        muted: {
          DEFAULT: 'rgb(var(--surface-muted))',
          foreground: 'rgb(var(--text-secondary))',
        },
        accent: {
          DEFAULT: 'rgb(var(--brand-accent))',
          foreground: 'rgb(255 255 255)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--error))',
          foreground: 'rgb(255 255 255)',
        },
        border: 'rgba(var(--text-primary) / 0.1)',
        input: 'rgba(var(--text-primary) / 0.1)',
        ring: 'rgb(var(--brand-primary))',
        chart: {
          '1': 'rgb(var(--brand-primary))',
          '2': 'rgb(var(--brand-secondary))',
          '3': 'rgb(var(--brand-accent))',
          '4': 'rgb(var(--success))',
          '5': 'rgb(var(--warning))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
