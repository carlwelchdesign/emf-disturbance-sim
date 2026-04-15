/**
 * FDTD Method Family Adapter
 * Implements the method-family adapter interface for the Finite-Difference Time-Domain solver.
 * 
 * ARCHITECTURE: No imports from components/, hooks/, or modules/ (except peer maxwell modules)
 */
import { SimulationConfiguration, FieldOutputSet, DerivedMetricResult, RunErrorRecord } from '../../../../types/maxwell.types';
import { FDTDStepper } from './fdtd-stepper';
import { buildFieldOutput } from '../../core/field-output-builder';
import { computeDerivedMetrics } from '../../core/derived-metrics';
import { computeGridPoints } from '../../core/simulation-configuration';
import { computeCFLTimeStep } from '../../core/method-family-profile';

export interface FDTDRunResult {
  fieldOutput: FieldOutputSet;
  derivedMetrics: DerivedMetricResult[];
  errors: RunErrorRecord[];
  runtimeMs: number;
}

export interface IMethodFamilyAdapter {
  runId: string;
  execute(config: SimulationConfiguration): FDTDRunResult;
  cancel(): void;
}

/**
 * FDTD Adapter — wraps the low-level stepper into a high-level run execution.
 */
export class FDTDAdapter implements IMethodFamilyAdapter {
  public runId: string;
  private cancelled = false;

  constructor(runId: string) {
    this.runId = runId;
  }

  cancel(): void {
    this.cancelled = true;
  }

  execute(config: SimulationConfiguration): FDTDRunResult {
    const startTime = Date.now();
    const errors: RunErrorRecord[] = [];

    try {
      // Compute grid dimensions
      const { nx, ny, nz } = computeGridPoints(config.domain);
      const { dx, dy, dz } = config.domain.gridResolution;

      // Compute CFL-stable time step
      const dtMax = computeCFLTimeStep(dx, dy, dz);
      const dt = config.runControls.timeStepHint > 0
        ? Math.min(config.runControls.timeStepHint, dtMax)
        : dtMax;

      // Compute number of steps
      const nt = Math.ceil(config.runControls.timeWindow / dt);
      const samplingPlan = config.runControls.samplingPlan;

      // Initialize stepper
      const stepper = new FDTDStepper(nx, ny, nz, dx, dy, dz, dt);

      // Initialize material arrays from config
      const mat = config.materials[0] ?? { permittivity: 1, permeability: 1, conductivity: 0 };
      stepper.initMaterials(mat.permittivity, mat.permeability, mat.conductivity);

      // Apply initial source excitation (Gaussian pulse at center)
      stepper.applyGaussianSource(Math.floor(nx / 2), Math.floor(ny / 2), Math.floor(nz / 2));

      // Time-stepping loop — collect snapshots
      const electricSnapshots: { step: number; time: number; ex: number[]; ey: number[]; ez: number[] }[] = [];
      const magneticSnapshots: { step: number; time: number; ex: number[]; ey: number[]; ez: number[] }[] = [];
      const timeAxis: number[] = [];

      const temporalDecimation = samplingPlan.temporalDecimation ?? 1;

      for (let n = 0; n < nt; n++) {
        if (this.cancelled) break;

        stepper.step();

        // Check instability
        const check = stepper.checkStability();
        if (!check.stable) {
          errors.push({
            runId: this.runId,
            category: 'stability',
            code: 'INSTABILITY_DETECTED',
            message: `Numerical instability detected at step ${n}: ${check.reason}`,
            recommendedActions: [
              'Reduce the time step (increase CFL safety factor).',
              'Reduce grid resolution.',
              'Check material properties for physical validity.',
            ],
            blocking: true,
          });
          break;
        }

        // Record snapshot according to sampling plan
        if (n % temporalDecimation === 0) {
          const t = n * dt;
          timeAxis.push(t);
          electricSnapshots.push({ ...stepper.getElectricSnapshot(), step: n, time: t });
          magneticSnapshots.push({ ...stepper.getMagneticSnapshot(), step: n, time: t });
        }
      }

      const fieldOutput = buildFieldOutput(
        this.runId,
        timeAxis,
        electricSnapshots,
        magneticSnapshots,
        nx, ny, nz, dx, dy, dz,
      );

      const derivedMetrics = computeDerivedMetrics(
        this.runId,
        fieldOutput,
      );

      return {
        fieldOutput,
        derivedMetrics,
        errors,
        runtimeMs: Date.now() - startTime,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push({
        runId: this.runId,
        category: 'system',
        code: 'EXECUTION_ERROR',
        message: `Solver execution error: ${message}`,
        recommendedActions: ['Check system resources and retry.'],
        blocking: false,
      });
      return {
        fieldOutput: {
          runId: this.runId,
          timeAxis: [],
          electricFieldSeries: [],
          magneticFieldSeries: [],
          samplingMetadata: { grid: { nx: 0, ny: 0, nz: 0, dx: 0, dy: 0, dz: 0 }, units: 'V/m', coordinateSystem: 'cartesian' },
          validationStatus: 'non_validated',
        },
        derivedMetrics: [],
        errors,
        runtimeMs: Date.now() - startTime,
      };
    }
  }
}
