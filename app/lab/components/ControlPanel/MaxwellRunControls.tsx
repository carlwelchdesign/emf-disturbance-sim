'use client';
/**
 * Maxwell Run Controls — sidebar section for configuring and launching Maxwell runs.
 * Full keyboard operability (tab order, enter/space activation) and ARIA live regions.
 *
 * A11Y-001: tab order, enter/space activation, ARIA live regions.
 */
import React, { useCallback, useState } from 'react';
import {
  Box, Typography, Stack, Chip, Divider, LinearProgress,
  Button, Select, MenuItem, TextField, FormControl, InputLabel,
  Collapse, Alert,
} from '@mui/material';
import { useLabStore } from '../../hooks/useLabStore';
import { useMaxwellRuns } from '../../hooks/useMaxwellRunSelectors';
import {
  SimulationRunStatus, ScenarioClass, SubmitSimulationRunRequest,
} from '../../types/maxwell.types';
import { SectionPanel } from './SectionPanel';
import { SIDEBAR_SECTION_TITLES } from '../../lib/sidebar-layout';

const STATUS_COLOR: Record<SimulationRunStatus, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  draft: 'default',
  queued: 'primary',
  running: 'primary',
  completed_unvalidated: 'warning',
  validated: 'success',
  non_validated: 'warning',
  unstable: 'error',
  failed: 'error',
  cancelled: 'default',
  rejected: 'error',
};

const SCENARIO_DEFAULTS: Record<ScenarioClass, { nx: number; ny: number; nz: number; steps: number; timeWindow: number }> = {
  coarse:   { nx: 30,  ny: 30,  nz: 30,  steps: 500,   timeWindow: 1e-9 },
  medium:   { nx: 80,  ny: 80,  nz: 80,  steps: 2000,  timeWindow: 5e-9 },
  baseline: { nx: 150, ny: 150, nz: 150, steps: 5000,  timeWindow: 1e-8 },
};

function buildDefaultRequest(scenarioClass: ScenarioClass): SubmitSimulationRunRequest {
  const d = SCENARIO_DEFAULTS[scenarioClass];
  const dx = 0.01 / d.nx;
  return {
    configurationId: `cfg-${Date.now()}`,
    methodFamily: 'fdtd',
    scenarioClass,
    domain: {
      extent: { min: { x: 0, y: 0, z: 0 }, max: { x: 0.01, y: 0.01, z: 0.01 } },
      discretizationIntent: 'auto',
      gridResolution: { dx, dy: dx, dz: dx },
      coordinateSystem: 'cartesian',
    },
    materials: [{
      id: 'mat-vacuum',
      permittivity: 1,
      permeability: 1,
      conductivity: 0,
      lossModel: 'none',
      isPhysical: true,
    }],
    boundaryConditions: [{
      id: 'bc-absorbing',
      type: 'absorbing',
      surfaceSelector: 'all',
      parameters: {},
    }],
    runControls: {
      timeWindow: d.timeWindow,
      timeStepHint: 0,
      samplingPlan: { spatialDecimation: 2, temporalDecimation: 10 },
    },
    requestedMetrics: ['poynting_vector', 'energy_density'],
  };
}

export interface MaxwellRunControlsProps {
  className?: string;
}

export function MaxwellRunControls({ className }: MaxwellRunControlsProps) {
  const sectionDisclosure = useLabStore((s) => s.sectionDisclosure);
  const toggleSectionExpanded = useLabStore((s) => s.toggleSectionExpanded);

  return (
    <SectionPanel
      sectionId="maxwell-solver"
      title={SIDEBAR_SECTION_TITLES['maxwell-solver']}
      ariaDescription="Maxwell solver controls section"
      expanded={sectionDisclosure['maxwell-solver']}
      onToggleExpanded={() => toggleSectionExpanded('maxwell-solver')}
    >
      <MaxwellRunControlsContent className={className} />
    </SectionPanel>
  );
}

/** Content-only version for embedding in canvas overlays */
export function MaxwellRunControlsContent({ className }: MaxwellRunControlsProps) {
  const runs = useMaxwellRuns();
  const setActiveMaxwellRun = useLabStore((s) => s.setActiveMaxwellRun ?? (() => {}));
  const submitMaxwellRun = useLabStore((s) => s.submitMaxwellRun);
  const activeRunId = useLabStore((s) => s.maxwellActiveRunId ?? null);

  const [scenarioClass, setScenarioClass] = useState<ScenarioClass>('coarse');
  const [showForm, setShowForm] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const handleRunKeyDown = useCallback((e: React.KeyboardEvent, runId: string) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveMaxwellRun(runId); }
  }, [setActiveMaxwellRun]);

  const handleLaunch = useCallback(() => {
    setLastError(null);
    const request = buildDefaultRequest(scenarioClass);
    const response = submitMaxwellRun(request);
    if (response.accepted) { setActiveMaxwellRun(response.runId); setShowForm(false); }
    else { setLastError(response.errors?.map((e) => e.message).join('; ') ?? 'Run rejected'); }
  }, [scenarioClass, submitMaxwellRun, setActiveMaxwellRun]);

  const handleLaunchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleLaunch(); }
  }, [handleLaunch]);

  return (
      <Box
        role="region"
        aria-label="Full-wave Maxwell solver run management"
        className={className}
      >
        {/* Run queue list */}
        {runs.length > 0 && (
          <Stack
            spacing={0.5}
            sx={{ mb: 1 }}
            role="list"
            aria-label="Maxwell simulation runs"
            aria-live="polite"
            aria-relevant="additions removals"
          >
            {runs.map((run) => (
              <Box
                key={run.runId}
                role="listitem"
                tabIndex={0}
                aria-label={`Run ${run.runId}, status: ${run.status}${run.runId === activeRunId ? ', currently active' : ''}`}
                aria-current={run.runId === activeRunId ? 'true' : undefined}
                onClick={() => setActiveMaxwellRun(run.runId)}
                onKeyDown={(e) => handleRunKeyDown(e, run.runId)}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: run.runId === activeRunId ? 'primary.main' : 'divider',
                  cursor: 'pointer',
                  bgcolor: run.runId === activeRunId ? 'action.selected' : 'transparent',
                  '&:focus': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                    {run.runId.slice(-12)}
                  </Typography>
                  <Chip
                    label={run.status}
                    size="small"
                    color={STATUS_COLOR[run.status] ?? 'default'}
                    aria-label={`Status: ${run.status}`}
                  />
                </Stack>
                {run.status === 'running' && (
                  <LinearProgress
                    aria-label="Run in progress"
                    sx={{ mt: 0.5 }}
                  />
                )}
              </Box>
            ))}
          </Stack>
        )}

        {/* Setup form toggle */}
        <Button
          size="small"
          variant={showForm ? 'outlined' : 'contained'}
          fullWidth
          tabIndex={0}
          aria-expanded={showForm}
          aria-controls="maxwell-setup-form"
          onClick={() => setShowForm((v) => !v)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowForm((v) => !v); } }}
          sx={{ mb: 1 }}
        >
          {showForm ? 'Cancel' : runs.length === 0 ? 'Configure & Run' : 'New Run'}
        </Button>

        <Collapse in={showForm} id="maxwell-setup-form">
          <Stack spacing={1} sx={{ mb: 1 }} role="form" aria-label="Maxwell simulation setup">
            <FormControl size="small" fullWidth>
              <InputLabel id="scenario-class-label">Scenario class</InputLabel>
              <Select
                labelId="scenario-class-label"
                label="Scenario class"
                value={scenarioClass}
                onChange={(e) => setScenarioClass(e.target.value as ScenarioClass)}
                inputProps={{ 'aria-label': 'Scenario class' }}
              >
                <MenuItem value="coarse">Coarse — 30³ grid, ~fast (demo)</MenuItem>
                <MenuItem value="medium">Medium — 80³ grid, balanced</MenuItem>
                <MenuItem value="baseline">Baseline — 150³ grid, full accuracy</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Method"
              value="FDTD (Yee grid)"
              disabled
              aria-label="Solver method: FDTD Yee grid"
            />

            <TextField
              size="small"
              label="Domain"
              value="10 mm cube, absorbing BCs"
              disabled
              aria-label="Domain: 10 mm cube with absorbing boundary conditions"
            />

            {lastError && (
              <Alert severity="error" role="alert" aria-live="assertive">
                {lastError}
              </Alert>
            )}

            <Button
              variant="contained"
              color="primary"
              size="small"
              fullWidth
              tabIndex={0}
              onClick={handleLaunch}
              onKeyDown={handleLaunchKeyDown}
              aria-label="Launch FDTD simulation run"
            >
              Launch FDTD Run
            </Button>
          </Stack>
        </Collapse>

        {/* Empty state hint */}
        {runs.length === 0 && !showForm && (
          <Typography
            variant="caption"
            color="text.secondary"
            role="status"
            aria-label="No Maxwell runs yet"
            sx={{ display: 'block' }}
          >
            Press &ldquo;Configure &amp; Run&rdquo; to launch a full-wave FDTD solve.
          </Typography>
        )}

        {runs.length > 0 && !showForm && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Select a run above to inspect its fields and metrics in the visualizer.
            </Typography>
          </>
        )}
      </Box>
  );
}
