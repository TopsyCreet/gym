import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';

const features = [
  {
    symbol: '▲',
    title: 'The Streak Engine',
    detail: 'Every session is proof. Miss a scheduled day and the record resets. Consistency is not optional — it is the product.',
    color: '#D4AF37',
  },
  {
    symbol: '◆',
    title: 'Prime Points',
    detail: 'Every commitment earns progress. Rise from Initiate to Monarch through repeated action, not intention.',
    color: '#B3B3B3',
  },
  {
    symbol: '◇',
    title: 'The Ranks',
    detail: 'Compete globally on three tracks: Streak, Points, and Trials. Your standing reflects your discipline.',
    color: '#2ECC71',
  },
  {
    symbol: '⬡',
    title: 'Six Rank Tiers',
    detail: 'Initiate. Forged. Vanguard. Elite. Prime. Monarch. Each rank is earned — and felt.',
    color: '#4A90D9',
  },
];

const stats = [
  { value: '10K+', label: 'Members' },
  { value: '2.4M', label: 'Commitments Proved' },
  { value: '97%', label: 'Streak Retention' },
  { value: '6', label: 'Rank Tiers' },
];

const mottos = [
  '"Consistency is status."',
  '"The standard is set by what you repeat."',
  '"Small actions become powerful identities."',
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
});

export default function Landing() {
  return (
    <div className="mx-auto max-w-7xl">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-20 pt-24 text-center sm:pt-36">

        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.09) 0%, transparent 65%)' }}
          />
        </div>

        {/* Eyebrow */}
        <motion.div
          {...fadeUp(0)}
          className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: '#D4AF37', boxShadow: '0 0 6px #D4AF37' }}
          />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: '#D4AF37' }}>
            The Operating System For Discipline
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.08)}
          className="mx-auto max-w-3xl text-7xl font-black leading-[0.9] tracking-tight text-white sm:text-9xl"
        >
          PRIME
        </motion.h1>

        <motion.p
          {...fadeUp(0.14)}
          className="mx-auto mt-3 text-sm font-bold uppercase tracking-[0.35em]"
          style={{ color: '#3A3A3A' }}
        >
          Not for everyone. For those who refuse to quit.
        </motion.p>

        {/* Subtext */}
        <motion.p {...fadeUp(0.22)} className="mx-auto mt-8 max-w-md text-base leading-relaxed" style={{ color: '#6B6B6B' }}>
          Prime rewards one thing: consistency. Every visit proves commitment. Every streak earns rank. Every rank becomes identity.
        </motion.p>

        {/* CTAs */}
        <motion.div {...fadeUp(0.3)} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link to="/signup" className="btn-primary px-10 py-3.5 text-sm">
            Begin <ArrowRight size={15} />
          </Link>
          <Link to="/login" className="btn-secondary px-8 py-3.5 text-sm">
            Sign In
          </Link>
        </motion.div>

        {/* Rotating motto */}
        <motion.p
          {...fadeUp(0.4)}
          className="mx-auto mt-12 text-xs italic"
          style={{ color: '#3A3A3A' }}
        >
          {mottos[0]}
        </motion.p>

        {/* Stats row */}
        <motion.div
          {...fadeUp(0.45)}
          className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl sm:grid-cols-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          {stats.map((s) => (
            <div key={s.label} className="px-5 py-6" style={{ background: 'rgba(10,10,10,0.8)' }}>
              <p className="text-3xl font-black tracking-tight text-white">{s.value}</p>
              <p className="mt-1 label">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      <div className="divider mx-4" />

      {/* ── Features ─────────────────────────────────────── */}
      <section className="px-4 pb-20 pt-16">
        <motion.div {...fadeUp(0)} className="mb-12 text-center">
          <p className="label tracking-[0.3em]">The System</p>
          <h2 className="mt-3 text-4xl font-black text-white">
            Built for{' '}
            <span className="gradient-text">high performers.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: '#4A4A4A' }}>
            Not a fitness tracker. Not a habit app. An operating system for the people who do the work anyway — and want proof.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp(0.07 * i)}
              whileHover={{ y: -4 }}
              className="card group cursor-default p-6"
            >
              <div
                className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl text-lg font-black transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: `${f.color}10`,
                  border: `1px solid ${f.color}20`,
                  color: f.color,
                }}
              >
                {f.symbol}
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: '#4A4A4A' }}>{f.detail}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Manifesto strip ─────────────────────────────────────── */}
      <section className="px-4 pb-8">
        <motion.div
          {...fadeUp(0)}
          className="card relative overflow-hidden p-10 text-center"
          style={{ background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.08)' }}
        >
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)' }}
            />
          </div>
          <p className="mx-auto max-w-lg text-3xl font-black leading-tight text-white">
            Greatness is rarely a single moment.
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed" style={{ color: '#4A4A4A' }}>
            It is repetition. It is showing up when nobody is watching. It is choosing progress over comfort. Every streak is proof. Every visit is evidence. Every rank is earned.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/signup" className="btn-primary px-10 py-3.5 text-sm inline-flex items-center gap-2">
              Begin Your Record <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Mottos ─────────────────────────────────────── */}
      <section className="px-4 pb-20 pt-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {mottos.map((m, i) => (
            <motion.div
              key={i}
              {...fadeUp(0.06 * i)}
              className="rounded-2xl p-5 text-center"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <p className="text-sm italic font-medium" style={{ color: '#4A4A4A' }}>{m}</p>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
