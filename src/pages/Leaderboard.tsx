import { motion } from 'framer-motion';
import LeaderboardTable from '../components/LeaderboardTable';

const tracks = [
  { label: 'Streak',       desc: 'Days of unbroken commitment',    color: '#D4AF37' },
  { label: 'Prime Points', desc: 'Total PP earned through effort', color: '#A1A1AA' },
  { label: 'Trials',       desc: 'Daily commitments completed',    color: '#2ECC71' },
];

export default function Leaderboard() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-5 sm:px-6">

      {/* ── Hero header ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="card-hero relative overflow-hidden p-8 sm:p-10"
      >
        {/* Ghost wordmark */}
        <div
          className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 select-none font-black leading-none"
          style={{ fontSize: 'clamp(6rem, 20vw, 11rem)', color: 'rgba(212,175,55,0.025)', letterSpacing: '-0.05em' }}
        >
          01
        </div>

        <span className="badge badge-gold mb-5">Global Standing</span>
        <h1 className="text-display text-white">The Ranks</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed" style={{ color: '#4A4A4A' }}>
          Consistency is status. These rankings reflect who actually shows up — day after day, regardless of motivation.
        </p>

        {/* Track pills */}
        <div className="mt-6 flex flex-wrap gap-2.5">
          {tracks.map((t) => (
            <div
              key={t.label}
              className="rounded-2xl px-4 py-2.5"
              style={{ background: 'var(--bg-overlay-1)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.color }} />
                <p className="text-xs font-black uppercase tracking-wider text-white">{t.label}</p>
              </div>
              <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Table ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <LeaderboardTable />
      </motion.div>

      {/* ── Closing quote ─────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: 'var(--bg-overlay-1)', border: '1px solid var(--border-ghost)' }}
      >
        <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
          "The standard is set by what you repeat."
        </p>
      </div>
    </div>
  );
}
