'use client';

import { Box, Paper, Button, Divider, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip } from '@mui/material';
import CameraIcon from '@mui/icons-material/CameraAlt';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/DeleteSweep';
import { SourceControls } from './SourceControls';
import { SourceList } from './SourceList';
import { EnvironmentControls } from './EnvironmentControls';
import { VisualizationSettings } from './VisualizationSettings';
import { MeasurementTools } from './MeasurementTools';
import { ScenarioPresets } from './ScenarioPresets';
import { MeasurementList } from '../Analysis/MeasurementList';
import { FPSMonitor } from '../shared/FPSMonitor';
import { useLabStore } from '../../hooks/useLabStore';
import { useState } from 'react';

/**
 * ControlPanel container component
 * Contains all control sections for the lab
 */
export function ControlPanel() {
  const getSelectedSource = useLabStore((state) => state.getSelectedSource);
  const resetCamera = useLabStore((state) => state.resetCamera);
  const addSource = useLabStore((state) => state.addSource);
  const clearAllSources = useLabStore((state) => state.clearAllSources);
  const sourcesCount = useLabStore((state) => state.sources.length);
  const selectedSource = getSelectedSource();

  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const handleAddSource = () => {
    addSource();
  };

  const handleClearAll = () => {
    clearAllSources();
    setClearDialogOpen(false);
  };

  return (
    <Box
      sx={{
        width: 320,
        height: '100%',
        overflowY: 'auto',
        bgcolor: 'background.default',
        borderLeft: 1,
        borderColor: 'divider',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 0,
        }}
      >
        {/* Camera Controls Section */}
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            View Controls
          </Typography>
          <Tooltip title="Return the 3D camera to the default overview position." describeChild>
            <Button
              variant="outlined"
              startIcon={<CameraIcon />}
              onClick={resetCamera}
              fullWidth
              sx={{ textTransform: 'none' }}
            >
              Reset View
            </Button>
          </Tooltip>
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
            • Left-click drag: Orbit
            <br />
            • Right-click drag: Pan
            <br />
            • Scroll: Zoom
          </Typography>
        </Box>

        <Divider />

        {/* Source Management Section */}
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Source Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Create another RF source using the current default settings." describeChild>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddSource}
                fullWidth
                sx={{ textTransform: 'none' }}
              >
                Add Source
              </Button>
            </Tooltip>
            <Tooltip title="Remove every source from the scene after confirmation." describeChild>
              <span>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<ClearIcon />}
                  onClick={() => setClearDialogOpen(true)}
                  disabled={sourcesCount === 0}
                  sx={{ textTransform: 'none' }}
                >
                  Clear All
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Box>

        <Divider />

        <ScenarioPresets />

        <Divider />

        {/* Source List */}
        {sourcesCount === 0 && (
          <Box sx={{ px: 2, pb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Add a source to begin.
            </Typography>
          </Box>
        )}
        <SourceList />

        <Divider />

        {/* Source Controls Section */}
        <SourceControls source={selectedSource} />

        <Divider />

        <EnvironmentControls />

        <Divider />

        <VisualizationSettings />

        <Box sx={{ px: 2, pb: 2 }}>
          <FPSMonitor />
        </Box>

        <Divider />

        <MeasurementTools />

        <Divider />

        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Measurement List
          </Typography>
          <MeasurementList />
        </Box>
      </Paper>

      {/* Clear All Confirmation Dialog */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
      >
        <DialogTitle>Clear All Sources?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will remove all {sourcesCount} source{sourcesCount !== 1 ? 's' : ''} from the simulation. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleClearAll} color="error" variant="contained">
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
