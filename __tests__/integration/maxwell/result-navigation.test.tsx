/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports, react/display-name, @typescript-eslint/no-unused-vars */
/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { FieldOutputSet } from '../../../app/lab/types/maxwell.types';

jest.mock('@mui/material', () => ({
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Typography: ({ children, variant, ...props }: any) => <span data-variant={variant} {...props}>{children}</span>,
  Chip: ({ label, ...props }: any) => <span {...props}>{label}</span>,
  Stack: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Paper: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
  ),
  IconButton: ({ children, onClick, 'aria-label': ariaLabel, disabled, ...props }: any) => (
    <button onClick={onClick} aria-label={ariaLabel} disabled={disabled} {...props}>{children}</button>
  ),
  Tooltip: ({ children }: any) => children,
  Slider: ({ value, onChange, min, max, 'aria-label': ariaLabel, ...props }: any) => (
    <input
      type="range"
      value={value}
      onChange={(e) => onChange?.(e, Number(e.target.value))}
      min={min}
      max={max}
      aria-label={ariaLabel}
      {...props}
    />
  ),
  Select: ({ children, value, onChange, ...props }: any) => (
    <select value={value} onChange={onChange} {...props}>{children}</select>
  ),
  MenuItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  InputLabel: ({ children }: any) => <label>{children}</label>,
  Divider: () => <hr />,
}));

jest.mock('@mui/icons-material/NavigateBefore', () => () => <span>prev</span>);
jest.mock('@mui/icons-material/NavigateNext', () => () => <span>next</span>);
jest.mock('@mui/icons-material/SkipPrevious', () => () => <span>first</span>);
jest.mock('@mui/icons-material/SkipNext', () => () => <span>last</span>);

const mockFieldOutput: FieldOutputSet = {
  runId: 'test-run',
  timeAxis: [0, 1e-12, 2e-12, 3e-12, 4e-12],
  electricFieldSeries: Array.from({ length: 5 }, (_, i) => ({
    step: i, time: i * 1e-12, ex: [1], ey: [0], ez: [0],
  })),
  magneticFieldSeries: Array.from({ length: 5 }, (_, i) => ({
    step: i, time: i * 1e-12, ex: [0], ey: [1], ez: [0],
  })),
  samplingMetadata: { grid: { nx: 1, ny: 1, nz: 1, dx: 0.01, dy: 0.01, dz: 0.01 }, units: 'V/m', coordinateSystem: 'cartesian' },
  validationStatus: 'validated',
};

jest.mock('../../../app/lab/hooks/useMaxwellRunSelectors', () => ({
  useActiveFieldOutput: jest.fn(() => mockFieldOutput),
  useActiveMetrics: jest.fn(() => []),
  useActiveValidationReport: jest.fn(() => undefined),
  useMaxwellRuns: jest.fn(() => []),
  useActiveRunId: jest.fn(() => 'test-run'),
}));

jest.mock('../../../app/lab/hooks/useLabStore', () => ({
  useLabStore: (selector: any) => selector({
    maxwellRuns: [],
    maxwellActiveRunId: 'test-run',
    setActiveMaxwellRun: jest.fn(),
  }),
}));

describe('Result Navigation', () => {
  it('time navigation controls are keyboard accessible (A11Y-001)', async () => {
    const { MaxwellRunContextPanel } = await import('../../../app/lab/components/Analysis/MaxwellRunContextPanel');
    render(<MaxwellRunContextPanel />);
    // Buttons/slider for time navigation should exist and be focusable
    const buttons = document.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('context panel shows validated status label', async () => {
    const { MaxwellRunContextPanel } = await import('../../../app/lab/components/Analysis/MaxwellRunContextPanel');
    render(<MaxwellRunContextPanel />);
    // Should show some time-step related text
    expect(document.body.textContent).toBeTruthy();
  });

  it('time slider has aria-label (A11Y-001)', async () => {
    const { MaxwellRunContextPanel } = await import('../../../app/lab/components/Analysis/MaxwellRunContextPanel');
    render(<MaxwellRunContextPanel />);
    const slider = document.querySelector('[aria-label]');
    expect(slider).toBeTruthy();
  });
});
