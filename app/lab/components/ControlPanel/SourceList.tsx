/**
 * Source List component
 * Displays all sources with selection and management controls
 */

'use client';

import { Box, List, ListItem, ListItemButton, IconButton, Typography, Stack, Chip, Tooltip } from '@mui/material';
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
  const selectSource = useLabStore((state) => state.selectSource);
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
    selectSource(sourceId);
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
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
        Sources ({sources.length})
      </Typography>
      
      <List disablePadding>
        {sources.map((source: RFSource, index) => {
          const isSelected = source.id === selectedSourceId;
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
                    
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      <Chip
                        label={formatFrequency(source.frequency)}
                        size="small"
                        sx={{ height: 18, fontSize: '0.7rem' }}
                      />
                      <Chip
                        label={formatPower(source.power)}
                        size="small"
                        sx={{ height: 18, fontSize: '0.7rem' }}
                      />
                    </Box>
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
