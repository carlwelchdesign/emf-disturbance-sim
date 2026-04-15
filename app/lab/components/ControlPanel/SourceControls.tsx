'use client';

import { Box, Typography, TextField, Button as MuiButton, Tooltip, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Slider } from '../shared/Slider';
import { RFSource, SourceFaction } from '../../types/source.types';
import { useLabStore } from '../../hooks/useLabStore';
import { FrequencyPresets } from './FrequencyPresets';
import { estimateSourceFieldStrength } from '../../lib/source-helpers';
import {
  formatBandwidthLabel,
  formatFieldStrength,
  formatFrequencyLabel,
  formatPhaseLabel,
} from '../../lib/visualization-helpers';
import { SelectionContext } from '../../types/store.types';
import { DualModeControl } from '../shared/DualModeControl';
import { useState } from 'react';

export interface SourceControlsProps {
  selectionContext: SelectionContext;
  selectedSources: RFSource[];
}

export function SourceControls({ selectionContext, selectedSources }: SourceControlsProps) {
  const updateSource = useLabStore((state) => state.updateSource);
  const removeSource = useLabStore((state) => state.removeSource);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const source = selectedSources[0];

  if (selectionContext.mode === 'none' || !source) {
    return (
      <Box>
        <Typography color="text.secondary">
          No source selected. Select an entity from Active Entities to edit parameters.
        </Typography>
      </Box>
    );
  }

  const isMulti = selectionContext.mode === 'multi';
  const hasMixedFrequency = isMulti && selectedSources.some((item) => item.frequency !== source.frequency);
  const hasMixedPower = isMulti && selectedSources.some((item) => item.power !== source.power);
  const hasMixedPhase = isMulti && selectedSources.some((item) => item.phase !== source.phase);

  const frequencyGHz = source.frequency / 1e9;
  const bandwidthMHz = (source.bandwidthHz ?? 80e6) / 1e6;
  const frequencyLabel = formatFrequencyLabel(source.frequency);
  const bandwidthLabel = formatBandwidthLabel(source.bandwidthHz ?? 80e6);
  const powerMW = source.power * 1000;
  const phaseDeg = (source.phase * 180) / Math.PI;
  const phaseLabel = formatPhaseLabel(source.phase);
  const fieldStrength = formatFieldStrength(estimateSourceFieldStrength(source));

  const applyUpdate = (params: Partial<RFSource>) => {
    selectedSources.forEach((item) => updateSource(item.id, params));
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 700 }}>
        {isMulti ? `${selectedSources.length} entities selected` : source.label || 'Selected Entity'}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
            Faction
          </Typography>
          <ToggleButtonGroup
            value={source.faction ?? 'friendly'}
            exclusive
            size="small"
            onChange={(_e, val: SourceFaction | null) => {
              if (val !== null) applyUpdate({ faction: val });
            }}
            fullWidth
          >
            <ToggleButton value="friendly" sx={{ color: '#00AAFF', '&.Mui-selected': { color: '#00AAFF', bgcolor: 'rgba(0,170,255,0.15)' } }}>
              Friendly
            </ToggleButton>
            <ToggleButton value="neutral" sx={{ '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
              Neutral
            </ToggleButton>
            <ToggleButton value="hostile" sx={{ color: '#FF3320', '&.Mui-selected': { color: '#FF3320', bgcolor: 'rgba(255,51,32,0.15)' } }}>
              Hostile
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <FrequencyPresets
          value={source.frequency}
          onChange={(frequencyHz) => applyUpdate({ frequency: frequencyHz })}
        />

        <DualModeControl
          label={`Center Frequency${hasMixedFrequency ? ' (mixed)' : ''}`}
          value={frequencyGHz}
          min={1}
          max={30}
          step={0.1}
          unit=" GHz"
          onChange={(value) => applyUpdate({ frequency: value * 1e9 })}
        />

        <DualModeControl
          label={`Output Power${hasMixedPower ? ' (mixed)' : ''}`}
          value={powerMW}
          min={1}
          max={1000}
          step={1}
          unit=" mW"
          onChange={(value) => applyUpdate({ power: value / 1000 })}
        />

        <MuiButton
          variant="text"
          size="small"
          sx={{ alignSelf: 'flex-start' }}
          onClick={() => setAdvancedOpen((current) => !current)}
          aria-expanded={advancedOpen}
        >
          {advancedOpen ? 'Hide advanced controls' : 'Show advanced controls'}
        </MuiButton>

        {advancedOpen && (
          <>
            <DualModeControl
              label={`Phase Offset${hasMixedPhase ? ' (mixed)' : ''}`}
              value={phaseDeg}
              min={0}
              max={360}
              step={1}
              unit="°"
              onChange={(value) => applyUpdate({ phase: (value * Math.PI) / 180 })}
            />

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
          </>
        )}

        <Typography variant="caption" color="primary.main">
          Frequency: {frequencyLabel} · Power: {powerMW.toFixed(0)} mW · {phaseLabel} · {fieldStrength}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }} aria-disabled={isMulti}>
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
              disabled={isMulti}
              fullWidth
            />
          ))}
        </Box>
        {isMulti && (
          <Typography variant="caption" color="text.secondary">
            Position editing is disabled for multi-select because coordinates are not shared.
          </Typography>
        )}

        <Tooltip title="Delete this source from the simulation." describeChild>
          <span>
            <MuiButton
              variant="outlined"
              color="error"
              onClick={() => removeSource(source.id)}
              disabled={!source || isMulti}
            >
              Remove Source
            </MuiButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
}
