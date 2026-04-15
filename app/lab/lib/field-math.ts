/**
 * Field math utilities for RF/EMF calculations
 */

import { dot, normalize } from './math-utils';
import { Vector3D } from '../types/common.types';
import { FactionMetrics } from '../types/field.types';
import { RFSource } from '../types/source.types';

// Physical constants
export const SPEED_OF_LIGHT = 299792458; // m/s
export const VACUUM_IMPEDANCE = 376.73; // ohms

/**
 * Convert frequency to wavelength
 * @param frequency - Frequency in Hz
 * @returns Wavelength in meters
 */
export function frequencyToWavelength(frequency: number): number {
  if (frequency <= 0) {
    throw new Error('Frequency must be positive');
  }
  return SPEED_OF_LIGHT / frequency;
}

/**
 * Convert wavelength to frequency
 * @param wavelength - Wavelength in meters
 * @returns Frequency in Hz
 */
export function wavelengthToFrequency(wavelength: number): number {
  if (wavelength <= 0) {
    throw new Error('Wavelength must be positive');
  }
  return SPEED_OF_LIGHT / wavelength;
}

/**
 * Calculate near-field boundary radius
 * Near-field extends to approximately λ/(2π) from the source
 * @param frequency - Frequency in Hz
 * @returns Near-field radius in meters
 */
export function calculateNearFieldRadius(frequency: number): number {
  const wavelength = frequencyToWavelength(frequency);
  return wavelength / (2 * Math.PI);
}

/**
 * Determine if a point is in the near-field region
 * @param distance - Distance from source in meters
 * @param frequency - Source frequency in Hz
 * @returns true if in near-field, false if in far-field
 */
export function isNearField(distance: number, frequency: number): boolean {
  const nearFieldRadius = calculateNearFieldRadius(frequency);
  return distance < nearFieldRadius;
}

/**
 * Calculate wave number (k = 2π/λ)
 * @param frequency - Frequency in Hz
 * @returns Wave number in rad/m
 */
export function calculateWaveNumber(frequency: number): number {
  const wavelength = frequencyToWavelength(frequency);
  return (2 * Math.PI) / wavelength;
}

/**
 * Convert dBm to watts.
 * @param powerDbm - Power in dBm.
 * @returns Power in watts.
 */
export function dbmToWatts(powerDbm: number): number {
  return Math.pow(10, powerDbm / 10) / 1000;
}

/**
 * Calculate free-space electric field strength from EIRP.
 * Uses the standard far-field approximation E = sqrt(30 * EIRP) / r.
 * @param powerWatts - Transmit power in watts.
 * @param gain - Linear antenna gain.
 * @param distanceMeters - Distance from source in meters.
 * @param nearFieldRadius - Optional softening radius to keep the visual model stable close to the source.
 * @returns Electric field strength in V/m.
 */
export function calculateFreeSpaceFieldStrength(
  powerWatts: number,
  gain: number,
  distanceMeters: number,
  nearFieldRadius = 0
): number {
  const eirp = Math.max(powerWatts, 0) * Math.max(gain, 0);
  const softenedDistance = Math.max(distanceMeters, nearFieldRadius * 0.25, 0.05);
  return Math.sqrt(30 * eirp) / softenedDistance;
}

/**
 * Calculate a directional gain term from an orientation vector.
 * Returns 1 for omni sources or when the orientation is unavailable.
 * @param direction - Unit vector from source to observation point.
 * @param orientation - Source forward vector.
 * @param exponent - Lobe sharpness; higher values narrow the beam.
 */
export function calculateDirectionalGain(
  direction: Vector3D,
  orientation?: Vector3D,
  exponent = 4
): number {
  if (!orientation) {
    return 1;
  }

  const forward = normalize(orientation);
  const arrival = normalize(direction);
  const alignment = Math.max(dot(forward, arrival), 0);
  return Math.pow(alignment, Math.max(1, exponent));
}

/**
 * Estimate overlap between two field contributions.
 */
export function calculateFieldOverlapScore(primary: number, secondary: number, epsilon = 1e-6): number {
  const normalizedPrimary = Math.abs(primary);
  const normalizedSecondary = Math.abs(secondary);
  return (normalizedPrimary * normalizedSecondary) / (normalizedPrimary + normalizedSecondary + epsilon);
}

/**
 * Estimate cancellation from two competing field contributions.
 */
export function calculateCancellationScore(net: number, primary: number, secondary: number, epsilon = 1e-6): number {
  const denominator = Math.abs(primary) + Math.abs(secondary) + epsilon;
  return Math.max(0, 1 - Math.abs(net) / denominator);
}

/**
 * Estimate whether a field region is contested by competing contributions.
 */
export function calculateContestedZoneScore(overlap: number, cancellation: number): number {
  return Math.max(0, Math.min(1, overlap * 0.65 + cancellation * 0.35));
}

/**
 * Convert electric field strength to power density
 * Power density (W/m²) = E² / (2 * Z0)
 * where Z0 is the vacuum impedance
 * @param fieldStrength - Electric field strength in V/m
 * @returns Power density in W/m²
 */
export function fieldStrengthToPowerDensity(fieldStrength: number): number {
  return (fieldStrength * fieldStrength) / (2 * VACUUM_IMPEDANCE);
}

/**
 * Convert power density to electric field strength
 * E = sqrt(2 * Z0 * S)
 * @param powerDensity - Power density in W/m²
 * @returns Electric field strength in V/m
 */
export function powerDensityToFieldStrength(powerDensity: number): number {
  return Math.sqrt(2 * VACUUM_IMPEDANCE * powerDensity);
}

/**
 * Compute faction-separated field metrics at a single point in space.
 *
 * Calls the provided `calculateField` function up to three times (friendly, hostile, net).
 * Pass `computeGradient: true` only when displaying the ThreatMetricsPanel — it adds
 * six extra calls and should not run inside the 60 fps animation loop.
 *
 * @param point - World-space position to evaluate
 * @param sources - All RF sources in the scene
 * @param time - Current animation time (same value passed to the simulation engine)
 * @param calculateField - Delegate that wraps the simulation engine's calculateFieldAtPoint
 * @param computeGradient - Whether to approximate |∇E| via central differences (default false)
 */
export function computeFactionMetrics(
  point: Vector3D,
  sources: RFSource[],
  time: number,
  calculateField: (p: Vector3D, s: RFSource[], t: number) => { strength: number },
  computeGradient = false
): FactionMetrics {
  const activeSources = sources.filter((s) => s.active);
  const friendlySources = activeSources.filter((s) => (s.faction ?? 'friendly') !== 'hostile');
  const hostileSources = activeSources.filter((s) => s.faction === 'hostile');

  const eF = friendlySources.length > 0
    ? Math.abs(calculateField(point, friendlySources, time).strength)
    : 0;
  const eH = hostileSources.length > 0
    ? Math.abs(calculateField(point, hostileSources, time).strength)
    : 0;
  const eN = activeSources.length > 0
    ? Math.abs(calculateField(point, activeSources, time).strength)
    : 0;

  const total = eF + eH;
  const threatDominance = total > 1e-9 ? eH / total : 0;

  const maxSingle = Math.max(eF, eH);
  const constructiveStrength = Math.max(0, eN - maxSingle);
  const destructiveStrength = Math.max(0, maxSingle - eN);
  const interactionScore = calculateFieldOverlapScore(eF, eH);

  let gradient = 0;
  if (computeGradient && activeSources.length > 0) {
    const DELTA = 0.1;
    const gx =
      (Math.abs(calculateField({ x: point.x + DELTA, y: point.y, z: point.z }, activeSources, time).strength) -
       Math.abs(calculateField({ x: point.x - DELTA, y: point.y, z: point.z }, activeSources, time).strength)) /
      (2 * DELTA);
    const gy =
      (Math.abs(calculateField({ x: point.x, y: point.y + DELTA, z: point.z }, activeSources, time).strength) -
       Math.abs(calculateField({ x: point.x, y: point.y - DELTA, z: point.z }, activeSources, time).strength)) /
      (2 * DELTA);
    const gz =
      (Math.abs(calculateField({ x: point.x, y: point.y, z: point.z + DELTA }, activeSources, time).strength) -
       Math.abs(calculateField({ x: point.x, y: point.y, z: point.z - DELTA }, activeSources, time).strength)) /
      (2 * DELTA);
    gradient = Math.sqrt(gx * gx + gy * gy + gz * gz);
  }

  return {
    eFieldFriendly: eF,
    eFieldHostile: eH,
    eFieldNet: eN,
    threatDominance,
    destructiveStrength,
    constructiveStrength,
    interactionScore,
    gradient,
  };
}
