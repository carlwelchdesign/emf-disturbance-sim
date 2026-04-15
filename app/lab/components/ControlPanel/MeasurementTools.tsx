'use client';

import { Box, Button, Typography, Tooltip } from '@mui/material';
import { useLabStore } from '../../hooks/useLabStore';

export function MeasurementTools() {
  const addMeasurement = useLabStore((state) => state.addMeasurement);
  const sources = useLabStore((state) => state.sources);

  const handleAdd = () => {
    const source = sources[0];
    if (!source) return;

    addMeasurement({
      position: { ...source.position },
      fieldStrength: 1,
      powerDensity: 0.001,
      region: 'far-field',
      label: 'Measurement',
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
        Measurements
      </Typography>
      <Tooltip title="Capture a measurement at the first source position." describeChild>
        <span>
          <Button variant="outlined" fullWidth onClick={handleAdd} disabled={sources.length === 0}>
            Add Measurement Point
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
}
