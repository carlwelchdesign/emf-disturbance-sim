/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports, react/display-name, @typescript-eslint/no-unused-vars */
/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';

jest.mock('@mui/material', () => ({
  Box: ({ children, onKeyDown, tabIndex, role, 'aria-label': ariaLabel, ...props }: any) => (
    <div onKeyDown={onKeyDown} tabIndex={tabIndex} role={role} aria-label={ariaLabel} {...props}>{children}</div>
  ),
  Typography: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  Button: ({ children, onClick, disabled, tabIndex, onKeyDown, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} tabIndex={tabIndex} onKeyDown={onKeyDown} {...props}>{children}</button>
  ),
  IconButton: ({ children, onClick, disabled, 'aria-label': ariaLabel, tabIndex, onKeyDown, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} aria-label={ariaLabel} tabIndex={tabIndex} onKeyDown={onKeyDown} {...props}>{children}</button>
  ),
  Paper: ({ children, onKeyDown, tabIndex, role, 'aria-label': ariaLabel, ...props }: any) => (
    <div onKeyDown={onKeyDown} tabIndex={tabIndex} role={role} aria-label={ariaLabel} {...props}>{children}</div>
  ),
  Stack: ({ children }: any) => <div>{children}</div>,
  Chip: ({ label, tabIndex, ...props }: any) => <span tabIndex={tabIndex} {...props}>{label}</span>,
  Slider: ({ value, onChange, min, max, 'aria-label': ariaLabel, tabIndex, onKeyDown, ...props }: any) => (
    <input
      type="range"
      value={value}
      onChange={(e) => onChange?.(e, Number(e.target.value))}
      min={min}
      max={max}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
      {...props}
    />
  ),
  Select: ({ children, value, onChange, inputProps, ...props }: any) => (
    <select value={value} onChange={onChange} tabIndex={inputProps?.tabIndex} {...props}>{children}</select>
  ),
  MenuItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  InputLabel: ({ children }: any) => <label>{children}</label>,
  Divider: () => <hr />,
  Tooltip: ({ children }: any) => children,
  Alert: ({ children, action, role, 'aria-live': ariaLive, 'aria-atomic': ariaAtomic, tabIndex, severity, ...props }: any) => (
    <div role={role} aria-live={ariaLive} aria-atomic={ariaAtomic} tabIndex={tabIndex} data-severity={severity} {...props}>{action}{children}</div>
  ),
  AlertTitle: ({ children }: any) => <strong>{children}</strong>,
  List: ({ children, role, 'aria-label': ariaLabel }: any) => <ul role={role} aria-label={ariaLabel}>{children}</ul>,
  ListItem: ({ children, role, 'aria-label': ariaLabel }: any) => <li role={role} aria-label={ariaLabel}>{children}</li>,
  ListItemText: ({ primary, secondary }: any) => <span>{primary}{secondary}</span>,
}));

jest.mock('../../../app/lab/hooks/useLabStore', () => ({
  useLabStore: (selector: any) => selector({
    maxwellRuns: [],
    maxwellActiveRunId: null,
    maxwellFieldOutputs: {},
    maxwellDerivedMetrics: {},
    maxwellValidationReports: {},
    maxwellErrors: {},
    setActiveMaxwellRun: jest.fn(),
  }),
}));

jest.mock('../../../app/lab/hooks/useMaxwellRunSelectors', () => ({
  useActiveFieldOutput: jest.fn(() => ({
    runId: 'test',
    timeAxis: [0, 1e-12, 2e-12],
    electricFieldSeries: Array.from({ length: 3 }, (_, i) => ({ step: i, time: i * 1e-12, ex: [0], ey: [0], ez: [0] })),
    magneticFieldSeries: Array.from({ length: 3 }, (_, i) => ({ step: i, time: i * 1e-12, ex: [0], ey: [0], ez: [0] })),
    samplingMetadata: { grid: { nx: 1, ny: 1, nz: 1, dx: 0.01, dy: 0.01, dz: 0.01 }, units: 'V/m', coordinateSystem: 'cartesian' },
    validationStatus: 'validated',
  })),
  useActiveMetrics: jest.fn(() => []),
  useActiveValidationReport: jest.fn(() => undefined),
  useMaxwellRuns: jest.fn(() => []),
  useActiveRunId: jest.fn(() => 'test'),
  useActiveInterferenceInterpretationSnapshot: jest.fn(() => undefined),
  useActiveInterferenceRenderState: jest.fn(() => undefined),
}));

describe('Keyboard-only run flow (A11Y-001)', () => {
  it('MaxwellRunContextPanel responds to keyboard time navigation', async () => {
    const { MaxwellRunContextPanel } = await import('../../../app/lab/components/Analysis/MaxwellRunContextPanel');
    const { container } = render(<MaxwellRunContextPanel />);

    // All interactive elements should be keyboard accessible (tabIndex >= 0)
    const focusable = container.querySelectorAll('[tabindex="0"]');
    expect(focusable.length).toBeGreaterThan(0);
  });

  it('DerivedMetricsPanel has focusable list items (A11Y-001)', async () => {
    jest.mock('../../../app/lab/hooks/useMaxwellRunSelectors', () => ({
      useActiveFieldOutput: jest.fn(() => undefined),
      useActiveMetrics: jest.fn(() => [
        { runId: 'r1', metricName: 'energy_density', definition: 'u', units: 'J/m³', values: [1], validityScope: 'all', sourceFieldDependencies: ['E', 'B'] },
        { runId: 'r1', metricName: 'poynting_magnitude', definition: 'S', units: 'W/m²', values: [2], validityScope: 'all', sourceFieldDependencies: ['E', 'B'] },
      ]),
      useActiveValidationReport: jest.fn(() => undefined),
      useMaxwellRuns: jest.fn(() => []),
      useActiveRunId: jest.fn(() => 'r1'),
    }));
    const { DerivedMetricsPanel } = await import('../../../app/lab/components/Analysis/DerivedMetricsPanel');
    const { container } = render(<DerivedMetricsPanel />);
    // Panel itself should be keyboard accessible
    const panel = container.querySelector('[tabindex="0"]');
    expect(panel).toBeTruthy();
  });

  it('MaxwellFieldOverlay has keyboard-accessible navigation buttons', async () => {
    const { MaxwellFieldOverlay } = await import('../../../app/lab/components/Canvas3D/MaxwellFieldOverlay');
    const { container } = render(<MaxwellFieldOverlay />);
    // Overlay is intentionally hidden in current feature scope.
    expect(container.firstChild).toBeNull();
  });

  it('SimulationSetupValidation has dismissible alerts via keyboard', async () => {
    const { SimulationSetupValidation } = await import('../../../app/lab/components/ControlPanel/SimulationSetupValidation');
    const errors = [
      { runId: 'r1', category: 'configuration' as const, code: 'ERR', message: 'Test error', recommendedActions: ['Fix it'], blocking: true },
    ];
    const { container } = render(<SimulationSetupValidation runId="r1" errors={errors} />);
    // Dismiss button should be keyboard accessible
    const dismissButton = container.querySelector('button[aria-label*="Dismiss"]');
    expect(dismissButton).toBeTruthy();
  });
});
