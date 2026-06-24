/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  safelist: [
    // Status colours — generated dynamically
    'bg-red-500/10','bg-red-500/15','bg-orange-500/10','bg-orange-500/15',
    'bg-amber-500/10','bg-amber-500/15','border-red-500/20','border-orange-500/20',
    'border-amber-500/20','border-emerald-500/20','border-blue-500/20',
    'text-red-400','text-orange-400','text-amber-400','text-emerald-400','text-blue-400',
    'text-violet-400',
  ],
  theme: {
    extend: {
      colors: {
        // Obsidian surfaces
        obsidian: {
          DEFAULT: '#080B12',
          1: '#0D1117',
          2: '#111827',
          3: '#141E30',
          4: '#1A2640',
        },
        // Aurora blue — primary
        aurora: {
          DEFAULT: '#3B82F6',
          light:   '#93C5FD',
          bright:  '#BFDBFE',
          dim:     'rgba(59,130,246,0.08)',
        },
        // Electric violet — accent
        violet: {
          DEFAULT: '#7C3AED',
          light:   '#A78BFA',
          dim:     'rgba(124,58,237,0.08)',
        },
        // Emerald signal — healthy
        emerald: {
          DEFAULT: '#10B981',
          light:   '#34D399',
          dim:     'rgba(16,185,129,0.08)',
        },
        // Amber insight — warning/revenue
        amber: {
          DEFAULT: '#F59E0B',
          light:   '#FCD34D',
          dim:     'rgba(245,158,11,0.08)',
        },
        // Crimson alert
        crimson: {
          DEFAULT: '#EF4444',
          light:   '#FCA5A5',
          dim:     'rgba(239,68,68,0.08)',
        },
        // Silver mist — text
        silver: {
          DEFAULT: '#E5E7EB',
          2:       '#D1D5DB',
          3:       '#9CA3AF',
          4:       '#6B7280',
          5:       '#374151',
        },
        // Keep legacy card for backwards compat with other pages
        card: {
          DEFAULT: '#0D1117',
          hover:   '#111827',
          border:  'rgba(255,255,255,0.06)',
        },
        // Keep gold for backwards compat
        gold: {
          DEFAULT: '#F59E0B',
          light:   '#FCD34D',
          muted:   'rgba(245,158,11,0.12)',
        },
      },
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        xs:     '0 1px 2px rgba(0,0,0,0.5)',
        sm:     '0 2px 8px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
        md:     '0 4px 20px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07)',
        lg:     '0 8px 40px rgba(0,0,0,0.75)',
        panel:  '0 24px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.06)',
        aurora: '0 0 0 1px rgba(59,130,246,0.2), 0 4px 24px rgba(59,130,246,0.12)',
        violet: '0 0 0 1px rgba(124,58,237,0.2), 0 4px 24px rgba(124,58,237,0.12)',
        // Legacy
        card:        '0 2px 8px rgba(0,0,0,0.55)',
        'card-hover':'0 4px 20px rgba(0,0,0,0.65)',
        indigo:      '0 0 20px rgba(59,130,246,0.3)',
        gold:        '0 0 20px rgba(245,158,11,0.2)',
      },
      backgroundImage: {
        'gradient-aurora':   'linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #7C3AED 100%)',
        'gradient-violet':   'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
        'gradient-emerald':  'linear-gradient(135deg, #059669 0%, #10B981 100%)',
        'gradient-amber':    'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
        'gradient-sidebar':  'linear-gradient(180deg, #0D1117 0%, #080B12 100%)',
        'gradient-indigo':   'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
        'gradient-gold':     'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in':     'fadeIn 0.25s ease-out',
        'slide-in':    'slideIn 0.25s ease-out',
        'ring-spin':   'ring-spin 3s linear infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity:'0', transform:'translateY(6px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        slideIn:   { from: { opacity:'0', transform:'translateX(-8px)' }, to: { opacity:'1', transform:'translateX(0)' } },
        'ring-spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
      },
    },
  },
  plugins: [],
}
