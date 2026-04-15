/**
 * Common types shared across the EMF/RF visualization platform
 */

/** 3D vector for positions, directions, and offsets */
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/** Bounding box defining a 3D region of space */
export interface BoundingBox {
  min: Vector3D;
  max: Vector3D;
  size: number; // Legacy max-dimension fallback
  width?: number;
  height?: number;
  depth?: number;
}
