/**
 * Tests for camera manipulation utilities
 */

import {
  calculateOrbit,
  calculatePan,
  calculateZoom,
  calculateDistance,
  isSameCameraState,
} from '../../lib/camera-helpers';

describe('camera-helpers', () => {
  describe('calculateOrbit', () => {
    it('should orbit camera around target point', () => {
      const cameraPos = { x: 5, y: 5, z: 5 };
      const target = { x: 0, y: 0, z: 0 };
      const deltaX = Math.PI / 4; // 45 degrees
      const deltaY = 0;

      const result = calculateOrbit(cameraPos, target, deltaX, deltaY);

      // Should maintain distance from target
      const originalDistance = Math.sqrt(5 * 5 + 5 * 5 + 5 * 5);
      const newDistance = Math.sqrt(
        result.position.x ** 2 +
        result.position.y ** 2 +
        result.position.z ** 2
      );
      expect(newDistance).toBeCloseTo(originalDistance, 5);

      // Y position should remain the same (no vertical rotation)
      expect(result.position.y).toBeCloseTo(5, 5);
    });

    it('should handle vertical orbit', () => {
      const cameraPos = { x: 5, y: 0, z: 0 };
      const target = { x: 0, y: 0, z: 0 };
      const deltaX = 0;
      const deltaY = -Math.PI / 4; // Negative deltaY moves up (convention)

      const result = calculateOrbit(cameraPos, target, deltaX, deltaY);

      // Should maintain distance
      const distance = 5;
      const newDistance = Math.sqrt(
        result.position.x ** 2 +
        result.position.y ** 2 +
        result.position.z ** 2
      );
      expect(newDistance).toBeCloseTo(distance, 5);

      // Y should increase (moved up)
      expect(result.position.y).toBeGreaterThan(0);
    });

    it('should clamp vertical rotation to avoid gimbal lock', () => {
      const cameraPos = { x: 0, y: 5, z: 0 };
      const target = { x: 0, y: 0, z: 0 };
      const deltaX = 0;
      const deltaY = Math.PI; // Try to flip over the top

      const result = calculateOrbit(cameraPos, target, deltaX, deltaY);

      // Should not flip completely upside down
      expect(result.position.y).toBeLessThan(0); // Moved down
      expect(result.position.y).toBeGreaterThan(-5); // But not all the way
    });
  });

  describe('calculatePan', () => {
    it('should pan both camera and target', () => {
      const cameraPos = { x: 5, y: 5, z: 5 };
      const target = { x: 0, y: 0, z: 0 };
      const deltaX = 100; // pixels
      const deltaY = 50;
      const distance = calculateDistance(cameraPos, target);

      const result = calculatePan(cameraPos, target, deltaX, deltaY, distance);

      // Both camera and target should move
      expect(result.position.x).not.toBe(cameraPos.x);
      expect(result.target.x).not.toBe(target.x);

      // Distance should remain the same
      const newDistance = calculateDistance(result.position, result.target);
      expect(newDistance).toBeCloseTo(distance, 5);
    });

    it('should scale pan by distance', () => {
      const cameraPos1 = { x: 2, y: 2, z: 2 };
      const target1 = { x: 0, y: 0, z: 0 };
      const distance1 = calculateDistance(cameraPos1, target1);

      const cameraPos2 = { x: 10, y: 10, z: 10 };
      const target2 = { x: 0, y: 0, z: 0 };
      const distance2 = calculateDistance(cameraPos2, target2);

      const deltaX = 100;
      const deltaY = 0;

      const result1 = calculatePan(cameraPos1, target1, deltaX, deltaY, distance1);
      const result2 = calculatePan(cameraPos2, target2, deltaX, deltaY, distance2);

      // Greater distance should result in larger pan movement
      const movement1 = Math.abs(result1.position.x - cameraPos1.x);
      const movement2 = Math.abs(result2.position.x - cameraPos2.x);
      expect(movement2).toBeGreaterThan(movement1);
    });
  });

  describe('calculateZoom', () => {
    it('should zoom in when delta is positive', () => {
      const cameraPos = { x: 10, y: 10, z: 10 };
      const target = { x: 0, y: 0, z: 0 };
      const delta = 1; // Zoom in

      const result = calculateZoom(cameraPos, target, delta);

      // Distance should decrease
      expect(result.distance).toBeLessThan(calculateDistance(cameraPos, target));
    });

    it('should zoom out when delta is negative', () => {
      const cameraPos = { x: 5, y: 5, z: 5 };
      const target = { x: 0, y: 0, z: 0 };
      const delta = -1; // Zoom out

      const result = calculateZoom(cameraPos, target, delta);

      // Distance should increase
      expect(result.distance).toBeGreaterThan(calculateDistance(cameraPos, target));
    });

    it('should clamp to minimum distance', () => {
      const cameraPos = { x: 1, y: 1, z: 1 };
      const target = { x: 0, y: 0, z: 0 };
      const delta = 10; // Zoom in a lot
      const minDistance = 0.5;
      const maxDistance = 50;

      const result = calculateZoom(cameraPos, target, delta, minDistance, maxDistance);

      // Should not go below minimum
      expect(result.distance).toBeGreaterThanOrEqual(minDistance);
    });

    it('should clamp to maximum distance', () => {
      const cameraPos = { x: 10, y: 10, z: 10 };
      const target = { x: 0, y: 0, z: 0 };
      const delta = -10; // Zoom out a lot
      const minDistance = 0.5;
      const maxDistance = 50;

      const result = calculateZoom(cameraPos, target, delta, minDistance, maxDistance);

      // Should not exceed maximum
      expect(result.distance).toBeLessThanOrEqual(maxDistance);
    });

    it('should maintain camera-target direction', () => {
      const cameraPos = { x: 5, y: 3, z: 4 };
      const target = { x: 0, y: 0, z: 0 };
      const delta = 1;

      const result = calculateZoom(cameraPos, target, delta);

      // Direction should be maintained (proportional)
      const originalRatio = cameraPos.x / cameraPos.y;
      const newRatio = result.position.x / result.position.y;
      expect(newRatio).toBeCloseTo(originalRatio, 5);
    });
  });

  describe('calculateDistance', () => {
    it('should calculate correct distance', () => {
      const pos1 = { x: 0, y: 0, z: 0 };
      const pos2 = { x: 3, y: 4, z: 0 };

      const distance = calculateDistance(pos1, pos2);

      expect(distance).toBe(5); // 3-4-5 triangle
    });

    it('should work in 3D', () => {
      const pos1 = { x: 0, y: 0, z: 0 };
      const pos2 = { x: 1, y: 1, z: 1 };

      const distance = calculateDistance(pos1, pos2);

      expect(distance).toBeCloseTo(Math.sqrt(3), 5);
    });

    it('should return 0 for same position', () => {
      const pos = { x: 5, y: 5, z: 5 };

      const distance = calculateDistance(pos, pos);

      expect(distance).toBe(0);
    });
  });

  describe('isSameCameraState', () => {
    it('detects equivalent camera states', () => {
      const camera = {
        position: { x: 5, y: 5, z: 5 },
        target: { x: 0, y: 0, z: 0 },
        up: { x: 0, y: 1, z: 0 },
        fov: 75,
        zoom: 1,
        near: 0.1,
        far: 1000,
      };

      expect(isSameCameraState(camera, { ...camera, position: { ...camera.position } })).toBe(true);
    });
  });
});
