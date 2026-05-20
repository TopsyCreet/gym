export const getLevelThreshold = (level: number) => {
  if (level <= 1) return 0;
  return 300 + (level - 2) * 400;
};

export const getLevelFromXp = (xp: number) => {
  let level = 1;
  while (xp >= getLevelThreshold(level + 1)) {
    level += 1;
  }
  return level;
};

export const getXpProgress = (xp: number) => {
  const level = getLevelFromXp(xp);
  const prev = getLevelThreshold(level);
  const next = getLevelThreshold(level + 1);
  const progress = next === prev ? 1 : (xp - prev) / (next - prev);
  return { level, progress, from: prev, to: next };
};
