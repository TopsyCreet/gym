import LeaderboardTable from '../components/LeaderboardTable';

export default function Leaderboard() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-surface2 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-300">The arena</p>
        <h1 className="mt-4 text-4xl font-bold text-white">Global leaderboard</h1>
        <p className="mt-3 text-zinc-300">Watch your rank climb as you earn streaks, XP, and challenge completions.</p>
      </section>
      <LeaderboardTable />
    </div>
  );
}
