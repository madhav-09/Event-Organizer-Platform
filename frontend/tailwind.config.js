export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0effe',
          100: '#e3e0fd',
          200: '#cac5fb',
          300: '#a89af8',
          400: '#8467f3',
          500: '#6c47ec',
          600: '#5c29e1',
          700: '#4e1cc8',
          800: '#4119a3',
          900: '#371983',
          950: '#22105a',
        },
        surface: {
          900: '#0B0F1A',
          800: '#121827',
          700: '#1a2235',
          600: '#1f2a3f',
          500: '#263348',
          400: '#304060',
        },
        glass: {
          white: 'rgba(255,255,255,0.07)',
          border: 'rgba(255,255,255,0.10)',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #6c47ec 0%, #2563eb 100%)',
        'brand-gradient-r': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        'hero-gradient': 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(120, 60, 250, 0.3), transparent)',
      },
      boxShadow: {
        'glow': '0 0 40px -8px rgba(108, 71, 236, 0.7)',
        'glow-sm': '0 0 20px -4px rgba(108, 71, 236, 0.5)',
        'glow-indigo': '0 0 40px -8px rgba(79, 70, 229, 0.7)',
        'card': '0 4px 24px -6px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 20px 60px -10px rgba(0, 0, 0, 0.6)',
        'glass': 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 24px rgba(0,0,0,0.2)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'scale-in': 'scaleIn 0.4s ease forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'slide-down': 'slideDown 0.3s ease forwards',
        'slide-up': 'slideUp 0.3s ease forwards',
        'pulse-glow': 'pulseGlow 2s infinite',
        'spin-slow': 'spin 8s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0,0,0.2,1) infinite',
        'blob': 'blob 12s infinite',
        'blob-delay': 'blob 12s 4s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(108, 71, 236, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(108, 71, 236, 0)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(60px, -50px) scale(1.2)' },
          '66%': { transform: 'translate(-30px, 40px) scale(0.8)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
