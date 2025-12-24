import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        // POS Brand Colors - KES Currency Theme
        primary: {
          50: '#f0f9ff',
          100: '#e0e7ff', 
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#93c5fd',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#020617',
        },
        // Success/Error Status Colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#22c55e',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#15803d',
          900: '#166534',
          950: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Neutral/Text Colors
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e7',
          300: '#d4d4d8',
          400: '#a3a3a3',
          500: '#737373',
          600: '#52525b',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        // Specific POS Colors
        accent: {
          50: '#fefefe',
          100: '#fef7ed',
          200: '#fef2ed',
          300: '#fde5cc',
          400: '#fcdcbd',
          500: '#fbbf24',
          600: '#f59e0b',
          700: '#fbbf24',
          800: '#fb923c',
          900: '#fbbf24',
          950: '#713f12',
        },
        // Card colors for UI components
        card: {
          DEFAULT: '#ffffff',
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e7',
          300: '#d4d4d8',
          400: '#a3a3a3',
          500: '#737373',
          600: '#52525b',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        // Chart colors for analytics
        chart: {
          1: '#0284c7',  // Primary blue
          2: '#f59e0b',  // Warning orange
          3: '#10b981',  // Success green
          4: '#ef4444',  // Error red
          5: '#8b5cf6',  // Info blue
        },
        // Sidebar specific colors
        sidebar: {
          DEFAULT: '#ffffff',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#18181b',
          950: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SF Mono', 'Monaco', 'Cascadia Code', 'monospace'],
      },
      borderRadius: {
        lg: '0.625rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.07)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'fadeIn': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slideUp': {
          '0%': { transform: 'translateY(10px)' },
          '100%': { transform: 'translateY(0)' },
        },
        'scaleIn': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
      },
    },
  plugins: [
    require('@tailwindcss/vite'),
  ],
  darkMode: 'class',
};

export default config;