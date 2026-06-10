export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0A0A0A',
        surface2: '#111111',
        surface3: '#141414',
        surface4: '#1A1A1A',
        surface5: '#222222',
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
      fontSize: {
        hero: ['clamp(5rem, 18vw, 9.5rem)', { letterSpacing: '-0.04em', lineHeight: '1', fontWeight: '900' }],
        display: ['clamp(2.25rem, 5.5vw, 3.5rem)', { letterSpacing: '-0.03em', lineHeight: '1.05', fontWeight: '900' }],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
        '5xl': '2rem',
      },
      boxShadow: {
        gold:        '0 0 30px rgba(212,175,55,0.32)',
        'gold-sm':   '0 0 14px rgba(212,175,55,0.22)',
        'gold-lg':   '0 0 70px rgba(212,175,55,0.22)',
        'gold-hero': '0 0 100px rgba(212,175,55,0.18), 0 0 200px rgba(212,175,55,0.06)',
        success:     '0 0 30px rgba(46,204,113,0.32)',
        error:       '0 0 30px rgba(231,76,60,0.32)',
        soft:        '0 24px 80px rgba(0,0,0,0.65)',
        card:        '0 4px 40px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.035)',
        'card-hero': '0 20px 80px rgba(0,0,0,0.75), inset 0 1px 0 rgba(212,175,55,0.07)',
        modal:       '0 32px 96px rgba(0,0,0,0.9)',
        inner:       'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      backgroundImage: {
        prime:                'radial-gradient(ellipse 130% 55% at 50% -10%, rgba(212,175,55,0.065) 0%, transparent 62%)',
        'gradient-gold':      'linear-gradient(135deg, #D4AF37 0%, #E5C158 100%)',
        'gradient-gold-dark': 'linear-gradient(135deg, #B8962E 0%, #D4AF37 100%)',
        'gradient-success':   'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
        'gradient-brand':     'linear-gradient(135deg, #D4AF37 0%, #E5C158 60%, #F0D060 100%)',
        shimmer:              'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.1) 50%, transparent 100%)',
      },
      backgroundSize: {
        '200': '200% 100%',
      },
      animation: {
        shimmer:       'shimmer 3s linear infinite',
        'pulse-gold':  'breatheGold 4s ease-in-out infinite',
        'breathe':     'breatheGold 4s ease-in-out infinite',
        float:         'float 5s ease-in-out infinite',
        'fade-up':     'fadeUp 0.5s ease-out forwards',
        'scale-in':    'scaleIn 0.3s ease-out forwards',
        'scan-line':   'scanLine 3s ease-in-out infinite',
        ring:          'ring 1.8s ease-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        breatheGold: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212,175,55,0.12), 0 0 50px rgba(212,175,55,0.04)' },
          '50%':      { boxShadow: '0 0 44px rgba(212,175,55,0.32), 0 0 100px rgba(212,175,55,0.1)' },
        },
        ring: {
          '0%':   { transform: 'scale(1)',   opacity: '0.7' },
          '100%': { transform: 'scale(1.7)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scanLine: {
          '0%':   { transform: 'translateY(-100%)', opacity: '0.6' },
          '100%': { transform: 'translateY(400%)',  opacity: '0' },
        },
      },
    }
  },
  plugins: []
};
