'use client';

import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useLabStore } from '../../hooks/useLabStore';
import { computeFactionMetrics } from '../../lib/field-math';
import { createSimulationEngine } from '../../modules/simulation/simulation-engine';

const engine = createSimulationEngine();
const SAMPLES = 30;
const X_RANGE = 8; // ±8 units along X axis

/**
 * SVG line chart of E_friendly, E_hostile, E_net sampled at 30 points along the X axis (Y=0, Z=0).
 * Computation is done synchronously using the CPU engine — intentionally lightweight (30 samples).
 * A vertical marker shows the primary drone's current X position.
 */
export function FieldSamplesChart() {
  const sources = useLabStore((state) => state.sources);
  const drones = useLabStore((state) => state.drones);

  const chartData = useMemo(() => {
    const activeSources = sources.filter((s) => s.active);
    if (activeSources.length === 0) return null;

    const hasFactions =
      activeSources.some((s) => s.faction === 'hostile') ||
      activeSources.some((s) => (s.faction ?? 'friendly') === 'friendly');

    if (!hasFactions) return null;

    const calculate = (p: { x: number; y: number; z: number }, srcs: typeof sources, t: number) =>
      engine.calculateFieldAtPoint(p, srcs, t);

    const xs: number[] = [];
    const friendly: number[] = [];
    const hostile: number[] = [];
    const net: number[] = [];

    for (let i = 0; i < SAMPLES; i++) {
      const x = -X_RANGE + (i / (SAMPLES - 1)) * X_RANGE * 2;
      xs.push(x);
      const m = computeFactionMetrics({ x, y: 1.5, z: 0 }, sources, 0, calculate);
      friendly.push(m.eFieldFriendly);
      hostile.push(m.eFieldHostile);
      net.push(m.eFieldNet);
    }

    const allValues = [...friendly, ...hostile, ...net];
    const maxVal = Math.max(...allValues, 0.01);

    return { xs, friendly, hostile, net, maxVal };
  }, [sources]);

  const droneX = drones.find((d) => d.faction === 'friendly')?.position.x ?? null;

  if (!chartData) return null;

  // Destructure after null guard so TypeScript narrows correctly inside toSvgPoints
  const { maxVal } = chartData;

  const W = 280;
  const H = 64;
  const PAD = { left: 6, right: 6, top: 6, bottom: 6 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  function toSvgPoints(values: number[]): string {
    return values
      .map((v, i) => {
        const px = PAD.left + (i / (SAMPLES - 1)) * innerW;
        const py = PAD.top + innerH - (v / maxVal) * innerH;
        return `${px.toFixed(1)},${py.toFixed(1)}`;
      })
      .join(' ');
  }

  // Drone marker x position in SVG coords
  const droneMarkerX =
    droneX !== null
      ? PAD.left + ((droneX + X_RANGE) / (X_RANGE * 2)) * innerW
      : null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        bgcolor: 'rgba(2, 6, 23, 0.82)',
        border: '1px solid rgba(148,163,184,0.18)',
        borderRadius: 1.5,
        p: 1,
        backdropFilter: 'blur(6px)',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.5, mb: 0.5, px: 0.5 }}>
        <Typography variant="caption" sx={{ color: '#00AAFF', fontFamily: 'monospace', fontSize: '0.6rem' }}>
          ─ E_friendly
        </Typography>
        <Typography variant="caption" sx={{ color: '#FF3320', fontFamily: 'monospace', fontSize: '0.6rem' }}>
          ─ E_hostile
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(226,232,240,0.7)', fontFamily: 'monospace', fontSize: '0.6rem' }}>
          ─ E_net
        </Typography>
      </Box>
      <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
        {/* Background */}
        <rect x={PAD.left} y={PAD.top} width={innerW} height={innerH} fill="rgba(255,255,255,0.02)" rx="2" />

        {/* Grid line at 50% */}
        <line
          x1={PAD.left} y1={PAD.top + innerH / 2}
          x2={PAD.left + innerW} y2={PAD.top + innerH / 2}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1"
        />

        {/* Field lines */}
        <polyline points={toSvgPoints(chartData.hostile)} fill="none" stroke="#FF3320" strokeWidth="1.5" opacity="0.9" />
        <polyline points={toSvgPoints(chartData.friendly)} fill="none" stroke="#00AAFF" strokeWidth="1.5" opacity="0.9" />
        <polyline points={toSvgPoints(chartData.net)} fill="none" stroke="rgba(226,232,240,0.6)" strokeWidth="1" strokeDasharray="3,2" />

        {/* Drone marker */}
        {droneMarkerX !== null && (
          <line
            x1={droneMarkerX} y1={PAD.top}
            x2={droneMarkerX} y2={PAD.top + innerH}
            stroke="#00FF88" strokeWidth="1.5" strokeDasharray="2,2"
          />
        )}

        {/* X-axis labels */}
        <text x={PAD.left} y={H - 1} fill="rgba(148,163,184,0.5)" fontSize="7" fontFamily="monospace">
          -{X_RANGE}
        </text>
        <text x={PAD.left + innerW / 2} y={H - 1} fill="rgba(148,163,184,0.5)" fontSize="7" fontFamily="monospace" textAnchor="middle">
          0
        </text>
        <text x={PAD.left + innerW} y={H - 1} fill="rgba(148,163,184,0.5)" fontSize="7" fontFamily="monospace" textAnchor="end">
          +{X_RANGE}
        </text>
      </svg>
    </Box>
  );
}
