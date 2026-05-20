export type RankDefinition = {
  title: string;
  color: string;
  subtitle: string;
};

export const ranks: RankDefinition[] = [
  { title: 'Bronze', color: '#D97706', subtitle: 'First Guardian' },
  { title: 'Silver', color: '#9CA3AF', subtitle: 'Iron Sentinel' },
  { title: 'Gold', color: '#F59E0B', subtitle: 'Elite Avenger' },
  { title: 'Platinum', color: '#38BDF8', subtitle: 'Nightblade' },
  { title: 'Diamond', color: '#818CF8', subtitle: 'Storm Reaper' },
  { title: 'Shadow Monarch', color: '#A855F7', subtitle: 'Ascended Slayer' }
];

export const getRankByTitle = (title: string) => ranks.find((rank) => rank.title === title) ?? ranks[0];
