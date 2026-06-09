import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, Zap, Trophy, Shield, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Flame,
    title: 'Streak Engine',
    detail: 'Every session builds a flame. Miss a scheduled day and it resets. Stay consistent or start over.',
    iconBg: 'rgba(239,68,68,0.12)',
    iconColor: '#EF4444',
  },
  {
    icon: Zap,
    title: 'XP & Levels',
    detail: 'Every check-in, challenge completion, and milestone earns XP. Rise from Novice to Shadow Monarch.',
    iconBg: 'rgba(91,142,240,0.12)',
    iconColor: '#5B8EF0',
  },
  {
    icon: Trophy,
    title: 'Live Leaderboard',
    detail: 'Compete with your gym crew in real-time. Three tracks: Streak, XP, and Challenges.',
    iconBg: 'rgba(245,158,11,0.12)',
    iconColor: '#F59E0B',
  },
  {
    icon: Shield,
    title: 'Rank System',
    detail: 'Six tiers from Bronze to Shadow Monarch. Your rank is your identity inside the dungeon.',
    iconBg: 'rgba(139,92,246,0.12)',
    iconColor: '#8B5CF6',
  },
];

const stats = [
  { value: '10K+', label: 'Warriors Enrolled' },
  { value: '2.4M', label: 'Gym Check-ins' },
  { value: '97%', label: 'Streak Retention' },
  { value: '6', label: 'Rank Tiers' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
});

export default function Landing() {
  return (
    <div className="mx-auto max-w-7xl">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-16 pt-20 text-center sm:pt-28">

        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/3 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(91,142,240,0.13) 0%, transparent 65%)' }} />
          <div className="absolute right-0 bottom-0 h-[400px] w-[400px] translate-x-1/4 translate-y-1/4 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 65%)' }} />
        </div>

        {/* Eyebrow badge */}
        <motion.div {...fadeUp(0)} className="mb-7 inline-flex items-center gap-2 rounded-full border border-glow/20 bg-glow/10 px-4 py-1.5">
          <Flame size={12} className="text-fire" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-glow">Solo Leveling Gym Mastery</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 {...fadeUp(0.08)} className="mx-auto max-w-4xl text-6xl font-black leading-[0.93] tracking-tight text-white sm:text-8xl">
          ENTER THE
          <span className="mt-2 block gradient-text">IRON GATE</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p {...fadeUp(0.18)} className="mx-auto mt-7 max-w-lg text-base leading-relaxed text-zinc-400 sm:text-lg">
          A dark dungeon-inspired fitness app that turns daily discipline into an RPG. Track streaks, earn XP, and climb the ranks.
        </motion.p>

        {/* CTAs */}
        <motion.div {...fadeUp(0.28)} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link to="/signup" className="btn-primary px-8 py-3 text-base animate-pulse-glow">
            Begin Your Journey <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-secondary px-8 py-3 text-base">
            Demo Login
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div {...fadeUp(0.38)} className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.06] sm:grid-cols-4"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          {stats.map((s) => (
            <div key={s.label} className="bg-surface2/60 px-5 py-5 backdrop-blur-sm">
              <p className="text-3xl font-black tracking-tight text-white">{s.value}</p>
              <p className="mt-1 label">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Divider ─────────────────────────────────────── */}
      <div className="divider mx-4" />

      {/* ── Features ─────────────────────────────────────── */}
      <section className="px-4 pb-16 pt-14">
        <motion.div {...fadeUp(0)} className="mb-10 text-center">
          <p className="label">Why IRONGATE</p>
          <h2 className="mt-3 text-4xl font-black text-white">
            Built for the{' '}
            <span className="gradient-text">serious athlete</span>
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp(0.07 * i)}
              whileHover={{ y: -5, scale: 1.01 }}
              className="card group cursor-default p-6"
            >
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{ background: f.iconBg }}
              >
                <f.icon size={22} style={{ color: f.iconColor }} />
              </div>
              <h3 className="text-base font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{f.detail}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA strip ─────────────────────────────────────── */}
      <section className="px-4 pb-20">
        <motion.div
          {...fadeUp(0)}
          className="card relative overflow-hidden p-10 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(91,142,240,0.08) 0%, rgba(139,92,246,0.06) 50%, rgba(239,68,68,0.05) 100%)' }}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(91,142,240,0.12) 0%, transparent 70%)' }} />
          </div>
          <TrendingUp size={32} className="mx-auto mb-4 text-glow" />
          <h2 className="text-3xl font-black text-white">Ready to level up?</h2>
          <p className="mx-auto mt-3 max-w-sm text-zinc-400">
            Join thousands of warriors who turned gym discipline into an obsession.
          </p>
          <Link to="/signup" className="btn-primary mx-auto mt-7 px-10 py-3 text-base inline-flex">
            Start Free <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

    </div>
  );
}
