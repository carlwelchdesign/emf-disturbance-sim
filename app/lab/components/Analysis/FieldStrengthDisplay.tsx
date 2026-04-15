'use client';
import { Stack, Typography, Chip, Tooltip } from '@mui/material';
import { formatFieldStrength } from '../../lib/visualization-helpers';

export type FieldValidityStatus = 'validated' | 'non_validated' | 'simplified';

export interface FieldStrengthDisplayProps {
  value: number;
  showDisclaimer?: boolean;
  validityStatus?: FieldValidityStatus;
  'aria-label'?: string;
}

const VALIDITY_LABELS: Record<FieldValidityStatus, { label: string; color: 'success' | 'warning' | 'default'; description: string }> = {
  validated: {
    label: 'Validated',
    color: 'success',
    description: 'Field strength computed by validated full-wave Maxwell solver',
  },
  non_validated: {
    label: 'Non-Validated',
    color: 'warning',
    description: 'Field strength from unvalidated solver run — treat with caution',
  },
  simplified: {
    label: 'Simplified Model',
    color: 'default',
    description: 'Field strength from quasi-static simplified model',
  },
};

export function FieldStrengthDisplay({
  value,
  showDisclaimer = true,
  validityStatus,
  'aria-label': ariaLabel,
}: FieldStrengthDisplayProps) {
  const status = validityStatus ?? 'simplified';
  const statusInfo = VALIDITY_LABELS[status];
  const formattedValue = formatFieldStrength(value);
  const displayAriaLabel = ariaLabel ?? `Field strength: ${formattedValue}, status: ${statusInfo.label}`;

  return (
    <Stack
      spacing={0.25}
      role="region"
      aria-label={displayAriaLabel}
      tabIndex={0}
    >
      <Typography variant="body2" aria-label={`Value: ${formattedValue}`}>
        {formattedValue}
      </Typography>
      {showDisclaimer && (
        <Tooltip title={statusInfo.description}>
          <Chip
            label={statusInfo.label}
            size="small"
            color={statusInfo.color}
            aria-label={statusInfo.description}
            tabIndex={0}
            sx={{ cursor: 'default', width: 'fit-content' }}
          />
        </Tooltip>
      )}
    </Stack>
  );
}
