import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const login = useAuthStore((state) => state.login);
  const authError = useAuthStore((state) => state.error);
  const user = useAuthStore((state) => state.getUser());

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setMessage(authError || 'Invalid credentials. Use demo@irongate.app / demo1234.');
    }
  };

  const handleDemo = () => {
    setEmail('demo@irongate.app');
    setPassword('demo1234');
    setMessage('Demo credentials filled. Submit to login.');
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 py-10">
      <div className="rounded-[32px] border border-white/10 bg-surface2 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Welcome back</p>
        <h1 className="mt-4 text-4xl font-bold text-white">Sign in to IRONGATE</h1>
        <p className="mt-4 text-zinc-300">Use the demo credentials or sign in with your own account to access the gym dashboard.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block text-sm text-zinc-300">
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-glow"
              type="email"
            />
          </label>
          <label className="block text-sm text-zinc-300">
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-glow"
              type="password"
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button type="submit" className="btn-primary">Sign In</button>
            <button type="button" onClick={handleDemo} className="btn-secondary">Auto Fill Demo</button>
          </div>
          {(message || authError) && <p className="text-sm text-amber-300">{message || authError}</p>}
        </form>
      </div>
    </div>
  );
}
