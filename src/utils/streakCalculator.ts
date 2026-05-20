import { AttendanceHistory } from '../store/authStore';

export const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const isScheduledDay = (date: string, schedule: string[]) => {
  const weekday = new Date(date).getDay();
  return schedule.includes(daysOfWeek[weekday]);
};

export const getCurrentStreak = (history: AttendanceHistory, schedule: string[]) => {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 30; i += 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    if (!isScheduledDay(key, schedule)) continue;
    if (history[key]) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
};

export const getStreakLevel = (streak: number) => {
  if (streak >= 30) return 'Shadow Monarch';
  if (streak >= 14) return 'Fortnight Fighter';
  if (streak >= 7) return 'Week Warrior';
  if (streak >= 1) return 'Rising Flame';
  return 'Dormant';
};
