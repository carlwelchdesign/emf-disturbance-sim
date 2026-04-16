'use client';

import { Box, Typography } from '@mui/material';
import { useLabStore } from '../../hooks/useLabStore';
import { FactionMetrics } from '../../types/field.types';

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

function PanelContent({ metrics }: { metrics: FactionMetrics }) {
  return (
    <>
      <MetricRow label="E_friendly" value={`${fmt(metrics.eFieldFriendly)} V/m`} color="#00AAFF" />
      <MetricRow label="E_hostile" value={`${fmt(metrics.eFieldHostile)} V/m`} color="#FF3320" />
      <MetricRow label="E_net" value={`${fmt(metrics.eFieldNet)} V/m`} />
      <MetricRow label="Destructive" value={fmt(metrics.destructiveStrength)} color="#FF6600" />
      <MetricRow label="Constructive" value={fmt(metrics.constructiveStrength)} color="#88FF44" />
      <MetricRow label="I_interaction" value={fmt(metrics.interactionScore)} />
      <Box sx={{ mt: 0.5 }}>
        <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.8)', fontFamily: 'monospace', fontSize: '0.68rem' }}>
          Threat Dominance
        </Typography>
        <ThreatBar value={metrics.threatDominance} />
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
  const drones = useLabStore((state) => state.drones);

  if (!metrics || drones.length === 0) return null;

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
      <Typography
        variant="caption"
        sx={{ display: 'block', fontFamily: 'monospace', fontWeight: 700, color: 'rgba(226,232,240,0.6)', letterSpacing: 1, mb: 0.75, fontSize: '0.6rem' }}
      >
        LIVE FIELD METRICS
      </Typography>
      <PanelContent metrics={metrics} />
    </Box>
  );
}

/** Content-only export for use inside a shared grouped container */
export function ThreatMetricsPanelContent() {
  const metrics = useLabStore((state) => state.activeFactionMetrics);
  const drones = useLabStore((state) => state.drones);
  if (!metrics || drones.length === 0) return null;
  return (
    <>
      <Typography
        variant="caption"
        sx={{ display: 'block', fontFamily: 'monospace', fontWeight: 700, color: 'rgba(226,232,240,0.6)', letterSpacing: 1, mb: 0.75, fontSize: '0.6rem' }}
      >
        LIVE FIELD METRICS
      </Typography>
      <PanelContent metrics={metrics} />
    </>
  );
}
