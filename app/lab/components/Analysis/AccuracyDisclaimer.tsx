'use client';

import { Typography, Paper, Alert } from '@mui/material';

/**
 * AccuracyDisclaimer component
 * Communicates model limitations and simplified assumptions
 */
export function AccuracyDisclaimer() {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        maxWidth: 400,
        bgcolor: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Alert
        severity="info"
        sx={{
          bgcolor: 'transparent',
          color: 'text.primary',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }} gutterBottom>
          Simplified Model
        </Typography>
        <Typography variant="caption" sx={{ display: 'block' }}>
          This visualization uses a simplified RF propagation model for educational purposes.
          Field strength values are approximate and should not be used for compliance or safety assessments.
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mt: 0.75 }}>
          Small particles flow along circular magnetic streamlines and heat-map by local field strength.
          Divergence and curl cues are shown as conceptual flow guidance only, not as a full Maxwell solver.
        </Typography>
      </Alert>
    </Paper>
  );
}
