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
      },
      colors: {
        toolstoy: {
          white: '#FFFFFF',
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
    },
  },
  plugins: [],
}
