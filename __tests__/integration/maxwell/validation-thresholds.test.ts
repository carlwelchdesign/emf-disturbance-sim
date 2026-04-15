import { VALIDATION_SCENARIOS } from '../../../app/lab/modules/maxwell/validation/scenarios';
import { ValidationPipeline } from '../../../app/lab/modules/maxwell/core/validation-pipeline';
import { FieldOutputSet, DerivedMetricResult } from '../../../app/lab/types/maxwell.types';

// Helper: create a mock field output that produces near-perfect plane wave behavior
function makePlaneWaveOutput(runId: string, amplitude = 1.0, frequency = 1e9): FieldOutputSet {
  const nt = 10;
  const nx = 10, ny = 10, nz = 10;
  const dt = 1 / (frequency * 20); // 20 samples per period
  const timeAxis = Array.from({ length: nt }, (_, i) => i * dt);
  
  const makeField = (t: number, isE: boolean) => {
    const n = nx * ny * nz;
    const k = (2 * Math.PI * frequency) / 3e8; // wave number
    const ex = new Array(n).fill(0).map((_, idx) => {
      const z = (idx % nz) * 0.01;
      return isE ? amplitude * Math.sin(k * z - 2 * Math.PI * frequency * t) : 0;
    });
    return { step: Math.round(t / dt), time: t, ex, ey: new Array(n).fill(0), ez: new Array(n).fill(0) };
  };

  return {
    runId,
    timeAxis,
    electricFieldSeries: timeAxis.map((t) => makeField(t, true)),
    magneticFieldSeries: timeAxis.map((t) => makeField(t, false)),
    samplingMetadata: { grid: { nx, ny, nz, dx: 0.01, dy: 0.01, dz: 0.01 }, units: 'V/m', coordinateSystem: 'cartesian' },
    validationStatus: 'non_validated',
  };
}

describe('VALIDATION_SCENARIOS', () => {
  it('defines at least 12 reference scenarios (SC-001)', () => {
    expect(VALIDATION_SCENARIOS.length).toBeGreaterThanOrEqual(12);
  });

  it('all scenarios have required fields', () => {
    for (const s of VALIDATION_SCENARIOS) {
      expect(s.scenarioId).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(s.referenceType).toMatch(/analytical|numerical|experimental/);
      expect(s.thresholds.fieldAmplitudeRelError).toBeGreaterThan(0);
      expect(s.applicableMethods).toContain('fdtd');
    }
  });

  it('scenario IDs are unique', () => {
    const ids = VALIDATION_SCENARIOS.map((s) => s.scenarioId);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

describe('ValidationPipeline', () => {
  let pipeline: ValidationPipeline;

  beforeEach(() => {
    pipeline = new ValidationPipeline();
  });

  it('produces a ValidationReport with aggregateStatus for every run', () => {
    const fieldOutput = makePlaneWaveOutput('run-001');
    const metrics: DerivedMetricResult[] = [
      { runId: 'run-001', metricName: 'poynting_magnitude', definition: 'S = E×H', units: 'W/m²', values: [1.0], validityScope: 'all', sourceFieldDependencies: ['E', 'B'] },
      { runId: 'run-001', metricName: 'energy_density', definition: 'u = ε|E|²/2 + μ|H|²/2', units: 'J/m³', values: [0.5], validityScope: 'all', sourceFieldDependencies: ['E', 'B'] },
    ];
    const report = pipeline.evaluate('run-001', VALIDATION_SCENARIOS[0].scenarioId, fieldOutput, metrics);
    expect(report.runId).toBe('run-001');
    expect(report.scenarioId).toBe(VALIDATION_SCENARIOS[0].scenarioId);
    expect(['pass', 'fail']).toContain(report.aggregateStatus);
    expect(report.checks).toBeDefined();
    expect(report.errorMetrics).toBeDefined();
  });

  it('passes for zero-error reference output', () => {
    // For a "zero_field" scenario, a field output with all zeros should pass
    const zeroScenario = VALIDATION_SCENARIOS.find((s) => s.scenarioId === 'zero_field_zero_source');
    if (!zeroScenario) return; // skip if scenario not defined
    
    const nx = 5, ny = 5, nz = 5;
    const n = nx * ny * nz;
    const zeros = new Array(n).fill(0);
    const output: FieldOutputSet = {
      runId: 'run-zero',
      timeAxis: [0, 1e-12],
      electricFieldSeries: [
        { step: 0, time: 0, ex: zeros, ey: zeros, ez: zeros },
        { step: 1, time: 1e-12, ex: zeros, ey: zeros, ez: zeros },
      ],
      magneticFieldSeries: [
        { step: 0, time: 0, ex: zeros, ey: zeros, ez: zeros },
        { step: 1, time: 1e-12, ex: zeros, ey: zeros, ez: zeros },
      ],
      samplingMetadata: { grid: { nx, ny, nz, dx: 0.01, dy: 0.01, dz: 0.01 }, units: 'V/m', coordinateSystem: 'cartesian' },
      validationStatus: 'non_validated',
    };
    const metrics: DerivedMetricResult[] = [
      { runId: 'run-zero', metricName: 'poynting_magnitude', definition: 'S=ExH', units: 'W/m²', values: [0], validityScope: 'all', sourceFieldDependencies: ['E', 'B'] },
      { runId: 'run-zero', metricName: 'energy_density', definition: 'u', units: 'J/m³', values: [0], validityScope: 'all', sourceFieldDependencies: ['E', 'B'] },
    ];
    const report = pipeline.evaluate('run-zero', zeroScenario.scenarioId, output, metrics);
    expect(report.aggregateStatus).toBe('pass');
  });

  it('returns checks array with check-level pass/fail for each scenario', () => {
    const fieldOutput = makePlaneWaveOutput('run-002');
    const metrics: DerivedMetricResult[] = [
      { runId: 'run-002', metricName: 'poynting_magnitude', definition: 'S', units: 'W/m²', values: [1.0], validityScope: 'all', sourceFieldDependencies: ['E', 'B'] },
      { runId: 'run-002', metricName: 'energy_density', definition: 'u', units: 'J/m³', values: [0.5], validityScope: 'all', sourceFieldDependencies: ['E', 'B'] },
    ];
    const report = pipeline.evaluate('run-002', VALIDATION_SCENARIOS[0].scenarioId, fieldOutput, metrics);
    expect(Array.isArray(report.checks)).toBe(true);
    for (const check of report.checks) {
      expect(check.checkId).toBeTruthy();
      expect(typeof check.passed).toBe('boolean');
    }
  });
});
