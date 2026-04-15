'use client';

import { useCameraControls } from '../../hooks/useCameraControls';

/**
 * Full-surface pointer layer for camera interactions.
 */
export function CameraControls() {
  const { onMouseDown, onMouseMove, onMouseUp, onWheel } = useCameraControls();

  return (
    <div
      aria-label="3D camera controls"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onWheel={onWheel}
      onContextMenu={(event) => event.preventDefault()}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        cursor: 'grab',
        touchAction: 'none',
      }}
    />
  );
}
