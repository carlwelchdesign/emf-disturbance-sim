'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useFieldCalculator } from '../../hooks/useFieldCalculator';
import { useLabStore } from '../../hooks/useLabStore';
import { LODLevel, ColorScheme } from '../../types/visualization.types';
import { RFSource } from '../../types/source.types';
import {
  calculateCancellationScore,
  calculateContestedZoneScore,
  calculateFieldOverlapScore,
} from '../../lib/field-math';

interface InterferenceField3DProps {
  sources: RFSource[];
  lod: LODLevel;
  colorScheme: ColorScheme;
}

// Particle counts per LOD — tuned for per-frame multi-source sampling.
const LOD_COUNT: Record<LODLevel, number> = { high: 2600, medium: 1300, low: 550 };

// Only recompute field every N frames.
const UPDATE_EVERY = 3;

// World-space point size (meters, screen-attenuated).
const POINT_SIZE: Record<LODLevel, number> = { high: 0.055, medium: 0.085, low: 0.13 };

// Round point shader — crisp circle, gentle alpha fade at the edge.
// Kept dim intentionally so the particle streams in FieldVisualization
// read clearly on top.
const VERT = /* glsl */`
  attribute vec3 aColor;
  varying vec3 vColor;
  uniform float uSize;
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (400.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */`
  varying vec3 vColor;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float alpha = (1.0 - smoothstep(0.3, 0.5, d)) * 0.22;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

/** Cooled-down viridis: starts near-black, stays muted, peaks at a soft cyan-white.
 *  Intentionally desaturated so the particle streams read clearly on top. */
function viridisAt(t: number, buf: Float32Array, i: number): void {
  const c = Math.min(1, Math.max(0, t));
  let r: number, g: number, b: number;
  if (c < 0.33) {
    const u = c / 0.33;
    r = 0.04 + 0.10 * u;
    g = 0.02 + 0.20 * u;
    b = 0.12 + 0.28 * u;
  } else if (c < 0.66) {
    const u = (c - 0.33) / 0.33;
    r = 0.14 + 0.10 * u;
    g = 0.22 + 0.30 * u;
    b = 0.40 + 0.10 * u;
  } else {
    const u = (c - 0.66) / 0.34;
    r = 0.24 + 0.46 * u;
    g = 0.52 + 0.28 * u;
    b = 0.50 - 0.10 * u;
  }
  buf[i * 3] = r; buf[i * 3 + 1] = g; buf[i * 3 + 2] = b;
}

function rainbowAt(t: number, buf: Float32Array, i: number): void {
  const h = (1 - Math.min(1, Math.max(0, t))) * 240;
  const l = 0.5, a = 0.5;
  const f = (n: number) => { const k = (n + h / 30) % 12; return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
  buf[i * 3] = f(0); buf[i * 3 + 1] = f(8); buf[i * 3 + 2] = f(4);
}

function monoAt(t: number, buf: Float32Array, i: number): void {
  const c = Math.min(1, Math.max(0, t));
  buf[i * 3] = c * 0.9 + 0.1; buf[i * 3 + 1] = c * 0.95 + 0.05; buf[i * 3 + 2] = c;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/**
 * InterferenceField3D
 *
 * Particle-based 3-D disturbance field. Particles cover the full environment
 * and move in real time based on local field flow and interference clash.
 * Where sources conflict (high overlap + cancellation), particles jitter and
 * swirl more aggressively; in calm regions they settle.
 *
 * This gives a physically legible "disturbance" view rather than a static
 * lattice heatmap, while still using the fast quasi-static superposition path.
 */
export function InterferenceField3D({ sources, lod, colorScheme }: InterferenceField3DProps) {
  const activeSources = useMemo(() => sources.filter((s) => s.active), [sources]);
  const { calculateFieldAtPoint } = useFieldCalculator();
  const environmentBounds = useLabStore((s) => s.environment.bounds);
  const animateFields = useLabStore((s) => s.settings.animateFields);
  const animationSpeed = useLabStore((s) => s.settings.animationSpeed);

  const frameRef = useRef(0);
  const maxRef = useRef(1);
  const posAttr = useRef<THREE.BufferAttribute>(null);
  const colorAttr = useRef<THREE.BufferAttribute>(null);
  const count = LOD_COUNT[lod] ?? LOD_COUNT.medium;
  const bounds = useMemo(
    () => ({
      xMin: environmentBounds.min.x,
      xMax: environmentBounds.max.x,
      yMin: Math.max(0.05, environmentBounds.min.y),
      yMax: environmentBounds.max.y,
      zMin: environmentBounds.min.z,
      zMax: environmentBounds.max.z,
    }),
    [environmentBounds]
  );

  // Anchor points are distributed across the full simulation volume.
  // Runtime positions are perturbed around these anchors by interference.
  const anchors = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const tx = i / Math.max(1, count - 1);
      const ty = ((i * 73) % count) / Math.max(1, count - 1);
      const tz = ((i * 193) % count) / Math.max(1, count - 1);
      arr[i * 3] = bounds.xMin + tx * (bounds.xMax - bounds.xMin);
      arr[i * 3 + 1] = bounds.yMin + ty * (bounds.yMax - bounds.yMin);
      arr[i * 3 + 2] = bounds.zMin + tz * (bounds.zMax - bounds.zMin);
    }
    return arr;
  }, [count, bounds]);

  const positions = useMemo(() => {
    const arr = new Float32Array(anchors.length);
    arr.set(anchors);
    return arr;
  }, [anchors]);

  const velocities = useMemo(() => new Float32Array(count * 3), [count]);
  const colors = useMemo(() => new Float32Array(count * 3), [count]);
  const strengths = useMemo(() => new Float32Array(count), [count]);
  const clashScores = useMemo(() => new Float32Array(count), [count]);

  const uniforms = useMemo(() => ({
    uSize: { value: POINT_SIZE[lod] * 85 },
  }), [lod]);

  useFrame(({ clock }, rawDelta) => {
    if (!activeSources.length || !colorAttr.current || !posAttr.current) return;

    frameRef.current++;
    if (frameRef.current % UPDATE_EVERY !== 0) return;

    const dt = Math.min(0.033, rawDelta) * animationSpeed * 0.75;
    const time = animateFields ? clock.getElapsedTime() * animationSpeed : 0;
    let maxS = 0;
    let maxClash = 1e-6;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const px = positions[ix];
      const py = positions[ix + 1];
      const pz = positions[ix + 2];
      const point = { x: px, y: py, z: pz };

      const field = calculateFieldAtPoint(
        point,
        activeSources,
        time,
      );
      const net = Math.abs(field.strength);
      strengths[i] = net;
      if (net > maxS) maxS = net;

      // Find top-2 single-source contributors at this point.
      let top1 = 0;
      let top2 = 0;
      for (let s = 0; s < activeSources.length; s++) {
        const single = Math.abs(calculateFieldAtPoint(point, [activeSources[s]], time).strength);
        if (single > top1) {
          top2 = top1;
          top1 = single;
        } else if (single > top2) {
          top2 = single;
        }
      }

      const overlap = calculateFieldOverlapScore(top1, top2);
      const cancel = calculateCancellationScore(net, top1, top2);
      const clash = calculateContestedZoneScore(overlap, cancel);
      clashScores[i] = clash;
      if (clash > maxClash) maxClash = clash;

      const flow = field.poynting ?? field.eField ?? { x: 0, y: 1, z: 0 };
      const flowMag = Math.hypot(flow.x, flow.y, flow.z) || 1;
      const fx = flow.x / flowMag;
      const fy = flow.y / flowMag;
      const fz = flow.z / flowMag;

      const n1 = Math.sin(i * 12.9898 + time * 2.17);
      const n2 = Math.sin(i * 78.233 + time * 1.73);
      const n3 = Math.sin(i * 39.425 + time * 2.91);

      // Build an explicit "front attraction" term: particles are pulled toward
      // the locus where the two strongest contributors are balanced
      // (|E1-E2| small). This makes interaction bands physically legible.
      const pairBalance = 1 - Math.min(1, Math.abs(top1 - top2) / (top1 + top2 + 1e-6));
      const frontStrength = pairBalance * overlap;
      let frontX = 0;
      let frontY = 0;
      let frontZ = 0;
      if (activeSources.length > 1) {
        // Approximate gradient of (E1-E2) so we can move toward the balance surface.
        const DELTA = 0.18;
        const exP = Math.abs(
          calculateFieldAtPoint({ x: point.x + DELTA, y: point.y, z: point.z }, [activeSources[0]], time).strength
        ) - Math.abs(
          calculateFieldAtPoint({ x: point.x + DELTA, y: point.y, z: point.z }, [activeSources[1]], time).strength
        );
        const exM = Math.abs(
          calculateFieldAtPoint({ x: point.x - DELTA, y: point.y, z: point.z }, [activeSources[0]], time).strength
        ) - Math.abs(
          calculateFieldAtPoint({ x: point.x - DELTA, y: point.y, z: point.z }, [activeSources[1]], time).strength
        );
        const eyP = Math.abs(
          calculateFieldAtPoint({ x: point.x, y: point.y + DELTA, z: point.z }, [activeSources[0]], time).strength
        ) - Math.abs(
          calculateFieldAtPoint({ x: point.x, y: point.y + DELTA, z: point.z }, [activeSources[1]], time).strength
        );
        const eyM = Math.abs(
          calculateFieldAtPoint({ x: point.x, y: point.y - DELTA, z: point.z }, [activeSources[0]], time).strength
        ) - Math.abs(
          calculateFieldAtPoint({ x: point.x, y: point.y - DELTA, z: point.z }, [activeSources[1]], time).strength
        );
        const ezP = Math.abs(
          calculateFieldAtPoint({ x: point.x, y: point.y, z: point.z + DELTA }, [activeSources[0]], time).strength
        ) - Math.abs(
          calculateFieldAtPoint({ x: point.x, y: point.y, z: point.z + DELTA }, [activeSources[1]], time).strength
        );
        const ezM = Math.abs(
          calculateFieldAtPoint({ x: point.x, y: point.y, z: point.z - DELTA }, [activeSources[0]], time).strength
        ) - Math.abs(
          calculateFieldAtPoint({ x: point.x, y: point.y, z: point.z - DELTA }, [activeSources[1]], time).strength
        );
        const gx = (exP - exM) / (2 * DELTA);
        const gy = (eyP - eyM) / (2 * DELTA);
        const gz = (ezP - ezM) / (2 * DELTA);
        const glen = Math.hypot(gx, gy, gz) || 1;
        // Move opposite the gradient to converge on E1≈E2 front.
        frontX = -gx / glen;
        frontY = -gy / glen;
        frontZ = -gz / glen;
      }

      // Gate strong turbulence to real clash zones so motion reads as
      // "disturbance from interference" instead of global noise.
      const activeClash = Math.max(0, clash - 0.15) / 0.85;
      const disturbance = activeClash * 0.7;
      const drift = 0.003 + 0.015 * activeClash;
      const noise = 0.004 * disturbance;
      const spring = 0.62;
      const damping = 0.95;
      const frontPull = 0.045 * frontStrength;

      // Velocity = directional flow + clash-driven turbulence + spring-to-anchor.
      const ax = fx * drift + frontX * frontPull + n1 * noise + (anchors[ix] - px) * spring;
      const ay = fy * drift + frontY * frontPull + n2 * noise + (anchors[ix + 1] - py) * spring;
      const az = fz * drift + frontZ * frontPull + n3 * noise + (anchors[ix + 2] - pz) * spring;

      velocities[ix] = velocities[ix] * damping + ax * dt;
      velocities[ix + 1] = velocities[ix + 1] * damping + ay * dt;
      velocities[ix + 2] = velocities[ix + 2] * damping + az * dt;

      positions[ix] = clamp(px + velocities[ix] * dt, bounds.xMin, bounds.xMax);
      positions[ix + 1] = clamp(py + velocities[ix + 1] * dt, bounds.yMin, bounds.yMax);
      positions[ix + 2] = clamp(pz + velocities[ix + 2] * dt, bounds.zMin, bounds.zMax);
    }

    maxRef.current = Math.max(maxS, maxRef.current * 0.97);
    const strengthNormBase = maxRef.current || 1;
    const logScale = 50;
    const logDenom = Math.log1p(logScale);

    const colorFn = colorScheme === 'rainbow' ? rainbowAt
                  : colorScheme === 'monochrome' ? monoAt
                  : viridisAt;

    for (let i = 0; i < count; i++) {
      const strengthT = Math.log1p((strengths[i] / strengthNormBase) * logScale) / logDenom;
      const clashT = clashScores[i] / maxClash;
      const t = (strengthT * 0.45 + clashT * 0.55) * 0.9;
      colorFn(t, colors, i);
    }

    posAttr.current.needsUpdate = true;
    colorAttr.current.needsUpdate = true;
  });

  if (!activeSources.length) return null;

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          ref={posAttr}
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          ref={colorAttr}
          attach="attributes-aColor"
          array={colors}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}
