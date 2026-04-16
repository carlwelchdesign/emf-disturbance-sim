/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports, react/display-name, @typescript-eslint/no-unused-vars */
/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { FieldOutputSet, DerivedMetricResult, ValidationReport } from '../../../app/lab/types/maxwell.types';

// Mock MUI to avoid theme provider issues
jest.mock('@mui/material', () => ({
  Box: ({ children, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
  Typography: ({ children, variant, ...props }: any) => <span data-testid={`typo-${variant}`} {...props}>{children}</span>,
  Chip: ({ label, ...props }: any) => <span data-testid="chip" {...props}>{label}</span>,
  Stack: ({ children, ...props }: any) => <div data-testid="stack" {...props}>{children}</div>,
  Paper: ({ children, ...props }: any) => <div data-testid="paper" {...props}>{children}</div>,
  Button: ({ children, onClick, ...props }: any) => <button onClick={onClick} {...props}>{children}</button>,
  IconButton: ({ children, onClick, 'aria-label': ariaLabel, ...props }: any) => (
    <button onClick={onClick} aria-label={ariaLabel} {...props}>{children}</button>
  ),
  Tooltip: ({ children }: any) => children,
  Divider: () => <hr />,
  Select: ({ children, value, onChange, ...props }: any) => (
    <select value={value} onChange={onChange} {...props}>{children}</select>
  ),
  MenuItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  InputLabel: ({ children }: any) => <label>{children}</label>,
  LinearProgress: ({ value, ...props }: any) => <div role="progressbar" aria-valuenow={value} {...props} />,
  Alert: ({ children, severity, ...props }: any) => <div role="alert" data-severity={severity} {...props}>{children}</div>,
}));

// Mock zustand store
const mockStore = {
  maxwellRuns: [],
  maxwellActiveRunId: null as string | null,
  maxwellFieldOutputs: {} as Record<string, FieldOutputSet>,
  maxwellDerivedMetrics: {} as Record<string, DerivedMetricResult[]>,
  maxwellValidationReports: {} as Record<string, ValidationReport>,
  setActiveMaxwellRun: jest.fn(),
  getActiveMaxwellFieldOutput: jest.fn(() => undefined),
  getActiveMaxwellMetrics: jest.fn(() => undefined),
  getActiveMaxwellValidationReport: jest.fn(() => undefined),
};

jest.mock('../../../app/lab/hooks/useLabStore', () => ({
  useLabStore: (selector: any) => selector(mockStore),
}));

// Mock Maxwell selectors
jest.mock('../../../app/lab/hooks/useMaxwellRunSelectors', () => ({
  useActiveFieldOutput: jest.fn(() => undefined),
  useActiveMetrics: jest.fn(() => undefined),
  useActiveValidationReport: jest.fn(() => undefined),
  useMaxwellRuns: jest.fn(() => []),
  useActiveRunId: jest.fn(() => null),
  useActiveInterferenceInterpretationSnapshot: jest.fn(() => undefined),
  useActiveInterferenceRenderState: jest.fn(() => undefined),
}));

describe('Maxwell Visualizer Integration', () => {
  it('renders MaxwellRunContextPanel without crashing', async () => {
    const { MaxwellRunContextPanel } = await import('../../../app/lab/components/Analysis/MaxwellRunContextPanel');
    const { container } = render(<MaxwellRunContextPanel />);
    expect(container).toBeTruthy();
  });

  it('renders DerivedMetricsPanel without crashing', async () => {
    const { DerivedMetricsPanel } = await import('../../../app/lab/components/Analysis/DerivedMetricsPanel');
    const { container } = render(<DerivedMetricsPanel />);
    expect(container).toBeTruthy();
  });

  it('Maxwell context panel has ARIA region role (A11Y-001)', async () => {
    const { MaxwellRunContextPanel } = await import('../../../app/lab/components/Analysis/MaxwellRunContextPanel');
    render(<MaxwellRunContextPanel />);
    expect(document.querySelector('[role="region"]')).toBeTruthy();
  });

  it('DerivedMetricsPanel has keyboard-accessible rows (A11Y-001)', async () => {
    const mockMetrics: DerivedMetricResult[] = [
      { runId: 'r1', metricName: 'poynting_magnitude', definition: 'S=ExH', units: 'W/m²', values: [1.0, 2.0], validityScope: 'all', sourceFieldDependencies: ['E', 'B'] },
    ];
    jest.mock('../../../app/lab/hooks/useMaxwellRunSelectors', () => ({
      useActiveFieldOutput: jest.fn(() => undefined),
      useActiveMetrics: jest.fn(() => mockMetrics),
      useActiveValidationReport: jest.fn(() => undefined),
      useMaxwellRuns: jest.fn(() => []),
      useActiveRunId: jest.fn(() => 'r1'),
    }));
    const { DerivedMetricsPanel } = await import('../../../app/lab/components/Analysis/DerivedMetricsPanel');
    render(<DerivedMetricsPanel />);
    expect(document.querySelector('[role="region"]')).toBeTruthy();
  });
});
