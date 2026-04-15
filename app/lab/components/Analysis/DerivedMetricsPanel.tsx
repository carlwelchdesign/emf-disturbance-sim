'use client';
/**
 * Derived Metrics Panel
 * Displays Poynting vector and energy density metrics for completed Maxwell runs.
 *
 * A11Y-001: keyboard-navigable rows, ARIA state annotations.
 */
import React, { useState } from 'react';
import {
  Box, Typography, Paper, Stack, Chip,
} from '@mui/material';
import { useActiveMetrics, useActiveRunId } from '../../hooks/useMaxwellRunSelectors';
import { DerivedMetricResult, SnapshotMetric } from '../../types/maxwell.types';

function getMaxValue(m: DerivedMetricResult): number {
  if (!Array.isArray(m.values) || m.values.length === 0) return 0;
  return Math.max(...m.values.map((v) => typeof v === 'number' ? v : (v as SnapshotMetric).value));
}

export interface DerivedMetricsPanelProps {
  className?: string;
}

export function DerivedMetricsPanel({ className }: DerivedMetricsPanelProps) {
  const metrics = useActiveMetrics();
  const runId = useActiveRunId();
  const [focusedMetric, setFocusedMetric] = useState<string | null>(null);

  if (!metrics || metrics.length === 0) {
    return (
      <Paper
        role="region"
        aria-label="Derived metrics panel"
        tabIndex={0}
        sx={{ p: 2, mb: 1 }}
        className={className}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Derived Metrics
        </Typography>
        <Typography variant="body2" color="text.secondary" role="status" aria-label="No metrics available">
          No derived metrics available. Complete a Maxwell simulation to see metrics.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      role="region"
      aria-label="Derived electromagnetic metrics"
      tabIndex={0}
      sx={{ p: 2, mb: 1 }}
      className={className}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
        Derived Metrics
        {runId && (
          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            (Run: {runId})
          </Typography>
        )}
      </Typography>

      <Stack spacing={1} role="list" aria-label="Electromagnetic metrics list">
        {metrics.map((metric) => {
          const maxVal = getMaxValue(metric);
          const isFocused = focusedMetric === metric.metricName;

          return (
            <Box
              key={metric.metricName}
              role="listitem"
              tabIndex={0}
              aria-label={`${metric.metricName}: max value ${maxVal.toExponential(3)} ${metric.units}`}
              onFocus={() => setFocusedMetric(metric.metricName)}
              onBlur={() => setFocusedMetric(null)}
              sx={{
                p: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: isFocused ? 'primary.main' : 'divider',
                cursor: 'default',
                outline: isFocused ? '2px solid' : 'none',
                outlineColor: 'primary.main',
                outlineOffset: 2,
              }}
            >
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {metric.metricName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {metric.definition}
                  </Typography>
                </Box>
                <Chip
                  label={metric.units}
                  size="small"
                  variant="outlined"
                  aria-label={`Units: ${metric.units}`}
                />
              </Stack>

              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  aria-label={`Maximum value: ${maxVal.toExponential(3)} ${metric.units}`}
                >
                  Max: {maxVal.toExponential(3)} {metric.units}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  · {metric.values.length} samples
                </Typography>
              </Stack>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.25, fontStyle: 'italic' }}
                aria-label={`Validity scope: ${metric.validityScope}`}
              >
                Scope: {metric.validityScope}
              </Typography>
            </Box>
          );
        })}
      </Stack>

      {/* Completeness indicator — FR-007 requires ≥2 metrics */}
      <Box sx={{ mt: 1 }} role="status" aria-live="polite" aria-label={`${metrics.length} derived metrics available`}>
        <Chip
          label={`${metrics.length} metric${metrics.length !== 1 ? 's' : ''} available`}
          size="small"
          color={metrics.length >= 2 ? 'success' : 'warning'}
          aria-label={metrics.length >= 2 ? 'Minimum metric requirement met' : 'Fewer than 2 metrics available'}
        />
      </Box>
    </Paper>
  );
}
