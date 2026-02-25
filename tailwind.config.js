/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Design system: DESIGN.md + design-tokens.json
        toolstoy: {
          // Backgrounds
          bg: {
            primary: '#2E3340',
            secondary: '#252A36',
            overlay: '#1E2330',
          },
          // Brand
          teal: '#70E6D2',
          orange: '#FF7A2F',
          coral: '#F4957A',
          logoOrange: '#EF8244',
          logoBurnt: '#BA6339',
          // Neutrals
          steelBlue: '#8FA3B5',
          cream: '#FDF0E0',
          slateText: '#C8D0DC',
          charcoal: '#2E3340',
          // Legacy aliases (map to design system)
          white: '#FDF0E0',
          canvas: '#252A36',
          border: 'rgba(143,163,181,0.15)',
          nearblack: '#FDF0E0',
          muted: '#8FA3B5',
          dark: '#2E3340',
          subtext: '#C8D0DC',
        },
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
      borderRadius: {
        'toolstoy': '16px',
        'toolstoy-sm': '6px',
        'toolstoy-md': '12px',
        'toolstoy-lg': '16px',
        'toolstoy-xl': '24px',
        'toolstoy-full': '9999px',
        'toolstoy-modal': '16px',
      },
      boxShadow: {
        'toolstoy': '0 2px 8px rgba(0,0,0,0.08)',
        'toolstoy-md': '0 4px 16px rgba(0,0,0,0.08)',
        'toolstoy-hover': '0 4px 16px rgba(0,0,0,0.08)',
        'teal-glow': '0 0 20px rgba(112,230,210,0.25)',
        'orange-glow': '0 0 20px rgba(255,122,47,0.30)',
        'button-glow': '0 0 15px rgba(255,122,47,0.2)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '400ms',
        'enter': '350ms',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'default': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      fontSize: {
        'xs': '11px',
        'sm': '13px',
        'base': '15px',
        'md': '17px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '30px',
        '3xl': '38px',
        'display': '48px',
      },
    },
  },
  plugins: [],
}
