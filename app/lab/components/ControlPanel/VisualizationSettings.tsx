'use client';

import {
  Box,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography,
  Tooltip,
} from '@mui/material';
import { useLabStore } from '../../hooks/useLabStore';
import { ColorScheme } from '../../types/visualization.types';

export function VisualizationSettings() {
  const colorScheme = useLabStore((state) => state.settings.colorScheme);
  const showFPS = useLabStore((state) => state.settings.showFPS);
  const animateFields = useLabStore((state) => state.settings.animateFields);
  const animationSpeed = useLabStore((state) => state.settings.animationSpeed);
  const themeMode = useLabStore((state) => state.settings.themeMode);
  const updateSettings = useLabStore((state) => state.updateSettings);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
        Visualization
      </Typography>
      <Stack spacing={1.5}>
        <FormControl fullWidth size="small">
          <Tooltip title="Choose how field intensity is colored across the 3D scene." describeChild>
            <InputLabel id="color-scheme-label">Color Scheme</InputLabel>
          </Tooltip>
          <Select
            labelId="color-scheme-label"
            value={colorScheme}
            label="Color Scheme"
            onChange={(event) => updateSettings({ colorScheme: event.target.value as ColorScheme })}
          >
            <MenuItem value="thermal">Thermal</MenuItem>
            <MenuItem value="rainbow">Rainbow</MenuItem>
            <MenuItem value="monochrome">Monochrome</MenuItem>
          </Select>
        </FormControl>
        <Tooltip title="Display the current frame rate in the top-right corner of the canvas." describeChild>
          <Box component="span">
            <FormControlLabel
              control={<Switch checked={showFPS} onChange={(_, checked) => updateSettings({ showFPS: checked })} />}
              label="Show FPS"
            />
          </Box>
        </Tooltip>
        <Tooltip title="Toggle the motion-first particle and wavefront animation in the 3D scene." describeChild>
          <Box component="span">
            <FormControlLabel
              control={
                <Switch
                  checked={animateFields}
                  onChange={(_, checked) => updateSettings({ animateFields: checked })}
                />
              }
              label="Animate fields"
            />
          </Box>
        </Tooltip>
        <Tooltip title="Switch between the lab's dark scientific theme and a brighter presentation mode." describeChild>
          <Box component="span">
            <FormControlLabel
              control={
                <Switch
                  checked={themeMode === 'dark'}
                  onChange={(_, checked) => {
                    const nextThemeMode = checked ? 'dark' : 'light';
                    updateSettings({ themeMode: nextThemeMode });
                  }}
                />
              }
              label="Dark theme"
            />
          </Box>
        </Tooltip>
        <Typography variant="caption" color="text.secondary">
          Animation speed: {animationSpeed.toFixed(1)}x
        </Typography>
      </Stack>
    </Box>
  );
}
