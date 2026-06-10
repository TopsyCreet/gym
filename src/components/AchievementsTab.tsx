import { motion } from 'framer-motion';
import { allAchievements } from '../data/achievements';

interface AchievementsTabProps {
  userAchievements: string[];
}

export default function AchievementsTab({ userAchievements }: AchievementsTabProps) {
  const achieved = new Set(userAchievements);
  const achievedCount = userAchievements.length;
  const totalCount = allAchievements.length;
  const pct = Math.round((achievedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="label tracking-[0.25em]">Milestone Progress</p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {achievedCount} <span style={{ color: '#3A3A3A' }}>/ {totalCount}</span>
          </h2>
          <p className="mt-1 text-xs" style={{ color: '#4A4A4A' }}>
            {achievedCount === 0
              ? 'Discipline is built one action at a time.'
              : achievedCount === totalCount
              ? 'All milestones cleared. The standard is set.'
              : 'Every milestone is earned, not given.'}
          </p>
        </div>
        <div className="text-right">
          <div
            className="text-3xl font-black"
            style={{ color: pct >= 80 ? '#D4AF37' : pct >= 40 ? '#B3B3B3' : '#3A3A3A' }}
          >
            {pct}%
          </div>
          <p className="text-xs" style={{ color: '#4A4A4A' }}>Earned</p>
        </div>
      </div>

      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(achievedCount / totalCount) * 100}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #B8962E, #D4AF37, #E5C158)' }}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {allAchievements.map((milestone, index) => {
          const isEarned = achieved.has(milestone.id);
          return (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-2xl p-4 transition"
              style={{
                background: isEarned ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.02)',
                border: isEarned ? '1px solid rgba(212,175,55,0.2)' : '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                  style={{
                    background: isEarned ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
                    color: isEarned ? '#D4AF37' : '#3A3A3A',
                    border: isEarned ? '1px solid rgba(212,175,55,0.2)' : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {milestone.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-sm font-bold leading-tight"
                    style={{ color: isEarned ? '#FFFFFF' : '#3A3A3A' }}
                  >
                    {milestone.name}
                  </h3>
                  <p className="mt-0.5 text-xs leading-snug" style={{ color: isEarned ? '#6B6B6B' : '#2A2A2A' }}>
                    {milestone.description}
                  </p>
                </div>
                {isEarned && (
                  <div
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-black"
                    style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}
                  >
                    ✓
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
