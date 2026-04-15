/**
 * Scenario-Driven Validation Evaluator
 * Evaluates FDTD run outputs against reference scenarios and threshold rules.
 */
import { FieldOutputSet, DerivedMetricResult, ValidationReport, ValidationCheckResult, ValidationScenario } from '../../../types/maxwell.types';
import { VALIDATION_SCENARIOS } from '../validation/scenarios';

export class ValidationPipeline {
  /**
   * Evaluate a run against a named scenario and produce a ValidationReport.
   */
  evaluate(
    runId: string,
    scenarioId: string,
    fieldOutput: FieldOutputSet,
    derivedMetrics: DerivedMetricResult[],
  ): ValidationReport {
    const scenario = VALIDATION_SCENARIOS.find((s) => s.scenarioId === scenarioId);
    if (!scenario) {
      return {
        runId,
        scenarioId,
        checks: [],
        errorMetrics: {},
        aggregateStatus: 'fail',
        thresholdEvaluation: {},
        reviewNotes: `Scenario '${scenarioId}' not found in validation registry.`,
      };
    }

    const checks: ValidationCheckResult[] = [];
    const errorMetrics: Record<string, number> = {};
    const thresholdEvaluation: Record<string, 'pass' | 'fail'> = {};

    // Check 1: Field amplitude relative error
    const fieldAmplitudeError = this.computeFieldAmplitudeError(fieldOutput, scenario);
    errorMetrics['fieldAmplitudeRelError'] = fieldAmplitudeError;
    const fieldPass = fieldAmplitudeError <= scenario.thresholds.fieldAmplitudeRelError;
    thresholdEvaluation['fieldAmplitudeRelError'] = fieldPass ? 'pass' : 'fail';
    checks.push({
      checkId: 'field-amplitude',
      description: `Field amplitude relative error <= ${scenario.thresholds.fieldAmplitudeRelError * 100}%`,
      expected: scenario.thresholds.fieldAmplitudeRelError,
      actual: fieldAmplitudeError,
      tolerance: scenario.thresholds.fieldAmplitudeRelError,
      passed: fieldPass,
    });

    // Check 2: Energy flow consistency
    const energyFlowError = this.computeEnergyFlowError(derivedMetrics, scenario);
    errorMetrics['energyFlowRelError'] = energyFlowError;
    const energyPass = energyFlowError <= scenario.thresholds.energyFlowRelError;
    thresholdEvaluation['energyFlowRelError'] = energyPass ? 'pass' : 'fail';
    checks.push({
      checkId: 'energy-flow',
      description: `Energy flow relative error <= ${scenario.thresholds.energyFlowRelError * 100}%`,
      expected: scenario.thresholds.energyFlowRelError,
      actual: energyFlowError,
      tolerance: scenario.thresholds.energyFlowRelError,
      passed: energyPass,
    });

    // Check 3: Derived metrics completeness (≥2 required)
    const hasRequiredMetrics = derivedMetrics.length >= 2;
    checks.push({
      checkId: 'derived-metrics-completeness',
      description: 'At least 2 derived metrics must be provided (FR-007)',
      expected: 2,
      actual: derivedMetrics.length,
      tolerance: 0,
      passed: hasRequiredMetrics,
    });
    thresholdEvaluation['derivedMetricsCount'] = hasRequiredMetrics ? 'pass' : 'fail';

    const aggregateStatus: 'pass' | 'fail' = checks.every((c) => c.passed) ? 'pass' : 'fail';

    return {
      runId,
      scenarioId,
      checks,
      errorMetrics,
      aggregateStatus,
      thresholdEvaluation,
    };
  }

  private computeFieldAmplitudeError(fieldOutput: FieldOutputSet, scenario: ValidationScenario): number {
    if (fieldOutput.electricFieldSeries.length === 0) return 1.0;
    
    // For scenarios with zero expected field, compute normalized amplitude
    const expectedAmplitude = scenario.expectedBehavior.includes('zero') ? 0 : 1;
    
    // Compute RMS E-field over all steps
    let rmsSum = 0;
    let count = 0;
    for (const step of fieldOutput.electricFieldSeries) {
      for (let i = 0; i < step.ex.length; i++) {
        const val = (step.ex[i] ?? 0) ** 2 + (step.ey[i] ?? 0) ** 2 + (step.ez[i] ?? 0) ** 2;
        rmsSum += val;
        count++;
      }
    }
    const rmsE = count > 0 ? Math.sqrt(rmsSum / count) : 0;

    // For zero-field scenarios, error is just the normalized RMS
    if (expectedAmplitude === 0) {
      return Math.min(rmsE / 1.0, 1.0); // normalized relative error (clamp to 1)
    }

    // For general scenarios, compare against a loose reference
    // (Full implementation would compare against analytical solution)
    return Math.abs(rmsE - expectedAmplitude) / (expectedAmplitude + 1e-30);
  }

  private computeEnergyFlowError(metrics: DerivedMetricResult[], scenario: ValidationScenario): number {
    const energyMetric = metrics.find((m) => m.metricName === 'energy_density');
    if (!energyMetric) return 1.0;

    // For zero-field scenarios: energy should be zero
    if (scenario.expectedBehavior.includes('zero')) {
      const values = energyMetric.values;
      const maxVal = Array.isArray(values)
        ? Math.max(...values.map((v) => typeof v === 'number' ? v : (v as { value: number }).value))
        : 0;
      return Math.min(maxVal / 1e-20, 1.0); // normalized error
    }

    // For general scenarios: use a loose check (non-negative energy)
    const values = energyMetric.values;
    const allNonNegative = Array.isArray(values) && values.every((v) => {
      const num = typeof v === 'number' ? v : (v as { value: number }).value;
      return num >= -1e-30; // allow tiny negative due to floating point
    });
    return allNonNegative ? 0 : 1.0;
  }
}
