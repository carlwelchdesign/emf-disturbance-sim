/**
 * Browser Safety Tests (BS-001–BS-005)
 * Validates memory budget, degrade, OOM guard, and run cap enforcement.
 */
import { checkSafeZone, runMemoryBudgetGate } from '../../../app/lab/modules/maxwell/core/memory-budget';
import { DegradeController } from '../../../app/lab/modules/maxwell/core/degrade-controller';
import { OOMGuard } from '../../../app/lab/modules/maxwell/core/oom-guard';
import { RunCapEnforcer } from '../../../app/lab/modules/maxwell/core/run-cap-enforcer';
import { MEMORY_BUDGET_BYTES, SAFE_ZONE_DEFAULTS } from '../../../app/lab/modules/maxwell/core/maxwell-constants';

// ─── BS-001 / BS-002: Memory Budget and Safe Zone ────────────────────────────

describe('BS-001: Memory budget gate', () => {
  it('within-budget run produces no errors', () => {
    // Coarse: 30×30×30 × 100 steps → ~123 MB << 512 MB
    const errors = runMemoryBudgetGate('run-1', 30, 30, 30, 100, 'coarse');
    expect(errors.filter((e) => e.code === 'MEMORY_BUDGET_EXCEEDED')).toHaveLength(0);
  });

  it('over-budget run produces blocking resource error', () => {
    // 200×200×200 × 10000 steps = 8M × 10k × 48 bytes = ~3.8 TB (way over)
    const errors = runMemoryBudgetGate('run-2', 200, 200, 200, 10000, 'baseline');
    const budgetError = errors.find((e) => e.code === 'MEMORY_BUDGET_EXCEEDED');
    expect(budgetError).toBeDefined();
    expect(budgetError?.blocking).toBe(true);
    expect(budgetError?.category).toBe('resource');
    expect(budgetError?.message).toContain('MB');
  });

  it('error message includes estimate and budget values (BS-001 rule)', () => {
    const errors = runMemoryBudgetGate('run-3', 200, 200, 200, 10000, 'baseline');
    const budgetError = errors.find((e) => e.code === 'MEMORY_BUDGET_EXCEEDED');
    expect(budgetError?.message).toMatch(/\d+(\.\d+)? MB/);
    expect(budgetError?.recommendedActions.length).toBeGreaterThan(0);
  });
});

describe('BS-002: Safe-zone defaults', () => {
  it('safe-zone defaults match spec for baseline class', () => {
    expect(SAFE_ZONE_DEFAULTS.baseline.maxGridPoints).toBe(200 * 200 * 200);
    expect(SAFE_ZONE_DEFAULTS.baseline.maxTimeSteps).toBe(10000);
  });

  it('safe-zone defaults match spec for medium class', () => {
    expect(SAFE_ZONE_DEFAULTS.medium.maxGridPoints).toBe(100 * 100 * 100);
    expect(SAFE_ZONE_DEFAULTS.medium.maxTimeSteps).toBe(5000);
  });

  it('safe-zone defaults match spec for coarse class', () => {
    expect(SAFE_ZONE_DEFAULTS.coarse.maxGridPoints).toBe(50 * 50 * 50);
    expect(SAFE_ZONE_DEFAULTS.coarse.maxTimeSteps).toBe(1000);
  });

  it('checkSafeZone detects grid points violation', () => {
    const result = checkSafeZone(60, 60, 60, 100, 'coarse'); // 60^3 > 50^3
    expect(result.withinSafeZone).toBe(false);
    expect(result.violatedConstraints.length).toBeGreaterThan(0);
  });

  it('checkSafeZone detects time steps violation', () => {
    const result = checkSafeZone(10, 10, 10, 2000, 'coarse'); // 2000 > 1000
    expect(result.withinSafeZone).toBe(false);
  });

  it('checkSafeZone passes for within-zone values', () => {
    const result = checkSafeZone(30, 30, 30, 500, 'coarse'); // well within coarse limits
    expect(result.withinSafeZone).toBe(true);
  });
});

// ─── BS-003: Degrade Controller ───────────────────────────────────────────────

describe('BS-003: Auto-degrade controller', () => {
  it('activates degrade when memory pressure > threshold', () => {
    const controller = new DegradeController({ memoryPressureThreshold: 0.8 });
    const highPressureBytes = MEMORY_BUDGET_BYTES * 0.85; // 85% — above 80% threshold
    const config = controller.evaluate(highPressureBytes);
    expect(config.activeDegradeActions.length).toBeGreaterThan(0);
    expect(config.notifyUser).toBe(true);
  });

  it('deactivates when pressure drops below threshold', () => {
    const controller = new DegradeController({ memoryPressureThreshold: 0.8 });
    controller.evaluate(MEMORY_BUDGET_BYTES * 0.85); // activate
    controller.evaluate(MEMORY_BUDGET_BYTES * 0.5);  // deactivate
    const config = controller.getConfig();
    expect(config.activeDegradeActions).toHaveLength(0);
    expect(config.notifyUser).toBe(false);
  });

  it('notifyUser is true when degrade active (BS-003 rule)', () => {
    const controller = new DegradeController();
    const config = controller.evaluate(MEMORY_BUDGET_BYTES * 0.9);
    if (config.activeDegradeActions.length > 0) {
      expect(config.notifyUser).toBe(true);
    }
  });

  it('default degrade threshold is 0.8 (80%)', () => {
    const controller = new DegradeController();
    expect(controller.getConfig().memoryPressureThreshold).toBe(0.8);
  });

  it('fires onChange callback when state changes', () => {
    const cb = jest.fn();
    const controller = new DegradeController({}, cb);
    controller.evaluate(MEMORY_BUDGET_BYTES * 0.9);
    expect(cb).toHaveBeenCalled();
  });
});

// ─── BS-004: OOM Guard ────────────────────────────────────────────────────────

describe('BS-004: OOM guard with fallback path', () => {
  it('activates fallback when peak bytes exceeds threshold', () => {
    const guard = new OOMGuard({ oomRiskThreshold: 0.9 });
    const event = guard.check('run-oom', MEMORY_BUDGET_BYTES * 0.95, 'result_loading');
    expect(event.fallbackActivated).toBe(true);
    expect(event.userMessageShown).toBe(true); // BS-004: MUST be true
  });

  it('does NOT activate fallback below threshold', () => {
    const guard = new OOMGuard({ oomRiskThreshold: 0.9 });
    const event = guard.check('run-ok', MEMORY_BUDGET_BYTES * 0.5, 'result_loading');
    expect(event.fallbackActivated).toBe(false);
    expect(event.userMessageShown).toBe(false);
  });

  it('userMessageShown is true when fallback activated (BS-004 rule)', () => {
    const guard = new OOMGuard({ oomRiskThreshold: 0.1 }); // very low threshold
    const event = guard.check('run-msg', MEMORY_BUDGET_BYTES * 0.5, 'visualization_render');
    if (event.fallbackActivated) {
      expect(event.userMessageShown).toBe(true);
    }
  });

  it('fallback mode is communicated in event', () => {
    const guard = new OOMGuard({ oomRiskThreshold: 0.9, fallbackMode: 'disable_time_series' });
    const event = guard.check('run-mode', MEMORY_BUDGET_BYTES * 0.95, 'time_series_nav');
    expect(event.fallbackMode).toBe('disable_time_series');
  });

  it('fires event listener on OOM detection', () => {
    const listener = jest.fn();
    const guard = new OOMGuard({ oomRiskThreshold: 0.5 });
    guard.onEvent(listener);
    guard.check('run-evt', MEMORY_BUDGET_BYTES * 0.8, 'result_loading');
    expect(listener).toHaveBeenCalled();
  });

  it('clearFallback allows reloading', () => {
    const guard = new OOMGuard({ oomRiskThreshold: 0.9 });
    guard.check('run-clear', MEMORY_BUDGET_BYTES * 0.95, 'result_loading');
    expect(guard.hasFallback('run-clear')).toBe(true);
    guard.clearFallback('run-clear');
    expect(guard.hasFallback('run-clear')).toBe(false);
  });
});

// ─── BS-005: Run Cap Enforcer ─────────────────────────────────────────────────

describe('BS-005: Concurrent run cap enforcement (max 3)', () => {
  it('allows loading up to cap (3) runs', () => {
    const enforcer = new RunCapEnforcer(3);
    const s1 = enforcer.tryLoad('r1');
    const s2 = enforcer.tryLoad('r2');
    const s3 = enforcer.tryLoad('r3');
    expect(s1.capExceeded).toBe(false);
    expect(s2.capExceeded).toBe(false);
    expect(s3.capExceeded).toBe(false);
  });

  it('blocks 4th run when cap is 3 (BS-005 rule)', () => {
    const enforcer = new RunCapEnforcer(3);
    enforcer.tryLoad('r1');
    enforcer.tryLoad('r2');
    enforcer.tryLoad('r3');
    const s4 = enforcer.tryLoad('r4');
    expect(s4.capExceeded).toBe(true);
    expect(s4.blockedRunId).toBe('r4');
  });

  it('shows blockedRunId in rejection status (BS-005 rule)', () => {
    const enforcer = new RunCapEnforcer(1);
    enforcer.tryLoad('existing');
    const blocked = enforcer.tryLoad('new-run');
    expect(blocked.blockedRunId).toBe('new-run');
    expect(blocked.capExceeded).toBe(true);
  });

  it('frees slot when run is unloaded', () => {
    const enforcer = new RunCapEnforcer(2);
    enforcer.tryLoad('r1');
    enforcer.tryLoad('r2');
    enforcer.unload('r1');
    const s3 = enforcer.tryLoad('r3');
    expect(s3.capExceeded).toBe(false);
  });

  it('default cap is 3 (MAX_ACTIVE_RUNS)', () => {
    const enforcer = new RunCapEnforcer();
    expect(enforcer.getStatus().cap).toBe(3);
  });

  it('fires onChange when load/unload occurs', () => {
    const cb = jest.fn();
    const enforcer = new RunCapEnforcer(3);
    enforcer.onChange(cb);
    enforcer.tryLoad('r1');
    expect(cb).toHaveBeenCalled();
  });

  it('repeated loading of same run does not change status', () => {
    const enforcer = new RunCapEnforcer(2);
    enforcer.tryLoad('r1');
    const status1 = enforcer.tryLoad('r1'); // same run again
    expect(status1.activeFullResolutionRuns).toBe(1); // not 2
  });
});
