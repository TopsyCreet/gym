export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#07070E',
        surface2: '#0C0E1A',
        surface3: '#111426',
        glow: '#5B8EF0',
        fire: '#EF4444',
        ember: '#F59E0B',
        jade: '#10B981',
        royal: '#8B5CF6',
        deep: '#040408',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 30px rgba(91,142,240,0.45)',
        'glow-sm': '0 0 14px rgba(91,142,240,0.3)',
        'glow-lg': '0 0 70px rgba(91,142,240,0.3)',
        fire: '0 0 30px rgba(239,68,68,0.45)',
        gold: '0 0 30px rgba(245,158,11,0.4)',
        jade: '0 0 30px rgba(16,185,129,0.4)',
        soft: '0 24px 80px rgba(0,0,0,0.55)',
        card: '0 4px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.055)',
        modal: '0 30px 90px rgba(0,0,0,0.75)',
        inner: 'inset 0 1px 0 rgba(255,255,255,0.07)',
      },
      backgroundImage: {
        dungeon: 'radial-gradient(ellipse 80% 60% at 50% -5%, rgba(91,142,240,0.2) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 85% 105%, rgba(239,68,68,0.09) 0%, transparent 50%)',
        'gradient-fire': 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
        'gradient-power': 'linear-gradient(135deg, #5B8EF0 0%, #8B5CF6 100%)',
        'gradient-gold': 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
        'gradient-jade': 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
        'gradient-brand': 'linear-gradient(135deg, #5B8EF0 0%, #8B5CF6 60%, #EF4444 100%)',
        shimmer: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.09) 50%, transparent 100%)',
      },
      backgroundSize: {
        '200': '200% 100%',
      },
      animation: {
        shimmer: 'shimmer 2.5s linear infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        float: 'float 5s ease-in-out infinite',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 18px rgba(91,142,240,0.3)' },
          '50%': { boxShadow: '0 0 55px rgba(91,142,240,0.7), 0 0 90px rgba(91,142,240,0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-9px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    }
  },
  plugins: []
};
