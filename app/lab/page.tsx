'use client';

import { Box, Paper, Typography } from '@mui/material';
import { Canvas3D } from './components/Canvas3D/Canvas3D';
import { SourceMarker } from './components/Canvas3D/SourceMarker';
import { MeasurementPoint as MeasurementPointMarker } from './components/Canvas3D/MeasurementPoint';
import { EnvironmentBoundary } from './components/Canvas3D/EnvironmentBoundary';
import { FieldVisualization } from './components/Canvas3D/FieldVisualization';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { AccuracyDisclaimer } from './components/Analysis/AccuracyDisclaimer';
import { FieldStrengthOverlay } from './components/Analysis/FieldStrengthOverlay';
import { FPSCounter } from './components/shared/FPSCounter';
import { PerformanceWarning } from './components/shared/PerformanceWarning';
import { WebGLErrorBoundary } from './components/shared/WebGLErrorBoundary';
import { useFPSMonitor } from './hooks/useFPSMonitor';
import { useLabStore } from './hooks/useLabStore';
import { useMemo } from 'react';

/**
 * Main page component for the EMF/RF Disturbance Lab
 */
export default function LabPage() {
  const sources = useLabStore((state) => state.sources);
  const selectedSourceId = useLabStore((state) => state.selectedSourceId);
  const selectSource = useLabStore((state) => state.selectSource);
  const settings = useLabStore((state) => state.settings);
  const camera = useLabStore((state) => state.camera);
  const measurements = useLabStore((state) => state.measurements);
  const activeSources = useMemo(() => sources.filter((source) => source.active), [sources]);

  useFPSMonitor();

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {/* 3D Visualization */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <WebGLErrorBoundary>
          <Canvas3D camera={camera}>
            {/* Grid / environment boundary */}
            <EnvironmentBoundary />

            {/* Source markers */}
            {sources.map((source) => (
              <SourceMarker
                key={source.id}
                source={source}
                isSelected={source.id === selectedSourceId}
                onClick={() => selectSource(source.id)}
              />
            ))}

            {/* Measurement markers */}
            {measurements.map((measurement) => (
              <MeasurementPointMarker key={measurement.id} measurement={measurement} />
            ))}

            {/* Field visualization */}
            <FieldVisualization
              sources={activeSources}
              lod={settings.lod}
              colorScheme={settings.colorScheme}
            />
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

        {/* Overlays */}
        <PerformanceWarning />
        <AccuracyDisclaimer />
        <FieldStrengthOverlay measurement={measurements[measurements.length - 1]} />
        <FPSCounter />
      </Box>

      {/* Control Panel */}
      <ControlPanel />
    </Box>
  );
}
