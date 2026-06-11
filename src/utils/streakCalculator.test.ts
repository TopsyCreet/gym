import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getCurrentStreak, getStreakLevel, isScheduledDay } from './streakCalculator';
import type { AttendanceHistory } from '../store/authStore';

// ── isScheduledDay ─────────────────────────────────────────
describe('isScheduledDay', () => {
  it('matches correct day name', () => {
    // 2024-01-01 was a Monday
    expect(isScheduledDay('2024-01-01', ['Mon'])).toBe(true);
  });

  it('returns false when day not in schedule', () => {
    expect(isScheduledDay('2024-01-01', ['Tue', 'Wed'])).toBe(false);
  });

  it('empty schedule always returns false', () => {
    expect(isScheduledDay('2024-01-01', [])).toBe(false);
  });
});

// ── getCurrentStreak ───────────────────────────────────────
describe('getCurrentStreak', () => {
  let fakeToday: Date;

  beforeEach(() => {
    // Fix "today" to 2024-01-05 (Friday) so tests are deterministic
    const RealDate = globalThis.Date;
    fakeToday = new RealDate('2024-01-05');
    vi.spyOn(globalThis, 'Date').mockImplementation((...args: ConstructorParameters<typeof Date>) => {
      if (args.length) return new RealDate(...(args as [string]));
      return fakeToday;
    });
  });

  afterEach(() => { vi.restoreAllMocks(); });

  const schedule = ['Mon', 'Wed', 'Fri']; // Mon/Wed/Fri

  it('returns 0 when history is empty', () => {
    expect(getCurrentStreak({}, schedule)).toBe(0);
  });

  it('counts consecutive scheduled days', () => {
    const history: AttendanceHistory = {
      '2024-01-05': true, // Fri ✓
      '2024-01-03': true, // Wed ✓
      '2024-01-01': true, // Mon ✓
    };
    expect(getCurrentStreak(history, schedule)).toBe(3);
  });

  it('stops at first missed scheduled day', () => {
    const history: AttendanceHistory = {
      '2024-01-05': true, // Fri ✓
      // 2024-01-03 Wed MISSED
      '2024-01-01': true, // Mon (not counted — streak broken at Wed)
    };
    expect(getCurrentStreak(history, schedule)).toBe(1);
  });

  it('skips non-scheduled days', () => {
    // Tue and Thu are not scheduled — should not break streak
    const history: AttendanceHistory = {
      '2024-01-05': true, // Fri ✓
      '2024-01-03': true, // Wed ✓
    };
    expect(getCurrentStreak(history, schedule)).toBe(2);
  });
});

// ── getStreakLevel ─────────────────────────────────────────
describe('getStreakLevel', () => {
  it('streak 0 → Initiate', () => expect(getStreakLevel(0)).toBe('Initiate'));
  it('streak 1 → Forged',   () => expect(getStreakLevel(1)).toBe('Forged'));
  it('streak 7 → Vanguard', () => expect(getStreakLevel(7)).toBe('Vanguard'));
  it('streak 14 → Prime',   () => expect(getStreakLevel(14)).toBe('Prime'));
  it('streak 30 → Monarch', () => expect(getStreakLevel(30)).toBe('Monarch'));
  it('streak 60 → Monarch', () => expect(getStreakLevel(60)).toBe('Monarch'));
});
