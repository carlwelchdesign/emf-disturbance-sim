/**
 * PF-002: 95th percentile of viewport interactions <= 1 second
 */
import { PerformanceTelemetryCapture } from '../../app/lab/modules/maxwell/core/performance-telemetry';

describe('PF-002: Interaction Latency', () => {
  it('meetsInteractionTarget returns true when all latencies are under 1s', () => {
    const telemetry = new PerformanceTelemetryCapture();
    telemetry.initRun('test-run');
    // 100 interactions all under 1s
    for (let i = 0; i < 100; i++) {
      telemetry.recordInteraction('test-run', Math.random() * 500); // 0-500ms
    }
    expect(telemetry.meetsInteractionTarget('test-run', 1000)).toBe(true);
  });

  it('meetsInteractionTarget returns false when p95 exceeds 1s', () => {
    const telemetry = new PerformanceTelemetryCapture();
    telemetry.initRun('slow-run');
    // 95% are fast, 5% are slow (>1s)
    for (let i = 0; i < 95; i++) {
      telemetry.recordInteraction('slow-run', 100);
    }
    for (let i = 0; i < 5; i++) {
      telemetry.recordInteraction('slow-run', 2000); // 2s — exceeds target
    }
    expect(telemetry.meetsInteractionTarget('slow-run', 1000)).toBe(false);
  });

  it('meetsRuntimeTarget returns true for fast run', () => {
    const telemetry = new PerformanceTelemetryCapture();
    telemetry.initRun('fast-run');
    telemetry.markStarted('fast-run');
    // Manually set runtimeMs
    const rec = telemetry.getTelemetry('fast-run')!;
    rec.startedAt = Date.now() - 10000; // 10 seconds
    rec.completedAt = Date.now();
    rec.runtimeMs = 10000;
    expect(telemetry.meetsRuntimeTarget('fast-run', 300_000)).toBe(true);
  });

  it('meetsRuntimeTarget returns false for slow run', () => {
    const telemetry = new PerformanceTelemetryCapture();
    telemetry.initRun('long-run');
    const rec = telemetry.getTelemetry('long-run')!;
    rec.runtimeMs = 400_000; // 6.67 minutes — exceeds 5 min target
    expect(telemetry.meetsRuntimeTarget('long-run', 300_000)).toBe(false);
  });

  it('returns true when no interactions recorded (vacuous pass)', () => {
    const telemetry = new PerformanceTelemetryCapture();
    telemetry.initRun('empty-run');
    expect(telemetry.meetsInteractionTarget('empty-run', 1000)).toBe(true);
  });
});
