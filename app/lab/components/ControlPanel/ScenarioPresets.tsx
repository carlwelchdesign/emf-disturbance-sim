'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useLabStore } from '../../hooks/useLabStore';
import { SCENARIO_PRESETS, ScenarioPresetId } from '../../modules/scenario/presets';

export function ScenarioPresets() {
  const activeScenarioPresetId = useLabStore((state) => state.activeScenarioPresetId);
  const scenarioIsDirty = useLabStore((state) => state.scenarioIsDirty);
  const applyScenarioPreset = useLabStore((state) => state.applyScenarioPreset);
  const [pendingPresetId, setPendingPresetId] = useState<ScenarioPresetId | null>(null);

  const currentPreset = useMemo(
    () => SCENARIO_PRESETS.find((preset) => preset.id === activeScenarioPresetId),
    [activeScenarioPresetId]
  );

  const handlePresetSelect = (presetId: ScenarioPresetId) => {
    if (presetId === activeScenarioPresetId && !scenarioIsDirty) {
      return;
    }

    if (scenarioIsDirty) {
      setPendingPresetId(presetId);
      return;
    }

    applyScenarioPreset(presetId);
  };

  const handleConfirmApply = () => {
    if (pendingPresetId) {
      applyScenarioPreset(pendingPresetId);
    }
    setPendingPresetId(null);
  };

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Scenario Presets
        </Typography>
        <Stack spacing={1.25}>
          <FormControl fullWidth size="small">
            <Tooltip title="Load a curated scene configuration for comparison or exploration." describeChild>
              <InputLabel id="scenario-presets-label" shrink>
                Preset
              </InputLabel>
            </Tooltip>
            <Select
              labelId="scenario-presets-label"
              label="Preset"
              value={activeScenarioPresetId ?? ''}
              displayEmpty
              renderValue={() => currentPreset?.name ?? 'Free Play'}
              onChange={(event) => handlePresetSelect(event.target.value as ScenarioPresetId)}
            >
              {SCENARIO_PRESETS.map((preset) => (
                <MenuItem key={preset.id} value={preset.id}>
                  {preset.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary">
            {currentPreset ? currentPreset.description : 'No preset is applied. Current scene is free play.'}
          </Typography>
        </Stack>
      </Box>

      <Dialog open={Boolean(pendingPresetId)} onClose={() => setPendingPresetId(null)}>
        <DialogTitle>Replace current scene?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Loading a preset will replace the current scene configuration. Unsaved source, environment, and measurement changes will be cleared.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingPresetId(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmApply}>
            Apply Preset
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
