'use client';

import { List, ListItem, ListItemText, Typography } from '@mui/material';
import { useLabStore } from '../../hooks/useLabStore';
import { FieldStrengthDisplay } from './FieldStrengthDisplay';

export function MeasurementList() {
  const measurements = useLabStore((state) => state.measurements);

  if (measurements.length === 0) {
    return <Typography variant="body2" color="text.secondary">No measurements yet.</Typography>;
  }

  return (
    <List dense>
      {measurements.map((measurement) => (
        <ListItem key={measurement.id} disableGutters>
          <ListItemText
            primary={measurement.label || measurement.id}
            secondary={<FieldStrengthDisplay value={measurement.fieldStrength} />}
          />
        </ListItem>
      ))}
    </List>
  );
}
