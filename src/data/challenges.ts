export type Challenge = {
  id: number;
  name: string;
  xp: number;
  category: string;
  description: string;
};

export const challenges: Challenge[] = [
  {
    id: 1, name: '100 Push-ups', xp: 50, category: 'strength',
    description: '100 push-ups in as few sets as needed. Full range — chest to floor, arms locked at the top. Track your sets. Beat your count next time.',
  },
  {
    id: 2, name: '5km Run', xp: 60, category: 'cardio',
    description: '5 kilometres at a pace you can sustain. Breathing controlled, posture tall. Time it. Every run is data you can act on.',
  },
  {
    id: 3, name: '30min Plank Hold', xp: 70, category: 'endurance',
    description: '30 cumulative minutes in a plank position. Rest between holds as needed. Core tight, hips level, no sagging at the lower back.',
  },
  {
    id: 4, name: '200 Squats', xp: 55, category: 'legs',
    description: '200 bodyweight squats. Full depth — crease of the hip below the knee. Controlled descent, explosive rise. Rest only when necessary.',
  },
  {
    id: 5, name: 'Deadlift PR Attempt', xp: 80, category: 'strength',
    description: 'Warm up progressively, then attempt a personal record. Brace hard, grip tight, drive through the floor. Record your number.',
  },
  {
    id: 6, name: '1000 Jump Ropes', xp: 45, category: 'cardio',
    description: '1000 rope rotations, consecutive or cumulative. Rhythm over speed. Let your wrists drive the rope, not your shoulders.',
  },
  {
    id: 7, name: 'Pull-up Ladder', xp: 65, category: 'strength',
    description: 'Start at 1 rep. Add 1 per set until failure, then descend back to 1. Full range every rep — dead hang to chin clearing the bar.',
  },
  {
    id: 8, name: '15min Cold Exposure', xp: 90, category: 'recovery',
    description: '15 minutes in cold water or a cold shower. Breathe slow and controlled. The discomfort is the stimulus. Do not rush out early.',
  },
  {
    id: 9, name: 'Mobility Flow (20min)', xp: 40, category: 'flexibility',
    description: '20 minutes of deliberate mobility work — hips, thoracic spine, shoulders. Move slowly, feel every end range. This is not stretching for comfort.',
  },
  {
    id: 10, name: "Farmer's Carry (50m x 5)", xp: 55, category: 'functional',
    description: 'Carry the heaviest pair you can hold with tall posture. Walk 50 metres, set down, rest briefly, repeat 5 times. Grip and core are everything.',
  },
];
