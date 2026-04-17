'use client';

import { Box } from '@mui/material';
import { EmitterInteractionsPanelContent } from '../Analysis/EmitterInteractionsPanel';
import { ThreatMetricsPanelContent } from '../Analysis/ThreatMetricsPanel';

export function LiveMetricsSidebar() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 12,
        width: 200,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        pointerEvents: 'none',
        py: 1.5,
      }}
    >
      <Box
        sx={{
          bgcolor: 'rgba(2, 6, 23, 0.82)',
          border: '1px solid rgba(148,163,184,0.18)',
          borderRadius: '6px 6px 0 0',
          p: 1.25,
          backdropFilter: 'blur(6px)',
        }}
      >
        <ThreatMetricsPanelContent />
      </Box>
      <Box
        sx={{
          bgcolor: 'rgba(2, 6, 23, 0.82)',
          border: '1px solid rgba(148,163,184,0.18)',
          borderTop: 'none',
          borderRadius: '0 0 6px 6px',
          p: 1.25,
          backdropFilter: 'blur(6px)',
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <EmitterInteractionsPanelContent />
      </Box>
    </Box>
  );
}