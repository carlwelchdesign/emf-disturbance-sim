'use client';
/**
 * MaxwellFieldVolume — 3D point-cloud visualization of FDTD E-field data at the current time step.
 *
 * Renders the electric field magnitude as a volumetric point cloud centred at the origin.
 * Point colour reacts to |E| at each grid cell using a blue→red hot spectrum.
 * A wireframe box shows the FDTD domain boundary at all times.
 * Scrubbing `maxwellCurrentStep` in the store drives which snapshot is shown.
 */
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useLabStore } from '../../hooks/useLabStore';
import { useActiveFieldOutput } from '../../hooks/useMaxwellRunSelectors';

/** Create a soft circular disc texture for round points */
function makeCircleTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const r = size / 2;
  const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

/** Blue(low) → cyan → green → yellow → red(high) */
function eMagToColor(norm: number, out: THREE.Color): THREE.Color {
  out.setHSL(0.66 * (1 - norm), 1.0, 0.3 + norm * 0.45);
  return out;
}

/** Map magnitude to [0,1] on a log scale so weak wavefronts are visible */
function logNorm(mag: number, maxMag: number): number {
  if (mag <= 0 || maxMag <= 0) return 0;
  const LOG_RANGE = 4; // show 4 decades below peak (10^-4 → 10^0)
  const logRatio = Math.log10(mag / maxMag);
  return Math.max(0, 1 + logRatio / LOG_RANGE);
}

/** Scale the FDTD domain to fill roughly 8 scene-units (a third of the 20-unit room) */
const DISPLAY_SIZE = 8.0;
/** Hide cells below this log-normalised value (cuts instrument noise) */
const NOISE_FLOOR_LOG = 0.05;

export function MaxwellFieldVolume() {
  const fieldOutput = useActiveFieldOutput();
  const currentStep = useLabStore((s) => s.maxwellCurrentStep);
  const currentStepRef = useRef<number>(currentStep);
  const prevStep = useRef<number>(-1);

  // Soft circular sprite texture (created once, browser-side only)
  const circleTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    return makeCircleTexture();
  }, []);

  // Geometry layout — positions + colour buffer — rebuilt when fieldOutput changes
  const { geometry, boxSize } = useMemo(() => {
    if (!fieldOutput || fieldOutput.electricFieldSeries.length === 0) {
      return { geometry: null, boxSize: new THREE.Vector3(1, 1, 1) };
    }

    const { nx, ny, nz, dx, dy, dz } = fieldOutput.samplingMetadata.grid;
    const total = nx * ny * nz;

    const domainX = nx * dx;
    const domainY = ny * dy;
    const domainZ = nz * dz;
    const maxDomain = Math.max(domainX, domainY, domainZ, 1e-9);
    const scale = DISPLAY_SIZE / maxDomain;

    const pos = new Float32Array(total * 3);
    const ox = -(domainX * scale) / 2;
    const oy = -(domainY * scale) / 2;
    const oz = -(domainZ * scale) / 2;
    let i3 = 0;
    for (let iz = 0; iz < nz; iz++) {
      for (let iy = 0; iy < ny; iy++) {
        for (let ix = 0; ix < nx; ix++) {
          pos[i3++] = ox + ix * dx * scale;
          pos[i3++] = oy + iy * dy * scale;
          pos[i3++] = oz + iz * dz * scale;
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(total * 3), 3));

    return {
      geometry: geo,
      boxSize: new THREE.Vector3(domainX * scale, domainY * scale, domainZ * scale),
    };
  }, [fieldOutput]);

  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const fieldOutputRef = useRef(fieldOutput);

  useEffect(() => { return () => { geometryRef.current?.dispose(); }; }, []);
  useEffect(() => {
    geometryRef.current = geometry;
    fieldOutputRef.current = fieldOutput;
    prevStep.current = -1;
  }, [geometry, fieldOutput]);
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);

  // Paint colours on every step change (all refs — avoids stale closure)
  useFrame(() => {
    const geo = geometryRef.current;
    const fo = fieldOutputRef.current;
    if (!geo || !fo) return;
    const step = currentStepRef.current;
    if (prevStep.current === step) return;
    prevStep.current = step;

    const series = fo.electricFieldSeries;
    if (series.length === 0) return;
    const snap = series[Math.min(step, series.length - 1)];
    const ex = snap.ex as number[];
    const ey = snap.ey as number[];
    const ez = snap.ez as number[];
    const count = ex.length;

    // Peak magnitude for normalisation
    let maxMag = 1e-30;
    for (let i = 0; i < count; i++) {
      const m = Math.sqrt(ex[i] ** 2 + ey[i] ** 2 + ez[i] ** 2);
      if (m > maxMag) maxMag = m;
    }

    const colorAttr = geo.getAttribute('color') as THREE.BufferAttribute;
    const colors = colorAttr.array as Float32Array;
    const scratch = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const mag = Math.sqrt(ex[i] ** 2 + ey[i] ** 2 + ez[i] ** 2);
      const norm = logNorm(mag, maxMag);
      const j = i * 3;
      if (norm < NOISE_FLOOR_LOG) {
        colors[j] = colors[j + 1] = colors[j + 2] = 0;
      } else {
        eMagToColor(norm, scratch);
        colors[j]     = scratch.r * norm * 0.6;
        colors[j + 1] = scratch.g * norm * 0.6;
        colors[j + 2] = scratch.b * norm * 0.6;
      }
    }
    colorAttr.needsUpdate = true;
  });

  if (!geometry || !fieldOutput) return null;

  return (
    <group>
      {/* Wireframe domain boundary — always visible */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z)]} />
        <lineBasicMaterial color="#4488ff" transparent opacity={0.35} depthWrite={false} />
      </lineSegments>

      {/* E-field point cloud — circular soft-disc sprites */}
      <points geometry={geometry}>
        <pointsMaterial
          size={0.22}
          sizeAttenuation
          transparent
          opacity={0.55}
          vertexColors
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          map={circleTexture ?? undefined}
          alphaMap={circleTexture ?? undefined}
          alphaTest={0.01}
        />
      </points>
    </group>
  );
}

