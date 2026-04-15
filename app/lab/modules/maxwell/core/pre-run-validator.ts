import { SubmitSimulationRunRequest, RunErrorRecord, SimulationConfiguration } from '../../../types/maxwell.types';
import { validateSimulationConfiguration } from './simulation-configuration';
import { checkCFLStability } from './method-family-profile';
import { stabilityError } from './run-records';

/** Pre-run validation — validates the request before passing to orchestrator */
export function validateRunRequest(request: SubmitSimulationRunRequest): RunErrorRecord[] {
  const config: SimulationConfiguration = {
    id: request.configurationId,
    name: 'Pre-run validation',
    methodFamily: request.methodFamily,
    domain: request.domain,
    materials: request.materials,
    boundaryConditions: request.boundaryConditions,
    runControls: request.runControls,
    scenarioClass: request.scenarioClass ?? 'coarse',
    createdAt: new Date().toISOString(),
  };

  const errors = validateSimulationConfiguration(config);

  // Check CFL stability for manual time step
  if (config.domain.discretizationIntent === 'manual' && config.runControls.timeStepHint > 0) {
    if (!checkCFLStability(config)) {
      errors.push(stabilityError(
        config.id,
        'CFL_VIOLATION',
        `Time step ${config.runControls.timeStepHint.toExponential(3)} s exceeds the CFL stability limit for the given grid resolution.`,
        [
          'Set timeStepHint to 0 to use automatic CFL-stable time step.',
          'Increase grid resolution (larger dx/dy/dz) to allow a larger stable time step.',
        ],
      ));
    }
  }

  return errors;
}
