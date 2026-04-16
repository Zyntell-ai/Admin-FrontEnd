/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  safelist: [
    'bg-red-500/10','bg-red-500/15','bg-orange-500/10','bg-orange-500/15',
    'bg-amber-500/10','bg-amber-500/15','bg-indigo-500/10','bg-indigo-500/15',
    'bg-emerald-500/10','bg-emerald-500/15','bg-slate-500/10','bg-gold-muted',
    'text-red-400','text-orange-400','text-amber-400','text-indigo-400',
    'text-emerald-400','text-slate-400','text-gold',
    'border-red-500/20','border-orange-500/20','border-amber-500/20',
    'border-indigo-500/20','border-emerald-500/20','border-slate-500/20',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B0F1A',
          50: '#1A2035',
          100: '#141929',
          200: '#0F1525',
          300: '#0B0F1A',
        },
        indigo: {
          DEFAULT: '#4F46E5',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          900: '#1e1b4b',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E8C94A',
          dark: '#B8960C',
          muted: 'rgba(212,175,55,0.15)',
        },
        card: {
          DEFAULT: '#0F1629',
          hover: '#131D35',
          border: 'rgba(255,255,255,0.06)',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(79,70,229,0.2)',
        indigo: '0 0 20px rgba(79,70,229,0.3)',
        gold: '0 0 20px rgba(212,175,55,0.2)',
      },
      backgroundImage: {
        'gradient-indigo': 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #E8C94A 100%)',
        'gradient-card': 'linear-gradient(135deg, #0F1629 0%, #111827 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #0B0F1A 0%, #080C14 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
