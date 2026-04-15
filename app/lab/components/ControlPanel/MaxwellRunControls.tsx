'use client';
/**
 * Maxwell Run Controls — sidebar section for configuring and launching Maxwell runs.
 * Full keyboard operability (tab order, enter/space activation) and ARIA live regions.
 *
 * A11Y-001: tab order, enter/space activation, ARIA live regions.
 */
import React, { useCallback } from 'react';
import {
  Box, Typography, Stack, Chip, Divider, LinearProgress,
} from '@mui/material';
import { useLabStore } from '../../hooks/useLabStore';
import { useMaxwellRuns } from '../../hooks/useMaxwellRunSelectors';
import { SimulationRunStatus } from '../../types/maxwell.types';
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

export interface MaxwellRunControlsProps {
  className?: string;
}

export function MaxwellRunControls({ className }: MaxwellRunControlsProps) {
  const runs = useMaxwellRuns();
  const setActiveMaxwellRun = useLabStore((s) => s.setActiveMaxwellRun ?? (() => {}));
  const activeRunId = useLabStore((s) => s.maxwellActiveRunId ?? null);
  const sectionDisclosure = useLabStore((s) => s.sectionDisclosure);
  const toggleSectionExpanded = useLabStore((s) => s.toggleSectionExpanded);

  const handleRunKeyDown = useCallback((e: React.KeyboardEvent, runId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveMaxwellRun(runId);
    }
  }, [setActiveMaxwellRun]);

  return (
    <SectionPanel
      sectionId="maxwell-solver"
      title={SIDEBAR_SECTION_TITLES['maxwell-solver']}
      ariaDescription="Maxwell solver controls section"
      expanded={sectionDisclosure['maxwell-solver']}
      onToggleExpanded={() => toggleSectionExpanded('maxwell-solver')}
    >
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

        {/* Empty state */}
        {runs.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            role="status"
            aria-label="No Maxwell runs yet"
            sx={{ mb: 1 }}
          >
            No Maxwell runs yet. Configure a simulation and press Run.
          </Typography>
        )}

        <Divider sx={{ my: 1 }} />

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Configure simulation parameters in the setup panel, then use the Run button to launch a full-wave FDTD solve.
        </Typography>
      </Box>
    </SectionPanel>
  );
}
