'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useLabStore } from '../../hooks/useLabStore';
import { frequencyToDisplayColor } from '../../lib/visualization-helpers';
import { RFSource } from '../../types/source.types';
import { ColorScheme, LODLevel } from '../../types/visualization.types';

const TAU = Math.PI * 2;

export interface FieldVisualizationProps {
  sources: RFSource[];
  lod: LODLevel;
  colorScheme: ColorScheme;
}

type ParticleConfig = {
  id: string;
  kind: 'packet' | 'scatter';
  direction: 1 | -1;
  travelSpan: number;
  speed: number;
  size: number;
  haloSize: number;
  opacityBase: number;
  phaseOffset: number;
  lateralPhase: number;
  lateralAmplitude: number;
  crossAmplitude: number;
  wobble: number;
  orbitRadius: number;
  orbitSpeed: number;
  forwardBias: number;
  color: string;
};

type WavefrontConfig = {
  id: string;
  speed: number;
  baseRadius: number;
  expansion: number;
  opacityBase: number;
  phaseOffset: number;
  color: string;
};

/**
 * Particle-and-wavefront renderer for the EMF lab.
 */
export function FieldVisualization({ sources, lod, colorScheme }: FieldVisualizationProps) {
  const activeSources = sources.filter((source) => source.active);

  if (activeSources.length === 0) {
    return null;
  }

  return (
    <>
      {activeSources.map((source) => (
        <SourceField key={source.id} source={source} lod={lod} colorScheme={colorScheme} />
      ))}
    </>
  );
}

function SourceField({
  source,
  lod,
  colorScheme,
}: {
  source: RFSource;
  lod: LODLevel;
  colorScheme: ColorScheme;
}) {
  const particleRefs = useRef<Array<THREE.Group | null>>([]);
  const coreRefs = useRef<Array<THREE.Mesh | null>>([]);
  const haloRefs = useRef<Array<THREE.Mesh | null>>([]);
  const wavefrontRefs = useRef<Array<THREE.Mesh | null>>([]);
  const coreRef = useRef<THREE.Mesh | null>(null);

  const { animateFields, animationSpeed, fieldLineDensity } = useLabStore((state) => state.settings);

  const displayColor = useMemo(() => {
    if (source.color) {
      return source.color;
    }

    if (colorScheme === 'monochrome') {
      return '#cbd5e1';
    }

    return frequencyToDisplayColor(source.frequency);
  }, [colorScheme, source.color, source.frequency]);

  const intensityFactor = useMemo(() => {
    const frequencyFactor = Math.min(
      Math.max(Math.log10(source.frequency / 1e6) / Math.log10(100e9 / 1e6), 0),
      1
    );
    const powerFactor =
      source.powerUnit === 'dBm'
        ? Math.min(Math.max((source.power + 30) / 80, 0), 1)
        : Math.min(Math.max(Math.log10(Math.max(source.power, 0.001) * 1000) / 3, 0), 1);

    return {
      frequencyFactor,
      powerFactor,
      combined: Math.min(1, 0.45 + frequencyFactor * 0.25 + powerFactor * 0.45),
    };
  }, [source.frequency, source.power, source.powerUnit]);

  const motion = useMemo(() => {
    const lodFactor = lod === 'high' ? 1 : lod === 'medium' ? 0.76 : 0.56;
    const packetCount = Math.max(
      16,
      Math.min(
        36,
        Math.round(
          fieldLineDensity *
            lodFactor *
            (0.26 + intensityFactor.powerFactor * 0.48 + intensityFactor.frequencyFactor * 0.2)
        )
      )
    );
    const scatterCount = Math.max(8, Math.min(18, Math.round(packetCount * 0.4)));
    const wavefrontCount = Math.max(2, Math.min(4, Math.round(2 + intensityFactor.powerFactor * 2)));
    const baseRadius = 0.16 + intensityFactor.powerFactor * 0.1;

    const particles: ParticleConfig[] = [
      ...Array.from({ length: packetCount }, (_, index) => {
        const direction: 1 | -1 = index % 2 === 0 ? 1 : -1;
        const lane = index / Math.max(packetCount - 1, 1);
        const lateralPhase = lane * TAU * 1.4 + source.phase;
        const travelSpan = 3.8 + intensityFactor.frequencyFactor * 2.4 + intensityFactor.powerFactor * 3.4;
        const speed =
          0.65 + intensityFactor.frequencyFactor * 1.1 + intensityFactor.powerFactor * 0.75 + (index % 4) * 0.08;
        const size = 0.085 + intensityFactor.powerFactor * 0.06 + (index % 4) * 0.01;
        const haloSize = size * 2.4;
        const opacityBase = 0.48 + intensityFactor.powerFactor * 0.22;
        const wobble = 1.1 + intensityFactor.frequencyFactor * 2.2;
        const lateralAmplitude = 0.12 + intensityFactor.powerFactor * 0.24;
        const crossAmplitude = lateralAmplitude * 0.84;

        return {
          id: `${source.id}-packet-${index}`,
          kind: 'packet' as const,
          direction,
          travelSpan,
          speed,
          size,
          haloSize,
          opacityBase,
          phaseOffset: source.phase + lane * TAU,
          lateralPhase,
          lateralAmplitude,
          crossAmplitude,
          wobble,
          orbitRadius: 0,
          orbitSpeed: 0,
          forwardBias: 0.42 + lane * 0.44,
          color: displayColor,
        };
      }),
      ...Array.from({ length: scatterCount }, (_, index) => {
        const lane = index / Math.max(scatterCount - 1, 1);
        const direction: 1 | -1 = index % 2 === 0 ? 1 : -1;
        const orbitRadius = 0.28 + lane * 0.65 + intensityFactor.powerFactor * 0.1;
        const orbitSpeed = 0.7 + intensityFactor.frequencyFactor * 1.15 + lane * 0.35;
        const size = 0.05 + lane * 0.025;
        const haloSize = size * 2.8;
        const lateralPhase = lane * TAU * 2.2 + source.phase * 1.6;

        return {
          id: `${source.id}-scatter-${index}`,
          kind: 'scatter' as const,
          direction,
          travelSpan: 1.6 + intensityFactor.powerFactor * 0.45,
          speed: 0.55 + lane * 0.25,
          size,
          haloSize,
          opacityBase: 0.24 + intensityFactor.powerFactor * 0.12,
          phaseOffset: source.phase + lane * TAU * 0.75,
          lateralPhase,
          lateralAmplitude: 0.24 + intensityFactor.powerFactor * 0.06,
          crossAmplitude: 0.2 + intensityFactor.frequencyFactor * 0.08,
          wobble: 1.6 + intensityFactor.frequencyFactor * 1.4,
          orbitRadius,
          orbitSpeed,
          forwardBias: 0.06 + lane * 0.12,
          color: displayColor,
        };
      }),
    ];

    const wavefronts: WavefrontConfig[] = Array.from({ length: wavefrontCount }, (_, index) => ({
      id: `${source.id}-wavefront-${index}`,
      speed: 0.35 + intensityFactor.frequencyFactor * 0.55 + intensityFactor.powerFactor * 0.35 + index * 0.03,
      baseRadius: baseRadius + index * 0.12,
      expansion: 0.9 + intensityFactor.frequencyFactor * 0.85 + intensityFactor.powerFactor * 1.25,
      opacityBase: 0.15 + intensityFactor.powerFactor * 0.12,
      phaseOffset: source.phase + index * (TAU / Math.max(wavefrontCount, 1)),
      color: displayColor,
    }));

    return { particles, wavefronts };
  }, [displayColor, fieldLineDensity, intensityFactor.frequencyFactor, intensityFactor.powerFactor, lod, source.id, source.phase]);

  useFrame(({ clock }) => {
    const t = animateFields ? clock.getElapsedTime() * animationSpeed : 0;

    if (coreRef.current) {
      coreRef.current.scale.setScalar(1 + intensityFactor.combined * 0.22 + Math.sin(t * 2.5 + source.phase) * 0.05);
      const coreMaterial = coreRef.current.material as THREE.MeshStandardMaterial;
      coreMaterial.emissiveIntensity =
        0.6 + intensityFactor.combined * 0.8 + Math.max(0, Math.sin(t * 3 + source.phase)) * 0.2;
    }

    motion.particles.forEach((particle, index) => {
      const particleGroup = particleRefs.current[index];
      if (!particleGroup) {
        return;
      }

      if (particle.kind === 'packet') {
        const progress = fract(t * particle.speed + particle.phaseOffset);
        const span = (progress - 0.5) * particle.travelSpan;
        const wobble = Math.sin(progress * TAU * particle.wobble + particle.lateralPhase) * particle.lateralAmplitude;
        const cross =
          Math.cos(progress * TAU * (particle.wobble * 0.72) + particle.lateralPhase) * particle.crossAmplitude;

        particleGroup.position.set(
          particle.direction * span + Math.cos(t * 0.45 + particle.lateralPhase) * 0.1,
          wobble,
          cross
        );
        particleGroup.scale.setScalar(1 + 0.08 * Math.sin(progress * TAU + source.phase));

        const coreMaterial = coreRefs.current[index]?.material as THREE.MeshStandardMaterial | undefined;
        const haloMaterial = haloRefs.current[index]?.material as THREE.MeshBasicMaterial | undefined;
        const scale = particle.size * (0.9 + 0.45 * Math.sin(progress * TAU + source.phase));
        const haloScale = particle.haloSize * (0.95 + 0.15 * Math.cos(progress * TAU + source.phase));
        const coreMesh = coreRefs.current[index];
        const haloMesh = haloRefs.current[index];

        if (coreMesh) {
          coreMesh.scale.setScalar(scale);
        }

        if (haloMesh) {
          haloMesh.scale.setScalar(haloScale);
        }

        const material = coreMaterial;
        const haloMaterialInstance = haloMaterial;
        if (material) {
          material.opacity = particle.opacityBase + (1 - Math.abs(progress - 0.5) * 2) * 0.28;
          material.emissiveIntensity = 0.85 + particle.forwardBias * 0.9 + Math.max(0, Math.sin(t * 3 + source.phase)) * 0.25;
        }

        if (haloMaterialInstance) {
          haloMaterialInstance.opacity = particle.opacityBase * 0.22 + (1 - Math.abs(progress - 0.5) * 2) * 0.14;
        }
      } else {
        const orbit = t * particle.orbitSpeed + particle.phaseOffset;
        const radius = particle.orbitRadius + Math.sin(orbit * 0.8) * 0.06;
        const x = Math.sin(orbit * 0.85) * radius * 0.7 + Math.cos(orbit * 0.27 + source.phase) * 0.2;
        const y = Math.cos(orbit) * radius * 0.9;
        const z = Math.sin(orbit * 0.62 + source.phase) * radius * 0.85;

        particleGroup.position.set(x, y, z);
        particleGroup.scale.setScalar(1 + 0.08 * Math.sin(orbit * 1.6));

        const coreMaterial = coreRefs.current[index]?.material as THREE.MeshStandardMaterial | undefined;
        const haloMaterial = haloRefs.current[index]?.material as THREE.MeshBasicMaterial | undefined;
        const coreMesh = coreRefs.current[index];
        const haloMesh = haloRefs.current[index];

        if (coreMesh) {
          coreMesh.scale.setScalar(particle.size * (1.0 + 0.2 * Math.sin(orbit * 1.6)));
        }

        if (haloMesh) {
          haloMesh.scale.setScalar(particle.haloSize * (1.0 + 0.28 * Math.sin(orbit * 1.1)));
        }

        if (coreMaterial) {
          coreMaterial.opacity = particle.opacityBase + 0.12 * (0.5 + 0.5 * Math.sin(orbit * 2.4));
          coreMaterial.emissiveIntensity = 0.55 + 0.35 * (0.5 + 0.5 * Math.sin(orbit * 1.2));
        }

        if (haloMaterial) {
          haloMaterial.opacity = particle.opacityBase * 0.18 + 0.08 * (0.5 + 0.5 * Math.sin(orbit * 2.2));
        }
      }
    });

    motion.wavefronts.forEach((wavefront, index) => {
      const mesh = wavefrontRefs.current[index];
      if (!mesh) {
        return;
      }

      const progress = fract(t * wavefront.speed + wavefront.phaseOffset);
      const scale = wavefront.baseRadius + progress * wavefront.expansion;

      mesh.scale.setScalar(scale);

      const material = mesh.material as THREE.MeshBasicMaterial;
      material.opacity = wavefront.opacityBase * (1 - progress) + 0.04;
    });
  });

  return (
    <group position={[source.position.x, source.position.y, source.position.z]}>
      <mesh ref={coreRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.26, 24, 24]} />
        <meshStandardMaterial
          color={displayColor}
          emissive={displayColor}
          emissiveIntensity={0.75}
          roughness={0.3}
          metalness={0.05}
        />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.36, 24, 24]} />
        <meshBasicMaterial
          color={displayColor}
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {motion.wavefronts.map((wavefront, index) => (
        <mesh
          key={wavefront.id}
          ref={(node) => {
            wavefrontRefs.current[index] = node;
          }}
          rotation={[0, Math.PI / 2, 0]}
          position={[0, 0, 0]}
        >
          <ringGeometry args={[0.92, 1.08, 48]} />
          <meshBasicMaterial
            color={wavefront.color}
            transparent
            opacity={wavefront.opacityBase}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {motion.particles.map((particle, index) => (
        <group
          key={particle.id}
          ref={(node) => {
            particleRefs.current[index] = node;
          }}
        >
          <mesh
            ref={(node) => {
              coreRefs.current[index] = node;
            }}
          >
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial
              color={particle.color}
              emissive={particle.color}
              emissiveIntensity={0.9}
              transparent
              opacity={particle.opacityBase}
              roughness={0.25}
              metalness={0.08}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh
            ref={(node) => {
              haloRefs.current[index] = node;
            }}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial
              color={particle.color}
              transparent
              opacity={particle.opacityBase * 0.22}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function fract(value: number): number {
  return value - Math.floor(value);
}
