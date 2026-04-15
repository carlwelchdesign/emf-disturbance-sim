import { Vector3D } from './common.types';

/**
 * Camera state for 3D scene rendering
 */
export interface CameraState {
  /** Camera position in world space */
  position: Vector3D;
  
  /** Point the camera is looking at */
  target: Vector3D;
  
  /** Up vector (usually [0, 1, 0] for Y-up coordinate system) */
  up: Vector3D;
  
  /** Field of view in degrees */
  fov: number;
  
  /** Zoom level (1.0 = default, <1.0 = zoomed out, >1.0 = zoomed in) */
  zoom: number;
  
  /** Near clipping plane distance */
  near: number;
  
  /** Far clipping plane distance */
  far: number;
}

/** Default camera configuration */
export const DEFAULT_CAMERA: CameraState = {
  position: { x: 5, y: 5, z: 5 },
  target: { x: 0, y: 0, z: 0 },
  up: { x: 0, y: 1, z: 0 },
  fov: 75,
  zoom: 1.0,
  near: 0.1,
  far: 1000,
};

/** Camera control constraints */
export const CAMERA_LIMITS = {
  fov: { min: 10, max: 120 },
  zoom: { min: 0.5, max: 5.0 },
  distance: { min: 1, max: 50 }, // Distance from target
} as const;
