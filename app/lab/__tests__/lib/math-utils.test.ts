import { distance, magnitude, normalize, add, subtract, scale, dot, cross, lerp, clamp } from '../../lib/math-utils';

describe('math-utils', () => {
  it('calculates distance', () => {
    expect(distance({ x: 0, y: 0, z: 0 }, { x: 3, y: 4, z: 0 })).toBe(5);
  });

  it('normalizes vectors', () => {
    expect(normalize({ x: 0, y: 0, z: 0 })).toEqual({ x: 0, y: 0, z: 0 });
    expect(magnitude(normalize({ x: 3, y: 0, z: 0 }))).toBeCloseTo(1, 5);
  });

  it('supports vector arithmetic', () => {
    expect(add({ x: 1, y: 2, z: 3 }, { x: 1, y: 1, z: 1 })).toEqual({ x: 2, y: 3, z: 4 });
    expect(subtract({ x: 2, y: 3, z: 4 }, { x: 1, y: 1, z: 1 })).toEqual({ x: 1, y: 2, z: 3 });
    expect(scale({ x: 1, y: 2, z: 3 }, 2)).toEqual({ x: 2, y: 4, z: 6 });
    expect(dot({ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 })).toBe(0);
    expect(cross({ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 })).toEqual({ x: 0, y: 0, z: 1 });
    expect(lerp({ x: 0, y: 0, z: 0 }, { x: 10, y: 10, z: 10 }, 0.5)).toEqual({ x: 5, y: 5, z: 5 });
  });

  it('clamps values', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
});
