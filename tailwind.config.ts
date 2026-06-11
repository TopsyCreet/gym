import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ── COLOR TOKENS ──────────────────────────────────────────
      colors: {
        // Backgrounds (dark theme — primary)
        base:     '#0E0F11',
        surface:  '#1A1C1F',
        elevated: '#22252A',
        overlay:  '#2A2D32',

        // Prime Gold — primary accent
        gold: {
          DEFAULT: '#D4A017',
          light:   '#E5B830',
          muted:   '#B8882E',
          dark:    '#966E1A',
          faint:   'rgba(212,160,23,0.12)',
        },

        // Supporting accent — steel blue (data viz, info)
        steel: {
          DEFAULT: '#3D7FD4',
          light:   '#5A96E0',
          muted:   '#2E65AE',
          faint:   'rgba(61,127,212,0.12)',
        },

        // Semantic
        success: '#27AE60',
        warning: '#F39C12',
        error:   '#E74C3C',
        info:    '#3D7FD4',

        // Rank colors (unchanged — identity layer)
        rank: {
          initiate: '#A1A1AA',
          forged:   '#CD853F',
          vanguard: '#4A90D9',
          elite:    '#2ECC71',
          prime:    '#D4AF37',
          monarch:  '#E5C158',
        },
      },

      // ── TYPOGRAPHY ────────────────────────────────────────────
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
        sans:    ['Inter', 'system-ui', 'sans-serif'], // Tailwind default
      },
      fontSize: {
        // Strict scale — no ad-hoc sizes
        micro:   ['0.625rem',  { lineHeight: '1', letterSpacing: '0.06em' }],
        caption: ['0.75rem',   { lineHeight: '1.4', letterSpacing: '0.01em' }],
        body:    ['0.9375rem', { lineHeight: '1.6' }],
        h2:      ['1.25rem',   { lineHeight: '1.3', fontWeight: '800', letterSpacing: '-0.01em' }],
        h1:      ['1.875rem',  { lineHeight: '1.1', fontWeight: '900', letterSpacing: '-0.025em' }],
        display: ['clamp(2.25rem,5.5vw,3.5rem)', { lineHeight: '1.05', fontWeight: '900', letterSpacing: '-0.03em' }],
        hero:    ['clamp(4rem,14vw,9rem)',        { lineHeight: '1',    fontWeight: '900', letterSpacing: '-0.04em' }],
      },

      // ── SPACING (4px grid) ────────────────────────────────────
      spacing: {
        px:   '1px',
        0:    '0',
        0.5:  '2px',
        1:    '4px',
        1.5:  '6px',
        2:    '8px',
        2.5:  '10px',
        3:    '12px',
        3.5:  '14px',
        4:    '16px',
        5:    '20px',
        6:    '24px',
        7:    '28px',
        8:    '32px',
        9:    '36px',
        10:   '40px',
        11:   '44px',
        12:   '48px',
        14:   '56px',
        16:   '64px',
        18:   '72px',
        20:   '80px',
        24:   '96px',
        28:   '112px',
        32:   '128px',
        36:   '144px',
        40:   '160px',
        44:   '176px',
        48:   '192px',
        52:   '208px',
        56:   '224px',
        60:   '240px',
        64:   '256px',
        72:   '288px',
        80:   '320px',
        96:   '384px',
      },

      // ── RADII ─────────────────────────────────────────────────
      borderRadius: {
        none: '0',
        sm:   '4px',
        md:   '8px',
        lg:   '12px',
        xl:   '16px',
        '2xl':'20px',
        '3xl':'24px',
        '4xl':'32px',
        full: '9999px',
        card:       '20px',
        'card-hero':'24px',
        btn:        '9999px',
        input:      '14px',
        badge:      '9999px',
        icon:       '12px',
      },

      // ── SHADOWS ───────────────────────────────────────────────
      boxShadow: {
        card:       '0 4px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
        'card-hero':'0 16px 64px rgba(0,0,0,0.75), inset 0 1px 0 rgba(212,160,23,0.07)',
        'card-light':'0 2px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)',
        gold:       '0 0 28px rgba(212,160,23,0.30)',
        'gold-sm':  '0 0 12px rgba(212,160,23,0.22)',
        'gold-lg':  '0 0 60px rgba(212,160,23,0.22)',
        steel:      '0 0 24px rgba(61,127,212,0.28)',
        success:    '0 0 24px rgba(39,174,96,0.30)',
        error:      '0 0 24px rgba(231,76,60,0.30)',
        ring:       '0 0 0 3px rgba(212,160,23,0.18)',
        inner:      'inset 0 1px 0 rgba(255,255,255,0.05)',
        modal:      '0 32px 96px rgba(0,0,0,0.9)',
      },

      // ── MOTION DURATIONS (as Tailwind custom utilities) ────────
      transitionDuration: {
        micro:       '150',
        standard:    '250',
        emphasized:  '400',
        celebration: '1200',
      },

      // ── ANIMATIONS ────────────────────────────────────────────
      animation: {
        shimmer:      'shimmer 2.8s linear infinite',
        breathe:      'breathe 4s ease-in-out infinite',
        float:        'float 5s ease-in-out infinite',
        'fade-up':    'fadeUp 0.5s ease-out forwards',
        'scale-in':   'scaleIn 0.28s ease-out forwards',
        'ring-pulse': 'ringPulse 1.8s ease-out infinite',
        blink:        'blink 3.5s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        breathe: {
          '0%,100%': { transform: 'scale(1)' },
          '50%':     { transform: 'scale(1.018)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-6px)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.93)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        ringPulse: {
          '0%':   { transform: 'scale(1)',   opacity: '0.7' },
          '100%': { transform: 'scale(1.65)',opacity: '0' },
        },
        blink: {
          '0%,96%,100%': { opacity: '1' },
          '98%':         { opacity: '0' },
        },
      },

      backgroundImage: {
        prime:            'radial-gradient(ellipse 130% 55% at 50% -10%, rgba(212,160,23,0.06) 0%, transparent 62%)',
        'gradient-gold':  'linear-gradient(135deg, #D4A017 0%, #E5B830 100%)',
        'gradient-steel': 'linear-gradient(135deg, #3D7FD4 0%, #5A96E0 100%)',
        shimmer:          'linear-gradient(90deg, transparent 0%, rgba(212,160,23,0.1) 50%, transparent 100%)',
      },
      backgroundSize: {
        '200': '200% 100%',
      },
    },
  },
  plugins: [],
};

export default config;
