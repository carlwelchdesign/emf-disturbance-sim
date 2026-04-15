/**
 * Auto-Degrade Controller (BS-003)
 * Reduces rendering fidelity when memory pressure exceeds threshold.
 */
import { DegradeControllerConfig, DegradeAction } from '../../../types/maxwell.types';
import { MEMORY_BUDGET_BYTES, DEGRADE_THRESHOLD } from './maxwell-constants';

export class DegradeController {
  private config: DegradeControllerConfig;
  private onDegradeChange?: (config: DegradeControllerConfig) => void;

  constructor(
    options: Partial<DegradeControllerConfig> = {},
    onDegradeChange?: (config: DegradeControllerConfig) => void,
  ) {
    this.config = {
      memoryPressureThreshold: options.memoryPressureThreshold ?? DEGRADE_THRESHOLD,
      degradeActions: options.degradeActions ?? ['reduceMeshResolution', 'limitVisualizationLayers'],
      activeDegradeActions: [],
      notifyUser: false,
    };
    this.onDegradeChange = onDegradeChange;
  }

  /**
   * Check current memory pressure and activate/deactivate degrade mode accordingly.
   * @param estimatedCurrentBytes — estimated current memory usage in bytes
   */
  evaluate(estimatedCurrentBytes: number): DegradeControllerConfig {
    const pressure = estimatedCurrentBytes / MEMORY_BUDGET_BYTES;
    const shouldDegrade = pressure >= this.config.memoryPressureThreshold;

    if (shouldDegrade && this.config.activeDegradeActions.length === 0) {
      // Activate degrade mode
      this.config = {
        ...this.config,
        activeDegradeActions: [...this.config.degradeActions],
        notifyUser: true,
      };
      this.onDegradeChange?.(this.config);
    } else if (!shouldDegrade && this.config.activeDegradeActions.length > 0) {
      // Deactivate degrade mode
      this.config = {
        ...this.config,
        activeDegradeActions: [],
        notifyUser: false,
      };
      this.onDegradeChange?.(this.config);
    }

    return this.getConfig();
  }

  /** Get current degrade configuration */
  getConfig(): DegradeControllerConfig {
    return { ...this.config };
  }

  /** Check if a specific degrade action is currently active */
  isActionActive(action: DegradeAction): boolean {
    return this.config.activeDegradeActions.includes(action);
  }

  /** Check if any degrade mode is active */
  isDegrading(): boolean {
    return this.config.activeDegradeActions.length > 0;
  }

  /** Manually reset degrade mode */
  reset(): void {
    this.config = {
      ...this.config,
      activeDegradeActions: [],
      notifyUser: false,
    };
  }
}

export const globalDegradeController = new DegradeController();
