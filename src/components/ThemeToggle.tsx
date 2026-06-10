import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

export default function ThemeToggle() {
  const { theme, toggle } = useThemeStore();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      className="relative flex shrink-0 items-center rounded-full p-1 transition-all duration-300"
      style={{
        width: 50,
        height: 26,
        background: isLight ? 'rgba(212,175,55,0.14)' : 'rgba(255,255,255,0.06)',
        border: isLight
          ? '1px solid rgba(212,175,55,0.28)'
          : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <motion.div
        animate={{ x: isLight ? 23 : 0 }}
        transition={{ type: 'spring', stiffness: 540, damping: 36 }}
        className="flex h-[18px] w-[18px] items-center justify-center rounded-full"
        style={{
          background: isLight
            ? 'linear-gradient(145deg, #E5C158, #D4AF37)'
            : '#2A2A2A',
          boxShadow: isLight ? '0 0 8px rgba(212,175,55,0.5)' : 'none',
        }}
      >
        {isLight ? (
          <Sun size={10} color="#0A0A0A" strokeWidth={2.5} />
        ) : (
          <Moon size={10} color="#666666" strokeWidth={2} />
        )}
      </motion.div>
    </button>
  );
}
