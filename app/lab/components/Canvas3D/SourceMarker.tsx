'use client';

import { useMemo, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { RFSource } from '../../types/source.types';
import { frequencyToDisplayColor } from '../../lib/visualization-helpers';
import { useLabStore } from '../../hooks/useLabStore';

const MODEL_PATH = '/models/radio+tower_02_optimized.glb';

// Model scale to fit within ~0.6 world-units height; adjust if needed
const TOWER_SCALE = 0.2;

export interface SourceMarkerProps {
  source: RFSource;
  isSelected?: boolean;
  onClick?: () => void;
}

export function SourceMarker({ source, isSelected, onClick }: SourceMarkerProps) {
  const color = useMemo(() => frequencyToDisplayColor(source.frequency), [source.frequency]);
  const powerScale = source.powerUnit === 'dBm'
    ? Math.min(Math.max((source.power + 30) / 80, 0), 1)
    : Math.min(Math.max(Math.log10(Math.max(source.power, 0.001) * 1000) / 3, 0), 1);
  const scale = isSelected ? 1.6 : 1.05 + powerScale * 0.35;

  const { scene } = useGLTF(MODEL_PATH);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // Collect material refs once after clone so useFrame can update them without traversal
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const animationSpeed = useLabStore((s) => s.settings.animationSpeed);
  const animateFields = useLabStore((s) => s.settings.animateFields);

  useEffect(() => {
    const emissiveColor = new THREE.Color(color);
    const collected: THREE.MeshStandardMaterial[] = [];
    clonedScene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat) => {
          if (mat instanceof THREE.MeshStandardMaterial) {
            mat.emissive = emissiveColor;
            collected.push(mat);
          }
        });
      }
    });
    materialsRef.current = collected;
  }, [clonedScene, color]);

  useFrame(({ clock }) => {
    if (isSelected) {
      materialsRef.current.forEach((mat) => { mat.emissiveIntensity = 0.7; });
      return;
    }
    if (!animateFields) {
      const staticGlow = 0.2 + ((Math.sin(source.phase) + 1) / 2) * 0.4;
      materialsRef.current.forEach((mat) => { mat.emissiveIntensity = staticGlow; });
      return;
    }
    const t = clock.getElapsedTime() * animationSpeed;
    const glow = 0.2 + ((Math.sin(t * 1.5 + source.phase) + 1) / 2) * 0.4;
    materialsRef.current.forEach((mat) => { mat.emissiveIntensity = glow; });
  });

  return (
    <group
      position={[source.position.x, 0, source.position.z]}
      onClick={onClick}
      scale={TOWER_SCALE * scale}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
