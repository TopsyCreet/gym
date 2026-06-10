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
        <p className="label tracking-[0.25em]">Weekly Plan</p>
        <h2 className="mt-2 text-2xl font-black text-white">Your Training Schedule</h2>
        <p className="mt-2 text-sm" style={{ color: '#4A4A4A' }}>Select a day to change your workout type.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-7">
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
                className="w-full rounded-2xl p-4 text-center transition-all duration-150"
                style={
                  isEditing
                    ? { background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)' }
                    : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }
                }
              >
                <p className="label mb-2 text-center">{day}</p>
                <div className={`bg-gradient-to-br ${getWorkoutColor(workout)} rounded-xl px-2 py-2 text-xs font-bold text-white truncate`}>
                  {workout}
                </div>
              </button>

              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full z-10 mt-2 w-full rounded-2xl shadow-lg"
                  style={{ background: '#1A1A1A', border: '1px solid rgba(212,175,55,0.2)' }}
                >
                  <div className="max-h-48 overflow-y-auto p-2">
                    {AVAILABLE_WORKOUTS.map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => handleWorkoutChange(day, w)}
                        className={`w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          workout === w
                            ? `bg-gradient-to-r ${getWorkoutColor(w)} text-white`
                            : 'text-zinc-400 hover:bg-white/[0.05] hover:text-white'
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
          className="rounded-2xl p-4"
          style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}
        >
          <p className="text-sm text-white mb-4">You have unsaved changes.</p>
          <div className="flex gap-3">
            <button type="button" onClick={handleSave} className="flex-1 btn-primary text-xs">
              Save Changes
            </button>
            <button type="button" onClick={handleReset} className="flex-1 btn-secondary text-xs">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <p className="label mb-4 tracking-[0.2em]">Workout Types</p>
        <div className="grid gap-3 md:grid-cols-3">
          {AVAILABLE_WORKOUTS.map((workout) => (
            <div key={workout} className="flex items-center gap-3">
              <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${getWorkoutColor(workout)}`} />
              <span className="text-sm" style={{ color: '#6B6B6B' }}>{workout}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
