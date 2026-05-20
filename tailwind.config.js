export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0A0A0F',
        surface2: '#11131E',
        glow: '#3B82F6',
        ember: '#F59E0B',
        deep: '#081225'
      },
      boxShadow: {
        glow: '0 0 45px rgba(59, 130, 246, 0.25)',
        soft: '0 24px 80px rgba(0,0,0,0.35)'
      },
      backgroundImage: {
        dungeon: 'radial-gradient(circle at top, rgba(59,130,246,0.14), transparent 30%), radial-gradient(circle at bottom right, rgba(245,158,11,0.12), transparent 25%)'
      }
    }
  },
  plugins: []
};
