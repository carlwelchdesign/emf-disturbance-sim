import {
  fieldStrengthToColor,
  frequencyToDisplayColor,
  getSourceColor,
} from '../../lib/visualization-helpers';

describe('visualization helpers', () => {
  it('maps thermal colors', () => {
    expect(fieldStrengthToColor(0.1, 1, 'thermal')).toMatch(/^rgb/);
  });

  it('maps rainbow colors', () => {
    expect(fieldStrengthToColor(0.5, 1, 'rainbow')).toMatch(/^hsl/);
  });

  it('maps monochrome colors', () => {
    expect(fieldStrengthToColor(0.5, 1, 'monochrome')).toMatch(/^rgb/);
  });

  it('returns a source palette color', () => {
    expect(getSourceColor(0)).toMatch(/^#/);
  });

  it('maps frequency to a display color', () => {
    expect(frequencyToDisplayColor(2.4e9)).toMatch(/^hsl/);
    expect(frequencyToDisplayColor(28e9)).toMatch(/^hsl/);
  });
});
