'use client';

import { Paper, Typography } from '@mui/material';
import { useLabStore } from '../../hooks/useLabStore';

export function FPSCounter() {
  const fps = useLabStore((state) => state.performance.currentFPS);
  const showFPS = useLabStore((state) => state.settings.showFPS);

  if (!showFPS) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        px: 1.25,
        py: 0.75,
        bgcolor: 'rgba(15, 23, 42, 0.92)',
      }}
    >
      <Typography variant="caption">FPS {fps.toFixed(0)}</Typography>
    </Paper>
  );
}
