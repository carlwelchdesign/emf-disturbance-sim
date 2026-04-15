/**
 * Source List component
 * Displays all sources with selection and management controls
 */

'use client';

import { Box, List, ListItem, ListItemButton, IconButton, Typography, Stack, Tooltip, Checkbox } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RadioButtonChecked from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import { useLabStore } from '../../hooks/useLabStore';
import { RFSource } from '../../types/source.types';
import { getSourceDisplayName } from '../../lib/source-helpers';

/**
 * SourceList component
 * Shows all sources with selection, visibility toggle, and delete actions
 */
export function SourceList() {
  const sources = useLabStore((state) => state.sources);
  const selectedSourceId = useLabStore((state) => state.selectedSourceId);
  const selectionContext = useLabStore((state) => state.selectionContext);
  const toggleSourceSelection = useLabStore((state) => state.toggleSourceSelection);
  const setPrimarySelection = useLabStore((state) => state.setPrimarySelection);
  const removeSource = useLabStore((state) => state.removeSource);
  const toggleSourceActive = useLabStore((state) => state.toggleSourceActive);

  if (sources.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          No sources yet. Add a source to begin.
        </Typography>
      </Box>
    );
  }

  const handleSelect = (sourceId: string) => {
    setPrimarySelection(sourceId);
  };

  const handleToggleActive = (sourceId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    toggleSourceActive(sourceId);
  };

  const handleDelete = (sourceId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    removeSource(sourceId);
  };

  const formatFrequency = (freq: number): string => {
    if (freq >= 1e9) {
      return `${(freq / 1e9).toFixed(2)} GHz`;
    } else if (freq >= 1e6) {
      return `${(freq / 1e6).toFixed(0)} MHz`;
    } else if (freq >= 1e3) {
      return `${(freq / 1e3).toFixed(0)} kHz`;
    }
    return `${freq} Hz`;
  };

  const formatPower = (power: number): string => {
    if (power >= 1) {
      return `${power.toFixed(1)} W`;
    }
    return `${(power * 1000).toFixed(0)} mW`;
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
        Source Inventory ({sources.length})
      </Typography>
      
      <List disablePadding>
        {sources.map((source: RFSource, index) => {
          const isSelected = source.id === selectedSourceId;
          const isChecked = selectionContext.selectedSourceIds.includes(source.id);
          const displayName = getSourceDisplayName(source, index);
          const activeToggleLabel = `${source.active ? 'Deactivate' : 'Activate'} ${displayName}`;
          const deleteLabel = `Delete ${displayName}`;
          
          return (
            <ListItem
              key={source.id}
              disablePadding
              secondaryAction={
                <Tooltip title={deleteLabel} describeChild>
                  <IconButton
                    edge="end"
                    aria-label={deleteLabel}
                    size="small"
                    onClick={(e) => handleDelete(source.id, e)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
              sx={{
                mb: 0.5,
                borderRadius: 1,
                border: 1,
                borderColor: isSelected ? 'primary.main' : 'divider',
                bgcolor: isSelected ? 'action.selected' : 'background.paper',
              }}
            >
              <ListItemButton onClick={() => handleSelect(source.id)} dense>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', pr: 1 }}>
                  <Checkbox
                    size="small"
                    checked={isChecked}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleSourceSelection(source.id)}
                    slotProps={{ input: { 'aria-label': `Select ${displayName}` } }}
                  />
                  {/* Active/Inactive Toggle */}
                  <Tooltip title={activeToggleLabel} describeChild>
                    <IconButton
                      size="small"
                      aria-label={activeToggleLabel}
                      onClick={(e) => handleToggleActive(source.id, e)}
                      sx={{ p: 0.5 }}
                    >
                      {source.active ? (
                        <RadioButtonChecked fontSize="small" sx={{ color: source.color }} />
                      ) : (
                        <RadioButtonUnchecked fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>

                  {/* Source Info */}
                    <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: isSelected ? 600 : 400 }}>
                        {displayName}
                      </Typography>
                    
                    {source.deviceType && (
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {source.deviceType}
                      </Typography>
                    )}
                    
                    <Typography variant="caption" color="text.secondary">
                      {formatFrequency(source.frequency)} · {formatPower(source.power)}
                    </Typography>
                  </Stack>
                </Box>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}
