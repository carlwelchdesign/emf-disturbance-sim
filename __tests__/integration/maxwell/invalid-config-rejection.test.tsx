/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports, react/display-name, @typescript-eslint/no-unused-vars */
/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';

// Mock MUI
jest.mock('@mui/material', () => ({
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Typography: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
  ),
  Alert: ({ children, severity, ...props }: any) => (
    <div role="alert" data-severity={severity} {...props}>{children}</div>
  ),
  AlertTitle: ({ children }: any) => <strong>{children}</strong>,
  List: ({ children }: any) => <ul>{children}</ul>,
  ListItem: ({ children }: any) => <li>{children}</li>,
  ListItemText: ({ primary, secondary }: any) => <span>{primary}{secondary}</span>,
  Stack: ({ children }: any) => <div>{children}</div>,
  Collapse: ({ children, 'in': open }: any) => open ? <div>{children}</div> : null,
  Paper: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  IconButton: ({ children, onClick, 'aria-label': ariaLabel, ...props }: any) => (
    <button onClick={onClick} aria-label={ariaLabel} {...props}>{children}</button>
  ),
  TextField: ({ label, value, onChange, error, helperText, ...props }: any) => (
    <div>
      <label>{label}</label>
      <input
        value={value || ''}
        onChange={onChange}
        aria-invalid={error}
        data-helper={helperText}
        {...props}
      />
      {helperText && <span role="alert">{helperText}</span>}
    </div>
  ),
  FormHelperText: ({ children }: any) => <span>{children}</span>,
}));

jest.mock('@mui/icons-material/Close', () => () => <span>X</span>);
jest.mock('@mui/icons-material/Warning', () => () => <span>!</span>);
jest.mock('@mui/icons-material/CheckCircle', () => () => <span>✓</span>);

jest.mock('../../../app/lab/hooks/useLabStore', () => ({
  useLabStore: (selector: any) => selector({
    maxwellErrors: {},
    maxwellRuns: [],
    maxwellActiveRunId: null,
  }),
}));

describe('SimulationSetupValidation', () => {
  it('renders without crashing', async () => {
    const { SimulationSetupValidation } = await import('../../../app/lab/components/ControlPanel/SimulationSetupValidation');
    const { container } = render(<SimulationSetupValidation runId={null} />);
    expect(container).toBeTruthy();
  });

  it('has ARIA region role (A11Y-001)', async () => {
    const { SimulationSetupValidation } = await import('../../../app/lab/components/ControlPanel/SimulationSetupValidation');
    render(<SimulationSetupValidation runId={null} />);
    expect(document.querySelector('[role="region"]')).toBeTruthy();
  });

  it('shows errors when provided directly', async () => {
    const { SimulationSetupValidation } = await import('../../../app/lab/components/ControlPanel/SimulationSetupValidation');
    const errors = [
      {
        runId: 'run-1',
        category: 'configuration' as const,
        code: 'CONFIG_ERR',
        message: 'Invalid grid resolution',
        recommendedActions: ['Increase dx to at least 0.001 m'],
        blocking: true,
      },
    ];
    render(<SimulationSetupValidation runId="run-1" errors={errors} />);
    expect(document.body.textContent).toContain('Invalid grid resolution');
  });

  it('shows recommended actions', async () => {
    const { SimulationSetupValidation } = await import('../../../app/lab/components/ControlPanel/SimulationSetupValidation');
    const errors = [
      {
        runId: 'run-1',
        category: 'configuration' as const,
        code: 'CONFIG_ERR',
        message: 'Bad config',
        recommendedActions: ['Try using auto-CFL time step'],
        blocking: true,
      },
    ];
    render(<SimulationSetupValidation runId="run-1" errors={errors} />);
    expect(document.body.textContent).toContain('Try using auto-CFL time step');
  });
});

describe('Pre-run validator', () => {
  it('rejects empty materials', () => {
    const { validateRunRequest } = require('../../../app/lab/modules/maxwell/core/pre-run-validator');
    const request = {
      configurationId: 'cfg-bad',
      methodFamily: 'fdtd',
      domain: { extent: { min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } }, discretizationIntent: 'auto', gridResolution: { dx: 0.1, dy: 0.1, dz: 0.1 }, coordinateSystem: 'cartesian' },
      materials: [], // INVALID
      boundaryConditions: [{ id: 'bc-1', type: 'pec', surfaceSelector: 'all', parameters: {} }],
      runControls: { timeWindow: 1e-9, timeStepHint: 0, samplingPlan: { spatialDecimation: 1, temporalDecimation: 1 } },
      requestedMetrics: [],
      scenarioClass: 'coarse',
    };
    const errors = validateRunRequest(request);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.every((e: any) => e.blocking)).toBe(true);
  });

  it('rejects CFL violation', () => {
    const { validateRunRequest } = require('../../../app/lab/modules/maxwell/core/pre-run-validator');
    const request = {
      configurationId: 'cfg-cfl',
      methodFamily: 'fdtd',
      domain: { extent: { min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } }, discretizationIntent: 'manual', gridResolution: { dx: 0.1, dy: 0.1, dz: 0.1 }, coordinateSystem: 'cartesian' },
      materials: [{ id: 'm1', permittivity: 1, permeability: 1, conductivity: 0, lossModel: 'none', isPhysical: true }],
      boundaryConditions: [{ id: 'bc-1', type: 'pec', surfaceSelector: 'all', parameters: {} }],
      runControls: { timeWindow: 1e-9, timeStepHint: 1.0, samplingPlan: { spatialDecimation: 1, temporalDecimation: 1 } }, // WAY too large dt
      requestedMetrics: [],
      scenarioClass: 'coarse',
    };
    const errors = validateRunRequest(request);
    const cflError = errors.find((e: any) => e.code === 'CFL_VIOLATION');
    expect(cflError).toBeDefined();
  });

  it('accepts valid request with zero actionable errors', () => {
    const { validateRunRequest } = require('../../../app/lab/modules/maxwell/core/pre-run-validator');
    const request = {
      configurationId: 'cfg-valid',
      methodFamily: 'fdtd',
      domain: { extent: { min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } }, discretizationIntent: 'auto', gridResolution: { dx: 0.1, dy: 0.1, dz: 0.1 }, coordinateSystem: 'cartesian' },
      materials: [{ id: 'm1', permittivity: 1, permeability: 1, conductivity: 0, lossModel: 'none', isPhysical: true }],
      boundaryConditions: [{ id: 'bc-1', type: 'pec', surfaceSelector: 'all', parameters: {} }],
      runControls: { timeWindow: 1e-10, timeStepHint: 0, samplingPlan: { spatialDecimation: 1, temporalDecimation: 1 } },
      requestedMetrics: [],
      scenarioClass: 'coarse',
    };
    const errors = validateRunRequest(request);
    expect(errors.filter((e: any) => e.blocking)).toHaveLength(0);
  });
});
