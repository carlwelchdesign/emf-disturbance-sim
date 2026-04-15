'use client';

import { Box, TextField, Typography } from '@mui/material';
import { Slider } from './Slider';

export interface DualModeControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function DualModeControl({
  label,
  value,
  min,
  max,
  step,
  unit,
  disabled = false,
  onChange,
}: DualModeControlProps) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="caption" color="primary.main">
          {value.toFixed(2)}{unit ?? ''}
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 96px', gap: 1, alignItems: 'center' }}>
        <Slider
          aria-label={label}
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(nextValue) => {
            const scalar = Array.isArray(nextValue) ? nextValue[0] : nextValue;
            onChange(scalar);
          }}
        />
        <TextField
          size="small"
          type="number"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          slotProps={{ htmlInput: { min, max, step, 'aria-label': `${label} numeric input` } }}
          disabled={disabled}
        />
      </Box>
    </Box>
  );
}
