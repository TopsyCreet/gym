import { describe, it, expect } from 'vitest';
import { getLevelThreshold, getLevelFromXp, getXpProgress } from './xpCalculator';

describe('xpCalculator', () => {
  it('calculates level thresholds', () => {
    expect(getLevelThreshold(1)).toBe(0);
    expect(getLevelThreshold(2)).toBe(300);
    expect(getLevelThreshold(3)).toBe(700);
  });

  it('derives level from xp', () => {
    expect(getLevelFromXp(0)).toBe(1);
    expect(getLevelFromXp(300)).toBe(2);
    expect(getLevelFromXp(500)).toBe(2);
    expect(getLevelFromXp(900)).toBe(3);
  });

  it('returns xp progress object', () => {
    const p = getXpProgress(500);
    expect(p.level).toBe(2);
    expect(p.from).toBe(300);
    expect(p.to).toBe(700);
    expect(p.progress).toBeCloseTo((500 - 300) / (700 - 300));
  });
});
