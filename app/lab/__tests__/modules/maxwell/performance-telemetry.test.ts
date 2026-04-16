import { PerformanceTelemetryCapture } from '../../../modules/maxwell/core/performance-telemetry';

describe('performance telemetry capture', () => {
  it('captures emitter-change to render latency pairs', () => {
    const telemetry = new PerformanceTelemetryCapture();
    telemetry.initRun('run-a');
    telemetry.recordEmitterChangeEvent('run-a');
    telemetry.recordRenderCompleteEvent('run-a');
    expect(telemetry.getEmitterChangeLatencies('run-a').length).toBe(1);
    expect(telemetry.getEmitterChangeLatencies('run-a')[0]).toBeGreaterThanOrEqual(0);
  });

  it('records edge state events', () => {
    const telemetry = new PerformanceTelemetryCapture();
    telemetry.initRun('run-b');
    telemetry.emitEdgeState('run-b', 'degraded', 'density-throttle');
    const rec = telemetry.getTelemetry('run-b');
    expect(rec?.edgeStateEvents?.[0]?.event).toBe('degraded');
  });
});

