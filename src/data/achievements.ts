export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export const allAchievements: Achievement[] = [
  { id: 'first-signup', name: 'First Step', description: 'You chose to begin. Most never do.', icon: '◈' },
  { id: 'first-checkin', name: 'First Commitment', description: 'You proved your first day of attendance.', icon: '◆' },
  { id: 'seven-day-streak', name: '7 Days Unbroken', description: 'Seven consecutive days of commitment.', icon: '◇' },
  { id: 'two-week-streak', name: 'Forged in Two Weeks', description: 'Fourteen days of unbroken discipline.', icon: '▲' },
  { id: 'month-streak', name: '30 Days Forged', description: 'One month of proof. No excuses.', icon: '⬡' },
  { id: 'challenge-beast', name: 'First Trial', description: 'You completed your first trial. Begin again.', icon: '▸' },
  { id: 'five-challenges', name: 'Five Trials Cleared', description: 'Five proofs of will.', icon: '▹' },
  { id: 'ten-challenges', name: 'Ten Trials Cleared', description: 'Discipline repeated becomes identity.', icon: '▶' },
  { id: 'level-two', name: 'Advancing', description: 'You reached Level 2.', icon: '△' },
  { id: 'level-three', name: 'Ascending', description: 'Level 3. The path narrows.', icon: '▴' },
  { id: 'level-five', name: 'Elite Status', description: 'Level 5. Few make it here.', icon: '★' },
  { id: 'five-hundred-xp', name: '500 Prime Points', description: 'Progress compounds. Keep going.', icon: '◉' },
  { id: 'thousand-xp', name: '1000 Prime Points', description: 'A thousand points of earned progress.', icon: '⊛' },
  { id: 'full-week', name: 'Perfect Week', description: 'All seven days. Unmatched consistency.', icon: '◼' },
  { id: 'comeback', name: 'Returned', description: 'You came back. That is everything.', icon: '↑' },
];
