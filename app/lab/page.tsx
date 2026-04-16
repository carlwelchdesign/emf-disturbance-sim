'use client';

import { Box, Chip, IconButton, Paper, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Canvas3D } from './components/Canvas3D/Canvas3D';
import { EnvironmentBoundary } from './components/Canvas3D/EnvironmentBoundary';
import { SourceMarker } from './components/Canvas3D/SourceMarker';
import { MeasurementPoint as MeasurementPointMarker } from './components/Canvas3D/MeasurementPoint';
import { DroneMarker } from './components/Canvas3D/DroneMarker';
import { FlightPath } from './components/Canvas3D/FlightPath';
import { ContestZoneMarker } from './components/Canvas3D/ContestZoneMarker';
import { InterferenceField3D } from './components/Canvas3D/InterferenceField3D';
import { FieldVisualization } from './components/Canvas3D/FieldVisualization';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { FieldStrengthOverlay } from './components/Analysis/FieldStrengthOverlay';
import { ThreatMetricsPanelContent } from './components/Analysis/ThreatMetricsPanel';
import { EmitterInteractionsPanelContent } from './components/Analysis/EmitterInteractionsPanel';
import { FieldSamplesChart } from './components/Analysis/FieldSamplesChart';
import { DerivedMetricsPanel } from './components/Analysis/DerivedMetricsPanel';
import { MaxwellRunContextPanel } from './components/Analysis/MaxwellRunContextPanel';
import { MaxwellRunControlsContent } from './components/ControlPanel/MaxwellRunControls';
import { PerformanceWarning } from './components/shared/PerformanceWarning';
import { WebGLErrorBoundary } from './components/shared/WebGLErrorBoundary';
import { useFPSMonitor } from './hooks/useFPSMonitor';
import { useLabStore } from './hooks/useLabStore';
import { useMemo } from 'react';
import { useState } from 'react';

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
  const [controlPanelOpen, setControlPanelOpen] = useState(true);
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
      <Box sx={{ flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden' }}>
        <WebGLErrorBoundary>
          <Canvas3D camera={camera}>
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

            {/* Contested zone indicators */}
            <ContestZoneMarker />

            {/* Drone flight paths */}
            {settings.showFlightPaths &&
              drones.map((drone) => <FlightPath key={`path-${drone.id}`} drone={drone} />)}

            {/* Drone animated objects */}
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

        {/* Overlays */}
        <PerformanceWarning />
        <FieldStrengthOverlay measurement={measurements[measurements.length - 1]} />
        <IconButton
          component="a"
          href="https://github.com/carlwelchdesign"
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

        {/* Maxwell field overlay disabled */}

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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'rgba(148,163,184,0.7)', letterSpacing: '0.08em' }}>
                MAXWELL SOLVER
              </Typography>
              <Chip
                label="VISUALS DISABLED"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  bgcolor: 'rgba(148,163,184,0.14)',
                  color: 'rgba(148,163,184,0.9)',
                  border: '1px solid rgba(148,163,184,0.3)',
                }}
              />
            </Box>
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
            top: 0,
            bottom: 0,
            right: 12,
            width: 200,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            pointerEvents: 'none',
            py: 1.5,
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
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            <EmitterInteractionsPanelContent />
          </Box>
        </Box>

        <FieldSamplesChart />
      </Box>

      {/* Control Panel */}
      <Box
        sx={{
          position: 'relative',
          width: controlPanelOpen ? 320 : 48,
          minWidth: controlPanelOpen ? 320 : 48,
          maxWidth: controlPanelOpen ? 320 : 48,
          flexShrink: 0,
          zIndex: 30,
          pointerEvents: 'auto',
        }}
      >
        {controlPanelOpen ? (
          <>
            <ControlPanel />
            <IconButton
              aria-label="Hide control panel"
              onClick={() => setControlPanelOpen(false)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 20,
                bgcolor: 'rgba(2, 6, 23, 0.72)',
                color: 'rgba(226, 232, 240, 0.95)',
                '&:hover': {
                  bgcolor: 'rgba(2, 6, 23, 0.88)',
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <Box
            sx={{
              width: 48,
              height: '100%',
              borderLeft: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              pt: 1,
              bgcolor: 'background.default',
            }}
          >
            <IconButton
              aria-label="Show control panel"
              onClick={() => setControlPanelOpen(true)}
              sx={{
                bgcolor: 'rgba(2, 6, 23, 0.72)',
                color: 'rgba(226, 232, 240, 0.95)',
                '&:hover': {
                  bgcolor: 'rgba(2, 6, 23, 0.88)',
                },
              }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
}
