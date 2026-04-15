import { Vector3D } from '../types/common.types';

/**
 * Mathematical utilities for vector and geometric operations
 */

/**
 * Calculate Euclidean distance between two 3D points
 * @param a - First point.
 * @param b - Second point.
 * @returns Distance between points.
 */
export function distance(a: Vector3D, b: Vector3D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate magnitude (length) of a vector
 * @param v - Vector to measure.
 * @returns Vector length.
 */
export function magnitude(v: Vector3D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

/**
 * Normalize a vector to unit length
 * @param v - Vector to normalize.
 * @returns Unit-length vector or zero vector.
 */
export function normalize(v: Vector3D): Vector3D {
  const mag = magnitude(v);
  if (mag === 0) {
    return { x: 0, y: 0, z: 0 };
  }
  return {
    x: v.x / mag,
    y: v.y / mag,
    z: v.z / mag,
  };
}

/**
 * Add two vectors
 * @param a - First vector.
 * @param b - Second vector.
 * @returns Sum of the vectors.
 */
export function add(a: Vector3D, b: Vector3D): Vector3D {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
  };
}

/**
 * Subtract vector b from vector a
 * @param a - Minuend vector.
 * @param b - Subtrahend vector.
 * @returns Difference vector.
 */
export function subtract(a: Vector3D, b: Vector3D): Vector3D {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  };
}

/**
 * Multiply vector by scalar
 * @param v - Vector to scale.
 * @param s - Scalar multiplier.
 * @returns Scaled vector.
 */
export function scale(v: Vector3D, s: number): Vector3D {
  return {
    x: v.x * s,
    y: v.y * s,
    z: v.z * s,
  };
}

/**
 * Dot product of two vectors
 * @param a - First vector.
 * @param b - Second vector.
 * @returns Dot product.
 */
export function dot(a: Vector3D, b: Vector3D): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * Cross product of two vectors
 * @param a - First vector.
 * @param b - Second vector.
 * @returns Cross product vector.
 */
export function cross(a: Vector3D, b: Vector3D): Vector3D {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

/**
 * Linear interpolation between two vectors
 * @param a - Start vector.
 * @param b - End vector.
 * @param t - Interpolation factor from 0 to 1.
 * @returns Interpolated vector.
 */
export function lerp(a: Vector3D, b: Vector3D, t: number): Vector3D {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

/**
 * Clamp a value between min and max
 * @param value - Input value.
 * @param min - Lower bound.
 * @param max - Upper bound.
 * @returns Clamped value.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
