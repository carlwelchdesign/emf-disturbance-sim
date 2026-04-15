'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLabStore } from '../../hooks/useLabStore';

/**
 * Places a pulsing semi-transparent sphere at the midpoint of each
 * (friendly, hostile) source pair that is close enough to overlap.
 * No extra field calculations — purely geometry-based.
 */
export function ContestZoneMarker() {
  const sources = useLabStore((state) => state.sources);
  const pulseRef = useRef(0);

  const zones = useMemo(() => {
    const friendly = sources.filter((s) => s.active && (s.faction ?? 'friendly') !== 'hostile');
    const hostile = sources.filter((s) => s.active && s.faction === 'hostile');
    const result: Array<{ position: [number, number, number]; radius: number }> = [];

    for (const f of friendly) {
      for (const h of hostile) {
        const dx = f.position.x - h.position.x;
        const dy = f.position.y - h.position.y;
        const dz = f.position.z - h.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (distance < 12) {
          result.push({
            position: [
              (f.position.x + h.position.x) / 2,
              (f.position.y + h.position.y) / 2,
              (f.position.z + h.position.z) / 2,
            ],
            radius: Math.max(0.4, distance * 0.35),
          });
        }
      }
    }
    return result;
  }, [sources]);

  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    pulseRef.current = clock.getElapsedTime();
    meshRefs.current.forEach((mesh) => {
      if (!mesh) return;
      const scale = 1 + 0.08 * Math.sin(pulseRef.current * 1.8);
      mesh.scale.setScalar(scale);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.08 + 0.04 * Math.sin(pulseRef.current * 2.3);
    });
  });

  if (zones.length === 0) return null;

  return (
    <>
      {zones.map((zone, i) => (
        <mesh
          key={i}
          position={zone.position}
          ref={(el) => { meshRefs.current[i] = el; }}
        >
          <sphereGeometry args={[zone.radius, 16, 16]} />
          <meshBasicMaterial
            color="#AA44FF"
            transparent
            opacity={0.1}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}
