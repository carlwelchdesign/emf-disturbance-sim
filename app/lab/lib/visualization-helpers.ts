import { ColorScheme } from '../types/visualization.types';
import { SOURCE_LIMITS } from '../types/source.types';
import { AnimationFrameSample, InputResponseSample, SmoothnessWindowEvaluation } from '../types/store.types';

/**
 * Visualization helper utilities for color mapping and rendering
 */

/**
 * Map field strength to color using thermal color scheme
 * Blue (weak) → Green → Yellow → Red (strong)
 */
export function fieldStrengthToThermalColor(strength: number, maxStrength: number): string {
  // Normalize strength to [0, 1]
  const normalized = Math.min(Math.max(strength / maxStrength, 0), 1);

  if (normalized < 0.25) {
    // Blue to Cyan
    const t = normalized / 0.25;
    return `rgb(${Math.floor(t * 100)}, ${Math.floor(t * 255)}, 255)`;
  } else if (normalized < 0.5) {
    // Cyan to Green
    const t = (normalized - 0.25) / 0.25;
    return `rgb(${Math.floor((1 - t) * 100)}, 255, ${Math.floor((1 - t) * 255)})`;
  } else if (normalized < 0.75) {
    // Green to Yellow
    const t = (normalized - 0.5) / 0.25;
    return `rgb(${Math.floor(t * 255)}, 255, 0)`;
  } else {
    // Yellow to Red
    const t = (normalized - 0.75) / 0.25;
    return `rgb(255, ${Math.floor((1 - t) * 255)}, 0)`;
  }
}

/**
 * Map field strength to color using rainbow color scheme
 */
export function fieldStrengthToRainbowColor(strength: number, maxStrength: number): string {
  const normalized = Math.min(Math.max(strength / maxStrength, 0), 1);
  const hue = (1 - normalized) * 240; // 240° (blue) to 0° (red)
  return `hsl(${hue}, 100%, 50%)`;
}

/**
 * Map field strength to color using monochrome scheme
 */
export function fieldStrengthToMonochromeColor(strength: number, maxStrength: number): string {
  const normalized = Math.min(Math.max(strength / maxStrength, 0), 1);
  const intensity = Math.floor(normalized * 255);
  return `rgb(${intensity}, ${intensity}, ${intensity})`;
}

/**
 * Map field strength to color based on selected color scheme
 */
export function fieldStrengthToColor(
  strength: number,
  maxStrength: number,
  colorScheme: ColorScheme
): string {
  switch (colorScheme) {
    case 'thermal':
      return fieldStrengthToThermalColor(strength, maxStrength);
    case 'rainbow':
      return fieldStrengthToRainbowColor(strength, maxStrength);
    case 'monochrome':
      return fieldStrengthToMonochromeColor(strength, maxStrength);
    default:
      return fieldStrengthToThermalColor(strength, maxStrength);
  }
}

/**
 * Map source frequency to a visible display color.
 * Lower frequencies trend toward blue, higher frequencies toward warm hues.
 */
export function frequencyToDisplayColor(frequencyHz: number): string {
  const min = SOURCE_LIMITS.frequency.min;
  const max = SOURCE_LIMITS.frequency.max;
  const normalized = Math.min(
    Math.max(Math.log10(frequencyHz / min) / Math.log10(max / min), 0),
    1
  );
  const hue = 220 - normalized * 180;
  return `hsl(${hue}, 90%, 60%)`;
}

/**
 * Format a frequency value for display in the controls.
 */
export function formatFrequencyLabel(frequencyHz: number): string {
  return `${(frequencyHz / 1e9).toFixed(2)} GHz`;
}

/**
 * Format a bandwidth value for display in the controls.
 */
export function formatBandwidthLabel(bandwidthHz: number): string {
  return `${(bandwidthHz / 1e6).toFixed(0)} MHz`;
}

/**
 * Format a phase value for display in the controls.
 */
export function formatPhaseLabel(phaseRadians: number): string {
  return `${((phaseRadians * 180) / Math.PI).toFixed(0)}°`;
}

export const SOURCE_COLOR_PALETTE = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
];

/**
 * Get a distinct source color from the default palette.
 * @param index - Zero-based source index.
 * @returns Hex color string.
 */
export function getSourceColor(index: number): string {
  return SOURCE_COLOR_PALETTE[index % SOURCE_COLOR_PALETTE.length];
}

/**
 * Format field strength value for display
 * @param strength - Field strength value
 * @param showApproximate - Whether to show "~" prefix for approximate values
 * @returns Formatted string with units
 */
export function formatFieldStrength(strength: number, showApproximate: boolean = true): string {
  const prefix = showApproximate ? '~' : '';
  
  if (strength < 0.001) {
    return `${prefix}${(strength * 1e6).toFixed(2)} μV/m`;
  } else if (strength < 1) {
    return `${prefix}${(strength * 1e3).toFixed(2)} mV/m`;
  } else if (strength < 1000) {
    return `${prefix}${strength.toFixed(2)} V/m`;
  } else {
    return `${prefix}${(strength / 1000).toFixed(2)} kV/m`;
  }
}

/**
 * Classify a local field reading into a broad interaction cue.
 */
export function classifyFieldInteraction(
  overlapScore: number,
  cancellationScore: number,
  contestedScore: number
): 'quiet' | 'constructive' | 'destructive' | 'contested' {
  if (contestedScore > 0.72) {
    return 'contested';
  }

  if (cancellationScore > overlapScore && cancellationScore > 0.55) {
    return 'destructive';
  }

  if (overlapScore > 0.45) {
    return 'constructive';
  }

  return 'quiet';
}

/**
 * Provide a readable label for a field interaction cue.
 */
export function describeFieldInteraction(
  overlapScore: number,
  cancellationScore: number,
  contestedScore: number
): string {
  const cue = classifyFieldInteraction(overlapScore, cancellationScore, contestedScore);

  switch (cue) {
    case 'constructive':
      return 'constructive overlap';
    case 'destructive':
      return 'destructive cancellation';
    case 'contested':
      return 'contested field';
    default:
      return 'quiet field';
  }
}

export function getNonColorInteractionCue(
  overlapScore: number,
  cancellationScore: number,
  contestedScore: number
): '↑' | '↓' | '↔' | '·' {
  const cue = classifyFieldInteraction(overlapScore, cancellationScore, contestedScore);
  if (cue === 'constructive') return '↑';
  if (cue === 'destructive') return '↓';
  if (cue === 'contested') return '↔';
  return '·';
}

export const SMOOTHNESS_THRESHOLDS = {
  minSmoothPercent: 95,
  maxP95LatencyMs: 120,
  frameOverloadMs: 33,
  severeLagLatencyMs: 300,
  sampleWindowMs: 5000,
} as const;

export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.min(sorted.length - 1, Math.max(0, Math.ceil((percentile / 100) * sorted.length) - 1));
  return sorted[rank];
}

export function evaluateSmoothnessWindow(
  frameSamples: AnimationFrameSample[],
  inputSamples: InputResponseSample[],
  now: number,
  windowMs: number = SMOOTHNESS_THRESHOLDS.sampleWindowMs
): SmoothnessWindowEvaluation {
  const windowStart = now - windowMs;
  const scopedFrames = frameSamples.filter((sample) => sample.timestamp >= windowStart && sample.timestamp <= now);
  const scopedInputs = inputSamples.filter((sample) => sample.timestamp >= windowStart && sample.timestamp <= now);

  const smoothFrames = scopedFrames.filter((sample) => sample.frameDurationMs <= SMOOTHNESS_THRESHOLDS.frameOverloadMs);
  const smoothInputs = scopedInputs.filter((sample) => !sample.jankFlag && sample.responseLatencyMs <= SMOOTHNESS_THRESHOLDS.maxP95LatencyMs);

  const animationSmoothPercent =
    scopedFrames.length === 0 ? 100 : (smoothFrames.length / scopedFrames.length) * 100;
  const interactionSmoothPercent =
    scopedInputs.length === 0 ? 100 : (smoothInputs.length / scopedInputs.length) * 100;

  const severeLagIncidents = scopedInputs.filter(
    (sample) => sample.responseLatencyMs >= SMOOTHNESS_THRESHOLDS.severeLagLatencyMs
  ).length;

  const meetsLatency =
    calculatePercentile(scopedInputs.map((sample) => sample.responseLatencyMs), 95) <=
    SMOOTHNESS_THRESHOLDS.maxP95LatencyMs;

  return {
    windowStart,
    windowEnd: now,
    interactionSmoothPercent,
    animationSmoothPercent,
    severeLagIncidents,
    meetsThreshold:
      animationSmoothPercent >= SMOOTHNESS_THRESHOLDS.minSmoothPercent &&
      interactionSmoothPercent >= SMOOTHNESS_THRESHOLDS.minSmoothPercent &&
      meetsLatency,
  };
}
