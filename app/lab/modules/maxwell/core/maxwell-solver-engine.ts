/**
 * Full-Wave Execution Pipeline using Orchestrator + FDTD Adapter
 * Orchestrates the complete run lifecycle: submit → validate → execute → validate → finalize.
 */
import { SimulationConfiguration, SubmitSimulationRunRequest, SubmitSimulationRunResponse, FieldOutputSet, DerivedMetricResult, ValidationReport } from '../../../types/maxwell.types';
import { RunOrchestrator, globalOrchestrator } from './run-orchestrator';
import { FDTDAdapter } from '../methods/fdtd/fdtd-adapter';
import { validateSimulationConfiguration } from './simulation-configuration';
import { ValidationPipeline } from './validation-pipeline';

export interface MaxwellSolverRunResult {
  runId: string;
  fieldOutput?: FieldOutputSet;
  derivedMetrics?: DerivedMetricResult[];
  validationReport?: ValidationReport;
  success: boolean;
  finalStatus: string;
}

export class MaxwellSolverEngine {
  private orchestrator: RunOrchestrator;
  private validationPipeline: ValidationPipeline;

  constructor(orchestrator: RunOrchestrator = globalOrchestrator) {
    this.orchestrator = orchestrator;
    this.validationPipeline = new ValidationPipeline();
  }

  /**
   * Submit a simulation run request.
   * Returns immediately with a runId + accepted/rejected status.
   */
  submit(request: SubmitSimulationRunRequest): SubmitSimulationRunResponse {
    const configForValidation: SimulationConfiguration = {
      id: request.configurationId,
      name: 'Run Config',
      methodFamily: request.methodFamily,
      domain: request.domain,
      materials: request.materials,
      boundaryConditions: request.boundaryConditions,
      runControls: request.runControls,
      scenarioClass: request.scenarioClass ?? 'coarse',
      createdAt: new Date().toISOString(),
    };

    const validationErrors = validateSimulationConfiguration(configForValidation);
    return this.orchestrator.submitRun(request, validationErrors);
  }

  /**
   * Execute a queued run synchronously.
   */
  execute(runId: string, config: SimulationConfiguration, validationScenarioId?: string): MaxwellSolverRunResult {
    this.orchestrator.startRun(runId);

    const adapter = new FDTDAdapter(runId);
    const result = adapter.execute(config);

    // Check for instability errors
    const hasInstabilityError = result.errors.some((e) => e.category === 'stability');
    if (hasInstabilityError) {
      const reason = result.errors.map((e) => e.message).join('; ');
      this.orchestrator.markUnstable(runId, reason);
      return { runId, fieldOutput: result.fieldOutput, derivedMetrics: result.derivedMetrics, success: false, finalStatus: 'unstable' };
    }

    if (result.errors.some((e) => e.category === 'system')) {
      this.orchestrator.failRun(runId, result.errors.map((e) => e.message).join('; '));
      return { runId, success: false, finalStatus: 'failed' };
    }

    // Mark as completed (unvalidated)
    this.orchestrator.completeRun(runId);

    // Run validation if scenario specified
    let validationReport: ValidationReport | undefined;
    if (validationScenarioId) {
      validationReport = this.validationPipeline.evaluate(
        runId,
        validationScenarioId,
        result.fieldOutput,
        result.derivedMetrics,
      );

      if (validationReport.aggregateStatus === 'pass') {
        this.orchestrator.validateRun(runId);
      } else {
        this.orchestrator.markNonValidated(runId, 'Validation thresholds not met.');
      }
    }

    const finalRun = this.orchestrator.getRun(runId);
    return {
      runId,
      fieldOutput: result.fieldOutput,
      derivedMetrics: result.derivedMetrics,
      validationReport,
      success: true,
      finalStatus: finalRun?.status ?? 'completed_unvalidated',
    };
  }
}

/** Singleton engine for app use */
export const globalSolverEngine = new MaxwellSolverEngine();
