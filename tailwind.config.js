/** @type {import('tailwindcss').Config} */
// Source of truth: design-tokens.json + DESIGN.md
// Every value here must trace back to a token. No legacy aliases.
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ─── Typography ──────────────────────────────────────────────
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // design-tokens.json → typography.scale
        'ds-xs':      ['11px', { lineHeight: '1.4' }],
        'ds-sm':      ['13px', { lineHeight: '1.5' }],
        'ds-base':    ['15px', { lineHeight: '1.6' }],
        'ds-md':      ['17px', { lineHeight: '1.5' }],
        'ds-lg':      ['20px', { lineHeight: '1.4' }],
        'ds-xl':      ['24px', { lineHeight: '1.3' }],
        'ds-2xl':     ['30px', { lineHeight: '1.2' }],
        'ds-3xl':     ['38px', { lineHeight: '1.15' }],
        'ds-display': ['48px', { lineHeight: '1.05' }],
      },

      // ─── Colors ──────────────────────────────────────────────────
      colors: {
        // design-tokens.json → color.background
        'bg-primary':   '#2E3340',
        'bg-secondary': '#252A36',
        'bg-overlay':   '#1E2330',

        // design-tokens.json → color.brand
        teal:   '#70E6D2',
        orange: '#FF7A2F',
        coral:  '#F4957A',
        // Logo-only — never copy into UI
        'logo-orange': '#EF8244',
        'logo-burnt':  '#BA6339',

        // design-tokens.json → color.neutral
        'steel-blue': '#8FA3B5',
        cream:        '#FDF0E0',
        'slate-text': '#C8D0DC',

        // Semantic border colors (for use with opacity modifier)
        border: '#8FA3B5',     // Use as border-border/15 etc.
      },

      // ─── Spacing ─────────────────────────────────────────────────
      // design-tokens.json → spacing.scale (all multiples of 8px base unit)
      spacing: {
        '0':  '0px',
        '1':  '4px',
        '2':  '8px',
        '3':  '12px',
        '4':  '16px',
        '5':  '20px',
        '6':  '24px',
        '8':  '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '32': '128px',
      },

      // ─── Border Radius ───────────────────────────────────────────
      // design-tokens.json → borderRadius
      borderRadius: {
        'sm':   '6px',
        'md':   '12px',
        'lg':   '16px',
        'xl':   '24px',
        '2xl':  '32px',
        'full': '9999px',
      },

      // ─── Shadows ─────────────────────────────────────────────────
      // design-tokens.json → shadow
      boxShadow: {
        'sm':         '0 2px 8px rgba(0,0,0,0.08)',
        'md':         '0 4px 16px rgba(0,0,0,0.08)',
        'teal-glow':  '0 0 20px rgba(112,230,210,0.25)',
        'orange-glow':'0 0 20px rgba(255,122,47,0.30)',
      },

      // ─── Animation ───────────────────────────────────────────────
      // design-tokens.json → animation
      transitionDuration: {
        'fast':   '150ms',
        'normal': '250ms',
        'slow':   '400ms',
        'enter':  '350ms',
      },
      transitionTimingFunction: {
        'spring':     'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'default':    'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'msg-slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '0.8' },
        },
      },
      animation: {
        'msg-slide-up': 'msg-slide-up 200ms cubic-bezier(0.34,1.56,0.64,1) both',
        'glow-pulse':   'glow-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
