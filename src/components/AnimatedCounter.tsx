import { motion } from 'framer-motion';

export default function AnimatedCounter({ value, label }: { value: number; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-surface2 p-5 text-center shadow-soft"
    >
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </motion.div>
  );
}
