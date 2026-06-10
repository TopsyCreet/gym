import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { Shield, LogOut } from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/leaderboard', label: 'The Ranks' },
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
        className="border-b border-white/[0.05]"
        style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">

          {/* Logo */}
          <button onClick={() => navigate('/')} className="group flex items-center gap-3">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
              <div className="absolute inset-0 rounded-xl bg-accent opacity-20 blur-[8px] transition-opacity group-hover:opacity-40" />
              <div
                className="relative flex h-9 w-9 items-center justify-center rounded-xl text-[10px] font-black text-surface shadow-gold-sm"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #E5C158)' }}
              >
                ▲
              </div>
            </div>
            <div className="hidden sm:block text-left">
              <p className="label leading-none tracking-[0.25em]">Operating System</p>
              <p className="mt-0.5 text-sm font-black leading-none tracking-[0.12em] text-white uppercase">Prime</p>
            </div>
          </button>

          {/* Nav links */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                  location.pathname === link.href ? 'text-white' : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                {location.pathname === link.href && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full border border-white/[0.08] bg-white/[0.05]"
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
                {/* Sign out: icon-only on mobile, text on desktop */}
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center justify-center rounded-xl transition-colors"
                  style={{ minWidth: 36, minHeight: 36, color: '#3A3A3A' }}
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-surface shadow-gold-sm"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #E5C158)' }}
                  title={user.name}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost py-2 text-xs">Sign In</Link>
                <Link to="/signup" className="btn-primary py-2 text-xs">
                  Begin
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {!user && (
        <div
          className="border-b border-white/[0.03]"
          style={{ background: 'rgba(212,175,55,0.03)' }}
        >
          <p className="py-2 text-center text-[11px] text-zinc-700">
            Demo access —{' '}
            <span className="font-mono text-zinc-500">demo@prime.app</span>
            {' / '}
            <span className="font-mono text-zinc-500">demo1234</span>
          </p>
        </div>
      )}
    </motion.header>
  );
}
