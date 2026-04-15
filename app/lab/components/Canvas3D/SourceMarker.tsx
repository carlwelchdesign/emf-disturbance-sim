'use client';

import { useMemo } from 'react';
import { RFSource } from '../../types/source.types';
import { frequencyToDisplayColor } from '../../lib/visualization-helpers';

export interface SourceMarkerProps {
  source: RFSource;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * SourceMarker 3D component
 * Displays a source as a sphere in 3D space
 */
export function SourceMarker({ source, isSelected, onClick }: SourceMarkerProps) {
  const color = useMemo(() => frequencyToDisplayColor(source.frequency), [source.frequency]);
  const powerScale = source.powerUnit === 'dBm'
    ? Math.min(Math.max((source.power + 30) / 80, 0), 1)
    : Math.min(Math.max(Math.log10(Math.max(source.power, 0.001) * 1000) / 3, 0), 1);
  const scale = isSelected ? 1.6 : 1.05 + powerScale * 0.35;
  const phaseGlow = 0.2 + ((Math.sin(source.phase) + 1) / 2) * 0.4;

  return (
    <mesh
      position={[source.position.x, source.position.y, source.position.z]}
      onClick={onClick}
      scale={scale}
    >
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isSelected ? 0.7 : phaseGlow}
      />
    </mesh>
  );
}
