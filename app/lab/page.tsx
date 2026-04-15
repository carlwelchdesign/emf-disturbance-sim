'use client';

import { Box } from '@mui/material';
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
              sources={sources.filter((s) => s.active)}
              lod={settings.lod}
              colorScheme={settings.colorScheme}
            />
          </Canvas3D>
        </WebGLErrorBoundary>

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
