import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { Menu, Home, Trophy, User, Shield} from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/profile', label: 'Profile' }
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.getUser());
  const logout = useAuthStore((state) => state.logout);

  return (
    <motion.header
      animate={{ y: 0, opacity: 1 }}
      initial={{ y: -20, opacity: 0 }}
      className="sticky top-0 z-50 border-b border-white/10 bg-surface/95 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 text-white">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-glow to-ember text-sm font-bold shadow-glow">IG</span>
          <div className="hidden sm:block">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">IRONGATE</p>
            <p className="font-semibold text-white">Solo Leveling Gym App</p>
          </div>
        </button>

        <nav className="hidden items-center gap-4 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`rounded-full px-4 py-2 text-sm transition ${location.pathname === link.href ? 'bg-glow/15 text-white' : 'text-zinc-300 hover:bg-white/5'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="btn-secondary hidden sm:inline-flex items-center gap-2"
              >
                <Shield size={16} /> Admin
              </button>
              <button type="button" onClick={logout} className="btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/signup" className="btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
      {!user && (
        <div className="border-t border-white/10 bg-surface2 px-4 py-3 text-center text-sm text-zinc-300">
          Demo Mode ready: use <strong>demo@irongate.app</strong> / <strong>demo1234</strong> or tap Login for one-click demo.
        </div>
      )}
    </motion.header>
  );
}
