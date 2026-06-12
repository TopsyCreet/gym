export type RankDefinition = {
  title: string;
  color: string;
  gradient: string;
  subtitle: string;
  description: string;
  streakMin: number;
  manifesto: string;
};

export const ranks: RankDefinition[] = [
  {
    title: 'Initiate',
    color: '#A1A1AA',
    gradient: 'linear-gradient(135deg, #6B6B6B, #A1A1AA)',
    subtitle: 'The journey begins.',
    description: 'You have taken the first step. Most never do.',
    streakMin: 0,
    manifesto: 'Every great record starts with day one.',
  },
  {
    title: 'Forged',
    color: '#CD853F',
    gradient: 'linear-gradient(135deg, #A0622A, #CD853F)',
    subtitle: 'Consistency becomes identity.',
    description: 'Repetition is reshaping you. Stay the course.',
    streakMin: 3,
    manifesto: 'You are no longer someone who starts. You are someone who continues.',
  },
  {
    title: 'Vanguard',
    color: '#8A9BA8',
    gradient: 'linear-gradient(135deg, #6B7E8C, #8A9BA8)',
    subtitle: 'You lead by example.',
    description: 'Your discipline speaks before you do.',
    streakMin: 7,
    manifesto: 'Discipline is the highest form of self-respect.',
  },
  {
    title: 'Elite',
    color: '#C0A864',
    gradient: 'linear-gradient(135deg, #9E8840, #C0A864)',
    subtitle: 'Few reach this level.',
    description: 'You have proven what most only promise.',
    streakMin: 14,
    manifesto: 'Most people stop when it gets hard. You stopped stopping.',
  },
  {
    title: 'Prime',
    color: '#D4AF37',
    gradient: 'linear-gradient(135deg, #B8962E, #D4AF37, #E5C158)',
    subtitle: 'Peak discipline.',
    description: 'This is what you were built for.',
    streakMin: 30,
    manifesto: 'You are the proof that consistency changes everything.',
  },
  {
    title: 'Monarch',
    color: '#E5C158',
    gradient: 'linear-gradient(135deg, #D4AF37, #E5C158, #F0D060)',
    subtitle: 'The standard others chase.',
    description: 'You are living proof of what is possible.',
    streakMin: 60,
    manifesto: 'You became the person others look up to — one day at a time.',
  },
];

export const getRankByTitle = (title: string) =>
  ranks.find((rank) => rank.title === title) ?? ranks[0];

export const getRankByStreak = (streak: number) =>
  [...ranks].reverse().find((r) => streak >= r.streakMin) ?? ranks[0];
