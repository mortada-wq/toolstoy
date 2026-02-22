/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        toolstoy: {
          white: '#FFFFFF',
          canvas: '#F9F9FB',
          border: 'rgba(0,0,0,0.06)',
          softgrey: '#F5F5F5',
          silver: '#E0E0E0',
          offwhite: '#D1D1D1',
          nearblack: '#1A1A1A',
          muted: '#6B7280',
          charcoal: '#282C34',
          dark: '#0A0A0A',
          subtext: '#888888',
        },
      },
      backgroundImage: {
        'vignette': 'radial-gradient(circle at center, #1a1b1b 0%, #050505 100%)',
      },
      borderRadius: {
        'toolstoy': '8px',
        'toolstoy-modal': '12px',
      },
      boxShadow: {
        'toolstoy': '0 2px 12px rgba(0,0,0,0.08)',
        'toolstoy-hover': '0 8px 32px rgba(0,0,0,0.2)',
        'button-glow': '0 0 15px rgba(255,255,255,0.1)',
      },
      transitionDelay: {
        '80': '80ms',
        '100': '100ms',
        '160': '160ms',
        '200': '200ms',
        '240': '240ms',
        '320': '320ms',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
