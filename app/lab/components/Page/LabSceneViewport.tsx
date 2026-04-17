'use client';

import GitHubIcon from '@mui/icons-material/GitHub';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import { FieldSamplesChart } from '../Analysis/FieldSamplesChart';
import { FieldStrengthOverlay } from '../Analysis/FieldStrengthOverlay';
import { ContestZoneMarker } from '../Canvas3D/ContestZoneMarker';
import { Canvas3D } from '../Canvas3D/Canvas3D';
import { DroneMarker } from '../Canvas3D/DroneMarker';
import { EnvironmentBoundary } from '../Canvas3D/EnvironmentBoundary';
import { FieldVisualization } from '../Canvas3D/FieldVisualization';
import { FlightPath } from '../Canvas3D/FlightPath';
import { InterferenceField3D } from '../Canvas3D/InterferenceField3D';
import { MeasurementPoint as MeasurementPointMarker } from '../Canvas3D/MeasurementPoint';
import { SourceMarker } from '../Canvas3D/SourceMarker';
import { PerformanceWarning } from '../shared/PerformanceWarning';
import { WebGLErrorBoundary } from '../shared/WebGLErrorBoundary';
import { CameraState } from '../../types/camera.types';
import { DroneState } from '../../types/drone.types';
import { MeasurementPoint } from '../../types/measurement.types';
import { RFSource } from '../../types/source.types';
import { VisualizationSettings } from '../../types/visualization.types';
import { LiveMetricsSidebar } from './LiveMetricsSidebar';
import { MaxwellOverlay } from './MaxwellOverlay';

interface LabSceneViewportProps {
  camera: CameraState;
  sources: RFSource[];
  selectedSourceIds: string[];
  measurements: MeasurementPoint[];
  drones: DroneState[];
  settings: VisualizationSettings;
  activeSources: RFSource[];
  hasActiveMaxwellRun: boolean;
  onSelectSource: (sourceId: string) => void;
}

export function LabSceneViewport({
  camera,
  sources,
  selectedSourceIds,
  measurements,
  drones,
  settings,
  activeSources,
  hasActiveMaxwellRun,
  onSelectSource,
}: LabSceneViewportProps) {
  return (
    <Box sx={{ flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden' }}>
      <WebGLErrorBoundary>
        <Canvas3D camera={camera}>
          <EnvironmentBoundary />

          {sources.map((source) => (
            <SourceMarker
              key={source.id}
              source={source}
              isSelected={selectedSourceIds.includes(source.id)}
              onClick={() => onSelectSource(source.id)}
            />
          ))}

          {measurements.map((measurement) => (
            <MeasurementPointMarker key={measurement.id} measurement={measurement} />
          ))}

          <FieldVisualization
            sources={activeSources}
            lod={settings.lod}
            colorScheme={settings.colorScheme}
          />
          <InterferenceField3D
            sources={activeSources}
            lod={settings.lod}
            colorScheme={settings.colorScheme}
          />

          <ContestZoneMarker />

          {settings.showFlightPaths &&
            drones.map((drone) => <FlightPath key={`path-${drone.id}`} drone={drone} />)}

          {drones.map((drone) => (
            <DroneMarker key={drone.id} drone={drone} />
          ))}
        </Canvas3D>
      </WebGLErrorBoundary>

      {activeSources.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            position: 'absolute',
            inset: '50% auto auto 50%',
            transform: 'translate(-50%, -50%)',
            px: 3,
            py: 2,
            bgcolor: 'rgba(15, 23, 42, 0.9)',
            color: 'text.primary',
            border: '1px solid rgba(148, 163, 184, 0.24)',
            borderRadius: 2,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            No active emitters
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enable a source or load a preset to display the field.
          </Typography>
        </Paper>
      )}

      <PerformanceWarning />
      <FieldStrengthOverlay measurement={measurements[measurements.length - 1]} />

      <IconButton
        component="a"
        href="https://github.com/carlwelchdesign/emf-disturbance-sim"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub profile"
        sx={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          zIndex: 12,
          bgcolor: 'rgba(2, 6, 23, 0.72)',
          color: 'rgba(226, 232, 240, 0.95)',
          border: '1px solid rgba(148,163,184,0.24)',
          borderRadius: 1.5,
          gap: 0.5,
          px: 1,
          '&:hover': {
            bgcolor: 'rgba(2, 6, 23, 0.88)',
          },
        }}
      >
        <GitHubIcon fontSize="small" />
        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'inherit' }}>
          carlwelchdesign
        </Typography>
      </IconButton>

      <MaxwellOverlay hasActiveMaxwellRun={hasActiveMaxwellRun} />
      <LiveMetricsSidebar />
      <FieldSamplesChart />
    </Box>
  );
}