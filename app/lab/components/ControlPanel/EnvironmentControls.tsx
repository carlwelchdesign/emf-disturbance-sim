'use client';

import { Box, Stack, Typography, FormControlLabel, Switch, FormControl, InputLabel, Select, MenuItem, Tooltip } from '@mui/material';
import { useLabStore } from '../../hooks/useLabStore';
import { LODLevel } from '../../types/visualization.types';

export function EnvironmentControls() {
  const showGrid = useLabStore((state) => state.settings.showGrid);
  const lod = useLabStore((state) => state.settings.lod);
  const showBoundary = useLabStore((state) => state.environment.showBoundary);
  const updateSettings = useLabStore((state) => state.updateSettings);
  const updateEnvironment = useLabStore((state) => state.updateEnvironment);
  const setLOD = useLabStore((state) => state.setLOD);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
        Environment
      </Typography>
      <Stack spacing={1.5}>
        <Tooltip title="Toggle the ground grid used for spatial reference." describeChild>
          <Box component="span">
            <FormControlLabel
              control={<Switch checked={showGrid} onChange={(_, checked) => updateSettings({ showGrid: checked })} />}
              label="Show Grid"
            />
          </Box>
        </Tooltip>
        <Tooltip title="Show or hide the simulation boundary box around the scene." describeChild>
          <Box component="span">
            <FormControlLabel
              control={<Switch checked={showBoundary} onChange={(_, checked) => updateEnvironment({ showBoundary: checked })} />}
              label="Show Boundary"
            />
          </Box>
        </Tooltip>
        <FormControl fullWidth size="small">
          <Tooltip title="Lower levels of detail improve performance when FPS drops." describeChild>
            <InputLabel id="lod-label" shrink>
              LOD
            </InputLabel>
          </Tooltip>
          <Select
            labelId="lod-label"
            value={lod}
            label="LOD"
            onChange={(event) => setLOD(event.target.value as LODLevel)}
          >
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Box>
  );
}
