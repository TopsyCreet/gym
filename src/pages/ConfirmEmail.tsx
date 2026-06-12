import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email;

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="card p-8 text-center">
          <p className="label tracking-[0.25em]">One More Step</p>
          <h1 className="mt-3 text-3xl font-black text-white">Confirm your email.</h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            We sent a confirmation link{email ? <> to <span className="font-semibold text-white">{email}</span></> : ''}.
            Open your inbox and click the link to activate your Prime account.
          </p>

          <div
            className="mx-auto mt-6 max-w-sm rounded-xl p-4 text-left"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
              Don't see it? Check your spam folder or try again with the correct address.
            </p>
            <p className="mt-2 text-xs" style={{ color: 'var(--text-faint)' }}>
              Once confirmed, sign in below to begin your record.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button type="button" onClick={() => navigate('/login')} className="btn-primary gap-2">
              Sign In <ArrowRight size={14} />
            </button>
            <button type="button" onClick={() => navigate('/')} className="btn-secondary">
              Return Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
