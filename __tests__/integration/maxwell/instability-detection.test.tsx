/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports, react/display-name, @typescript-eslint/no-unused-vars */
/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';

jest.mock('@mui/material', () => ({
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Typography: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  Alert: ({ children, severity, ...props }: any) => (
    <div role="alert" data-severity={severity} {...props}>{children}</div>
  ),
  AlertTitle: ({ children }: any) => <strong>{children}</strong>,
  Collapse: ({ children, 'in': open }: any) => open ? <div>{children}</div> : null,
  IconButton: ({ children, onClick, 'aria-label': ariaLabel, ...props }: any) => (
    <button onClick={onClick} aria-label={ariaLabel} {...props}>{children}</button>
  ),
  Stack: ({ children }: any) => <div>{children}</div>,
  Chip: ({ label, ...props }: any) => <span {...props}>{label}</span>,
  Button: ({ children, onClick, ...props }: any) => <button onClick={onClick} {...props}>{children}</button>,
}));

jest.mock('@mui/icons-material/Close', () => () => <span>X</span>);
jest.mock('@mui/icons-material/Warning', () => () => <span>!</span>);

jest.mock('../../../app/lab/hooks/useLabStore', () => ({
  useLabStore: (selector: any) => selector({
    maxwellErrors: {},
    maxwellRuns: [],
    maxwellActiveRunId: null,
  }),
}));

jest.mock('../../../app/lab/hooks/useMaxwellRunSelectors', () => ({
  useActiveRunId: () => null,
  useMaxwellRuns: () => [],
}));

describe('InstabilityDetector', () => {
  it('detects NaN in field data', () => {
    const { InstabilityDetector } = require('../../../app/lab/modules/maxwell/core/instability-detector');
    const detector = new InstabilityDetector();
    const fieldWithNaN = {
      step: 1, time: 1e-12,
      ex: [NaN], ey: [0], ez: [0],
    };
    const result = detector.checkStep(fieldWithNaN, { step: 1, time: 1e-12, ex: [0], ey: [0], ez: [0] });
    expect(result.stable).toBe(false);
    expect(result.reason).toContain('NaN');
  });

  it('detects Infinity in field data', () => {
    const { InstabilityDetector } = require('../../../app/lab/modules/maxwell/core/instability-detector');
    const detector = new InstabilityDetector();
    const fieldWithInf = {
      step: 1, time: 1e-12,
      ex: [Infinity], ey: [0], ez: [0],
    };
    const result = detector.checkStep(fieldWithInf, { step: 1, time: 1e-12, ex: [0], ey: [0], ez: [0] });
    expect(result.stable).toBe(false);
    expect(result.reason).toContain('Inf');
  });

  it('detects divergence', () => {
    const { InstabilityDetector } = require('../../../app/lab/modules/maxwell/core/instability-detector');
    const detector = new InstabilityDetector({ divergenceThreshold: 1e6 });
    const divergingField = {
      step: 1, time: 1e-12,
      ex: [1e8], ey: [0], ez: [0],
    };
    const result = detector.checkStep(divergingField, { step: 1, time: 1e-12, ex: [0], ey: [0], ez: [0] });
    expect(result.stable).toBe(false);
  });

  it('passes stable data', () => {
    const { InstabilityDetector } = require('../../../app/lab/modules/maxwell/core/instability-detector');
    const detector = new InstabilityDetector();
    const stableField = {
      step: 1, time: 1e-12,
      ex: [0.5], ey: [0.3], ez: [0.1],
    };
    const result = detector.checkStep(stableField, { step: 1, time: 1e-12, ex: [0.4], ey: [0.2], ez: [0.05] });
    expect(result.stable).toBe(true);
  });
});

describe('MaxwellRunStatusBanner', () => {
  it('renders without crashing', async () => {
    const { MaxwellRunStatusBanner } = await import('../../../app/lab/components/Analysis/MaxwellRunStatusBanner');
    const { container } = render(<MaxwellRunStatusBanner />);
    expect(container).toBeTruthy();
  });

  it('has ARIA live region (A11Y-001)', async () => {
    const { MaxwellRunStatusBanner } = await import('../../../app/lab/components/Analysis/MaxwellRunStatusBanner');
    render(<MaxwellRunStatusBanner />);
    // Live region for status announcements
    expect(document.querySelector('[aria-live]')).toBeTruthy();
  });

  it('shows error alert with ARIA role when errors provided', async () => {
    const { MaxwellRunStatusBanner } = await import('../../../app/lab/components/Analysis/MaxwellRunStatusBanner');
    const errors = [
      {
        runId: 'run-x',
        category: 'stability' as const,
        code: 'INSTABILITY_DETECTED',
        message: 'NaN detected at step 42',
        recommendedActions: ['Reduce time step'],
        blocking: true,
      },
    ];
    render(<MaxwellRunStatusBanner runId="run-x" errors={errors} />);
    const alerts = document.querySelectorAll('[role="alert"]');
    expect(alerts.length).toBeGreaterThan(0);
  });
});
