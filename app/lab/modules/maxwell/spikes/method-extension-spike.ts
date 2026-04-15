/**
 * SC-006: Method Family Extension Spike
 * Demonstrates that an additional method family (FEM stub) can be integrated
 * using the same orchestrator contracts without changing user workflows.
 * 
 * This is a NON-PRODUCTION spike for architecture validation only.
 */
import { SimulationConfiguration } from '../../../types/maxwell.types';
import { IMethodFamilyAdapter, FDTDRunResult } from '../methods/fdtd/fdtd-adapter';
import { buildFieldOutput } from '../core/field-output-builder';
import { computeDerivedMetrics } from '../core/derived-metrics';

/**
 * FEM Spike Adapter — demonstrates method-family extensibility.
 * Uses the same IMethodFamilyAdapter interface as FDTDAdapter.
 * Produces synthetic outputs to validate orchestrator integration.
 */
export class FEMSpikeAdapter implements IMethodFamilyAdapter {
  public runId: string;
  constructor(runId: string) {
    this.runId = runId;
  }

  cancel(): void {
    // no-op for spike
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  execute(_config: SimulationConfiguration): FDTDRunResult {
    const startTime = Date.now();

    // FEM spike: generate synthetic sinusoidal field data
    const nx = 5, ny = 5, nz = 5;
    const n = nx * ny * nz;
    const nt = 10;
    const dt = 1e-12;
    const timeAxis = Array.from({ length: nt }, (_, i) => i * dt);

    const electricSnapshots = timeAxis.map((t, idx) => ({
      step: idx,
      time: t,
      ex: Array.from({ length: n }, (_, i) => Math.sin(2 * Math.PI * 1e9 * t + i * 0.01)),
      ey: new Array(n).fill(0),
      ez: new Array(n).fill(0),
    }));

    const magneticSnapshots = timeAxis.map((t, idx) => ({
      step: idx,
      time: t,
      ex: new Array(n).fill(0),
      ey: Array.from({ length: n }, (_, i) => Math.sin(2 * Math.PI * 1e9 * t + i * 0.01) / 377),
      ez: new Array(n).fill(0),
    }));

    const fieldOutput = buildFieldOutput(
      this.runId,
      timeAxis,
      electricSnapshots,
      magneticSnapshots,
      nx, ny, nz, 0.02, 0.02, 0.02,
    );

    const derivedMetrics = computeDerivedMetrics(this.runId, fieldOutput);

    return {
      fieldOutput,
      derivedMetrics,
      errors: [],
      runtimeMs: Date.now() - startTime,
    };
  }
}

/**
 * Spike test: demonstrates SC-006 compliance.
 * FEM adapter produces field outputs compatible with ValidationPipeline.
 */
export function runFEMSpike(config: SimulationConfiguration): {
  supported: boolean;
  outputShape: string;
  derivedMetricsCount: number;
  validationPipelineCompatible: boolean;
} {
  const adapter = new FEMSpikeAdapter('fem-spike-001');
  const result = adapter.execute(config);

  return {
    supported: true,
    outputShape: `${result.fieldOutput.timeAxis.length} time steps × ${result.fieldOutput.samplingMetadata.grid.nx}×${result.fieldOutput.samplingMetadata.grid.ny}×${result.fieldOutput.samplingMetadata.grid.nz} grid`,
    derivedMetricsCount: result.derivedMetrics.length,
    validationPipelineCompatible: result.derivedMetrics.length >= 2 && result.fieldOutput.timeAxis.length > 0,
  };
}
