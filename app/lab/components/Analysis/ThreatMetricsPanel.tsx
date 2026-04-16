'use client';

import { Box, Typography } from '@mui/material';
import { useLabStore } from '../../hooks/useLabStore';
import { FactionMetrics } from '../../types/field.types';
import { DroneState } from '../../types/drone.types';
import { RFSource } from '../../types/source.types';
import { dbmToWatts } from '../../lib/field-math';

function MetricRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', py: 0.2 }}>
      <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.8)', fontFamily: 'monospace', fontSize: '0.68rem' }}>
        {label}
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: color ?? 'rgba(226,232,240,0.9)', fontFamily: 'monospace', fontSize: '0.68rem', fontWeight: 600 }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function fmt(v: number, decimals = 2) {
  return v.toFixed(decimals);
}

function pct(v: number) {
  return `${Math.round(Math.min(1, Math.max(0, v)) * 100)}%`;
}

function sourcePowerWatts(source: RFSource) {
  return source.powerUnit === 'dBm' ? dbmToWatts(source.power) : Math.max(0, source.power);
}

function getPrimaryDrone(drones: DroneState[]) {
  return drones.find((drone) => drone.faction === 'friendly') ?? drones[0];
}

function computePresetProbabilities(sources: RFSource[]) {
  const activeSources = sources.filter((s) => s.active);
  const friendlySources = activeSources.filter((s) => (s.faction ?? 'friendly') !== 'hostile');
  const hostileSources = activeSources.filter((s) => s.faction === 'hostile');

  const friendlyPower = friendlySources.reduce((sum, source) => sum + sourcePowerWatts(source), 0);
  const hostilePower = hostileSources.reduce((sum, source) => sum + sourcePowerWatts(source), 0);
  const totalPower = friendlyPower + hostilePower;

  const hostileProbability = totalPower > 1e-9 ? hostilePower / totalPower : 0;
  const friendlyProbability = totalPower > 1e-9 ? friendlyPower / totalPower : 0;

  return {
    friendlyCount: friendlySources.length,
    hostileCount: hostileSources.length,
    friendlyPower,
    hostilePower,
    hostileProbability,
    friendlyProbability,
  };
}

function ThreatBar({ value }: { value: number }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  const barColor = value < 0.35 ? '#00FF88' : value < 0.65 ? '#FFAA00' : '#FF3320';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
      <Box sx={{ flex: 1, height: 4, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: barColor, borderRadius: 2, transition: 'width 0.3s ease' }} />
      </Box>
      <Typography variant="caption" sx={{ color: barColor, fontFamily: 'monospace', fontSize: '0.65rem', minWidth: 28 }}>
        {pct}%
      </Typography>
    </Box>
  );
}

function PanelContent({
  metrics,
  sources,
  drones,
}: {
  metrics: FactionMetrics | null;
  sources: RFSource[];
  drones: DroneState[];
}) {
  const probabilities = computePresetProbabilities(sources);
  const hostileProbability = metrics ? metrics.threatDominance : probabilities.hostileProbability;
  const friendlyProbability = metrics ? 1 - metrics.threatDominance : probabilities.friendlyProbability;
  const primaryDrone = getPrimaryDrone(drones);
  const hostileAtDrone = primaryDrone?.fieldAtDrone?.eFieldHostile ?? metrics?.eFieldHostile ?? 0;
  const disruptionThreshold = primaryDrone?.disruptionThreshold ?? 0;
  const marginToDisruption = disruptionThreshold > 0 ? disruptionThreshold - hostileAtDrone : null;

  return (
    <>
      {primaryDrone ? (
        <>
          <MetricRow label="Drone" value={primaryDrone.label} />
          <MetricRow
            label="Status"
            value={primaryDrone.status.toUpperCase()}
            color={
              primaryDrone.status === 'jammed'
                ? '#FF3320'
                : primaryDrone.status === 'degraded'
                ? '#FFAA00'
                : '#00FF88'
            }
          />
          <MetricRow
            label="Drone XYZ"
            value={`${fmt(primaryDrone.position.x, 1)}, ${fmt(primaryDrone.position.y, 1)}, ${fmt(primaryDrone.position.z, 1)}`}
          />
          <MetricRow label="E_hostile@drone" value={`${fmt(hostileAtDrone)} V/m`} color="#FF3320" />
          {marginToDisruption !== null && (
            <MetricRow
              label="Disruption margin"
              value={`${fmt(marginToDisruption)} V/m`}
              color={marginToDisruption <= 0 ? '#FF3320' : marginToDisruption < disruptionThreshold * 0.25 ? '#FFAA00' : '#00FF88'}
            />
          )}
        </>
      ) : (
        <Typography
          variant="caption"
          sx={{ color: 'rgba(148,163,184,0.9)', fontFamily: 'monospace', fontSize: '0.65rem', display: 'block', mb: 0.4 }}
        >
          No active drone telemetry yet.
        </Typography>
      )}
      {metrics ? (
        <>
          <MetricRow label="E_friendly" value={`${fmt(metrics.eFieldFriendly)} V/m`} color="#00AAFF" />
          <MetricRow label="E_hostile" value={`${fmt(metrics.eFieldHostile)} V/m`} color="#FF3320" />
          <MetricRow label="E_net" value={`${fmt(metrics.eFieldNet)} V/m`} />
          <MetricRow label="Destructive" value={fmt(metrics.destructiveStrength)} color="#FF6600" />
          <MetricRow label="Constructive" value={fmt(metrics.constructiveStrength)} color="#88FF44" />
          <MetricRow label="I_interaction" value={fmt(metrics.interactionScore)} />
        </>
      ) : (
        <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.9)', fontFamily: 'monospace', fontSize: '0.65rem', display: 'block', mb: 0.4 }}>
          Telemetry unavailable for this preset. Using live source mix.
        </Typography>
      )}
      <MetricRow label="P_hostile" value={pct(hostileProbability)} color="#FF3320" />
      <MetricRow label="P_friendly" value={pct(friendlyProbability)} color="#00AAFF" />
      <MetricRow label="Sources F/H" value={`${probabilities.friendlyCount}/${probabilities.hostileCount}`} />
      <MetricRow label="Power F/H" value={`${fmt(probabilities.friendlyPower, 3)}/${fmt(probabilities.hostilePower, 3)} W`} />
      <Box sx={{ mt: 0.5 }}>
        <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.8)', fontFamily: 'monospace', fontSize: '0.68rem' }}>
          Threat Dominance
        </Typography>
        <ThreatBar value={hostileProbability} />
      </Box>
    </>
  );
}

/**
 * Overlay panel showing live faction-separated field metrics at the primary drone's position.
 * Reads `activeFactionMetrics` from the Zustand store (updated ~2 Hz by DroneMarker).
 */
export function ThreatMetricsPanel() {
  const metrics = useLabStore((state) => state.activeFactionMetrics);
  const sources = useLabStore((state) => state.sources);
  const drones = useLabStore((state) => state.drones);
  const fps = useLabStore((state) => state.performance.currentFPS);

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 200,
        bgcolor: 'rgba(2, 6, 23, 0.82)',
        border: '1px solid rgba(148,163,184,0.18)',
        borderRadius: 1.5,
        p: 1.25,
        backdropFilter: 'blur(6px)',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography
          variant="caption"
          sx={{ display: 'block', fontFamily: 'monospace', fontWeight: 700, color: 'rgba(226,232,240,0.6)', letterSpacing: 1, fontSize: '0.6rem' }}
        >
          LIVE FIELD METRICS
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'rgba(226,232,240,0.8)', fontSize: '0.6rem' }}
        >
          FPS {fps.toFixed(0)}
        </Typography>
      </Box>
      <PanelContent metrics={metrics} sources={sources} drones={drones} />
    </Box>
  );
}

/** Content-only export for use inside a shared grouped container */
export function ThreatMetricsPanelContent() {
  const metrics = useLabStore((state) => state.activeFactionMetrics);
  const sources = useLabStore((state) => state.sources);
  const drones = useLabStore((state) => state.drones);
  const fps = useLabStore((state) => state.performance.currentFPS);
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography
          variant="caption"
          sx={{ display: 'block', fontFamily: 'monospace', fontWeight: 700, color: 'rgba(226,232,240,0.6)', letterSpacing: 1, fontSize: '0.6rem' }}
        >
          LIVE FIELD METRICS
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'rgba(226,232,240,0.8)', fontSize: '0.6rem' }}
        >
          FPS {fps.toFixed(0)}
        </Typography>
      </Box>
      <PanelContent metrics={metrics} sources={sources} drones={drones} />
    </>
  );
}
