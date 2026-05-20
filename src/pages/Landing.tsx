import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Activity, Star } from 'lucide-react';

export default function Landing() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 py-10">
      <section className="rounded-[32px] border border-white/10 bg-surface2 p-8 shadow-soft">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-300">LEVEL UP. EVERY DAY.</p>
            <h1 className="mt-6 text-5xl font-bold tracking-tight text-white sm:text-6xl">IRONGATE — Solo Leveling inspired gym mastery.</h1>
            <p className="mt-6 max-w-2xl text-zinc-300">Launch into a dark dungeon-inspired workout experience built for investors: check-ins, streaks, challenges, ranks, and a polished demo-ready flow powered entirely by localStorage.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/signup" className="btn-primary inline-flex items-center gap-2">
                Get Started <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn-secondary inline-flex items-center gap-2">
                Demo Login
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { icon: Sparkles, title: 'Immersive onboarding', detail: 'From profile creation to rank reveal.' },
              { icon: Activity, title: 'Real check-in simulation', detail: 'Geofence animation and gym verification.' },
              { icon: Star, title: 'Gamified progress', detail: 'XP, streaks, challenges and leaderboards.' },
              { icon: Shield, title: 'Investor-ready admin', detail: 'Reset streaks, award XP, simulate gym presence.' }
            ].map((item) => (
              <motion.div key={item.title} whileHover={{ x: 4 }} className="rounded-3xl border border-white/10 bg-[#07101f] p-5 shadow-soft">
                <div className="flex items-center gap-3 text-glow"><item.icon size={20} /></div>
                <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-zinc-300">{item.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-surface2 p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">Investor demo ready</p>
          <h2 className="mt-4 text-3xl font-semibold text-white">No backend, no friction, all polish.</h2>
          <p className="mt-4 text-zinc-300">Fully working single-tab MVP with persistence, animated flows, and enough heat to impress stakeholders.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-surface2 p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">Dark dungeon aesthetic</p>
          <h2 className="mt-4 text-3xl font-semibold text-white">Glassmorphism, glow, and motion.</h2>
          <p className="mt-4 text-zinc-300">Electric blue gradients, gold streak accents, and cinematic UI details inspired by Solo Leveling.</p>
        </div>
      </section>
    </div>
  );
}
