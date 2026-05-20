export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export const allAchievements: Achievement[] = [
  { id: 'first-signup', name: 'First Signup', description: 'Create your account', icon: '🎯' },
  { id: 'first-checkin', name: 'First Check-in', description: 'Complete your first gym check-in', icon: '✅' },
  { id: 'seven-day-streak', name: '7-Day Streak', description: 'Maintain a 7-day check-in streak', icon: '🔥' },
  { id: 'two-week-streak', name: '2-Week Streak', description: 'Maintain a 14-day check-in streak', icon: '💪' },
  { id: 'month-streak', name: 'One Month Beast', description: 'Maintain a 30-day check-in streak', icon: '👑' },
  { id: 'challenge-beast', name: 'Challenge Beast', description: 'Complete your first workout challenge', icon: '⚡' },
  { id: 'five-challenges', name: 'Challenge Slayer', description: 'Complete 5 challenges', icon: '🎖️' },
  { id: 'ten-challenges', name: 'Challenge Master', description: 'Complete 10 challenges', icon: '🥇' },
  { id: 'level-two', name: 'Rising Star', description: 'Reach Level 2', icon: '⭐' },
  { id: 'level-three', name: 'Getting Serious', description: 'Reach Level 3', icon: '✨' },
  { id: 'level-five', name: 'Elite Status', description: 'Reach Level 5', icon: '👑' },
  { id: 'five-hundred-xp', name: 'XP Collector', description: 'Earn 500 XP', icon: '💎' },
  { id: 'thousand-xp', name: 'XP Master', description: 'Earn 1000 XP', icon: '🏆' },
  { id: 'full-week', name: 'Complete Week', description: 'Check in all 7 days of the week', icon: '📅' },
  { id: 'comeback', name: 'Comeback King', description: 'Resume your streak after a break', icon: '🚀' },
];
