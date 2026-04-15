'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFieldCalculator } from '../../hooks/useFieldCalculator';
import { useLabStore } from '../../hooks/useLabStore';
import { fieldStrengthToColor, getSourceColor } from '../../lib/visualization-helpers';
import { RFSource } from '../../types/source.types';
import { ColorScheme, LODLevel } from '../../types/visualization.types';

export interface FieldVisualizationProps {
  sources: RFSource[];
  lod: LODLevel;
  colorScheme: ColorScheme;
}

type CloudLayerId = 'core' | 'mid' | 'haze';

type CloudParticle = {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  tangent: THREE.Vector3;
  radial: number;
  phaseSeed: number;
  layer: CloudLayerId;
  drift: number;
  spin: number;
  compression: number;
};

type CloudLayerConfig = {
  id: CloudLayerId;
  size: number;
  baseOpacity: number;
  countScale: number;
  radiusScale: number;
  blur: number;
  compression: number;
  tintMix: number;
};

const TAU = Math.PI * 2;
const X_AXIS = new THREE.Vector3(1, 0, 0);
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const Z_AXIS = new THREE.Vector3(0, 0, 1);
const VISUAL_TIME_SCALE = 1e-9;
const DEFAULT_BANDWIDTH_HZ = 80e6;

const LAYERS: CloudLayerConfig[] = [
  { id: 'core', size: 0.09, baseOpacity: 0.28, countScale: 0.9, radiusScale: 0.55, blur: 0.08, compression: 0.2, tintMix: 0.82 },
  { id: 'mid', size: 0.14, baseOpacity: 0.16, countScale: 0.7, radiusScale: 0.9, blur: 0.14, compression: 0.34, tintMix: 0.7 },
  { id: 'haze', size: 0.2, baseOpacity: 0.08, countScale: 0.5, radiusScale: 1.25, blur: 0.22, compression: 0.48, tintMix: 0.54 },
];

/**
 * Layered cloud transmission visualization.
 * Each emitter gets a volumetric cloud of tiny particles whose density and compression react to interference.
 */
export function FieldVisualization({ sources, lod, colorScheme }: FieldVisualizationProps) {
  const activeSources = sources.filter((source) => source.active);

  if (activeSources.length === 0) {
    return null;
  }

  return (
    <>
      {activeSources.map((source, index) => (
        <EmitterCloud
          key={source.id}
          source={source}
          allSources={activeSources}
          lod={lod}
          colorScheme={colorScheme}
          sourceIndex={index}
        />
      ))}
    </>
  );
}

function EmitterCloud({
  source,
  allSources,
  lod,
  colorScheme,
  sourceIndex,
}: {
  source: RFSource;
  allSources: RFSource[];
  lod: LODLevel;
  colorScheme: ColorScheme;
  sourceIndex: number;
}) {
  const { calculateFieldAtPoint } = useFieldCalculator();
  const { animateFields, animationSpeed, fieldLineDensity } = useLabStore((state) => state.settings);

  const sourceTint = useMemo(() => new THREE.Color(source.color ?? getSourceColor(sourceIndex)), [source.color, sourceIndex]);

  const bands = useMemo(() => {
    const lodFactor = lod === 'high' ? 1 : lod === 'medium' ? 0.78 : 0.58;
    const bandwidthHz = source.bandwidthHz ?? DEFAULT_BANDWIDTH_HZ;
    const bandwidthFactor = 1 + Math.min(2.2, Math.log10(Math.max(bandwidthHz, 1e6) / 1e6 + 1) * 0.45);

    return LAYERS.map((layer, layerIndex) => {
      const count = Math.max(
        28,
        Math.min(120, Math.round(fieldLineDensity * lodFactor * layer.countScale * 1.3 * bandwidthFactor))
      );
      const baseRadius = 0.42 + Math.min(1.0, Math.abs(source.power) * 1.2) + bandwidthFactor * 0.08;
      const particles: CloudParticle[] = [];

      for (let i = 0; i < count; i++) {
        const t = i / count;
        const direction = fibonacciSphereDirection(i, count, sourceIndex, layerIndex);
        const tangent = orthogonalTangent(direction);
        const shell = (0.5 + (i % 11) * 0.06) * layer.radiusScale * baseRadius;
        const radialJitter = 0.72 + (i % 5) * 0.08;
        const emissionRadius = shell * radialJitter;

        particles.push({
          position: new THREE.Vector3(
            source.position.x + direction.x * emissionRadius,
            source.position.y + direction.y * emissionRadius,
            source.position.z + direction.z * emissionRadius
          ),
          direction,
          tangent,
          radial: emissionRadius,
          phaseSeed: t * TAU + sourceIndex * 0.55 + layerIndex * 0.35,
          layer: layer.id,
          drift: ((i % 2 === 0 ? 1 : -1) * (0.08 + layerIndex * 0.03)) * bandwidthFactor,
          spin: (0.4 + (i % 7) * 0.045 + layerIndex * 0.06) * (0.9 + bandwidthFactor * 0.08),
          compression: 1 - layer.compression,
        });
      }

      return {
        config: layer,
        particles,
        geometry: createLayerGeometry(count),
      };
    });
  }, [fieldLineDensity, lod, source.bandwidthHz, source.power, source.position.x, source.position.y, source.position.z, sourceIndex]);

  useEffect(() => {
    return () => {
      bands.forEach((band) => band.geometry.dispose());
    };
  }, [bands]);

  const maxStrength = useMemo(() => {
    const wattEquivalent = allSources.reduce((sum, item) => {
      const watts = item.powerUnit === 'dBm' ? Math.pow(10, item.power / 10) / 1000 : item.power;
      return sum + Math.sqrt(Math.max(watts, 0.0001));
    }, 0);

    return Math.max(0.2, wattEquivalent * 1.45);
  }, [allSources]);

  useFrame(({ clock }) => {
    // RF frequencies are far too fast to render directly, so we compress time
    // into a visual cadence while preserving the phase relationships.
    const time = animateFields ? clock.getElapsedTime() * animationSpeed * VISUAL_TIME_SCALE : 0;
    const delta = Math.min(0.032, clock.getDelta());

    bands.forEach((band, bandIndex) => {
      const positionAttr = band.geometry.getAttribute('position') as THREE.BufferAttribute;
      const colorAttr = band.geometry.getAttribute('color') as THREE.BufferAttribute;
      const positions = positionAttr.array as Float32Array;
      const colors = colorAttr.array as Float32Array;

      for (let i = 0; i < band.particles.length; i++) {
        const particle = band.particles[i];
        const layer = band.config;
        const samplePoint = particle.position;
        const field = calculateFieldAtPoint(samplePoint, allSources, time);
        const strength = Math.abs(field.strength);
        const normalized = Math.min(1, strength / maxStrength);
        const poynting = field.poynting ?? new THREE.Vector3(1, 0, 0);
        const flow = new THREE.Vector3(poynting.x, poynting.y, poynting.z);

        if (flow.lengthSq() === 0) {
          flow.copy(X_AXIS);
        }
        flow.normalize();

        const eField = new THREE.Vector3(field.eField?.x ?? 0, field.eField?.y ?? 0, field.eField?.z ?? 0);
        const bField = new THREE.Vector3(field.bField?.x ?? 0, field.bField?.y ?? 0, field.bField?.z ?? 0);
        const swirlAxis = new THREE.Vector3().crossVectors(particle.direction, flow);
        if (swirlAxis.lengthSq() === 0) {
          swirlAxis.copy(particle.tangent);
        }
        swirlAxis.normalize();

        const radial = particle.position.clone().sub(source.position);
        if (radial.lengthSq() === 0) {
          radial.copy(particle.direction);
        }
        radial.normalize();

        const phasePulse = Math.sin((field.phase ?? 0) + particle.phaseSeed * 0.75);
        const frequencyPulse = Math.sin((source.frequency * time * 0.25) + particle.phaseSeed);
        const bandwidthHz = source.bandwidthHz ?? DEFAULT_BANDWIDTH_HZ;
        const bandwidthFactor = 1 + Math.min(2.2, Math.log10(Math.max(bandwidthHz, 1e6) / 1e6 + 1) * 0.45);
        const waveEnvelope = 0.38 + 0.24 * phasePulse + 0.18 * frequencyPulse + normalized * 0.12 + bandwidthFactor * 0.06;

        const interferenceCompression = 1 - normalized * layer.compression * (0.9 + bandwidthFactor * 0.12);
        const densityPulse = 0.02 + normalized * layer.blur + bandwidthFactor * 0.01;
        const swirlFlow = (0.16 + normalized * 0.54 + Math.abs(phasePulse) * 0.12) * delta * (0.92 + bandwidthFactor * 0.06);
        const jitter = new THREE.Vector3(
          Math.sin(time * 0.95 + particle.phaseSeed),
          Math.cos(time * 0.8 + particle.phaseSeed * 0.9),
          Math.sin(time * 1.05 + particle.phaseSeed * 1.3)
        ).multiplyScalar(densityPulse * 0.4);

        particle.radial = THREE.MathUtils.lerp(
          particle.radial,
          particle.radial * interferenceCompression + layer.radiusScale * (0.03 + waveEnvelope * 0.08),
          0.12
        );

        particle.direction.lerp(
          radial.clone().multiplyScalar(0.68).add(flow.clone().multiplyScalar(0.32)),
          0.08 + normalized * 0.08
        ).normalize();
        particle.tangent.lerp(swirlAxis.clone(), 0.1 + Math.abs(phasePulse) * 0.05).normalize();

        const radius = particle.radial + waveEnvelope * (0.04 + normalized * 0.09);
        const cloudSpread = 0.18 + normalized * 0.3 + bandwidthFactor * 0.05;
        const target = new THREE.Vector3(
          source.position.x + particle.direction.x * radius * interferenceCompression + particle.tangent.x * swirlFlow + jitter.x * cloudSpread,
          source.position.y + particle.direction.y * radius * interferenceCompression + particle.tangent.y * swirlFlow + jitter.y * cloudSpread,
          source.position.z + particle.direction.z * radius * interferenceCompression + particle.tangent.z * swirlFlow + jitter.z * cloudSpread
        );

        particle.position.lerp(target, 0.22 + normalized * 0.2 + Math.abs(phasePulse) * 0.06);

        if (
          particle.position.distanceTo(source.position) > 5.2 ||
          Math.abs(particle.position.x - source.position.x) > 5.5 ||
          Math.abs(particle.position.y - source.position.y) > 5.0 ||
          Math.abs(particle.position.z - source.position.z) > 5.5
        ) {
          reseedParticle(particle, source, bandIndex, i);
        }

        // Nudge the particle cloud to stay aligned with the vector field.
        const fieldBias = new THREE.Vector3(
          flow.x * (0.08 + normalized * 0.05),
          flow.y * (0.08 + normalized * 0.05),
          flow.z * (0.08 + normalized * 0.05)
        )
          .add(eField.clone().multiplyScalar(0.006 + normalized * 0.004))
          .add(bField.clone().multiplyScalar(0.008 + normalized * 0.004))
          .add(radial.clone().multiplyScalar((0.02 + normalized * 0.02) * (0.9 + bandwidthFactor * 0.08)))
          .add(swirlAxis.clone().multiplyScalar(0.02 + Math.abs(phasePulse) * 0.02));
        particle.position.add(fieldBias);

        const tint = sourceTint.clone().lerp(new THREE.Color(fieldStrengthToColor(strength, maxStrength, colorScheme)), layer.tintMix);
        const glow = layer.baseOpacity + normalized * (0.34 + layerIndexBonus(bandIndex));
        const idx = i * 3;
        positions[idx] = particle.position.x;
        positions[idx + 1] = particle.position.y;
        positions[idx + 2] = particle.position.z;
        colors[idx] = tint.r * glow;
        colors[idx + 1] = tint.g * glow;
        colors[idx + 2] = tint.b * glow;
      }

      positionAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
    });
  });

  return (
    <>
      {bands.map((band) => (
        <points key={`${source.id}-${band.config.id}`} geometry={band.geometry}>
          <pointsMaterial
            size={band.config.size}
            sizeAttenuation
            transparent
            opacity={band.config.baseOpacity}
            vertexColors
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      ))}
    </>
  );

  function reseedParticle(particle: CloudParticle, src: RFSource, bandIndex: number, particleIndex: number) {
    const band = bands[bandIndex];
    const direction = fibonacciSphereDirection(particleIndex, band.particles.length, sourceIndex, bandIndex);
    const tangent = orthogonalTangent(direction);
    const radius = 0.3 + (particleIndex % 9) * 0.06 + band.config.radiusScale * 0.28;
    const spinBias = ((particleIndex % 2 === 0 ? 1 : -1) * (0.08 + bandIndex * 0.03));

    particle.position.set(
      src.position.x + direction.x * radius,
      src.position.y + direction.y * radius,
      src.position.z + direction.z * radius
    );
    particle.direction.copy(direction);
    particle.tangent.copy(tangent);
    particle.radial = radius;
    particle.phaseSeed = radius + sourceIndex * 0.2;
    particle.drift = spinBias;
  }
}

function createLayerGeometry(count: number) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  return geometry;
}

function layerIndexBonus(index: number) {
  return index === 0 ? 0.1 : index === 1 ? 0.06 : 0.03;
}

function fibonacciSphereDirection(index: number, count: number, sourceIndex: number, layerIndex: number) {
  const offset = 2 / count;
  const increment = Math.PI * (3 - Math.sqrt(5));
  const y = ((index * offset) - 1) + offset / 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const phi = ((index + sourceIndex * 13 + layerIndex * 7) % count) * increment;

  const direction = new THREE.Vector3(
    Math.cos(phi) * r,
    y,
    Math.sin(phi) * r
  );

  if (direction.lengthSq() === 0) {
    direction.set(0, 1, 0);
  }

  return direction.normalize();
}

function orthogonalTangent(direction: THREE.Vector3) {
  const helper = Math.abs(direction.y) < 0.9 ? Y_AXIS : Z_AXIS;
  const tangent = new THREE.Vector3().crossVectors(direction, helper);

  if (tangent.lengthSq() === 0) {
    tangent.copy(new THREE.Vector3().crossVectors(direction, X_AXIS));
  }

  if (tangent.lengthSq() === 0) {
    tangent.set(1, 0, 0);
  }

  return tangent.normalize();
}
