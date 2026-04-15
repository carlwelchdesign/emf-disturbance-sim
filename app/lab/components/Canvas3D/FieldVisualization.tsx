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

type FlowParticle = {
  position: THREE.Vector3;
  seed: number;
  speed: number;
  phase: number;
};

const TAU = Math.PI * 2;

/**
 * Equation-driven particle flow visualization.
 * Tiny particles are advected by the solved E×B flow and heat-mapped by local field intensity.
 */
export function FieldVisualization({ sources, lod, colorScheme }: FieldVisualizationProps) {
  const activeSources = sources.filter((source) => source.active);

  if (activeSources.length === 0) {
    return null;
  }

  return (
    <>
      {activeSources.map((source, index) => (
        <SourceFlowField
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

function SourceFlowField({
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

  const particles = useMemo(() => {
    const lodFactor = lod === 'high' ? 1 : lod === 'medium' ? 0.76 : 0.56;
    const count = Math.max(56, Math.min(180, Math.round(fieldLineDensity * lodFactor * 1.9)));
    const seedRadius = 0.25 + Math.min(0.85, Math.abs(source.power) * 1.1);
    const sourcePhase = source.phase + sourceIndex * 0.73;
    const sourceStride = 0.36 + (sourceIndex % 4) * 0.08;
    const state: FlowParticle[] = [];

    for (let i = 0; i < count; i++) {
      const t = i / count;
      const theta = t * TAU * (4.2 + (sourceIndex % 3) * 0.45) + sourcePhase;
      const radial = seedRadius + (i % 11) * 0.05 + sourceStride * 0.1;
      const axial = (t - 0.5) * 3.2;
      state.push({
        position: new THREE.Vector3(
          source.position.x + axial,
          source.position.y + Math.cos(theta) * radial,
          source.position.z + Math.sin(theta) * radial
        ),
        seed: theta + sourceIndex * 0.33,
        speed: 0.42 + (i % 9) * 0.04 + Math.min(0.5, source.frequency / 40e9) + sourceStride * 0.1,
        phase: t * TAU,
      });
    }

    return state;
  }, [fieldLineDensity, lod, source.frequency, source.id, source.power, source.position.x, source.position.y, source.position.z, sourceIndex]);

  const sourceColor = useMemo(() => {
    return new THREE.Color(source.color ?? getSourceColor(sourceIndex));
  }, [source.color, sourceIndex]);

  const geometry = useMemo(() => {
    const positions = new Float32Array(particles.length * 3);
    const colors = new Float32Array(particles.length * 3);
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geom;
  }, [particles.length]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  const maxStrength = useMemo(() => {
    const wattEquivalent = allSources.reduce((sum, item) => {
      const watts = item.powerUnit === 'dBm' ? Math.pow(10, item.power / 10) / 1000 : item.power;
      return sum + Math.sqrt(Math.max(watts, 0.0001));
    }, 0);

    return Math.max(0.2, wattEquivalent * 1.5);
  }, [allSources]);

  useFrame(({ clock }) => {
    const time = animateFields ? clock.getElapsedTime() * animationSpeed : 0;
    const delta = Math.min(0.032, clock.getDelta());
    const positionAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute;
    const positions = positionAttr.array as Float32Array;
    const colors = colorAttr.array as Float32Array;

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      const field = calculateFieldAtPoint(particle.position, allSources, time);
      const e = field.eField ?? { x: 0, y: 0, z: 0 };
      const b = field.bField ?? { x: 0, y: 0, z: 0 };
      const poynting = field.poynting ?? new THREE.Vector3(e.x, e.y, e.z);

      const flow = new THREE.Vector3(poynting.x, poynting.y, poynting.z);
      if (flow.lengthSq() === 0) {
        flow.set(-(particle.position.x - source.position.x), particle.position.y - source.position.y, particle.position.z - source.position.z);
      }

      flow.normalize();
      const eVector = new THREE.Vector3(e.x, e.y, e.z);
      const bVector = new THREE.Vector3(b.x, b.y, b.z);
      const curl = new THREE.Vector3().crossVectors(eVector, bVector).normalize();
      const advection = flow.multiplyScalar((0.35 + particle.speed) * delta);
      const twist = curl.multiplyScalar(0.12 * delta);
      const oscillation = new THREE.Vector3(
        Math.sin(time * 1.1 + particle.seed),
        Math.cos(time * 0.9 + particle.phase),
        Math.sin(time * 0.7 + particle.phase * 0.5)
      ).multiplyScalar(0.02 + Math.min(0.08, Math.abs(field.strength) / (maxStrength * 8)));

      particle.position.add(advection).add(twist).add(oscillation);
      particle.phase += delta * (0.8 + particle.speed);

      const radialDistance = particle.position.distanceTo(source.position);
      if (radialDistance > 4.5 || Math.abs(particle.position.x - source.position.x) > 4.8) {
        const reseedAngle = (i / particles.length) * TAU * 2 + sourceIndex * 0.7;
        const reseedRadius = 0.35 + (i % 8) * 0.08;
        particle.position.set(
          source.position.x + (Math.random() - 0.5) * 1.8,
          source.position.y + Math.cos(reseedAngle) * reseedRadius,
          source.position.z + Math.sin(reseedAngle) * reseedRadius
        );
      }

      const normalized = Math.min(1, Math.abs(field.strength) / maxStrength);
      const color = new THREE.Color(fieldStrengthToColor(Math.abs(field.strength), maxStrength, colorScheme));
      const particleTint = sourceColor.clone().lerp(color, 0.68);
      const glow = 0.35 + normalized * 0.65;
      const idx = i * 3;
      positions[idx] = particle.position.x;
      positions[idx + 1] = particle.position.y;
      positions[idx + 2] = particle.position.z;
      colors[idx] = particleTint.r * glow;
      colors[idx + 1] = particleTint.g * glow;
      colors[idx + 2] = particleTint.b * glow;
    }

    positionAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
  });

  return (
    <points geometry={geometry}>
      <pointsMaterial
        size={0.07}
        sizeAttenuation
        transparent
        opacity={0.95}
        vertexColors
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
