'use client';

import { Box, Chip, Typography } from '@mui/material';
import { DerivedMetricsPanel } from '../Analysis/DerivedMetricsPanel';
import { MaxwellRunContextPanel } from '../Analysis/MaxwellRunContextPanel';
import { MaxwellRunControlsContent } from '../ControlPanel/MaxwellRunControls';

interface MaxwellOverlayProps {
  hasActiveMaxwellRun: boolean;
}

export function MaxwellOverlay({ hasActiveMaxwellRun }: MaxwellOverlayProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 12,
        left: 12,
        width: 260,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
      role="complementary"
      aria-label="Maxwell simulation controls and results"
    >
      <Box
        sx={{
          bgcolor: 'rgba(2, 6, 23, 0.88)',
          border: '1px solid rgba(148,163,184,0.18)',
          borderRadius: hasActiveMaxwellRun ? '6px 6px 0 0' : 1.5,
          borderBottom: hasActiveMaxwellRun ? 'none' : undefined,
          p: 1.25,
          backdropFilter: 'blur(6px)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.65rem',
              color: 'rgba(148,163,184,0.7)',
              letterSpacing: '0.08em',
            }}
          >
            MAXWELL SOLVER
          </Typography>
          <Chip
            label="VISUALS DISABLED"
            size="small"
            sx={{
              height: 18,
              fontSize: '0.58rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              bgcolor: 'rgba(148,163,184,0.14)',
              color: 'rgba(148,163,184,0.9)',
              border: '1px solid rgba(148,163,184,0.3)',
            }}
          />
        </Box>
        <MaxwellRunControlsContent />
      </Box>

      {hasActiveMaxwellRun && (
        <Box
          sx={{
            bgcolor: 'rgba(2, 6, 23, 0.88)',
            border: '1px solid rgba(148,163,184,0.18)',
            borderTop: 'none',
            p: 1.25,
            backdropFilter: 'blur(6px)',
          }}
        >
          <MaxwellRunContextPanel />
        </Box>
      )}

      {hasActiveMaxwellRun && (
        <Box
          sx={{
            bgcolor: 'rgba(2, 6, 23, 0.88)',
            border: '1px solid rgba(148,163,184,0.18)',
            borderTop: 'none',
            borderRadius: '0 0 6px 6px',
            p: 1.25,
            backdropFilter: 'blur(6px)',
          }}
        >
          <DerivedMetricsPanel />
        </Box>
      )}
    </Box>
  );
}