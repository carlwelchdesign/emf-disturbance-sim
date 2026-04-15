/**
 * Field math utilities for RF/EMF calculations
 */

import { dot, normalize } from './math-utils';
import { Vector3D } from '../types/common.types';

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
