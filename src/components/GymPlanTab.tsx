import { motion } from 'framer-motion';
import { useState } from 'react';
import { AVAILABLE_WORKOUTS, WorkoutType, defaultWorkoutPlan, getWorkoutColor } from '../data/workoutPlans';
import { daysOfWeek } from '../utils/streakCalculator';

interface GymPlanTabProps {
  workoutPlan?: Record<string, WorkoutType>;
  onUpdate: (newPlan: Record<string, WorkoutType>) => void;
}

export default function GymPlanTab({ workoutPlan, onUpdate }: GymPlanTabProps) {
  const safeWorkoutPlan = workoutPlan ?? defaultWorkoutPlan;
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [tempPlan, setTempPlan] = useState<Record<string, WorkoutType>>(safeWorkoutPlan);

  const handleWorkoutChange = (day: string, workout: WorkoutType) => {
    const updated = { ...tempPlan, [day]: workout };
    setTempPlan(updated);
    setEditingDay(null);
  };

  const handleSave = () => {
    onUpdate(tempPlan);
  };

  const handleReset = () => {
    setTempPlan(workoutPlan ?? defaultWorkoutPlan);
  };

  const days = daysOfWeek.slice(1).concat(daysOfWeek[0]);
  const hasChanges = JSON.stringify(tempPlan) !== JSON.stringify(workoutPlan);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Weekly Plan</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Customize Your Gym Schedule</h2>
        <p className="mt-2 text-zinc-300 text-sm">Click on a day to change your workout type</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
        {days.map((day) => {
          const workout = tempPlan[day] ?? defaultWorkoutPlan[day];
          const isEditing = editingDay === day;

          return (
            <motion.div
              key={day}
              className="relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <button
                type="button"
                onClick={() => setEditingDay(isEditing ? null : day)}
                className={`w-full rounded-3xl border-2 p-4 text-center transition ${
                  isEditing
                    ? 'border-glow bg-glow/10'
                    : 'border-white/10 hover:border-glow/50 bg-surface2'
                }`}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2">{day}</p>
                <div className={`bg-gradient-to-br ${getWorkoutColor(workout)} rounded-2xl px-3 py-2 text-sm font-semibold text-white truncate`}>
                  {workout}
                </div>
              </button>

              {/* Dropdown Menu */}
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full z-10 mt-2 w-full rounded-3xl border border-glow/50 bg-surface2 shadow-lg"
                >
                  <div className="max-h-48 overflow-y-auto p-2">
                    {AVAILABLE_WORKOUTS.map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => handleWorkoutChange(day, w)}
                        className={`w-full text-left rounded-2xl px-4 py-3 text-sm font-medium transition ${
                          workout === w
                            ? `bg-gradient-to-r ${getWorkoutColor(w)} text-white`
                            : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {hasChanges && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-3xl border border-glow/30 bg-glow/10 p-4"
        >
          <p className="text-sm text-zinc-300 mb-4">You have unsaved changes</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 btn-primary"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Workout Legend */}
      <div className="rounded-3xl border border-white/10 bg-[#07101f] p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-400 mb-4">Workout Types</p>
        <div className="grid gap-3 md:grid-cols-3">
          {AVAILABLE_WORKOUTS.map((workout) => (
            <div key={workout} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getWorkoutColor(workout)}`} />
              <span className="text-sm text-zinc-300">{workout}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
