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

/** Hide cells below this log-normalised value (cuts instrument noise) */
const NOISE_FLOOR_LOG = 0.05;

export function MaxwellFieldVolume() {
  const fieldOutput = useActiveFieldOutput();
  const currentStep = useLabStore((s) => s.maxwellCurrentStep);
  const environmentBounds = useLabStore((s) => s.environment.bounds);
  const currentStepRef = useRef<number>(currentStep);
  const prevStep = useRef<number>(-1);

  // Geometry layout — positions + colour buffer — rebuilt when fieldOutput changes
  const { geometry, boxSize } = useMemo(() => {
    if (!fieldOutput || fieldOutput.electricFieldSeries.length === 0) {
      return { geometry: null, boxSize: new THREE.Vector3(1, 1, 1) };
    }

    const { nx, ny, nz } = fieldOutput.samplingMetadata.grid;
    const total = nx * ny * nz;

    const pos = new Float32Array(total * 3);
    const roomX = environmentBounds.max.x - environmentBounds.min.x;
    const roomY = environmentBounds.max.y - environmentBounds.min.y;
    const roomZ = environmentBounds.max.z - environmentBounds.min.z;
    let i3 = 0;
    for (let iz = 0; iz < nz; iz++) {
      for (let iy = 0; iy < ny; iy++) {
        for (let ix = 0; ix < nx; ix++) {
          pos[i3++] = environmentBounds.min.x + (ix / Math.max(1, nx - 1)) * roomX;
          pos[i3++] = environmentBounds.min.y + (iy / Math.max(1, ny - 1)) * roomY;
          pos[i3++] = environmentBounds.min.z + (iz / Math.max(1, nz - 1)) * roomZ;
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(total * 3), 3));

    return {
      geometry: geo,
      boxSize: new THREE.Vector3(roomX, roomY, roomZ),
    };
  }, [fieldOutput, environmentBounds]);

  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const fieldOutputRef = useRef(fieldOutput);

  useEffect(() => { return () => { geometryRef.current?.dispose(); }; }, []);
  useEffect(() => {
    geometryRef.current = geometry;
    fieldOutputRef.current = fieldOutput;
    prevStep.current = -1;
  }, [geometry, fieldOutput]);
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);

  // Static point cloud colors update only on time-step change.
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
        colors[j]     = scratch.r * norm * 0.55;
        colors[j + 1] = scratch.g * norm * 0.55;
        colors[j + 2] = scratch.b * norm * 0.55;
      }
    }
    colorAttr.needsUpdate = true;
  }, 1);

  if (!geometry || !fieldOutput) return null;

  return (
    <group>
      {/* Wireframe domain boundary — always visible */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z)]} />
        <lineBasicMaterial color="#4488ff" transparent opacity={0.35} depthWrite={false} />
      </lineSegments>

      {/* E-field point cloud — crisp points, no sprite glow */}
      <points geometry={geometry}>
        <pointsMaterial
          size={0.006}
          sizeAttenuation
          vertexColors
          depthWrite
          blending={THREE.NormalBlending}
          transparent={false}
        />
      </points>
    </group>
  );
}
