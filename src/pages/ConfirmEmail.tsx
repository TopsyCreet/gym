import { useLocation, useNavigate } from 'react-router-dom';

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 py-10">
      <div className="rounded-[32px] border border-white/10 bg-surface2 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Confirm your email</p>
        <h1 className="mt-4 text-4xl font-bold text-white">Almost there</h1>
        <p className="mt-4 text-zinc-300">
          We sent a confirmation email{email ? ` to ${email}` : ''}. Open your inbox and click the link to activate your IRONGATE account.
        </p>
        <div className="mt-8 space-y-4 text-sm text-zinc-300">
          <p>If you do not see the email, check your spam folder or try again with the correct address.</p>
          <p>Once confirmed, use the button below to return to the login page and sign in.</p>
        </div>
        <div className="mt-8 flex gap-3 flex-wrap">
          <button type="button" onClick={() => navigate('/login')} className="btn-primary">
            Go to Login
          </button>
          <button type="button" onClick={() => navigate('/')} className="btn-secondary">
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
