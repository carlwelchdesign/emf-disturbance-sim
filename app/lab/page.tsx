'use client';

import { Box, Paper, Typography } from '@mui/material';
import { Canvas3D } from './components/Canvas3D/Canvas3D';
import { SourceMarker } from './components/Canvas3D/SourceMarker';
import { MeasurementPoint as MeasurementPointMarker } from './components/Canvas3D/MeasurementPoint';
import { FieldVisualization } from './components/Canvas3D/FieldVisualization';
import { DroneMarker } from './components/Canvas3D/DroneMarker';
import { FlightPath } from './components/Canvas3D/FlightPath';
import { ContestZoneMarker } from './components/Canvas3D/ContestZoneMarker';
import { MaxwellFieldOverlay } from './components/Canvas3D/MaxwellFieldOverlay';
import { MaxwellFieldVolume } from './components/Canvas3D/MaxwellFieldVolume';
import { InterferenceField3D } from './components/Canvas3D/InterferenceField3D';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { FieldStrengthOverlay } from './components/Analysis/FieldStrengthOverlay';
import { ThreatMetricsPanelContent } from './components/Analysis/ThreatMetricsPanel';
import { EmitterInteractionsPanelContent } from './components/Analysis/EmitterInteractionsPanel';
import { FieldSamplesChart } from './components/Analysis/FieldSamplesChart';
import { DerivedMetricsPanel } from './components/Analysis/DerivedMetricsPanel';
import { MaxwellRunContextPanel } from './components/Analysis/MaxwellRunContextPanel';
import { MaxwellRunControlsContent } from './components/ControlPanel/MaxwellRunControls';
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
  const drones = useLabStore((state) => state.drones);
  const hasActiveMaxwellRun = useLabStore((s) => !!s.maxwellActiveRunId);
  const activeSources = useMemo(() => {
    const staticSources = sources.filter((source) => source.active);
    const droneEmissionSources = drones
      .filter((d) => d.emission?.active)
      .map((d) => ({
        id: `drone-emission-${d.id}`,
        position: d.position,
        frequency: d.emission!.frequency,
        power: d.emission!.power,
        powerUnit: d.emission!.powerUnit,
        bandwidthHz: d.emission!.bandwidthHz,
        phase: 0,
        antennaType: 'omnidirectional' as const,
        active: true,
        faction: d.faction,
        label: `${d.label} (EMF)`,
        gain: 1,
      }));
    return [...staticSources, ...droneEmissionSources];
  }, [sources, drones]);

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

            {/* Live 3-D interference field — colours every lattice point by net
                E-field strength (superposition of all active sources + phase).
                Updates every few frames; no solver run required. */}
            <InterferenceField3D
              sources={activeSources}
              lod={settings.lod}
              colorScheme={settings.colorScheme}
            />

            {/* Contested zone indicators */}
            <ContestZoneMarker />

            {/* Drone flight paths */}
            {settings.showFlightPaths &&
              drones.map((drone) => <FlightPath key={`path-${drone.id}`} drone={drone} />)}

            {/* Drone animated objects */}
            {drones.map((drone) => (
              <DroneMarker key={drone.id} drone={drone} />
            ))}

            {/* Maxwell FDTD field volume — renders E-field at current time step */}
            {hasActiveMaxwellRun && <MaxwellFieldVolume />}
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
        <FieldStrengthOverlay measurement={measurements[measurements.length - 1]} />
        <FPSCounter />

        {/* Maxwell time-navigation overlay (bottom-centre of canvas) */}
        <MaxwellFieldOverlay />

        {/* Maxwell overlay — always visible (launch controls + results) */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            width: 260,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}
          role="complementary"
          aria-label="Maxwell simulation controls and results"
        >
          {/* Launch controls: run queue + configure form */}
          <Box
            sx={{
              bgcolor: 'rgba(2, 6, 23, 0.88)',
              border: '1px solid rgba(148,163,184,0.18)',
              borderRadius: hasActiveMaxwellRun ? '6px 6px 0 0' : 1.5,
              borderBottom: hasActiveMaxwellRun ? 'none' : undefined,
              p: 1.25,
              backdropFilter: 'blur(6px)',
            }}
          >
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'rgba(148,163,184,0.7)', letterSpacing: '0.08em', display: 'block', mb: 0.75 }}>
              MAXWELL SOLVER
            </Typography>
            <MaxwellRunControlsContent />
          </Box>

          {/* Context: run selector, time-step nav, validation status */}
          {hasActiveMaxwellRun && (
            <Box
              sx={{
                bgcolor: 'rgba(2, 6, 23, 0.88)',
                border: '1px solid rgba(148,163,184,0.18)',
                borderTop: 'none',
                p: 1.25,
                backdropFilter: 'blur(6px)',
              }}
            >
              <MaxwellRunContextPanel />
            </Box>
          )}

          {/* Derived metrics */}
          {hasActiveMaxwellRun && (
            <Box
              sx={{
                bgcolor: 'rgba(2, 6, 23, 0.88)',
                border: '1px solid rgba(148,163,184,0.18)',
                borderTop: 'none',
                borderRadius: '0 0 6px 6px',
                p: 1.25,
                backdropFilter: 'blur(6px)',
              }}
            >
              <DerivedMetricsPanel />
            </Box>
          )}
        </Box>

        {/* Live Field Metrics + Emitter Interactions — grouped bottom-right, always visible */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            width: 200,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              bgcolor: 'rgba(2, 6, 23, 0.82)',
              border: '1px solid rgba(148,163,184,0.18)',
              borderRadius: '6px 6px 0 0',
              p: 1.25,
              backdropFilter: 'blur(6px)',
            }}
          >
            <ThreatMetricsPanelContent />
          </Box>
          <Box
            sx={{
              bgcolor: 'rgba(2, 6, 23, 0.82)',
              border: '1px solid rgba(148,163,184,0.18)',
              borderTop: 'none',
              borderRadius: '0 0 6px 6px',
              p: 1.25,
              backdropFilter: 'blur(6px)',
              maxHeight: 280,
              overflow: 'hidden',
            }}
          >
            <EmitterInteractionsPanelContent />
          </Box>
        </Box>

        <FieldSamplesChart />
      </Box>

      {/* Control Panel */}
      <ControlPanel />
    </Box>
  );
}
