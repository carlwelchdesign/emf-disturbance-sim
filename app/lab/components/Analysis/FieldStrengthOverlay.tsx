'use client';

import { Paper, Typography, Stack } from '@mui/material';
import { fieldStrengthToPowerDensity } from '../../lib/field-math';
import { formatFieldStrength } from '../../lib/visualization-helpers';
import { MeasurementPoint } from '../../types/measurement.types';

export interface FieldStrengthOverlayProps {
  measurement?: MeasurementPoint;
}

export function FieldStrengthOverlay({ measurement }: FieldStrengthOverlayProps) {
  if (!measurement) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        p: 1.5,
        bgcolor: 'rgba(15, 23, 42, 0.92)',
        color: 'text.primary',
      }}
    >
      <Stack spacing={0.25}>
        <Typography variant="subtitle2">Measurement Point</Typography>
        <Typography variant="body2">{formatFieldStrength(measurement.fieldStrength, false)}</Typography>
        <Typography variant="caption">
          Power density: {fieldStrengthToPowerDensity(measurement.fieldStrength).toFixed(3)} W/m²
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Region: {measurement.region}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Divergence/curl cues are conceptual overlays, not a full field solver.
        </Typography>
      </Stack>
    </Paper>
  );
}
