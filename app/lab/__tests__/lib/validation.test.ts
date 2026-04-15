import {
  sanitizeBandwidth,
  sanitizeFrequency,
  sanitizePower,
  sanitizePhase,
  sanitizeSource,
  dBmToWatts,
  wattsTodBm,
} from '../../lib/validation';

describe('validation', () => {
  it('clamps frequency to configured range', () => {
    expect(sanitizeFrequency(1)).toBeGreaterThanOrEqual(1e6);
    expect(sanitizeFrequency(1e12)).toBeLessThanOrEqual(100e9);
  });

  it('clamps bandwidth to configured range', () => {
    expect(sanitizeBandwidth(1)).toBeGreaterThanOrEqual(1e6);
    expect(sanitizeBandwidth(1e12)).toBeLessThanOrEqual(5e9);
  });

  it('clamps power based on unit', () => {
    expect(sanitizePower(0.0001, 'watts')).toBeGreaterThanOrEqual(0.001);
    expect(sanitizePower(99, 'dBm')).toBeLessThanOrEqual(50);
  });

  it('wraps phase into 0 to 2π', () => {
    expect(sanitizePhase(-Math.PI)).toBeCloseTo(Math.PI);
    expect(sanitizePhase(5 * Math.PI)).toBeCloseTo(Math.PI);
  });

  it('converts between watts and dBm', () => {
    const watts = 0.1;
    const dBm = wattsTodBm(watts);
    expect(dBmToWatts(dBm)).toBeCloseTo(watts, 5);
  });

  it('strips markup from source labels', () => {
    const sanitized = sanitizeSource({
      label: '<script>alert(1)</script>Router',
      deviceType: '<b>Wi-Fi</b>',
      bandwidthHz: 250e6,
    });

    expect(sanitized.label).toBe('alert(1)Router');
    expect(sanitized.deviceType).toBe('Wi-Fi');
    expect(sanitized.bandwidthHz).toBe(250e6);
  });
});
