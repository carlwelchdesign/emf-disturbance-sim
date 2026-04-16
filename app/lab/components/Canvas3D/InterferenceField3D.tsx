'use client';

import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useFieldCalculator } from '../../hooks/useFieldCalculator';
import { useLabStore } from '../../hooks/useLabStore';
import { LODLevel, ColorScheme } from '../../types/visualization.types';
import { RFSource } from '../../types/source.types';

interface InterferenceField3DProps {
  sources: RFSource[];
  lod: LODLevel;
  colorScheme: ColorScheme;
}

type GridRes = { nx: number; ny: number; nz: number };

const GRID_BY_LOD: Record<LODLevel, GridRes> = {
  high: { nx: 34, ny: 20, nz: 34 },
  medium: { nx: 24, ny: 14, nz: 24 },
  low: { nx: 16, ny: 10, nz: 16 },
};

const NOISE_FLOOR = 0.12;
const EMITTER_CLEAR_RADIUS = 0.42;

function setInterferenceColor(
  signedNorm: number,
  intensity: number,
  scheme: ColorScheme,
  out: THREE.Color
): void {
  const clampedIntensity = Math.max(0, Math.min(1, intensity));
  const positive = signedNorm >= 0;
  const saturation = scheme === 'monochrome' ? 0.25 : 1;

  if (scheme === 'thermal') {
    const hue = positive ? 0.06 - clampedIntensity * 0.06 : 0.62 - clampedIntensity * 0.05;
    out.setHSL(hue, saturation, 0.2 + clampedIntensity * 0.52);
    return;
  }

  if (scheme === 'rainbow') {
    const hue = positive ? 0.02 + clampedIntensity * 0.06 : 0.55 + clampedIntensity * 0.08;
    out.setHSL(hue, saturation, 0.22 + clampedIntensity * 0.5);
    return;
  }

  const hue = positive ? 0.03 : 0.58;
  out.setHSL(hue, saturation, 0.24 + clampedIntensity * 0.5);
}

export function InterferenceField3D({ sources, lod, colorScheme }: InterferenceField3DProps) {
  const activeSources = useMemo(() => sources.filter((s) => s.active), [sources]);
  const { calculateFieldAtPoint } = useFieldCalculator();
  const environmentBounds = useLabStore((s) => s.environment.bounds);
  const animateFields = useLabStore((s) => s.settings.animateFields);
  const animationSpeed = useLabStore((s) => s.settings.animationSpeed);

  const grid = GRID_BY_LOD[lod] ?? GRID_BY_LOD.medium;

  const { basePositions, positions, colors, count } = useMemo(() => {
    const { nx, ny, nz } = grid;
    const total = nx * ny * nz;
    const base = new Float32Array(total * 3);
    const p = new Float32Array(total * 3);
    const c = new Float32Array(total * 3);

    const sx = environmentBounds.max.x - environmentBounds.min.x;
    const sy = environmentBounds.max.y - environmentBounds.min.y;
    const sz = environmentBounds.max.z - environmentBounds.min.z;

    let i3 = 0;
    for (let iz = 0; iz < nz; iz++) {
      for (let iy = 0; iy < ny; iy++) {
        for (let ix = 0; ix < nx; ix++) {
          const x = environmentBounds.min.x + (ix / Math.max(1, nx - 1)) * sx;
          const y = environmentBounds.min.y + (iy / Math.max(1, ny - 1)) * sy;
          const z = environmentBounds.min.z + (iz / Math.max(1, nz - 1)) * sz;
          base[i3] = x;
          p[i3++] = x;
          base[i3] = y;
          p[i3++] = y;
          base[i3] = z;
          p[i3++] = z;
        }
      }
    }
    return { basePositions: base, positions: p, colors: c, count: total };
  }, [grid, environmentBounds]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  const emitterGeometry = useMemo(() => {
    const p = new Float32Array(activeSources.length * 3);
    const c = new Float32Array(activeSources.length * 3);
    let i3 = 0;
    for (const src of activeSources) {
      p[i3] = src.position.x;
      c[i3++] = 1.0;
      p[i3] = src.position.y + 0.35;
      c[i3++] = 0.85;
      p[i3] = src.position.z;
      c[i3++] = 0.2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    return g;
  }, [activeSources]);

  const scratch = useMemo(() => new THREE.Color(), []);
  const signedScratch = useMemo(() => new Float32Array(count), [count]);
  const phaseScratch = useMemo(() => new Float32Array(count), [count]);
  const flowScratch = useMemo(() => new Float32Array(count * 3), [count]);
  const stride = lod === 'high' ? 1 : lod === 'medium' ? 2 : 3;

  useFrame(({ clock }) => {
    if (!activeSources.length) return;
    const time = animateFields ? clock.getElapsedTime() * animationSpeed : 0;

    let maxSigned = 1e-9;
    let maxFlow = 1e-9;
    for (let i = 0; i < count; i++) {
      const j = i * 3;
      if (i % stride !== 0) {
        signedScratch[i] = 0;
        phaseScratch[i] = 0;
        flowScratch[j] = 0;
        flowScratch[j + 1] = 0;
        flowScratch[j + 2] = 0;
        continue;
      }
      const px = basePositions[j];
      const py = basePositions[j + 1];
      const pz = basePositions[j + 2];
      const point = { x: px, y: py, z: pz };

      let inEmitterClearZone = false;
      for (const src of activeSources) {
        const dx = px - src.position.x;
        const dy = py - src.position.y;
        const dz = pz - src.position.z;
        if (dx * dx + dy * dy + dz * dz <= EMITTER_CLEAR_RADIUS * EMITTER_CLEAR_RADIUS) {
          inEmitterClearZone = true;
          break;
        }
      }
      if (inEmitterClearZone) {
        signedScratch[i] = 0;
        phaseScratch[i] = 0;
        flowScratch[j] = 0;
        flowScratch[j + 1] = 0;
        flowScratch[j + 2] = 0;
        continue;
      }

      const f = calculateFieldAtPoint(point, activeSources, time);
      const signed = f.strength * Math.cos(f.phase);
      signedScratch[i] = signed;
      phaseScratch[i] = f.phase;

      const flow = f.poynting ?? f.propagation;
      const fx = flow?.x ?? 0;
      const fy = flow?.y ?? 0;
      const fz = flow?.z ?? 0;
      flowScratch[j] = fx;
      flowScratch[j + 1] = fy;
      flowScratch[j + 2] = fz;

      const signedAbs = Math.abs(signed);
      if (signedAbs > maxSigned) maxSigned = signedAbs;
      const flowMag = Math.sqrt(fx * fx + fy * fy + fz * fz);
      if (flowMag > maxFlow) maxFlow = flowMag;
    }

    const positionAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const posArr = positionAttr.array as Float32Array;
    const colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute;
    const colorArr = colorAttr.array as Float32Array;
    const flowScaleBase = lod === 'high' ? 0.045 : lod === 'medium' ? 0.06 : 0.075;
    const motionFactor = animateFields ? 1 : 0;

    for (let i = 0; i < count; i++) {
      const j = i * 3;
      if (i % stride !== 0) {
        colorArr[j] = colorArr[j + 1] = colorArr[j + 2] = 0;
        posArr[j] = basePositions[j];
        posArr[j + 1] = basePositions[j + 1];
        posArr[j + 2] = basePositions[j + 2];
        continue;
      }
      const signedNorm = Math.max(-1, Math.min(1, signedScratch[i] / maxSigned));
      const intensity = Math.abs(signedNorm);

      if (intensity < NOISE_FLOOR) {
        colorArr[j] = colorArr[j + 1] = colorArr[j + 2] = 0;
        posArr[j] = basePositions[j];
        posArr[j + 1] = basePositions[j + 1];
        posArr[j + 2] = basePositions[j + 2];
      } else {
        setInterferenceColor(signedNorm, intensity, colorScheme, scratch);
        const brightness = Math.max(0.2, intensity) * (0.75 + intensity * 0.25);
        colorArr[j] = scratch.r * brightness;
        colorArr[j + 1] = scratch.g * brightness;
        colorArr[j + 2] = scratch.b * brightness;

        const fx = flowScratch[j];
        const fy = flowScratch[j + 1];
        const fz = flowScratch[j + 2];
        const flowNorm = Math.sqrt(fx * fx + fy * fy + fz * fz) / maxFlow;
        const phaseWave = Math.sin(phaseScratch[i] + time * 1.25);
        const displacement = phaseWave * flowScaleBase * flowNorm * intensity * motionFactor;
        posArr[j] = basePositions[j] + fx * displacement;
        posArr[j + 1] = basePositions[j + 1] + fy * displacement;
        posArr[j + 2] = basePositions[j + 2] + fz * displacement;
      }
    }
    positionAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
  });

  if (!activeSources.length) return null;

    return (
    <group>
      <points geometry={geometry}>
        <pointsMaterial
          size={lod === 'high' ? 0.018 : lod === 'medium' ? 0.026 : 0.036}
          sizeAttenuation
          vertexColors
          depthWrite={false}
          depthTest
          transparent
          opacity={0.24}
          blending={THREE.NormalBlending}
        />
      </points>
      <points geometry={emitterGeometry} renderOrder={20}>
        <pointsMaterial
          size={0.14}
          sizeAttenuation
          vertexColors
          depthWrite={false}
          depthTest={false}
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
