import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Activity, Trophy, User } from 'lucide-react';

const tabs = [
  { href: '/dashboard',   label: 'Home',     Icon: Home },
  { href: '/progress',    label: 'Progress', Icon: Activity },
  { href: '/leaderboard', label: 'Ranks',    Icon: Trophy },
  { href: '/profile',     label: 'Profile',  Icon: User },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'var(--bg-bottom-nav)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderTop: '1px solid var(--border-subtle)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-stretch">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              to={href}
              className="relative flex flex-1 flex-col items-center justify-center gap-1.5 transition-colors"
              style={{ minHeight: 58, paddingBlock: '0.875rem' }}
            >
              {/* Active top indicator */}
              {active && (
                <motion.span
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-x-5 top-0 h-px rounded-full"
                  style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}

              <Icon
                size={19}
                strokeWidth={active ? 2.2 : 1.6}
                style={{
                  color: active ? '#D4AF37' : 'var(--text-muted)',
                  transition: 'color 0.18s, stroke-width 0.18s',
                }}
              />
              <span
                className="text-[9px] font-bold uppercase tracking-widest leading-none transition-colors"
                style={{ color: active ? '#D4AF37' : 'var(--text-muted)' }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
