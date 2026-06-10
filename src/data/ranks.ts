export type RankDefinition = {
  title: string;
  color: string;
  subtitle: string;
  description: string;
};

export const ranks: RankDefinition[] = [
  {
    title: 'Initiate',
    color: '#B3B3B3',
    subtitle: 'The journey begins.',
    description: 'You have taken the first step. Most never do.'
  },
  {
    title: 'Forged',
    color: '#CD853F',
    subtitle: 'Consistency becomes identity.',
    description: 'Repetition is reshaping you. Stay the course.'
  },
  {
    title: 'Vanguard',
    color: '#4A90D9',
    subtitle: 'You lead by example.',
    description: 'Your discipline speaks before you do.'
  },
  {
    title: 'Elite',
    color: '#2ECC71',
    subtitle: 'Few reach this level.',
    description: 'You have proven what most only promise.'
  },
  {
    title: 'Prime',
    color: '#D4AF37',
    subtitle: 'Peak discipline.',
    description: 'This is what you were built for.'
  },
  {
    title: 'Monarch',
    color: '#E5C158',
    subtitle: 'The standard others chase.',
    description: 'You are the proof that consistency changes everything.'
  },
];

export const getRankByTitle = (title: string) => ranks.find((rank) => rank.title === title) ?? ranks[0];
