/**
 * Performance Telemetry for Maxwell Solver Runs
 * Captures runtime and interaction latency for PF-001/PF-002/PF-003 evaluation.
 */
import { PerformanceTelemetry } from '../../../types/maxwell.types';

export class PerformanceTelemetryCapture {
  private records: Map<string, PerformanceTelemetry> = new Map();

  /** Start tracking a run */
  initRun(runId: string): void {
    this.records.set(runId, {
      runId,
      queuedAt: Date.now(),
      interactionLatencies: [],
    });
  }

  /** Mark run as started */
  markStarted(runId: string): void {
    const rec = this.records.get(runId);
    if (rec) rec.startedAt = Date.now();
  }

  /** Mark run as completed */
  markCompleted(runId: string): void {
    const rec = this.records.get(runId);
    if (rec) {
      rec.completedAt = Date.now();
      rec.runtimeMs = rec.startedAt ? rec.completedAt - rec.startedAt : undefined;
    }
  }

  /** Record an interaction latency measurement */
  recordInteraction(runId: string, latencyMs: number): void {
    const rec = this.records.get(runId);
    if (rec) rec.interactionLatencies.push(latencyMs);
  }

  /** Get telemetry record for a run */
  getTelemetry(runId: string): PerformanceTelemetry | undefined {
    return this.records.get(runId);
  }

  /** Check if PF-001: runtime <= 5 minutes (300,000 ms) */
  meetsRuntimeTarget(runId: string, targetMs = 300_000): boolean {
    const rec = this.records.get(runId);
    if (!rec?.runtimeMs) return false;
    return rec.runtimeMs <= targetMs;
  }

  /** Check if PF-002: 95th percentile interaction latency <= 1000 ms */
  meetsInteractionTarget(runId: string, targetMs = 1000): boolean {
    const rec = this.records.get(runId);
    if (!rec || rec.interactionLatencies.length === 0) return true;
    const sorted = [...rec.interactionLatencies].sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);
    const p95 = sorted[Math.min(p95Index, sorted.length - 1)];
    return p95 <= targetMs;
  }

  /** Get summary for all runs */
  getSummary(): { totalRuns: number; runsMetPF001: number; runsMetPF002: number } {
    const all = Array.from(this.records.values());
    return {
      totalRuns: all.length,
      runsMetPF001: all.filter((r) => r.runId && this.meetsRuntimeTarget(r.runId)).length,
      runsMetPF002: all.filter((r) => r.runId && this.meetsInteractionTarget(r.runId)).length,
    };
  }
}

export const globalTelemetry = new PerformanceTelemetryCapture();
