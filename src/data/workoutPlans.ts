export type WorkoutType = 
  | 'Arms'
  | 'Legs'
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Cardio'
  | 'Core'
  | 'Full Body'
  | 'Rest';

export const AVAILABLE_WORKOUTS: WorkoutType[] = [
  'Arms',
  'Legs',
  'Chest',
  'Back',
  'Shoulders',
  'Cardio',
  'Core',
  'Full Body',
  'Rest'
];

export const defaultWorkoutPlan: Record<string, WorkoutType> = {
  'Mon': 'Chest',
  'Tue': 'Legs',
  'Wed': 'Back',
  'Thu': 'Shoulders',
  'Fri': 'Arms',
  'Sat': 'Full Body',
  'Sun': 'Rest'
};

export const getWorkoutColor = (workout: WorkoutType): string => {
  const colors: Record<WorkoutType, string> = {
    'Arms': 'from-pink-500 to-rose-500',
    'Legs': 'from-amber-500 to-orange-500',
    'Chest': 'from-red-500 to-pink-500',
    'Back': 'from-purple-500 to-indigo-500',
    'Shoulders': 'from-blue-500 to-cyan-500',
    'Cardio': 'from-green-500 to-emerald-500',
    'Core': 'from-yellow-500 to-amber-500',
    'Full Body': 'from-violet-500 to-purple-500',
    'Rest': 'from-slate-500 to-gray-500'
  };
  return colors[workout];
};
