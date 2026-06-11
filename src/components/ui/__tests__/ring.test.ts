import { describe, it, expect } from 'vitest';

// ── Ring geometry helpers (pure maths, no DOM) ─────────────
const circ = (r: number) => 2 * Math.PI * r;
const dashOffset = (r: number, progress: number) => circ(r) * (1 - Math.min(1, Math.max(0, progress)));

describe('Ring arc geometry', () => {
  const R_A = 82;
  const R_B = 64;
  const R_W = 46;

  it('full ring (progress=1) gives dashoffset=0', () => {
    expect(dashOffset(R_A, 1)).toBeCloseTo(0);
  });

  it('empty ring (progress=0) gives dashoffset=circumference', () => {
    expect(dashOffset(R_A, 0)).toBeCloseTo(circ(R_A));
  });

  it('half ring (progress=0.5) gives dashoffset=half circumference', () => {
    expect(dashOffset(R_A, 0.5)).toBeCloseTo(circ(R_A) * 0.5);
  });

  it('clamps progress above 1', () => {
    expect(dashOffset(R_A, 1.5)).toBeCloseTo(0);
  });

  it('clamps progress below 0', () => {
    expect(dashOffset(R_A, -0.2)).toBeCloseTo(circ(R_A));
  });

  it('outer ring circumference is larger than inner', () => {
    expect(circ(R_A)).toBeGreaterThan(circ(R_B));
    expect(circ(R_B)).toBeGreaterThan(circ(R_W));
  });
});

// ── Weekly commitment progress ratio ──────────────────────
describe('Weekly progress ratio', () => {
  const toProgress = (done: number, target: number) =>
    target === 0 ? 0 : Math.min(1, done / target);

  it('0 of 4 → 0%', () => expect(toProgress(0, 4)).toBe(0));
  it('2 of 4 → 50%', () => expect(toProgress(2, 4)).toBe(0.5));
  it('4 of 4 → 100%', () => expect(toProgress(4, 4)).toBe(1));
  it('5 of 4 clamps to 100%', () => expect(toProgress(5, 4)).toBe(1));
  it('target=0 → 0% (no divide-by-zero)', () => expect(toProgress(3, 0)).toBe(0));
});
