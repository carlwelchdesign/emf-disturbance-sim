'use client';

import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useLabStore } from '../../hooks/useLabStore';
import { RFSource } from '../../types/source.types';
import { calculateFieldOverlapScore } from '../../lib/field-math';
import { useActiveInterferenceRenderState } from '../../hooks/useMaxwellRunSelectors';

function dist3(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', py: 0.2 }}>
      <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.7)', fontFamily: 'monospace', fontSize: '0.65rem' }}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ color: color ?? 'rgba(226,232,240,0.85)', fontFamily: 'monospace', fontSize: '0.65rem', fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  );
}

function sourcePowerWatts(source: RFSource) {
  return source.powerUnit === 'dBm' ? Math.pow(10, source.power / 10) / 1000 : Math.max(0, source.power);
}

function computeInteractionSummary(sources: RFSource[]) {
  const activeSources = sources.filter((s) => s.active);
  const friendly = activeSources.filter((s) => (s.faction ?? 'friendly') !== 'hostile');
  const hostile = activeSources.filter((s) => s.faction === 'hostile');
  const pairCount = friendly.length * hostile.length;
  const friendlyPower = friendly.reduce((sum, source) => sum + sourcePowerWatts(source), 0);
  const hostilePower = hostile.reduce((sum, source) => sum + sourcePowerWatts(source), 0);
  const totalPower = friendlyPower + hostilePower;
  const hostileProbability = totalPower > 1e-9 ? hostilePower / totalPower : 0;
  const friendlyProbability = totalPower > 1e-9 ? friendlyPower / totalPower : 0;
  return {
    friendly,
    hostile,
    pairCount,
    friendlyPower,
    hostilePower,
    hostileProbability,
    friendlyProbability,
  };
}

function percent(v: number) {
  return `${Math.round(Math.min(1, Math.max(0, v)) * 100)}%`;
}

function PairPanel({ friendly, hostile }: { friendly: RFSource; hostile: RFSource }) {
  const distance = dist3(friendly.position, hostile.position);

  // Coupling: normalised field overlap proxy based on distance and power
  const fPower = friendly.powerUnit === 'dBm' ? Math.pow(10, friendly.power / 10) / 1000 : friendly.power;
  const hPower = hostile.powerUnit === 'dBm' ? Math.pow(10, hostile.power / 10) / 1000 : hostile.power;
  const coupling = Math.min(1, calculateFieldOverlapScore(fPower, hPower) / (distance * distance + 0.01));

  // Resonance: frequencies close relative to their bandwidths
  const freqDelta = Math.abs(friendly.frequency - hostile.frequency);
  const combinedBw = ((friendly.bandwidthHz ?? 80e6) + (hostile.bandwidthHz ?? 80e6)) / 2;
  const isResonant = freqDelta < combinedBw;

  // Phase conflict
  const phaseDiff = Math.abs(friendly.phase - hostile.phase);
  const conflictAngle = Math.min(phaseDiff, Math.PI * 2 - phaseDiff);
  const conflictScore = conflictAngle / Math.PI; // 0 = same phase, 1 = anti-phase

  return (
    <Box
      sx={{
        bgcolor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(148,163,184,0.12)',
        borderRadius: 1,
        p: 1,
        mb: 0.75,
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontFamily: 'monospace', fontSize: '0.6rem', color: 'rgba(226,232,240,0.45)', letterSpacing: 0.8 }}
      >
        {friendly.label ?? 'F'} ↔ {hostile.label ?? 'H'}
      </Typography>
      <Row label="Distance" value={`${distance.toFixed(1)} m`} />
      <Row label="Coupling K" value={coupling.toFixed(2)} color={coupling > 0.5 ? '#FFAA00' : undefined} />
      <Row
        label="Conflict"
        value={conflictScore.toFixed(2)}
        color={conflictScore > 0.7 ? '#FF3320' : conflictScore > 0.4 ? '#FFAA00' : '#00FF88'}
      />
      <Row
        label="Resonance"
        value={isResonant ? 'YES' : 'no'}
        color={isResonant ? '#FF6600' : 'rgba(148,163,184,0.5)'}
      />
    </Box>
  );
}

/**
 * Shows coupling/conflict analysis for each (friendly, hostile) source pair in the scene.
 */
export function EmitterInteractionsPanel() {
  const sources = useLabStore((state) => state.sources);
  const interferenceState = useActiveInterferenceRenderState();

  const pairs = useMemo(() => {
    const friendly = sources.filter((s) => s.active && (s.faction ?? 'friendly') !== 'hostile');
    const hostile = sources.filter((s) => s.active && s.faction === 'hostile');
    const result: Array<{ friendly: RFSource; hostile: RFSource }> = [];
    for (const f of friendly) {
      for (const h of hostile) {
        result.push({ friendly: f, hostile: h });
      }
    }
    return result;
  }, [sources]);
  const summary = useMemo(() => computeInteractionSummary(sources), [sources]);

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
        maxHeight: 280,
        overflow: 'hidden',
      }}
    >
      <Typography
        variant="caption"
        sx={{ display: 'block', fontFamily: 'monospace', fontWeight: 700, color: 'rgba(226,232,240,0.6)', letterSpacing: 1, mb: 0.75, fontSize: '0.6rem' }}
      >
        EMITTER INTERACTIONS
      </Typography>
      {interferenceState && (
        <Typography variant="caption" sx={{ color: 'rgba(226,232,240,0.75)', display: 'block', mb: 0.75 }}>
          Bands H/M/L: {interferenceState.bandDistribution.high}/{interferenceState.bandDistribution.medium}/{interferenceState.bandDistribution.low}
        </Typography>
      )}
      <Row label="Pairs F×H" value={`${summary.pairCount}`} />
      <Row label="P_hostile" value={percent(summary.hostileProbability)} color="#FF3320" />
      <Row label="P_friendly" value={percent(summary.friendlyProbability)} color="#00AAFF" />
      <Row label="Sources F/H" value={`${summary.friendly.length}/${summary.hostile.length}`} />
      {pairs.length === 0 ? (
        <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.9)', display: 'block', mt: 0.6, fontFamily: 'monospace', fontSize: '0.64rem' }}>
          No friendly-hostile pair currently active. Pair analytics will appear automatically.
        </Typography>
      ) : (
        pairs.slice(0, 3).map((p, i) => <PairPanel key={i} friendly={p.friendly} hostile={p.hostile} />)
      )}
    </Box>
  );
}

/** Content-only export for use inside a shared grouped container */
export function EmitterInteractionsPanelContent() {
  const sources = useLabStore((state) => state.sources);
  const interferenceState = useActiveInterferenceRenderState();
  const pairs = useMemo(() => {
    const friendly = sources.filter((s) => s.active && (s.faction ?? 'friendly') !== 'hostile');
    const hostile = sources.filter((s) => s.active && s.faction === 'hostile');
    const result: Array<{ friendly: RFSource; hostile: RFSource }> = [];
    for (const f of friendly) {
      for (const h of hostile) {
        result.push({ friendly: f, hostile: h });
      }
    }
    return result;
  }, [sources]);
  const summary = useMemo(() => computeInteractionSummary(sources), [sources]);
  return (
    <>
      <Typography
        variant="caption"
        sx={{ display: 'block', fontFamily: 'monospace', fontWeight: 700, color: 'rgba(226,232,240,0.6)', letterSpacing: 1, mb: 0.75, fontSize: '0.6rem' }}
      >
        EMITTER INTERACTIONS
      </Typography>
      {interferenceState && (
        <Typography variant="caption" sx={{ color: 'rgba(226,232,240,0.75)', display: 'block', mb: 0.75 }}>
          Interference legend: High=strong overlap, Medium=transition, Low=weak
        </Typography>
      )}
      <Row label="Pairs F×H" value={`${summary.pairCount}`} />
      <Row label="P_hostile" value={percent(summary.hostileProbability)} color="#FF3320" />
      <Row label="P_friendly" value={percent(summary.friendlyProbability)} color="#00AAFF" />
      <Row label="Sources F/H" value={`${summary.friendly.length}/${summary.hostile.length}`} />
      {pairs.length === 0 ? (
        <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.9)', display: 'block', mt: 0.6, fontFamily: 'monospace', fontSize: '0.64rem' }}>
          No friendly-hostile pair currently active. Pair analytics will appear automatically.
        </Typography>
      ) : (
        pairs.slice(0, 3).map((p, i) => <PairPanel key={i} friendly={p.friendly} hostile={p.hostile} />)
      )}
    </>
  );
}
