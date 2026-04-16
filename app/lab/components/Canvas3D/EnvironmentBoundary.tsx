'use client';

import { useLabStore } from '../../hooks/useLabStore';

export function EnvironmentBoundary() {
  const showGrid = useLabStore((state) => state.settings.showGrid);
  const bounds = useLabStore((state) => state.environment.bounds);

  if (!showGrid) return null;

  const size = bounds.size;
  const width = bounds.width ?? size;
  const depth = bounds.depth ?? size;

  return (
    <group>
      {showGrid && <gridHelper args={[Math.max(width, depth), 20, '#334155', '#1e293b']} />}
    </group>
  );
}
