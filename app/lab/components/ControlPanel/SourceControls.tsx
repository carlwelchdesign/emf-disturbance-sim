'use client';

import { Box, Typography, TextField, Button as MuiButton, Tooltip } from '@mui/material';
import { Slider } from '../shared/Slider';
import { RFSource } from '../../types/source.types';
import { useLabStore } from '../../hooks/useLabStore';
import { FrequencyPresets } from './FrequencyPresets';
import { estimateSourceFieldStrength } from '../../lib/source-helpers';
import {
  formatBandwidthLabel,
  formatFieldStrength,
  formatFrequencyLabel,
  formatPhaseLabel,
} from '../../lib/visualization-helpers';

export interface SourceControlsProps {
  source: RFSource | undefined;
}

export function SourceControls({ source }: SourceControlsProps) {
  const updateSource = useLabStore((state) => state.updateSource);
  const removeSource = useLabStore((state) => state.removeSource);

  if (!source) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">
          No source selected. Select a source to adjust its parameters.
        </Typography>
      </Box>
    );
  }

  const frequencyGHz = source.frequency / 1e9;
  const bandwidthMHz = (source.bandwidthHz ?? 80e6) / 1e6;
  const frequencyLabel = formatFrequencyLabel(source.frequency);
  const bandwidthLabel = formatBandwidthLabel(source.bandwidthHz ?? 80e6);
  const powerMW = source.power * 1000;
  const phaseDeg = (source.phase * 180) / Math.PI;
  const phaseLabel = formatPhaseLabel(source.phase);
  const fieldStrength = formatFieldStrength(estimateSourceFieldStrength(source));

  const applyUpdate = (params: Partial<RFSource>) => updateSource(source.id, params);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {source.label || 'Source Controls'}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FrequencyPresets
          value={source.frequency}
          onChange={(frequencyHz) => applyUpdate({ frequency: frequencyHz })}
        />

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
            <Typography variant="body2" color="text.secondary">
              Center Frequency: {frequencyLabel}
            </Typography>
            <Typography variant="caption" color="primary.main">
              {fieldStrength}
            </Typography>
          </Box>
          <Tooltip title="Fine-tune the transmit frequency from 1 to 30 GHz." describeChild>
            <Box component="span" sx={{ display: 'block' }}>
              <Slider
                value={frequencyGHz}
                onChange={(value) => {
                  const freq = Array.isArray(value) ? value[0] : value;
                  applyUpdate({ frequency: freq * 1e9 });
                }}
                min={1}
                max={30}
                step={0.1}
                aria-label="Frequency"
                marks={[
                  { value: 2.4, label: '2.4' },
                  { value: 5, label: '5' },
                  { value: 28, label: '28' },
                ]}
              />
            </Box>
          </Tooltip>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
            <Typography variant="body2" color="text.secondary">
              Spectral Width: {bandwidthLabel}
            </Typography>
            <Typography variant="caption" color="primary.main">
              Wider bands influence more nearby frequencies
            </Typography>
          </Box>
          <Tooltip title="Broaden the emitter's spectral footprint so the cloud reads as a wider frequency band." describeChild>
            <Box component="span" sx={{ display: 'block' }}>
              <Slider
                value={bandwidthMHz}
                onChange={(value) => {
                  const bandwidth = Array.isArray(value) ? value[0] : value;
                  applyUpdate({ bandwidthHz: bandwidth * 1e6 });
                }}
                min={1}
                max={5000}
                step={1}
                aria-label="Bandwidth"
                marks={[
                  { value: 10, label: '10' },
                  { value: 100, label: '100' },
                  { value: 1000, label: '1000' },
                ]}
              />
            </Box>
          </Tooltip>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
            <Typography variant="body2" color="text.secondary">
              Output Power: {powerMW.toFixed(0)} mW
            </Typography>
            <Typography variant="caption" color="primary.main">
              {fieldStrength}
            </Typography>
          </Box>
          <Tooltip title="Adjust the source output from 1 mW up to 1 W." describeChild>
            <Box component="span" sx={{ display: 'block' }}>
              <Slider
                value={powerMW}
                onChange={(value) => {
                  const power = Array.isArray(value) ? value[0] : value;
                  applyUpdate({ power: power / 1000 });
                }}
                min={1}
                max={1000}
                step={1}
                aria-label="Power"
                marks={[
                  { value: 1, label: '1' },
                  { value: 100, label: '100' },
                  { value: 1000, label: '1000' },
                ]}
              />
            </Box>
          </Tooltip>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
            <Typography variant="body2" color="text.secondary">
              Phase Offset: {phaseLabel}
            </Typography>
            <Typography variant="caption" color="primary.main">
              {fieldStrength}
            </Typography>
          </Box>
          <Tooltip title="Shift the signal phase to explore interference patterns." describeChild>
            <Box component="span" sx={{ display: 'block' }}>
              <Slider
                value={phaseDeg}
                onChange={(value) => {
                  const phase = Array.isArray(value) ? value[0] : value;
                  applyUpdate({ phase: (phase * Math.PI) / 180 });
                }}
                min={0}
                max={360}
                step={1}
                aria-label="Phase"
                marks={[
                  { value: 0, label: '0°' },
                  { value: 180, label: '180°' },
                  { value: 360, label: '360°' },
                ]}
              />
            </Box>
          </Tooltip>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {(['x', 'y', 'z'] as const).map((axis) => (
            <TextField
              key={axis}
              label={axis.toUpperCase()}
              slotProps={{ inputLabel: { shrink: true } }}
              size="small"
              type="number"
              value={source.position[axis]}
              onChange={(event) =>
                applyUpdate({
                  position: {
                    ...source.position,
                    [axis]: Number(event.target.value),
                  },
                })
              }
              fullWidth
            />
          ))}
        </Box>

        <Tooltip title="Delete this source from the simulation." describeChild>
          <MuiButton
            variant="outlined"
            color="error"
            onClick={() => removeSource(source.id)}
            disabled={!source}
          >
            Remove Source
          </MuiButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
