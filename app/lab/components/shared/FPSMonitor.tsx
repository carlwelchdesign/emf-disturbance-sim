'use client';

import { Paper, Typography } from '@mui/material';
import { useLabStore } from '../../hooks/useLabStore';

export function FPSMonitor() {
  const fps = useLabStore((state) => state.performance.currentFPS);
  const showFPS = useLabStore((state) => state.settings.showFPS);

  if (!showFPS) return null;

  return (
    <Paper elevation={0} sx={{ p: 1, bgcolor: 'background.paper' }}>
      <Typography variant="caption">Current FPS: {fps.toFixed(0)}</Typography>
    </Paper>
  );
}
