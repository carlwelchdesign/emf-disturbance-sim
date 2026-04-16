'use client';

import {
  Alert,
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
import { SolverProfile, VISUALIZATION_LIMITS } from '../../types/visualization.types';
import { Slider } from '../shared/Slider';

export function VisualizationSettings() {
  const animateFields = useLabStore((state) => state.settings.animateFields);
  const animationSpeed = useLabStore((state) => state.settings.animationSpeed);
  const solverProfile = useLabStore((state) => state.settings.solverProfile);
  const interferenceProfile = useLabStore((state) => state.settings.interferenceProfile);
  const showFlightPaths = useLabStore((state) => state.settings.showFlightPaths);
  const performanceSignal = useLabStore((state) => state.settings.performanceSignal);
  const updateSettings = useLabStore((state) => state.updateSettings);
  const setSolverProfile = useLabStore((state) => state.setSolverProfile);

  return (
    <Box>
      <Stack spacing={1.5}>
        <Alert severity="info" variant="outlined" aria-label="Maxwell hidden scope message">
          Maxwell field visualization is hidden in this optimization cycle. Smoothness tuning applies to non-Maxwell workflows.
        </Alert>
        {performanceSignal.active && (
          <Alert severity="warning" aria-label="Performance degraded message">
            {performanceSignal.message}
          </Alert>
        )}
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
          <Tooltip title="Select the interference point-cloud encoding profile." describeChild>
            <InputLabel id="interference-profile-label" shrink>
              Interference Profile
            </InputLabel>
          </Tooltip>
          <Select
            labelId="interference-profile-label"
            value={interferenceProfile}
            label="Interference Profile"
            onChange={(event) => updateSettings({ interferenceProfile: event.target.value as SolverProfile })}
          >
            <MenuItem value="simplified">Simplified</MenuItem>
            <MenuItem value="balanced">Balanced</MenuItem>
            <MenuItem value="scientific">Scientific</MenuItem>
          </Select>
        </FormControl>
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
