'use client';

import { useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { RFSource } from '../../types/source.types';
import { frequencyToDisplayColor } from '../../lib/visualization-helpers';

const MODEL_PATH = '/models/radio+tower_02_optimized.glb';

// Model scale to fit within ~0.6 world-units height; adjust if needed
const TOWER_SCALE = 0.5;

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
  const phaseGlow = 0.2 + ((Math.sin(source.phase) + 1) / 2) * 0.4;

  const { scene } = useGLTF(MODEL_PATH);
  // Clone so each source instance has independent materials
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    const emissiveColor = new THREE.Color(color);
    clonedScene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat) => {
          if (mat instanceof THREE.MeshStandardMaterial) {
            mat.emissive = emissiveColor;
            mat.emissiveIntensity = isSelected ? 0.7 : phaseGlow;
          }
        });
      }
    });
  }, [clonedScene, color, isSelected, phaseGlow]);

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
