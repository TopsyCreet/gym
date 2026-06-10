export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0A0A0A',
        surface2: '#121212',
        surface3: '#1A1A1A',
        surface4: '#222222',
        accent: '#D4AF37',
        'accent-hover': '#E5C158',
        'accent-muted': '#B8962E',
        success: '#2ECC71',
        warning: '#F39C12',
        error: '#E74C3C',
        deep: '#050505',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 30px rgba(212,175,55,0.35)',
        'gold-sm': '0 0 14px rgba(212,175,55,0.25)',
        'gold-lg': '0 0 70px rgba(212,175,55,0.25)',
        success: '0 0 30px rgba(46,204,113,0.35)',
        error: '0 0 30px rgba(231,76,60,0.35)',
        soft: '0 24px 80px rgba(0,0,0,0.65)',
        card: '0 4px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
        modal: '0 30px 90px rgba(0,0,0,0.85)',
        inner: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      backgroundImage: {
        prime: 'radial-gradient(ellipse 80% 55% at 50% -5%, rgba(212,175,55,0.12) 0%, transparent 55%), radial-gradient(ellipse 40% 30% at 90% 100%, rgba(212,175,55,0.05) 0%, transparent 50%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #E5C158 100%)',
        'gradient-gold-dark': 'linear-gradient(135deg, #B8962E 0%, #D4AF37 100%)',
        'gradient-success': 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
        'gradient-brand': 'linear-gradient(135deg, #D4AF37 0%, #E5C158 60%, #F0D060 100%)',
        shimmer: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.12) 50%, transparent 100%)',
      },
      backgroundSize: {
        '200': '200% 100%',
      },
      animation: {
        shimmer: 'shimmer 2.5s linear infinite',
        'pulse-gold': 'pulseGold 2.5s ease-in-out infinite',
        float: 'float 5s ease-in-out infinite',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 18px rgba(212,175,55,0.2)' },
          '50%': { boxShadow: '0 0 55px rgba(212,175,55,0.5), 0 0 90px rgba(212,175,55,0.15)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-9px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    }
  },
  plugins: []
};
