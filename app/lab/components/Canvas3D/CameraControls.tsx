'use client';

import { useMemo } from 'react';
import { useCameraControls } from '../../hooks/useCameraControls';

/**
 * Full-surface pointer layer for camera interactions.
 */
export function CameraControls() {
  const { onMouseDown, onMouseMove, onMouseUp, onWheel } = useCameraControls();
  const layerStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      inset: 0,
      zIndex: 1,
      cursor: 'grab',
      touchAction: 'none' as const,
    }),
    []
  );

  return (
    <div
      aria-label="3D camera controls"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
      onContextMenu={(event) => event.preventDefault()}
      style={layerStyle}
    />
  );
}
