import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/dashboard',   label: 'Home' },
  { href: '/leaderboard', label: 'Ranks' },
  { href: '/profile',     label: 'Profile' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.getUser());
  const logout = useAuthStore((state) => state.logout);

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50"
    >
      <div
        style={{
          background: 'var(--bg-navbar)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">

          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="group flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
              <div
                className="absolute inset-0 rounded-[10px] opacity-20 blur-[10px] transition-opacity group-hover:opacity-35"
                style={{ background: '#D4AF37' }}
              />
              <div
                className="relative flex h-9 w-9 items-center justify-center rounded-[10px] text-[10px] font-black text-black"
                style={{ background: 'linear-gradient(145deg, #E5C158, #D4AF37, #B8962E)' }}
              >
                ▲
              </div>
            </div>
            <div className="hidden sm:block">
              <p className="label leading-none tracking-[0.3em]">Operating System</p>
              <p className="mt-0.5 text-sm font-black leading-none tracking-[0.15em] text-white uppercase">
                Prime
              </p>
            </div>
          </button>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {links.map((link) => {
              const active = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="relative rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-150"
                  style={{ color: active ? 'var(--text-primary)' : 'var(--text-muted)' }}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'var(--bg-overlay-3)', border: '1px solid var(--border-faint)' }}
                      transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center justify-center rounded-xl transition-colors hover:bg-white/[0.06]"
                  style={{ width: 36, height: 36, color: 'var(--text-muted)' }}
                  title="Sign out"
                >
                  <LogOut size={15} />
                </button>

                {user.avatar ? (
                  <button type="button" onClick={() => navigate('/profile')}>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover transition-opacity hover:opacity-80"
                      style={{ border: '1px solid rgba(212,175,55,0.25)' }}
                      title={user.name}
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black transition-opacity hover:opacity-80"
                    style={{ background: 'linear-gradient(145deg, #E5C158, #D4AF37)' }}
                    title={user.name}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost py-2 text-xs">Sign In</Link>
                <Link to="/signup" className="btn-primary py-2 text-xs px-5">Begin</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Demo hint strip */}
      {!user && (
        <div style={{ background: 'rgba(212,175,55,0.025)', borderBottom: '1px solid rgba(212,175,55,0.06)' }}>
          <p className="py-1.5 text-center text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Demo ·{' '}
            <span className="font-mono" style={{ color: 'var(--text-faint)' }}>demo@prime.app</span>
            {' / '}
            <span className="font-mono" style={{ color: 'var(--text-faint)' }}>demo1234</span>
          </p>
        </div>
      )}
    </motion.header>
  );
}
