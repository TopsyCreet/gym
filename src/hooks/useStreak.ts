import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { getCurrentStreak, getStreakLevel, isScheduledDay } from '../utils/streakCalculator';

export const useStreak = () => {
  const user = useAuthStore((state) => state.getUser());

  return useMemo(() => {
    if (!user) {
      return { streak: 0, level: 'Dormant', nextMilestone: 7, scheduleToday: false };
    }
    const streak = getCurrentStreak(user.attendanceHistory, user.schedule);
    const level = getStreakLevel(streak);
    const today = new Date().toISOString().slice(0, 10);
    const scheduleToday = isScheduledDay(today, user.schedule);
    const nextMilestone = streak >= 30 ? streak : streak + 1;
    return { streak, level, nextMilestone, scheduleToday };
  }, [user]);
};
