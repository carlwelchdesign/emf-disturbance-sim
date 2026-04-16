import { InterferenceBandLabel, PointCloudEncodingProfile } from '../../../types/maxwell.types';

const BASE_SIZES: Record<InterferenceBandLabel, number> = {
  high: 0.0105,
  medium: 0.0085,
  low: 0.0065,
};

const BASE_LUMINANCE: Record<InterferenceBandLabel, number> = {
  high: 1.0,
  medium: 0.78,
  low: 0.56,
};

export function encodePointSize(
  band: InterferenceBandLabel,
  profile: PointCloudEncodingProfile
): number {
  return BASE_SIZES[band] * profile.sizeScale;
}

export function encodeLuminanceWeight(
  band: InterferenceBandLabel,
  profile: PointCloudEncodingProfile
): number {
  return Math.max(0.35, Math.min(1.2, BASE_LUMINANCE[band] * profile.luminanceScale));
}

export function encodeVisibilityAlpha(normalizedIntensity: number): number {
  return Math.max(0.3, Math.min(1, 0.2 + normalizedIntensity * 0.9));
}

export function shouldRenderSample(
  normalizedIntensity: number,
  sampleIndex: number,
  profile: PointCloudEncodingProfile
): boolean {
  if (normalizedIntensity >= profile.noiseFloor) {
    return true;
  }
  const keepStride = Math.max(1, Math.round(8 / Math.max(0.5, profile.densityScale)));
  return sampleIndex % keepStride === 0;
}

