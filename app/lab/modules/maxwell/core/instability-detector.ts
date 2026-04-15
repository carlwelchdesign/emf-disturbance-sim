/**
 * Runtime Instability Detector
 * Detects NaN, Infinity, and divergence in FDTD field data during execution.
 *
 * ARCHITECTURE: Pure logic — no imports from components/, hooks/, or modules/
 */
import { FieldTensor } from '../../../types/maxwell.types';

export interface InstabilityCheckResult {
  stable: boolean;
  reason?: string;
  severity?: 'warning' | 'critical';
  stepIndex?: number;
}

export interface InstabilityDetectorConfig {
  /** Maximum allowed field magnitude before flagging as divergence */
  divergenceThreshold?: number;
  /** Maximum allowed growth rate between consecutive steps (multiplicative) */
  maxGrowthRate?: number;
}

export class InstabilityDetector {
  private divergenceThreshold: number;

  constructor(config: InstabilityDetectorConfig = {}) {
    this.divergenceThreshold = config.divergenceThreshold ?? 1e10;
    // maxGrowthRate accepted for future growth-rate check; stored via config reference only
    void (config.maxGrowthRate ?? 100);
  }

  /**
   * Check a single time-step E/H field snapshot for instability.
   * @param eField — current E-field tensor
   * @param hField — current H-field tensor
   * @returns InstabilityCheckResult
   */
  checkStep(eField: FieldTensor, hField: FieldTensor): InstabilityCheckResult {
    const eCheck = this.checkFieldTensor(eField, 'E');
    if (!eCheck.stable) return eCheck;

    const hCheck = this.checkFieldTensor(hField, 'H');
    if (!hCheck.stable) return hCheck;

    return { stable: true };
  }

  /**
   * Check a field tensor for numerical issues.
   */
  private checkFieldTensor(field: FieldTensor, label: string): InstabilityCheckResult {
    const components = [
      { data: field.ex, name: `${label}x` },
      { data: field.ey, name: `${label}y` },
      { data: field.ez, name: `${label}z` },
    ];

    for (const { data, name } of components) {
      if (!data) continue;
      for (let i = 0; i < data.length; i++) {
        const v = typeof data[i] === 'number' ? data[i] as number : 0;
        if (isNaN(v)) {
          return {
            stable: false,
            reason: `NaN detected in ${name} at index ${i} (step ${field.step})`,
            severity: 'critical',
            stepIndex: field.step,
          };
        }
        if (!isFinite(v)) {
          return {
            stable: false,
            reason: `Inf detected in ${name} at index ${i} (step ${field.step})`,
            severity: 'critical',
            stepIndex: field.step,
          };
        }
        if (Math.abs(v) > this.divergenceThreshold) {
          return {
            stable: false,
            reason: `Field divergence: |${name}[${i}]| = ${Math.abs(v).toExponential(3)} exceeds threshold ${this.divergenceThreshold.toExponential(3)} at step ${field.step}`,
            severity: 'critical',
            stepIndex: field.step,
          };
        }
      }
    }

    return { stable: true };
  }

  /**
   * Check a sequence of field tensors for instability.
   * Returns the first instability found, or stable if none.
   */
  checkSequence(eFields: FieldTensor[], hFields: FieldTensor[]): InstabilityCheckResult {
    for (let i = 0; i < eFields.length; i++) {
      const result = this.checkStep(eFields[i], hFields[i] ?? eFields[i]);
      if (!result.stable) return result;
    }
    return { stable: true };
  }
}

/** Default detector instance */
export const defaultInstabilityDetector = new InstabilityDetector();
