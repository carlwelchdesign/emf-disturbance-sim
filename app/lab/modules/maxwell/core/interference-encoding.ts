import {
  FieldOutputSet,
  InterferenceBandLabel,
  InterferenceIntensityBand,
  InterferenceInterpretationSnapshot,
  MaxwellFieldSample,
  PointCloudEncodingProfile,
  PointCloudRenderState,
  Vec3,
} from '../../../types/maxwell.types';

export const DEFAULT_INTERFERENCE_BANDS: InterferenceIntensityBand[] = [
  { bandId: 'high', label: 'high', lowerBound: 0.66, upperBound: 1 },
  { bandId: 'medium', label: 'medium', lowerBound: 0.33, upperBound: 0.66 },
  { bandId: 'low', label: 'low', lowerBound: 0, upperBound: 0.33 },
];

export const DEFAULT_ENCODING_PROFILE: PointCloudEncodingProfile = {
  profileId: 'balanced',
  colorMapName: 'blue-cyan-yellow',
  sizeScale: 1,
  densityScale: 1,
  luminanceScale: 1,
  noiseFloor: 0.05,
};

export const ENCODING_PROFILES: Record<string, PointCloudEncodingProfile> = {
  simplified: { ...DEFAULT_ENCODING_PROFILE, profileId: 'simplified', sizeScale: 0.9, densityScale: 0.85, luminanceScale: 0.95, noiseFloor: 0.065 },
  balanced: { ...DEFAULT_ENCODING_PROFILE },
  scientific: { ...DEFAULT_ENCODING_PROFILE, profileId: 'scientific', sizeScale: 1.1, densityScale: 1.15, luminanceScale: 1.05, noiseFloor: 0.04 },
};

export function normalizeFieldMagnitude(magnitude: number, maxMagnitude: number): number {
  if (magnitude <= 0 || maxMagnitude <= 0) return 0;
  const logRange = 4;
  const ratio = Math.log10(magnitude / maxMagnitude);
  return Math.max(0, Math.min(1, 1 + ratio / logRange));
}

export function classifyInterferenceBand(
  normalizedIntensity: number,
  bands: InterferenceIntensityBand[] = DEFAULT_INTERFERENCE_BANDS
): InterferenceBandLabel {
  for (const band of bands) {
    if (
      normalizedIntensity >= band.lowerBound &&
      (normalizedIntensity < band.upperBound || band.label === 'high')
    ) {
      return band.label;
    }
  }
  return 'low';
}

export function smoothBandTransition(
  previousBand: InterferenceBandLabel | undefined,
  nextBand: InterferenceBandLabel,
  normalizedIntensity: number
): InterferenceBandLabel {
  if (!previousBand || previousBand === nextBand) return nextBand;

  if (previousBand === 'high' && nextBand === 'medium' && normalizedIntensity > 0.58) return 'high';
  if (previousBand === 'medium' && nextBand === 'high' && normalizedIntensity < 0.72) return 'medium';
  if (previousBand === 'medium' && nextBand === 'low' && normalizedIntensity > 0.27) return 'medium';
  if (previousBand === 'low' && nextBand === 'medium' && normalizedIntensity < 0.4) return 'low';

  return nextBand;
}

export function sampleIndexToPosition(
  sampleIndex: number,
  grid: { nx: number; ny: number; nz: number },
  bounds: { min: Vec3; max: Vec3 }
): Vec3 {
  const { nx, ny, nz } = grid;
  const plane = nx * ny;
  const z = Math.floor(sampleIndex / plane);
  const rem = sampleIndex % plane;
  const y = Math.floor(rem / nx);
  const x = rem % nx;
  const roomX = bounds.max.x - bounds.min.x;
  const roomY = bounds.max.y - bounds.min.y;
  const roomZ = bounds.max.z - bounds.min.z;

  return {
    x: bounds.min.x + (x / Math.max(1, nx - 1)) * roomX,
    y: bounds.min.y + (y / Math.max(1, ny - 1)) * roomY,
    z: bounds.min.z + (z / Math.max(1, nz - 1)) * roomZ,
  };
}

export function computeInterpretationSummary(
  renderState: PointCloudRenderState,
  samples: MaxwellFieldSample[]
): InterferenceInterpretationSnapshot {
  if (samples.length === 0) {
    return {
      snapshotId: `${renderState.runId}-${renderState.timeStep}`,
      runId: renderState.runId,
      timeStep: renderState.timeStep,
      strongestRegionLabel: 'Strongest region unavailable',
      weakestRegionLabel: 'Weakest region unavailable',
      overlapRegionPresence: false,
      consistencyToken: simpleTokenHash(`${renderState.runId}:${renderState.timeStep}:empty`),
      bandCoverageMetrics: {
        high: renderState.bandDistribution.high,
        medium: renderState.bandDistribution.medium,
        low: renderState.bandDistribution.low,
      },
    };
  }

  const strongest = samples.reduce((best, sample) =>
    sample.compositeInterferenceScore > best.compositeInterferenceScore ? sample : best, samples[0]
  );
  const weakest = samples.reduce((best, sample) =>
    sample.compositeInterferenceScore < best.compositeInterferenceScore ? sample : best, samples[0]
  );

  const strongestRegionLabel = strongest
    ? `Strongest near (${strongest.position.x.toFixed(2)}, ${strongest.position.y.toFixed(2)}, ${strongest.position.z.toFixed(2)})`
    : 'Strongest region unavailable';
  const weakestRegionLabel = weakest
    ? `Weakest near (${weakest.position.x.toFixed(2)}, ${weakest.position.y.toFixed(2)}, ${weakest.position.z.toFixed(2)})`
    : 'Weakest region unavailable';

  const overlapRegionPresence = renderState.bandDistribution.high > 0 && renderState.bandDistribution.low > 0;
  const tokenSeed = `${renderState.runId}:${renderState.timeStep}:${renderState.bandDistribution.high}:${renderState.bandDistribution.medium}:${renderState.bandDistribution.low}`;
  const consistencyToken = simpleTokenHash(tokenSeed);

  return {
    snapshotId: `${renderState.runId}-${renderState.timeStep}`,
    runId: renderState.runId,
    timeStep: renderState.timeStep,
    strongestRegionLabel,
    weakestRegionLabel,
    overlapRegionPresence,
    consistencyToken,
    bandCoverageMetrics: {
      high: renderState.bandDistribution.high,
      medium: renderState.bandDistribution.medium,
      low: renderState.bandDistribution.low,
    },
  };
}

function simpleTokenHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return `tok-${Math.abs(hash).toString(36)}`;
}

export function getEncodingProfile(profileId: string): PointCloudEncodingProfile {
  return ENCODING_PROFILES[profileId] ?? DEFAULT_ENCODING_PROFILE;
}

export function inferMaxMagnitude(fieldOutput: FieldOutputSet, timeStep: number): number {
  const series = fieldOutput.electricFieldSeries;
  if (!series.length) return 1;
  const snap = series[Math.min(timeStep, series.length - 1)];
  const ex = snap.ex as number[];
  const ey = snap.ey as number[];
  const ez = snap.ez as number[];
  let maxMag = 1e-30;
  for (let i = 0; i < ex.length; i += 1) {
    const m = Math.sqrt(ex[i] ** 2 + ey[i] ** 2 + ez[i] ** 2);
    if (m > maxMag) maxMag = m;
  }
  return maxMag;
}
