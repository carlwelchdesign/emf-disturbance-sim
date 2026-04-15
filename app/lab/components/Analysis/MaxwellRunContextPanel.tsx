'use client';
/**
 * Maxwell Run Context Panel
 * Displays scenario/time/metric context for the active Maxwell run.
 *
 * A11Y-001: keyboard-operable controls, ARIA roles, focus management.
 */
import React, { useState, useCallback } from 'react';
import {
  Box, Typography, Chip, Stack, Paper, Select, MenuItem, FormControl, InputLabel, Divider, Tooltip, IconButton, Slider,
} from '@mui/material';
import { useActiveFieldOutput, useActiveMetrics, useActiveValidationReport, useActiveRunId } from '../../hooks/useMaxwellRunSelectors';
import { useLabStore } from '../../hooks/useLabStore';

const VALIDATION_STATUS_COLOR = {
  validated: 'success',
  non_validated: 'warning',
} as const;

export interface MaxwellRunContextPanelProps {
  className?: string;
}

export function MaxwellRunContextPanel({ className }: MaxwellRunContextPanelProps) {
  const fieldOutput = useActiveFieldOutput();
  const metrics = useActiveMetrics();
  const validationReport = useActiveValidationReport();
  const activeRunId = useActiveRunId();
  const maxwellRuns = useLabStore((s) => s.maxwellRuns);
  const setActiveMaxwellRun = useLabStore((s) => s.setActiveMaxwellRun);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState<string>('');

  const timeAxis = fieldOutput?.timeAxis ?? [];
  const totalSteps = timeAxis.length;
  const currentTime = timeAxis[currentStep] ?? 0;

  const goFirst = useCallback(() => setCurrentStep(0), []);
  const goPrev = useCallback(() => setCurrentStep((s) => Math.max(0, s - 1)), []);
  const goNext = useCallback(() => setCurrentStep((s) => Math.min(totalSteps - 1, s + 1)), [totalSteps]);
  const goLast = useCallback(() => setCurrentStep(totalSteps - 1), [totalSteps]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft': case 'ArrowDown': e.preventDefault(); goPrev(); break;
      case 'ArrowRight': case 'ArrowUp': e.preventDefault(); goNext(); break;
      case 'Home': e.preventDefault(); goFirst(); break;
      case 'End': e.preventDefault(); goLast(); break;
    }
  }, [goPrev, goNext, goFirst, goLast]);

  const validationStatus = fieldOutput?.validationStatus;

  return (
    <Paper
      role="region"
      aria-label="Maxwell solver run context"
      className={className}
      tabIndex={0}
      sx={{ p: 2, mb: 1 }}
      onKeyDown={handleKeyDown}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
        Maxwell Run Context
      </Typography>

      {/* Run selector */}
      {maxwellRuns.length > 0 && (
        <FormControl fullWidth size="small" sx={{ mb: 1 }}>
          <InputLabel id="maxwell-run-selector-label">Active Run</InputLabel>
          <Select
            labelId="maxwell-run-selector-label"
            value={activeRunId ?? ''}
            label="Active Run"
            onChange={(e) => setActiveMaxwellRun(e.target.value || null)}
            aria-label="Select active Maxwell run"
            inputProps={{ tabIndex: 0 }}
          >
            {maxwellRuns.map((run) => (
              <MenuItem key={run.runId} value={run.runId}>
                {run.runId} — {run.status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Validation status */}
      {validationStatus && (
        <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }} role="status" aria-label={`Validation status: ${validationStatus}`}>
          <Typography variant="caption" color="text.secondary">Status:</Typography>
          <Chip
            label={validationStatus === 'validated' ? 'Validated' : 'Non-Validated'}
            size="small"
            color={VALIDATION_STATUS_COLOR[validationStatus] ?? 'default'}
            aria-label={`Run is ${validationStatus}`}
          />
        </Stack>
      )}

      {/* Time navigation */}
      {totalSteps > 0 && (
        <Box role="group" aria-label="Time step navigation" sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary" id="time-nav-label">
            Time Step Navigation
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, alignItems: 'center' }}>
            <Tooltip title="First step (Home key)">
              <span>
                <IconButton
                  size="small"
                  onClick={goFirst}
                  disabled={currentStep === 0}
                  aria-label="Go to first time step"
                  tabIndex={0}
                >
                  ⏮
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Previous step (← key)">
              <span>
                <IconButton
                  size="small"
                  onClick={goPrev}
                  disabled={currentStep === 0}
                  aria-label="Go to previous time step"
                  tabIndex={0}
                >
                  ◀
                </IconButton>
              </span>
            </Tooltip>

            <Slider
              value={currentStep}
              min={0}
              max={Math.max(0, totalSteps - 1)}
              step={1}
              onChange={(_, v) => setCurrentStep(v as number)}
              aria-label="Time step"
              aria-valuetext={`Step ${currentStep + 1} of ${totalSteps}`}
              size="small"
              sx={{ flex: 1 }}
              tabIndex={0}
            />

            <Tooltip title="Next step (→ key)">
              <span>
                <IconButton
                  size="small"
                  onClick={goNext}
                  disabled={currentStep >= totalSteps - 1}
                  aria-label="Go to next time step"
                  tabIndex={0}
                >
                  ▶
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Last step (End key)">
              <span>
                <IconButton
                  size="small"
                  onClick={goLast}
                  disabled={currentStep >= totalSteps - 1}
                  aria-label="Go to last time step"
                  tabIndex={0}
                >
                  ⏭
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          <Typography
            variant="caption"
            color="text.secondary"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`Current time: ${currentTime.toExponential(2)} seconds, step ${currentStep + 1} of ${totalSteps}`}
          >
            t = {currentTime.toExponential(2)} s · Step {currentStep + 1}/{totalSteps}
          </Typography>
        </Box>
      )}

      {/* Metric selector */}
      {metrics && metrics.length > 0 && (
        <Box>
          <Divider sx={{ my: 1 }} />
          <FormControl fullWidth size="small">
            <InputLabel id="metric-selector-label">Selected Metric</InputLabel>
            <Select
              labelId="metric-selector-label"
              value={selectedMetric || (metrics[0]?.metricName ?? '')}
              label="Selected Metric"
              onChange={(e) => setSelectedMetric(e.target.value)}
              aria-label="Select derived metric to display"
              inputProps={{ tabIndex: 0 }}
            >
              {metrics.map((m) => (
                <MenuItem key={m.metricName} value={m.metricName}>
                  {m.metricName} ({m.units})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Validation report summary */}
      {validationReport && (
        <Box sx={{ mt: 1 }} role="region" aria-label="Validation report summary">
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            Validation: {validationReport.aggregateStatus.toUpperCase()}
          </Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
            {Object.entries(validationReport.thresholdEvaluation).map(([key, val]) => (
              <Chip
                key={key}
                label={`${key}: ${val}`}
                size="small"
                color={val === 'pass' ? 'success' : 'error'}
                aria-label={`${key} threshold: ${val}`}
                tabIndex={0}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Empty state */}
      {!fieldOutput && (
        <Typography
          variant="body2"
          color="text.secondary"
          role="status"
          aria-label="No active Maxwell run"
        >
          No active Maxwell run. Submit a simulation run to see results here.
        </Typography>
      )}
    </Paper>
  );
}
