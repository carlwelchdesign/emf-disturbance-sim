/**
 * Concurrent Run Cap Enforcer (BS-005)
 * Prevents more than `cap` full-resolution result sets from being loaded simultaneously.
 */
import { RunCapStatus } from '../../../types/maxwell.types';
import { MAX_ACTIVE_RUNS } from './maxwell-constants';

export type RunCapChangeListener = (status: RunCapStatus) => void;

export class RunCapEnforcer {
  private cap: number;
  private activeRuns: Set<string> = new Set();
  private listeners: RunCapChangeListener[] = [];

  constructor(cap = MAX_ACTIVE_RUNS) {
    this.cap = cap;
  }

  /** Subscribe to run cap change events */
  onChange(listener: RunCapChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emit(): void {
    const status = this.getStatus();
    this.listeners.forEach((l) => l(status));
  }

  /**
   * Attempt to load a full-resolution result set (BS-005).
   * Returns the RunCapStatus after the attempt.
   */
  tryLoad(runId: string): RunCapStatus {
    if (this.activeRuns.has(runId)) {
      // Already loaded
      return this.getStatus();
    }

    if (this.activeRuns.size >= this.cap) {
      // Cap exceeded
      const status: RunCapStatus = {
        activeFullResolutionRuns: this.activeRuns.size,
        cap: this.cap,
        capExceeded: true,
        blockedRunId: runId,
      };
      return status;
    }

    this.activeRuns.add(runId);
    this.emit();
    return this.getStatus();
  }

  /**
   * Deactivate a loaded run to free a slot.
   */
  unload(runId: string): void {
    this.activeRuns.delete(runId);
    this.emit();
  }

  /**
   * Get current cap status.
   */
  getStatus(): RunCapStatus {
    return {
      activeFullResolutionRuns: this.activeRuns.size,
      cap: this.cap,
      capExceeded: this.activeRuns.size > this.cap,
    };
  }

  /**
   * Get list of currently active run IDs.
   */
  getActiveRuns(): string[] {
    return Array.from(this.activeRuns);
  }

  /**
   * Check if a run is currently loaded at full resolution.
   */
  isLoaded(runId: string): boolean {
    return this.activeRuns.has(runId);
  }
}

export const globalRunCapEnforcer = new RunCapEnforcer(MAX_ACTIVE_RUNS);
