export type Challenge = {
  id: number;
  name: string;
  xp: number;
  category: string;
};

export const challenges: Challenge[] = [
  { id: 1, name: '100 Push-ups', xp: 50, category: 'strength' },
  { id: 2, name: '5km Run', xp: 60, category: 'cardio' },
  { id: 3, name: '30min Plank Hold', xp: 70, category: 'endurance' },
  { id: 4, name: '200 Squats', xp: 55, category: 'legs' },
  { id: 5, name: 'Deadlift PR Attempt', xp: 80, category: 'strength' },
  { id: 6, name: '1000 Jump Ropes', xp: 45, category: 'cardio' },
  { id: 7, name: 'Pull-up Ladder', xp: 65, category: 'strength' },
  { id: 8, name: '15min Cold Exposure', xp: 90, category: 'recovery' },
  { id: 9, name: 'Mobility Flow (20min)', xp: 40, category: 'flexibility' },
  { id: 10, name: "Farmer's Carry (50m x 5)", xp: 55, category: 'functional' }
];
