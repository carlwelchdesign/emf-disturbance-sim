'use client';

import { Box } from '@mui/material';
import { ControlPanelRail } from './components/Page/ControlPanelRail';
import { LabSceneViewport } from './components/Page/LabSceneViewport';
import { WelcomeDialog } from './components/Page/WelcomeDialog';
import { useFPSMonitor } from './hooks/useFPSMonitor';
import { useLabStore } from './hooks/useLabStore';
import { RFSource } from './types';
import { useMemo } from 'react';
import { useState } from 'react';

/**
 * Main page component for the EMF/RF Disturbance Lab
 */
export default function LabPage() {
  const WELCOME_MODAL_Z_INDEX = 20000000;
  const sources = useLabStore((state) => state.sources);
  const selectedSourceIds = useLabStore((state) => state.selectionContext.selectedSourceIds);
  const selectSource = useLabStore((state) => state.selectSource);
  const settings = useLabStore((state) => state.settings);
  const camera = useLabStore((state) => state.camera);
  const measurements = useLabStore((state) => state.measurements);
  const drones = useLabStore((state) => state.drones);
  const hasActiveMaxwellRun = useLabStore((s) => !!s.maxwellActiveRunId);
  const [controlPanelOpen, setControlPanelOpen] = useState(true);
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(true);
  const activeSources = useMemo<RFSource[]>(() => {
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
      <LabSceneViewport
        camera={camera}
        sources={sources}
        selectedSourceIds={selectedSourceIds}
        measurements={measurements}
        drones={drones}
        settings={settings}
        activeSources={activeSources}
        hasActiveMaxwellRun={hasActiveMaxwellRun}
        onSelectSource={selectSource}
      />

      <ControlPanelRail
        open={controlPanelOpen}
        onOpen={() => setControlPanelOpen(true)}
        onClose={() => setControlPanelOpen(false)}
      />

      <WelcomeDialog
        open={welcomeModalOpen}
        zIndex={WELCOME_MODAL_Z_INDEX}
        onClose={() => setWelcomeModalOpen(false)}
      />
    </Box>
  );
}
