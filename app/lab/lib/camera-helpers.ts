/**
 * Camera manipulation utilities for 3D navigation
 * Provides orbit, pan, and zoom calculations for camera controls
 */

import { Vector3 } from 'three';

/**
 * Orbit result containing new camera position
 */
export interface OrbitResult {
  position: { x: number; y: number; z: number };
}

/**
 * Pan result containing new camera and target positions
 */
export interface PanResult {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
}

/**
 * Zoom result containing new camera position
 */
export interface ZoomResult {
  position: { x: number; y: number; z: number };
  distance: number;
}

/**
 * Calculate new camera position after orbiting around a target point
 * 
 * @param cameraPos - Current camera position
 * @param target - Point to orbit around
 * @param deltaX - Horizontal rotation delta (radians)
 * @param deltaY - Vertical rotation delta (radians)
 * @returns New camera position
 */
export function calculateOrbit(
  cameraPos: { x: number; y: number; z: number },
  target: { x: number; y: number; z: number },
  deltaX: number,
  deltaY: number
): OrbitResult {
  // Create vectors
  const camera = new Vector3(cameraPos.x, cameraPos.y, cameraPos.z);
  const targetVec = new Vector3(target.x, target.y, target.z);
  
  // Get offset from target
  const offset = camera.clone().sub(targetVec);
  
  // Calculate spherical coordinates
  const radius = offset.length();
  let theta = Math.atan2(offset.x, offset.z); // Azimuth
  let phi = Math.acos(Math.max(-1, Math.min(1, offset.y / radius))); // Polar
  
  // Apply rotations
  theta += deltaX;
  phi = Math.max(0.01, Math.min(Math.PI - 0.01, phi + deltaY)); // Clamp to avoid gimbal lock
  
  // Convert back to Cartesian
  offset.x = radius * Math.sin(phi) * Math.sin(theta);
  offset.y = radius * Math.cos(phi);
  offset.z = radius * Math.sin(phi) * Math.cos(theta);
  
  // Add target offset back
  const newPosition = offset.add(targetVec);
  
  return {
    position: { x: newPosition.x, y: newPosition.y, z: newPosition.z },
  };
}

/**
 * Calculate new camera and target positions after panning
 * 
 * @param cameraPos - Current camera position
 * @param target - Current target position
 * @param deltaX - Horizontal pan delta
 * @param deltaY - Vertical pan delta
 * @param distance - Current camera-to-target distance
 * @returns New camera and target positions
 */
export function calculatePan(
  cameraPos: { x: number; y: number; z: number },
  target: { x: number; y: number; z: number },
  deltaX: number,
  deltaY: number,
  distance: number
): PanResult {
  const camera = new Vector3(cameraPos.x, cameraPos.y, cameraPos.z);
  const targetVec = new Vector3(target.x, target.y, target.z);
  
  // Get camera's right and up vectors
  const forward = new Vector3().subVectors(targetVec, camera).normalize();
  const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0)).normalize();
  const up = new Vector3().crossVectors(right, forward).normalize();
  
  // Scale pan by distance for consistent feel
  const panScale = distance * 0.001;
  
  // Calculate pan offset
  const panOffset = new Vector3()
    .addScaledVector(right, -deltaX * panScale)
    .addScaledVector(up, deltaY * panScale);
  
  // Apply to both camera and target
  const newCamera = camera.add(panOffset);
  const newTarget = targetVec.add(panOffset);
  
  return {
    position: { x: newCamera.x, y: newCamera.y, z: newCamera.z },
    target: { x: newTarget.x, y: newTarget.y, z: newTarget.z },
  };
}

/**
 * Calculate new camera position after zooming (moving along view direction)
 * 
 * @param cameraPos - Current camera position
 * @param target - Current target position
 * @param delta - Zoom delta (positive = zoom in, negative = zoom out)
 * @param minDistance - Minimum allowed distance (default: 0.5)
 * @param maxDistance - Maximum allowed distance (default: 50)
 * @returns New camera position and distance
 */
export function calculateZoom(
  cameraPos: { x: number; y: number; z: number },
  target: { x: number; y: number; z: number },
  delta: number,
  minDistance = 0.5,
  maxDistance = 50
): ZoomResult {
  const camera = new Vector3(cameraPos.x, cameraPos.y, cameraPos.z);
  const targetVec = new Vector3(target.x, target.y, target.z);
  
  // Get direction from camera to target
  const direction = new Vector3().subVectors(targetVec, camera);
  const currentDistance = direction.length();
  
  // Calculate new distance with clamping
  const zoomScale = 1 + delta * 0.1; // 10% per delta unit
  const newDistance = Math.max(minDistance, Math.min(maxDistance, currentDistance / zoomScale));
  
  // Move camera along direction
  direction.normalize();
  const newCamera = targetVec.clone().sub(direction.multiplyScalar(newDistance));
  
  return {
    position: { x: newCamera.x, y: newCamera.y, z: newCamera.z },
    distance: newDistance,
  };
}

/**
 * Calculate distance between camera and target
 */
export function calculateDistance(
  cameraPos: { x: number; y: number; z: number },
  target: { x: number; y: number; z: number }
): number {
  const dx = cameraPos.x - target.x;
  const dy = cameraPos.y - target.y;
  const dz = cameraPos.z - target.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
