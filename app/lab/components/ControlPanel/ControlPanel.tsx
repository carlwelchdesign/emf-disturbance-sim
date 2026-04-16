'use client';

import { Box, Paper, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip, Typography } from '@mui/material';
import CameraIcon from '@mui/icons-material/CameraAlt';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
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
import { SectionPanel } from './SectionPanel';
import { SIDEBAR_SECTION_TITLES } from '../../lib/sidebar-layout';

/**
 * ControlPanel container component
 * Contains all control sections for the lab
 */
export function ControlPanel() {
  const getSelectionContext = useLabStore((state) => state.getSelectionContext);
  const getSelectedSources = useLabStore((state) => state.getSelectedSources);
  const resetCamera = useLabStore((state) => state.resetCamera);
  const addSource = useLabStore((state) => state.addSource);
  const clearAllSources = useLabStore((state) => state.clearAllSources);
  const sourcesCount = useLabStore((state) => state.sources.length);
  const sectionDisclosure = useLabStore((state) => state.sectionDisclosure);
  const toggleSectionExpanded = useLabStore((state) => state.toggleSectionExpanded);
  const selectionContext = getSelectionContext();
  const selectedSources = getSelectedSources();

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
        <SectionPanel
          sectionId="simulation-setup"
          title={SIDEBAR_SECTION_TITLES['simulation-setup']}
          ariaDescription="Simulation setup section for presets"
          expanded={sectionDisclosure['simulation-setup']}
          onToggleExpanded={() => toggleSectionExpanded('simulation-setup')}
        >
          <ScenarioPresets />
        </SectionPanel>

        <SectionPanel
          sectionId="active-entities"
          title={SIDEBAR_SECTION_TITLES['active-entities']}
          ariaDescription="Active entities section for source inventory and selection"
          expanded={sectionDisclosure['active-entities']}
          onToggleExpanded={() => toggleSectionExpanded('active-entities')}
          headerActions={
            <>
              <Tooltip title="Create another RF source using the current default settings." describeChild>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddSource}
                  aria-label="Add source to active entities"
                  sx={{
                    textTransform: 'none',
                    minHeight: 18,
                    py: 0.25,
                    px: 0.75,
                    minWidth: 36,
                    fontSize: '0.75rem',
                    '& .MuiButton-startIcon': {
                      marginRight: 0,
                    },
                  }}
                />
              </Tooltip>
              <Tooltip title="Remove every source from the scene after confirmation." describeChild>
                <span>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setClearDialogOpen(true)}
                    aria-label="Clear all sources from active entities"
                    disabled={sourcesCount === 0}
                  sx={{
                    textTransform: 'none',
                    minHeight: 18,
                    py: 0.25,
                      minWidth: 36,
                      px: 0.75,
                      fontSize: '0.75rem',
                    '& .MuiButton-startIcon': {
                      margin: 0,
                    },
                  }}
                />
              </span>
            </Tooltip>
            </>
          }
        >
          {sourcesCount === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Add a source to begin.
            </Typography>
          )}
          <SourceList />
        </SectionPanel>

        <SectionPanel
          sectionId="selected-entity"
          title={SIDEBAR_SECTION_TITLES['selected-entity']}
          ariaDescription="Selected entity section for focused source parameter editing"
          expanded={sectionDisclosure['selected-entity']}
          onToggleExpanded={() => toggleSectionExpanded('selected-entity')}
        >
          <SourceControls selectionContext={selectionContext} selectedSources={selectedSources} />
        </SectionPanel>

        <SectionPanel
          sectionId="visualization-controls"
          title={SIDEBAR_SECTION_TITLES['visualization-controls']}
          ariaDescription="Visualization controls section for global rendering settings"
          expanded={sectionDisclosure['visualization-controls']}
          onToggleExpanded={() => toggleSectionExpanded('visualization-controls')}
        >
          <VisualizationSettings />
        </SectionPanel>

        <SectionPanel
          sectionId="analysis-measurements"
          title={SIDEBAR_SECTION_TITLES['analysis-measurements']}
          ariaDescription="Analysis and measurements section for readouts and measurement tools"
          expanded={sectionDisclosure['analysis-measurements']}
          onToggleExpanded={() => toggleSectionExpanded('analysis-measurements')}
        >
          <MeasurementTools />
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Measurement List
            </Typography>
            <MeasurementList />
          </Box>
        </SectionPanel>

        <SectionPanel
          sectionId="system-view"
          title={SIDEBAR_SECTION_TITLES['system-view']}
          ariaDescription="System and view section for environment controls and camera reset"
          expanded={sectionDisclosure['system-view']}
          onToggleExpanded={() => toggleSectionExpanded('system-view')}
        >
          <EnvironmentControls />
          <Box sx={{ mt: 1 }}>
            <Tooltip title="Return the 3D camera to the default overview position." describeChild>
              <Button
                variant="outlined"
                startIcon={<CameraIcon />}
                onClick={resetCamera}
                aria-label="Reset View camera"
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
          <Box sx={{ mt: 1 }}>
            <FPSMonitor />
          </Box>
        </SectionPanel>

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
