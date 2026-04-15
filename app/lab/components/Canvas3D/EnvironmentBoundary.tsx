'use client';

import { useLabStore } from '../../hooks/useLabStore';

export function EnvironmentBoundary() {
  const showGrid = useLabStore((state) => state.settings.showGrid);
  const showBoundary = useLabStore((state) => state.environment.showBoundary);
  const bounds = useLabStore((state) => state.environment.bounds);

  if (!showGrid && !showBoundary) return null;

  const size = bounds.size;
  const width = bounds.width ?? size;
  const height = bounds.height ?? size;
  const depth = bounds.depth ?? size;
  const center = [
    (bounds.min.x + bounds.max.x) / 2,
    (bounds.min.y + bounds.max.y) / 2,
    (bounds.min.z + bounds.max.z) / 2,
  ] as const;

  return (
    <group>
      {showGrid && <gridHelper args={[Math.max(width, depth), 20, '#334155', '#1e293b']} />}
      {showBoundary && (
        <mesh position={center}>
          <boxGeometry args={[width, height, depth]} />
          <meshBasicMaterial color="#64748b" wireframe transparent opacity={0.25} />
        </mesh>
      )}
    </group>
  );
}
