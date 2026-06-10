import { motion } from 'framer-motion';
import LeaderboardTable from '../components/LeaderboardTable';

export default function Leaderboard() {
  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated relative overflow-hidden p-8"
      >
        <div
          className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-[120px] font-black leading-none select-none"
          style={{ color: 'rgba(212,175,55,0.04)' }}
        >
          ▲
        </div>
        <span className="badge badge-gold mb-4">Global Standing</span>
        <h1 className="text-4xl font-black text-white">The Ranks</h1>
        <p className="mt-2 max-w-sm text-sm" style={{ color: '#4A4A4A' }}>
          Consistency is status. Rankings reflect who actually shows up. Stay committed to hold your position.
        </p>
        <div className="mt-5 flex flex-wrap gap-4">
          {[
            { label: 'Streak', desc: 'Days of unbroken commitment' },
            { label: 'Points', desc: 'Total Prime Points earned' },
            { label: 'Trials', desc: 'Challenges completed' },
          ].map((t) => (
            <div
              key={t.label}
              className="rounded-xl px-4 py-2"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-xs font-black uppercase tracking-wider text-white">{t.label}</p>
              <p className="mt-0.5 text-[11px]" style={{ color: '#3A3A3A' }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <LeaderboardTable />

      {/* Bottom manifesto */}
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
      >
        <p className="text-xs italic" style={{ color: '#3A3A3A' }}>
          "The standard is set by what you repeat."
        </p>
      </div>
    </div>
  );
}
