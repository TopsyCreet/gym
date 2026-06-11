import { describe, it, expect } from 'vitest';
import { deriveMascotState } from '../Mascot';

const base = {
  checkedInToday: false,
  weeklyDone: 2,
  weeklyTarget: 4,
  daysRemainingInWeek: 3,
  streakJustBroken: false,
  weeklyGoalJustCompleted: false,
  streakMilestone: false,
};

describe('deriveMascotState', () => {
  it('returns sad when streak just broken', () => {
    expect(deriveMascotState({ ...base, streakJustBroken: true })).toBe('sad');
  });

  it('sad takes priority over all other states', () => {
    expect(deriveMascotState({
      ...base,
      streakJustBroken: true,
      weeklyGoalJustCompleted: true,
      checkedInToday: true,
    })).toBe('sad');
  });

  it('returns celebrating when weekly goal just completed', () => {
    expect(deriveMascotState({ ...base, weeklyGoalJustCompleted: true })).toBe('celebrating');
  });

  it('returns celebrating on streak milestone', () => {
    expect(deriveMascotState({ ...base, streakMilestone: true })).toBe('celebrating');
  });

  it('returns happy when checked in today', () => {
    expect(deriveMascotState({ ...base, checkedInToday: true })).toBe('happy');
  });

  it('returns worried when check-ins remaining >= days remaining', () => {
    // 2 remaining, 2 days left — tight
    expect(deriveMascotState({ ...base, weeklyDone: 2, weeklyTarget: 4, daysRemainingInWeek: 2 })).toBe('worried');
  });

  it('returns worried when no days left and not done', () => {
    expect(deriveMascotState({ ...base, weeklyDone: 1, weeklyTarget: 4, daysRemainingInWeek: 0 })).toBe('worried');
  });

  it('returns encouraging when on track', () => {
    // 2 done, 2 left, 4 days remaining — comfortable
    expect(deriveMascotState({ ...base, weeklyDone: 2, weeklyTarget: 4, daysRemainingInWeek: 4 })).toBe('encouraging');
  });

  it('returns encouraging when no target set (0)', () => {
    expect(deriveMascotState({ ...base, weeklyTarget: 0 })).toBe('encouraging');
  });
});
