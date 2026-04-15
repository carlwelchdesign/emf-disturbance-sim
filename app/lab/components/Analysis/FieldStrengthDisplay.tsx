'use client';

import { Stack, Typography } from '@mui/material';
import { formatFieldStrength } from '../../lib/visualization-helpers';

export interface FieldStrengthDisplayProps {
  value: number;
  showDisclaimer?: boolean;
}

export function FieldStrengthDisplay({ value, showDisclaimer = true }: FieldStrengthDisplayProps) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="body2">{formatFieldStrength(value)}</Typography>
      {showDisclaimer && (
        <Typography variant="caption" color="text.secondary">
          Simplified Model
        </Typography>
      )}
    </Stack>
  );
}
