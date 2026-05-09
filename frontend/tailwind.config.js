/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          violet:  '#7c3aed',
          violet2: '#6d28d9',
          cyan:    '#06b6d4',
          cyan2:   '#0891b2',
        },
        primary: {
          50:  '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe',
          300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6',
          600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95',
        },
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'float':       'float 3s ease-in-out infinite',
        'fade-in':     'fadeIn 0.22s ease-out',
        'scale-in':    'scaleIn 0.2s ease-out',
        'slide-up':    'slideUpIn 0.25s ease-out',
        'glow-pulse':  'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        float:      { '0%,100%': {transform:'translateY(0px)'}, '50%': {transform:'translateY(-8px)'} },
        fadeIn:     { '0%': {opacity:'0',transform:'translateY(6px)'}, '100%': {opacity:'1',transform:'translateY(0)'} },
        scaleIn:    { '0%': {opacity:'0',transform:'scale(0.92)'},     '100%': {opacity:'1',transform:'scale(1)'} },
        slideUpIn:  { '0%': {opacity:'0',transform:'translateY(12px)'},'100%': {opacity:'1',transform:'translateY(0)'} },
        glowPulse:  { '0%,100%': {boxShadow:'0 0 20px rgba(124,58,237,0.3)'}, '50%': {boxShadow:'0 0 40px rgba(124,58,237,0.6)'} },
      },
      screens: { xs: '375px' },
      backdropBlur: { '2xl': '36px' },
    },
  },
  plugins: [],
}
