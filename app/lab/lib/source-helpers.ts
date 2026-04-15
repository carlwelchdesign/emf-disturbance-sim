import { RFSource } from '../types/source.types';

/**
 * Create a simple incremental source ID generator.
 * @param prefix - ID prefix to use for generated values.
 */
export function createSourceIdGenerator(prefix = 'source') {
  let counter = 1;

  return {
    nextId() {
      return `${prefix}-${counter++}`;
    },
    reset() {
      counter = 1;
    },
  };
}

/**
 * Resolve the best display name for a source.
 * @param source - Source metadata.
 * @param index - Fallback index used when no label or device type is present.
 * @returns Human-readable name for UI display.
 */
export function getSourceDisplayName(source: Pick<RFSource, 'id' | 'label' | 'deviceType'>, index: number) {
  return source.label || source.deviceType || `Source ${index + 1}`;
}

/**
 * Estimate field strength for a source at a given distance.
 * @param source - RF source definition.
 * @param distanceMeters - Distance from the source in meters.
 * @returns Estimated field strength in V/m.
 */
export function estimateSourceFieldStrength(source: RFSource, distanceMeters = 1): number {
  const powerWatts = source.powerUnit === 'dBm'
    ? Math.pow(10, source.power / 10) / 1000
    : source.power;
  const gain = source.gain ?? 1;
  return Math.sqrt(Math.max(powerWatts * gain, 0)) / Math.max(distanceMeters, 0.001);
}
