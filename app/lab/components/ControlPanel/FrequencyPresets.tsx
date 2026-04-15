'use client';

import { FormControl, InputLabel, Select, MenuItem, Tooltip } from '@mui/material';
import { COMMON_FREQUENCIES } from '../../types/source.types';

export interface FrequencyPresetsProps {
  value: number;
  onChange: (frequencyHz: number) => void;
}

export function FrequencyPresets({ value, onChange }: FrequencyPresetsProps) {
  const presetFrequency = Object.values(COMMON_FREQUENCIES).find((frequency) => frequency === value);

  return (
    <FormControl fullWidth size="small">
      <Tooltip title="Quickly switch to a common RF band such as Wi-Fi, Bluetooth, or 5G." describeChild>
        <InputLabel id="frequency-presets-label" shrink>
          Preset
        </InputLabel>
      </Tooltip>
      <Select
        labelId="frequency-presets-label"
        label="Preset"
        value={presetFrequency ? String(presetFrequency) : ''}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {Object.entries(COMMON_FREQUENCIES).map(([label, frequency]) => (
          <MenuItem key={label} value={String(frequency)}>
            {label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
