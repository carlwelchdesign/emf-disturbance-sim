/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports, react/display-name, @typescript-eslint/no-unused-vars */
/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';

jest.mock('@mui/material', () => ({
  Box: ({ children, role, 'aria-label': ariaLabel, 'aria-live': ariaLive, tabIndex, onKeyDown, ...props }: any) => (
    <div role={role} aria-label={ariaLabel} aria-live={ariaLive} tabIndex={tabIndex} onKeyDown={onKeyDown} {...props}>{children}</div>
  ),
  Typography: ({ children, role, 'aria-live': ariaLive, 'aria-label': ariaLabel, ...props }: any) => (
    <span role={role} aria-live={ariaLive} aria-label={ariaLabel} {...props}>{children}</span>
  ),
  Paper: ({ children, role, 'aria-label': ariaLabel, tabIndex, onKeyDown, ...props }: any) => (
    <div role={role} aria-label={ariaLabel} tabIndex={tabIndex} onKeyDown={onKeyDown} {...props}>{children}</div>
  ),
  Stack: ({ children, role, 'aria-label': ariaLabel, 'aria-live': ariaLive, 'aria-relevant': ariaRel, ...props }: any) => (
    <div role={role} aria-label={ariaLabel} aria-live={ariaLive} aria-relevant={ariaRel} {...props}>{children}</div>
  ),
  Chip: ({ label, tabIndex, color, 'aria-label': ariaLabel, ...props }: any) => (
    <span tabIndex={tabIndex} aria-label={ariaLabel} data-color={color} {...props}>{label}</span>
  ),
  Select: ({ children, value, onChange, inputProps, 'aria-label': ariaLabel, ...props }: any) => (
    <select value={value} onChange={onChange} aria-label={ariaLabel} tabIndex={inputProps?.tabIndex} {...props}>{children}</select>
  ),
  MenuItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  InputLabel: ({ children, id }: any) => <label id={id}>{children}</label>,
  Divider: () => <hr />,
  IconButton: ({ children, onClick, 'aria-label': ariaLabel, tabIndex, disabled, ...props }: any) => (
    <button onClick={onClick} aria-label={ariaLabel} tabIndex={tabIndex} disabled={disabled} {...props}>{children}</button>
  ),
  Slider: ({ 'aria-label': ariaLabel, 'aria-valuetext': ariaValuetext, tabIndex, ...props }: any) => (
    <input type="range" aria-label={ariaLabel} aria-valuetext={ariaValuetext} tabIndex={tabIndex} {...props} />
  ),
  Tooltip: ({ children }: any) => children,
  Alert: ({ children, role, 'aria-live': ariaLive, 'aria-atomic': ariaAtomic, tabIndex, severity, ...props }: any) => (
    <div role={role} aria-live={ariaLive} aria-atomic={ariaAtomic} tabIndex={tabIndex} data-severity={severity} {...props}>{children}</div>
  ),
  AlertTitle: ({ children }: any) => <strong>{children}</strong>,
  Collapse: ({ children, 'in': open }: any) => open ? <div>{children}</div> : null,
  List: ({ children, role, 'aria-label': ariaLabel }: any) => <ul role={role} aria-label={ariaLabel}>{children}</ul>,
  ListItem: ({ children, role, 'aria-label': ariaLabel }: any) => <li role={role} aria-label={ariaLabel}>{children}</li>,
  ListItemText: ({ primary, secondary }: any) => <span>{primary}{secondary}</span>,
  LinearProgress: ({ 'aria-label': ariaLabel }: any) => <div role="progressbar" aria-label={ariaLabel} />,
  Button: ({ children, onClick, disabled, tabIndex, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} tabIndex={tabIndex} {...props}>{children}</button>
  ),
}));

jest.mock('@mui/icons-material/PlayArrow', () => () => <span>▶</span>);

jest.mock('../../../app/lab/hooks/useLabStore', () => ({
  useLabStore: (selector: any) => selector({
    maxwellRuns: [],
    maxwellActiveRunId: null,
    maxwellErrors: {},
    sectionDisclosure: { 'maxwell-solver': true },
    toggleSectionExpanded: jest.fn(),
    setActiveMaxwellRun: jest.fn(),
  }),
}));

jest.mock('../../../app/lab/hooks/useMaxwellRunSelectors', () => ({
  useActiveFieldOutput: jest.fn(() => undefined),
  useActiveMetrics: jest.fn(() => undefined),
  useActiveValidationReport: jest.fn(() => undefined),
  useMaxwellRuns: jest.fn(() => []),
  useActiveRunId: jest.fn(() => null),
  useActiveInterferenceInterpretationSnapshot: jest.fn(() => undefined),
  useActiveInterferenceRenderState: jest.fn(() => undefined),
}));

describe('A11Y-001: ARIA roles and keyboard accessibility', () => {
  it('MaxwellRunContextPanel has [role="region"] (A11Y-001)', async () => {
    const { MaxwellRunContextPanel } = await import('../../../app/lab/components/Analysis/MaxwellRunContextPanel');
    const { container } = render(<MaxwellRunContextPanel />);
    expect(container.querySelector('[role="region"]')).toBeTruthy();
  });

  it('DerivedMetricsPanel has [role="region"] (A11Y-001)', async () => {
    const { DerivedMetricsPanel } = await import('../../../app/lab/components/Analysis/DerivedMetricsPanel');
    const { container } = render(<DerivedMetricsPanel />);
    expect(container.querySelector('[role="region"]')).toBeTruthy();
  });

  it('MaxwellRunStatusBanner has aria-live region (A11Y-001)', async () => {
    const { MaxwellRunStatusBanner } = await import('../../../app/lab/components/Analysis/MaxwellRunStatusBanner');
    const { container } = render(<MaxwellRunStatusBanner />);
    expect(container.querySelector('[aria-live]')).toBeTruthy();
  });

  it('SimulationSetupValidation has [role="region"] (A11Y-001)', async () => {
    const { SimulationSetupValidation } = await import('../../../app/lab/components/ControlPanel/SimulationSetupValidation');
    const { container } = render(<SimulationSetupValidation runId={null} />);
    expect(container.querySelector('[role="region"]')).toBeTruthy();
  });

  it('FieldStrengthDisplay has [role="region"] and tabIndex (A11Y-001)', async () => {
    const { FieldStrengthDisplay } = await import('../../../app/lab/components/Analysis/FieldStrengthDisplay');
    const { container } = render(<FieldStrengthDisplay value={100} />);
    expect(container.querySelector('[role="region"]')).toBeTruthy();
    expect(container.querySelector('[tabindex="0"]')).toBeTruthy();
  });

  it('MaxwellRunControls has [role="region"] (A11Y-001)', async () => {
    const { MaxwellRunControls } = await import('../../../app/lab/components/ControlPanel/MaxwellRunControls');
    const { container } = render(<MaxwellRunControls />);
    expect(container.querySelector('[role="region"]')).toBeTruthy();
  });
});
