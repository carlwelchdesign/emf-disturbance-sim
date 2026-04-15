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
import { ColorScheme, SolverProfile, VISUALIZATION_LIMITS } from '../../types/visualization.types';
import { Slider } from '../shared/Slider';

export function VisualizationSettings() {
  const colorScheme = useLabStore((state) => state.settings.colorScheme);
  const showFPS = useLabStore((state) => state.settings.showFPS);
  const animateFields = useLabStore((state) => state.settings.animateFields);
  const animationSpeed = useLabStore((state) => state.settings.animationSpeed);
  const solverProfile = useLabStore((state) => state.settings.solverProfile);
  const themeMode = useLabStore((state) => state.settings.themeMode);
  const showThreatMetrics = useLabStore((state) => state.settings.showThreatMetrics);
  const showEmitterInteractions = useLabStore((state) => state.settings.showEmitterInteractions);
  const showFieldChart = useLabStore((state) => state.settings.showFieldChart);
  const showFlightPaths = useLabStore((state) => state.settings.showFlightPaths);
  const updateSettings = useLabStore((state) => state.updateSettings);
  const setSolverProfile = useLabStore((state) => state.setSolverProfile);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
        Visualization
      </Typography>
      <Stack spacing={1.5}>
        <FormControl fullWidth size="small">
          <Tooltip title="Choose how field intensity is colored across the 3D scene." describeChild>
            <InputLabel id="color-scheme-label" shrink>
              Color Scheme
            </InputLabel>
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
        <FormControl fullWidth size="small">
          <Tooltip title="Choose how much field detail and directional structure to emphasize." describeChild>
            <InputLabel id="solver-profile-label" shrink>
              Field Fidelity
            </InputLabel>
          </Tooltip>
          <Select
            labelId="solver-profile-label"
            value={solverProfile}
            label="Field Fidelity"
            onChange={(event) => setSolverProfile(event.target.value as SolverProfile)}
          >
            <MenuItem value="simplified">Simplified</MenuItem>
            <MenuItem value="balanced">Balanced</MenuItem>
            <MenuItem value="scientific">Scientific</MenuItem>
          </Select>
        </FormControl>
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
        <Tooltip title="Show threat metrics overlay with faction-separated field strengths." describeChild>
          <Box component="span">
            <FormControlLabel
              control={<Switch checked={showThreatMetrics} onChange={(_, checked) => updateSettings({ showThreatMetrics: checked })} />}
              label="Threat metrics"
            />
          </Box>
        </Tooltip>
        <Tooltip title="Show emitter interaction panel (coupling, conflict, resonance)." describeChild>
          <Box component="span">
            <FormControlLabel
              control={<Switch checked={showEmitterInteractions} onChange={(_, checked) => updateSettings({ showEmitterInteractions: checked })} />}
              label="Emitter interactions"
            />
          </Box>
        </Tooltip>
        <Tooltip title="Show field samples chart along the X axis." describeChild>
          <Box component="span">
            <FormControlLabel
              control={<Switch checked={showFieldChart} onChange={(_, checked) => updateSettings({ showFieldChart: checked })} />}
              label="Field chart"
            />
          </Box>
        </Tooltip>
        <Tooltip title="Show drone patrol flight paths in the 3D scene." describeChild>
          <Box component="span">
            <FormControlLabel
              control={<Switch checked={showFlightPaths} onChange={(_, checked) => updateSettings({ showFlightPaths: checked })} />}
              label="Flight paths"
            />
          </Box>
        </Tooltip>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Animation speed
            </Typography>
            <Typography variant="caption" color="primary.main">
              {animationSpeed.toFixed(1)}x
            </Typography>
          </Box>
          <Tooltip title="Adjust how quickly the particle field animates without changing the source frequency." describeChild>
            <Box component="span" sx={{ display: 'block' }}>
              <Slider
                aria-label="Animation speed"
                value={animationSpeed}
                min={VISUALIZATION_LIMITS.animationSpeed.min}
                max={VISUALIZATION_LIMITS.animationSpeed.max}
                step={0.1}
                marks={[
                  { value: 0.5, label: '0.5x' },
                  { value: 1.0, label: '1.0x' },
                  { value: 2.0, label: '2.0x' },
                ]}
                onChange={(value) => {
                  const speed = Array.isArray(value) ? value[0] : value;
                  updateSettings({ animationSpeed: speed });
                }}
              />
            </Box>
          </Tooltip>
        </Box>
      </Stack>
    </Box>
  );
}
