/**
 * OOM-Risk Detector and Fallback Path (BS-004)
 * Detects OOM-risk conditions and activates fallback modes instead of crashing.
 */
import { OOMGuardEvent, OOMFallbackMode, OOMTriggerContext } from '../../../types/maxwell.types';
import { MEMORY_BUDGET_BYTES } from './maxwell-constants';

export interface OOMGuardConfig {
  /** Fraction of budget at which OOM risk is triggered (default: 0.9 = 90%) */
  oomRiskThreshold?: number;
  /** Fallback mode to activate when OOM risk detected */
  fallbackMode?: OOMFallbackMode;
}

export type OOMEventListener = (event: OOMGuardEvent) => void;

export class OOMGuard {
  private oomRiskThreshold: number;
  private fallbackMode: OOMFallbackMode;
  private activeFallbacks: Set<string> = new Set();
  private listeners: OOMEventListener[] = [];

  constructor(config: OOMGuardConfig = {}) {
    this.oomRiskThreshold = config.oomRiskThreshold ?? 0.9;
    this.fallbackMode = config.fallbackMode ?? 'summary_only';
  }

  /** Subscribe to OOM guard events */
  onEvent(listener: OOMEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emit(event: OOMGuardEvent): void {
    this.listeners.forEach((l) => l(event));
  }

  /**
   * Check memory pressure and activate fallback if OOM risk detected (BS-004).
   * @param runId — the run triggering the check
   * @param estimatedPeakBytes — estimated peak memory for this load operation
   * @param context — what triggered the check
   */
  check(runId: string, estimatedPeakBytes: number, context: OOMTriggerContext): OOMGuardEvent {
    const pressure = estimatedPeakBytes / MEMORY_BUDGET_BYTES;
    const isOOMRisk = pressure >= this.oomRiskThreshold;

    if (isOOMRisk && !this.activeFallbacks.has(runId)) {
      this.activeFallbacks.add(runId);
      const event: OOMGuardEvent = {
        runId,
        triggeredAt: context,
        estimatedPeakBytes,
        fallbackActivated: true,
        fallbackMode: this.fallbackMode,
        userMessageShown: true, // BS-004: MUST be true when fallback activated
      };
      this.emit(event);
      return event;
    }

    return {
      runId,
      triggeredAt: context,
      estimatedPeakBytes,
      fallbackActivated: false,
      fallbackMode: this.fallbackMode,
      userMessageShown: false,
    };
  }

  /** Check if a run has an active OOM fallback */
  hasFallback(runId: string): boolean {
    return this.activeFallbacks.has(runId);
  }

  /** Clear fallback for a run (user chose full mode) */
  clearFallback(runId: string): void {
    this.activeFallbacks.delete(runId);
  }

  /** Get current fallback mode */
  getFallbackMode(): OOMFallbackMode {
    return this.fallbackMode;
  }
}

export const globalOOMGuard = new OOMGuard();
