import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { allAchievements } from '../data/achievements';

interface AchievementsTabProps {
  userAchievements: string[];
}

export default function AchievementsTab({ userAchievements }: AchievementsTabProps) {
  const achieved = new Set(userAchievements);
  const achievedCount = userAchievements.length;
  const totalCount = allAchievements.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Achievement Progress</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {achievedCount} / {totalCount} Unlocked
          </h2>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-glow">{Math.round((achievedCount / totalCount) * 100)}%</div>
          <p className="text-sm text-zinc-400">Complete</p>
        </div>
      </div>

      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(achievedCount / totalCount) * 100}%` }}
          transition={{ duration: 0.8 }}
          className="h-full bg-gradient-to-r from-glow to-blue-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {allAchievements.map((achievement, index) => {
          const isAchieved = achieved.has(achievement.name);
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-3xl border p-4 transition ${
                isAchieved
                  ? 'border-glow/50 bg-glow/10'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <h3 className={`font-semibold ${isAchieved ? 'text-white' : 'text-zinc-300'}`}>
                        {achievement.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">{achievement.description}</p>
                    </div>
                  </div>
                </div>
                {isAchieved && (
                  <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0 mt-1" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
