import animate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        brand: {
          DEFAULT: '#FF6B00',
          50: '#FFF5EB',
          100: '#FFE6D1',
          200: '#FFC9A3',
          300: '#FFA375',
          400: '#FF7D47',
          500: '#FF6B00',
          600: '#E66000',
          700: '#CC5500',
          800: '#993F00',
          900: '#662A00',
        },
        accent: {
          DEFAULT: '#22C55E',
          foreground: '#FFFFFF',
        },
        surface: {
          DEFAULT: '#FDFBF7',
          elevated: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#6B7280',
          foreground: '#9CA3AF',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '4xl': '2.5rem',
      },
      fontFamily: {
        sans: ['Sarabun', 'system-ui', 'sans-serif'],
        heading: ['Kanit', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(-5%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        },
        stamp: {
          '0%': { transform: 'scale(2)', opacity: '0' },
          '50%': { transform: 'scale(0.9)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 3s ease-in-out infinite',
        'bounce-slow': 'bounce-slow 3s infinite',
        stamp: 'stamp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
        'soft-lg': '0 10px 40px -4px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 40px -10px rgba(255, 107, 0, 0.3)',
      },
    },
  },
  plugins: [animate],
}
