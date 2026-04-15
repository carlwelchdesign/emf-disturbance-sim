import {
  frequencyToWavelength,
  calculateNearFieldRadius,
  isNearField,
  fieldStrengthToPowerDensity,
} from '../../lib/field-math';

describe('field-math', () => {
  it('converts 2.4 GHz to ~0.125 m wavelength', () => {
    expect(frequencyToWavelength(2.4e9)).toBeCloseTo(0.1249, 3);
  });

  it('converts 5 GHz to ~0.06 m wavelength', () => {
    expect(frequencyToWavelength(5e9)).toBeCloseTo(0.0599, 3);
  });

  it('calculates near-field boundary as λ/(2π)', () => {
    const radius = calculateNearFieldRadius(2.4e9);
    expect(radius).toBeCloseTo(frequencyToWavelength(2.4e9) / (2 * Math.PI), 6);
  });

  it('classifies points by near/far field distance', () => {
    const frequency = 2.4e9;
    const boundary = calculateNearFieldRadius(frequency);

    expect(isNearField(boundary / 2, frequency)).toBe(true);
    expect(isNearField(boundary * 2, frequency)).toBe(false);
  });

  it('converts field strength to power density', () => {
    expect(fieldStrengthToPowerDensity(10)).toBeGreaterThan(0);
  });
});
