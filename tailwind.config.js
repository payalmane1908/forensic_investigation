/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Surfaces ──────────────────────────────────────
        'surface-base': '#0D0E11',
        'surface-01':   '#13151A',
        'surface-02':   '#1A1D24',
        'surface-03':   '#21242D',

        // ── Borders ───────────────────────────────────────
        'border-subtle':  '#2A2D38',
        'border-default': '#363944',

        // ── Text ──────────────────────────────────────────
        'text-primary':   '#E8EAF0',
        'text-secondary': '#8B8FA8',
        'text-tertiary':  '#555870',

        // ── Accent ────────────────────────────────────────
        'accent':       '#4F7EF7',
        'accent-hover': '#6B93F8',
        'accent-dim':   '#1E2D54',

        // ── Semantic ──────────────────────────────────────
        'green':      '#34C17A',
        'green-dim':  '#0D2E1D',
        'amber':      '#E8A135',
        'amber-dim':  '#2E210A',
        'red':        '#E85555',
        'red-dim':    '#2E0D0D',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],  // 11px
        'xs':  ['0.75rem',   { lineHeight: '1.125rem' }],  // 12px
        'sm':  ['0.8125rem', { lineHeight: '1.25rem' }],   // 13px
        'base':['0.875rem',  { lineHeight: '1.375rem' }],  // 14px
        'md':  ['1rem',      { lineHeight: '1.5rem' }],    // 16px
        'lg':  ['1.125rem',  { lineHeight: '1.625rem' }],  // 18px
        'xl':  ['1.5rem',    { lineHeight: '2rem' }],      // 24px
        '2xl': ['2rem',      { lineHeight: '2.5rem' }],    // 32px
      },
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'card':  '0 1px 3px 0 rgba(0,0,0,0.4), 0 1px 2px -1px rgba(0,0,0,0.3)',
        'modal': '0 25px 60px -12px rgba(0,0,0,0.7)',
      },
      keyframes: {
        'modal-in': {
          '0%':   { opacity: '0', transform: 'scale(0.97) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },
      animation: {
        'modal-in':   'modal-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in':    'fade-in 0.3s ease both',
        'slide-up':   'slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
