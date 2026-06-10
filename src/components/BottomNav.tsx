import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const tabs = [
  { href: '/dashboard', label: 'Home', icon: '▲' },
  { href: '/leaderboard', label: 'Ranks', icon: '◆' },
  { href: '/profile', label: 'Profile', icon: '◉' },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(10,10,10,0.96)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-stretch">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors"
              style={{ minHeight: 56 }}
            >
              {active && (
                <motion.span
                  layoutId="bottom-nav-active"
                  className="absolute inset-x-3 top-0 h-0.5 rounded-full"
                  style={{ background: '#D4AF37' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <span
                className="text-base leading-none transition-colors"
                style={{ color: active ? '#D4AF37' : '#3A3A3A' }}
              >
                {tab.icon}
              </span>
              <span
                className="text-[10px] font-semibold uppercase tracking-widest leading-none transition-colors"
                style={{ color: active ? '#D4AF37' : '#3A3A3A' }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
