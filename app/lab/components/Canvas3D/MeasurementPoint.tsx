'use client';

import { useMemo } from 'react';
import { MeasurementPoint as MeasurementPointType } from '../../types/measurement.types';

export interface MeasurementPointProps {
  measurement: MeasurementPointType;
}

export function MeasurementPoint({ measurement }: MeasurementPointProps) {
  const color = useMemo(() => {
    return measurement.region === 'near-field' ? '#f59e0b' : '#22c55e';
  }, [measurement.region]);

  return (
    <mesh position={[measurement.position.x, measurement.position.y, measurement.position.z]}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
    </mesh>
  );
}
