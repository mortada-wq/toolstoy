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
        // Figma theme — spiral palette
        toolstoy: {
          // Backgrounds (Figma theme.css)
          bg: {
            primary: '#36454f',
            secondary: '#3c444a',
            overlay: '#4a5057',
          },
          // Brand (spiral palette)
          teal: '#70E6D2',
          orange: '#FF8C00',
          coral: '#CD5C5C',
          logoOrange: '#EF8244',
          logoBurnt: '#BA6339',
          // Spiral palette
          vibrantOrange: '#FF8C00',
          goldenrod: '#DAA520',
          bronze: '#B8860B',
          rustOrange: '#B7410E',
          cream: '#F5F5DC',
          palePeach: '#FFDAB9',
          // Neutrals
          steelBlue: '#8FA3B5',
          slateText: '#C8D0DC',
          charcoal: '#36454F',
          // Figma golden/border accents
          borderAccent: '#b8860b',
          goldenPrimary: '#daa520',
          secondaryText: '#ffdab9',
          // Legacy aliases (map to Figma theme)
          white: '#F5F5DC',
          canvas: '#3c444a',
          border: 'rgba(184,134,11,0.4)',
          nearblack: '#F5F5DC',
          muted: '#8FA3B5',
          dark: '#36454F',
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
        'orange-glow': '0 0 20px rgba(255,140,0,0.30)',
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
