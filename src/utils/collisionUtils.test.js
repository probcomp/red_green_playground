import {
  checkRectangleOverlap,
  calculateOverlapRegion,
  validateEntityOverlaps,
} from './collisionUtils';

describe('checkRectangleOverlap', () => {
  test('no overlap: rectangles apart', () => {
    expect(checkRectangleOverlap(0, 0, 2, 2, 3, 0, 2, 2)).toBe(false);
  });
  test('touching edges (gap 0) is not overlap', () => {
    // rect1 [0,2] x [0,2], rect2 [2,4] x [0,2] - touching at x=2
    expect(checkRectangleOverlap(0, 0, 2, 2, 2, 0, 2, 2)).toBe(false);
  });
  test('real overlap returns true', () => {
    expect(checkRectangleOverlap(0, 0, 3, 3, 1, 1, 3, 3)).toBe(true);
  });
  test('micro-overlap below epsilon is not overlap', () => {
    // Overlap of 1e-6 in both dimensions is below OVERLAP_EPSILON (1e-5)
    const a = 0, b = 2 - 1e-6; // rects [0,2] and [2-1e-6, 4-1e-6], overlap 1e-6
    expect(checkRectangleOverlap(a, 0, 2, 2, b, 0, 2, 2)).toBe(false);
  });
});

describe('calculateOverlapRegion', () => {
  test('no overlap returns null', () => {
    expect(calculateOverlapRegion(0, 0, 2, 2, 3, 0, 2, 2)).toBe(null);
  });
  test('touching returns null', () => {
    expect(calculateOverlapRegion(0, 0, 2, 2, 2, 0, 2, 2)).toBe(null);
  });
  test('real overlap returns region', () => {
    const r = calculateOverlapRegion(0, 0, 3, 3, 1, 1, 3, 3);
    expect(r).not.toBe(null);
    expect(r.width).toBe(2);
    expect(r.height).toBe(2);
  });
});

describe('validateEntityOverlaps', () => {
  test('strict mode ON: occluder overlapping barrier is invalid', () => {
    const entities = [
      { id: 1, type: 'barrier', x: 0, y: 0, width: 4, height: 2 },
      { id: 2, type: 'occluder', x: 1, y: 0, width: 2, height: 2 },
    ];
    const r = validateEntityOverlaps(entities, true);
    expect(r.valid).toBe(false);
    expect(r.message).toMatch(/occluder/);
  });
  test('strict mode OFF: occluder overlapping barrier is valid', () => {
    const entities = [
      { id: 1, type: 'barrier', x: 0, y: 0, width: 4, height: 2 },
      { id: 2, type: 'occluder', x: 1, y: 0, width: 2, height: 2 },
    ];
    const r = validateEntityOverlaps(entities, false);
    expect(r.valid).toBe(true);
    expect(r.overlapRegions).toHaveLength(0);
  });
  test('barrier-barrier overlap is always invalid regardless of strict mode', () => {
    const entities = [
      { id: 1, type: 'barrier', x: 0, y: 0, width: 3, height: 2 },
      { id: 2, type: 'barrier', x: 2, y: 0, width: 3, height: 2 },
    ];
    expect(validateEntityOverlaps(entities, true).valid).toBe(false);
    expect(validateEntityOverlaps(entities, false).valid).toBe(false);
  });
  test('barrier-barrier touching (no overlap) is valid', () => {
    const entities = [
      { id: 1, type: 'barrier', x: 0, y: 0, width: 2, height: 2 },
      { id: 2, type: 'barrier', x: 2, y: 0, width: 2, height: 2 },
    ];
    expect(validateEntityOverlaps(entities, true).valid).toBe(true);
    expect(validateEntityOverlaps(entities, false).valid).toBe(true);
  });
});
