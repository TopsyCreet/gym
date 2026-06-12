import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import logoPng from '../assets/brand/logo.png';
import mascotHappy from '../assets/brand/mascot_happy.png';

const up = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.65, ease: [0.22, 1, 0.36, 1] },
});

const ranks = [
  { name: 'Initiate', color: '#A1A1AA' },
  { name: 'Forged',   color: '#CD853F' },
  { name: 'Vanguard', color: '#4A90D9' },
  { name: 'Elite',    color: '#2ECC71' },
  { name: 'Prime',    color: '#D4AF37' },
  { name: 'Monarch',  color: '#E5C158' },
];

const pillars = [
  {
    title: 'The Streak Engine',
    body: 'Every session is proof. Miss a scheduled day and the record resets. Consistency is not optional — it is the product.',
    color: '#D4AF37',
    symbol: '▲',
  },
  {
    title: 'Evidence-Based Ranks',
    body: 'Rank is not self-declared. Check-ins drive promotion — 10 to Forged, 25 to Vanguard, 50 to Elite, 100 to Prime, 200 to Monarch.',
    color: '#A1A1AA',
    symbol: '◆',
  },
  {
    title: 'Gym Community',
    body: 'Compete within your gym each month. Pure consistency, no artificial scores. Give kudos to members who show up.',
    color: '#2ECC71',
    symbol: '◇',
  },
  {
    title: 'Daily Trials',
    body: 'Three challenges rotate every day — strength, endurance, recovery. Completing them compounds the record beyond attendance alone.',
    color: '#4A90D9',
    symbol: '⬡',
  },
];

const stats = [
  { value: '10K+', label: 'Members' },
  { value: '2.4M', label: 'Sessions Proved' },
  { value: '97%',  label: 'Streak Retention' },
  { value: '6',    label: 'Rank Tiers' },
];

export default function Landing() {
  return (
    <div className="mx-auto max-w-7xl">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-24 pt-20 text-center sm:pt-40">

        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 62%)' }}
          />
        </div>

        {/* Brand mark */}
        <motion.div {...up(0)} className="mb-8 flex justify-center">
          <div className="relative h-20 w-20">
            <div
              className="absolute inset-0 rounded-3xl opacity-25 blur-[20px]"
              style={{ background: '#D4AF37' }}
            />
            <img src={logoPng} alt="PRIME" className="relative h-20 w-20 object-contain" />
          </div>
        </motion.div>

        {/* Mascot — peeking in from bottom-right of hero */}
        <img
          src={mascotHappy}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-4 sm:right-10 select-none"
          style={{ width: 130, opacity: 0.88, transform: 'rotate(-6deg)' }}
        />

        {/* Eyebrow */}
        <motion.div
          {...up(0.04)}
          className="mb-10 inline-flex items-center gap-2.5 rounded-full px-4 py-2"
          style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.14)' }}
        >
          <span className="status-dot status-gold" />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.28em]"
            style={{ color: '#D4AF37' }}
          >
            The Operating System For Discipline
          </span>
        </motion.div>

        {/* Wordmark */}
        <motion.h1
          {...up(0.06)}
          className="mx-auto font-black leading-none tracking-tighter text-white"
          style={{ fontSize: 'clamp(5rem, 22vw, 14rem)', letterSpacing: '-0.04em' }}
        >
          PRIME
        </motion.h1>

        <motion.p
          {...up(0.13)}
          className="mx-auto mt-4 text-xs font-bold uppercase tracking-[0.4em]"
          style={{ color: 'var(--text-faint)' }}
        >
          Not for everyone. For those who refuse to quit.
        </motion.p>

        {/* Sub copy */}
        <motion.p
          {...up(0.2)}
          className="mx-auto mt-8 max-w-sm text-base leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          Prime rewards one thing: consistency. Every visit proves commitment. Every streak earns rank. Every rank becomes identity.
        </motion.p>

        {/* CTAs */}
        <motion.div {...up(0.28)} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link to="/signup" className="btn-primary px-10 py-4 text-sm">
            Begin Your Record <ArrowRight size={14} />
          </Link>
          <Link to="/login" className="btn-secondary px-8 py-4 text-sm">
            Sign In
          </Link>
        </motion.div>

        {/* Rank tiers parade */}
        <motion.div {...up(0.38)} className="mt-14 flex flex-wrap items-center justify-center gap-3">
          {ranks.map((rank, i) => (
            <motion.div
              key={rank.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.07, duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
              style={{
                background: `${rank.color}08`,
                border: `1px solid ${rank.color}1a`,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: rank.color, boxShadow: `0 0 5px ${rank.color}` }}
              />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: `${rank.color}cc` }}
              >
                {rank.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────────── */}
      <section className="px-4 pb-20">
        <motion.div
          {...up(0)}
          className="mx-auto grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl sm:grid-cols-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          {stats.map((s) => (
            <div key={s.label} className="px-6 py-7" style={{ background: 'var(--bg-base)' }}>
              <p className="text-3xl font-black tracking-tight text-white">{s.value}</p>
              <p className="mt-1 label">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Divider */}
      <div className="divider mx-4" />

      {/* ── Manifesto ───────────────────────────────────────────── */}
      <section className="px-4 py-20">
        <motion.div {...up(0)} className="relative overflow-hidden rounded-[1.5rem] px-8 py-14 text-center sm:px-16"
          style={{ background: 'rgba(212,175,55,0.025)', border: '1px solid rgba(212,175,55,0.08)' }}
        >
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)' }}
          />
          <p className="mx-auto max-w-sm text-xs font-bold uppercase tracking-[0.3em]" style={{ color: '#D4AF37' }}>
            The Prime Manifesto
          </p>
          <h2 className="mx-auto mt-5 max-w-xl text-4xl font-black leading-tight text-white sm:text-5xl">
            Greatness is built through repetition.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Not talent. Not luck. Not a single defining moment. Greatness is the person who showed up — again — when it would have been easier to stop.
          </p>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Every streak is proof. Every visit is evidence. Every rank is earned.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/signup" className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-sm">
              Begin Your Record <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Four Pillars ─────────────────────────────────────────── */}
      <section className="px-4 pb-20">
        <div className="mb-12 text-center">
          <p className="label tracking-[0.3em]">The System</p>
          <h2 className="mt-3 text-4xl font-black text-white">
            Built for{' '}
            <span className="gradient-text">those who do the work.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Not a habit tracker. Not a workout app. An operating system for people who already know what they need to do — and need proof that they did it.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3 }}
              className="card group cursor-default p-6"
            >
              <div
                className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl text-lg font-black transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: `${p.color}0d`,
                  border: `1px solid ${p.color}1a`,
                  color: p.color,
                }}
              >
                {p.symbol}
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">{p.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{p.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Closing mottos ─────────────────────────────────────── */}
      <section className="px-4 pb-20">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            '"Consistency is status."',
            '"The standard is set by what you repeat."',
            '"Small actions become powerful identities."',
          ].map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.5 }}
              className="rounded-2xl p-6 text-center"
              style={{ background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <p className="text-sm italic font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{m}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
