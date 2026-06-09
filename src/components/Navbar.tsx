import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { Shield, Zap } from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/profile', label: 'Profile' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.getUser());
  const logout = useAuthStore((state) => state.logout);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-50"
    >
      <div
        className="border-b border-white/[0.06]"
        style={{ background: 'rgba(7,7,14,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">

          {/* Logo */}
          <button onClick={() => navigate('/')} className="group flex items-center gap-3">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-glow to-royal opacity-70 blur-[6px] transition-opacity group-hover:opacity-100" />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-glow to-royal text-[11px] font-black text-white shadow-glow-sm">
                IG
              </div>
            </div>
            <div className="hidden sm:block text-left">
              <p className="label leading-none">IRONGATE</p>
              <p className="mt-0.5 text-sm font-bold leading-none text-white">Solo Leveling Gym</p>
            </div>
          </button>

          {/* Nav links */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                  location.pathname === link.href ? 'text-white' : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {location.pathname === link.href && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.08]"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="btn-ghost hidden py-2 text-xs sm:inline-flex"
                >
                  <Shield size={13} /> Admin
                </button>
                <button type="button" onClick={logout} className="btn-secondary py-2 text-xs">
                  Sign Out
                </button>
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-glow to-royal text-xs font-bold text-white shadow-glow-sm"
                  title={user.name}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost py-2 text-xs">Sign In</Link>
                <Link to="/signup" className="btn-primary py-2 text-xs">
                  <Zap size={12} /> Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {!user && (
        <div
          className="border-b border-white/[0.04]"
          style={{ background: 'linear-gradient(90deg, rgba(91,142,240,0.06), rgba(139,92,246,0.04), rgba(239,68,68,0.04))' }}
        >
          <p className="py-2 text-center text-[11px] text-zinc-600">
            Demo credentials —{' '}
            <span className="font-mono text-zinc-400">demo@irongate.app</span>
            {' / '}
            <span className="font-mono text-zinc-400">demo1234</span>
          </p>
        </div>
      )}
    </motion.header>
  );
}
