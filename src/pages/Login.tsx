import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.getUser());

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (success) {
      navigate('/dashboard');
    } else {
      setMessage('Invalid credentials. Try demo@prime.app / demo1234');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo mark */}
        <div className="mb-10 text-center">
          <div className="relative mx-auto mb-6 h-16 w-16">
            <div
              className="absolute inset-0 rounded-[1.125rem] opacity-25 blur-[14px]"
              style={{ background: '#D4AF37' }}
            />
            <div
              className="relative flex h-16 w-16 items-center justify-center rounded-[1.125rem] text-xl font-black text-black"
              style={{ background: 'linear-gradient(145deg, #E5C158, #D4AF37, #B8962E)' }}
            >
              ▲
            </div>
          </div>
          <h1 className="text-3xl font-black text-white">Welcome back.</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Continue your record.
          </p>
        </div>

        {/* Form card */}
        <div className="card p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label mb-2 block">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label mb-2 block">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {message && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl px-4 py-3 text-xs"
                style={{ background: 'rgba(243,156,18,0.06)', border: '1px solid rgba(243,156,18,0.16)', color: '#F39C12' }}
              >
                {message}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
              style={isLoading ? { opacity: 0.7 } : {}}
            >
              {isLoading ? 'Signing in…' : 'Sign In'}
              {!isLoading && <ArrowRight size={14} />}
            </button>
          </form>

          <div className="divider my-5" />

          <button
            type="button"
            onClick={() => { setEmail('demo@prime.app'); setPassword('demo1234'); setMessage(''); }}
            className="btn-ghost w-full justify-center text-xs"
          >
            Use demo account
          </button>
        </div>

        <p className="mt-5 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          No account?{' '}
          <Link to="/signup" className="font-semibold text-white hover:underline">
            Begin here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
