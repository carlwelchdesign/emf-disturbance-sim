import { RFSource, SOURCE_LIMITS } from '../types/source.types';

/**
 * Validation utilities for RFSource parameters
 */

/**
 * Validate and clamp frequency to acceptable range
 */
export function validateFrequency(frequency: number): number {
  if (!isFinite(frequency)) {
    throw new Error('Frequency must be a finite number');
  }
  
  return Math.max(
    SOURCE_LIMITS.frequency.min,
    Math.min(SOURCE_LIMITS.frequency.max, frequency)
  );
}

/**
 * Validate and clamp bandwidth to acceptable range.
 */
export function validateBandwidth(bandwidthHz: number): number {
  if (!isFinite(bandwidthHz)) {
    throw new Error('Bandwidth must be a finite number');
  }

  return Math.max(
    SOURCE_LIMITS.bandwidthHz.min,
    Math.min(SOURCE_LIMITS.bandwidthHz.max, bandwidthHz)
  );
}

/**
 * Sanitize a frequency value for safe storage.
 * @param frequency - Raw frequency in Hz.
 * @returns Clamped frequency in Hz.
 */
export function sanitizeFrequency(frequency: number): number {
  return validateFrequency(frequency);
}

/**
 * Validate and clamp power value
 */
export function validatePower(power: number, unit: 'watts' | 'dBm'): number {
  if (!isFinite(power)) {
    throw new Error('Power must be a finite number');
  }
  
  const limits = SOURCE_LIMITS.power[unit];
  return Math.max(limits.min, Math.min(limits.max, power));
}

/**
 * Sanitize a power value for safe storage.
 * @param power - Raw power value.
 * @param unit - Power unit.
 * @returns Clamped power value.
 */
export function sanitizePower(power: number, unit: 'watts' | 'dBm'): number {
  return validatePower(power, unit);
}

/**
 * Sanitize a bandwidth value for safe storage.
 * @param bandwidthHz - Raw bandwidth in Hz.
 * @returns Clamped bandwidth in Hz.
 */
export function sanitizeBandwidth(bandwidthHz: number): number {
  return validateBandwidth(bandwidthHz);
}

/**
 * Validate and wrap phase to [0, 2π] range
 */
export function validatePhase(phase: number): number {
  if (!isFinite(phase)) {
    throw new Error('Phase must be a finite number');
  }
  
  // Wrap to [0, 2π] range
  const wrapped = phase % (2 * Math.PI);
  return wrapped < 0 ? wrapped + 2 * Math.PI : wrapped;
}

/**
 * Sanitize a phase value for safe storage.
 * @param phase - Raw phase in radians.
 * @returns Wrapped phase in radians.
 */
export function sanitizePhase(phase: number): number {
  return validatePhase(phase);
}

/**
 * Validate source position coordinates
 */
export function validatePosition(position: { x: number; y: number; z: number }): void {
  if (!isFinite(position.x) || !isFinite(position.y) || !isFinite(position.z)) {
    throw new Error('Position coordinates must be finite numbers');
  }
}

/**
 * Validate entire RFSource object
 */
export function validateSource(source: Partial<RFSource>): void {
  if (source.frequency !== undefined) {
    validateFrequency(source.frequency);
  }

  if (source.bandwidthHz !== undefined) {
    validateBandwidth(source.bandwidthHz);
  }
  
  if (source.power !== undefined && source.powerUnit) {
    validatePower(source.power, source.powerUnit);
  }
  
  if (source.phase !== undefined) {
    validatePhase(source.phase);
  }
  
  if (source.position) {
    validatePosition(source.position);
  }
  
  if (source.label && source.label.length > 50) {
    throw new Error('Source label must be 50 characters or less');
  }
}

/**
 * Remove markup and control characters from user-entered text.
 * @param value - Raw text input.
 * @returns Sanitized plain text.
 */
export function sanitizeTextInput(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim();
}

/**
 * Sanitize an RF source object before storing it.
 * @param source - Partial source payload.
 * @returns Sanitized source payload.
 */
export function sanitizeSource(source: Partial<RFSource>): Partial<RFSource> {
  const sanitized: Partial<RFSource> = { ...source };

  if (sanitized.frequency !== undefined) {
    sanitized.frequency = sanitizeFrequency(sanitized.frequency);
  }

  if (sanitized.bandwidthHz !== undefined) {
    sanitized.bandwidthHz = sanitizeBandwidth(sanitized.bandwidthHz);
  }

  if (sanitized.power !== undefined && sanitized.powerUnit) {
    sanitized.power = sanitizePower(sanitized.power, sanitized.powerUnit);
  }

  if (sanitized.phase !== undefined) {
    sanitized.phase = sanitizePhase(sanitized.phase);
  }

  if (typeof sanitized.label === 'string') {
    const cleanedLabel = sanitizeTextInput(sanitized.label);
    sanitized.label = cleanedLabel.length > 0 ? cleanedLabel : undefined;
  }

  if (typeof sanitized.deviceType === 'string') {
    const cleanedDeviceType = sanitizeTextInput(sanitized.deviceType);
    sanitized.deviceType = cleanedDeviceType.length > 0 ? cleanedDeviceType : undefined;
  }

  return sanitized;
}

/**
 * Convert power from watts to dBm
 */
export function wattsTodBm(watts: number): number {
  return 10 * Math.log10(watts * 1000);
}

/**
 * Convert power from dBm to watts
 */
export function dBmToWatts(dBm: number): number {
  return Math.pow(10, dBm / 10) / 1000;
}
