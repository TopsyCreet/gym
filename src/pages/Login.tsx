import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, LogIn } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.getUser());

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    } else {
      setMessage('Invalid credentials. Try demo@irongate.app / demo1234');
    }
  };

  const handleDemo = () => {
    setEmail('demo@irongate.app');
    setPassword('demo1234');
    setMessage('Demo credentials filled. Hit Sign In.');
  };

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo mark */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-glow to-royal text-xl font-black text-white shadow-glow">
            IG
          </div>
          <h1 className="text-3xl font-black text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-500">Sign in to your IRONGATE account</p>
        </div>

        {/* Card */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label block mb-2">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="label block mb-2">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            {message && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg border border-amber-500/20 bg-amber-500/8 px-3 py-2 text-xs text-amber-300"
              >
                {message}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
              style={loading ? { opacity: 0.7 } : {}}
            >
              <LogIn size={15} />
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="divider my-4" />

          <button
            type="button"
            onClick={handleDemo}
            className="btn-secondary w-full text-xs"
          >
            <Zap size={13} /> Auto-fill Demo
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-zinc-600">
          No account?{' '}
          <Link to="/signup" className="text-glow font-semibold hover:underline">
            Create one free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
