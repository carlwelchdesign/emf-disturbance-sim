/**
 * Camera control hook for mouse-based 3D navigation
 * Handles orbit, pan, and zoom interactions
 */

import { useCallback, useEffect, useRef, MouseEvent as ReactMouseEvent } from 'react';
import { useLabStore } from './useLabStore';
import { calculateOrbit, calculatePan, calculateZoom, calculateDistance } from '../lib/camera-helpers';
import { CameraState } from '../types/camera.types';

/**
 * Mouse button constants
 */
const MOUSE_BUTTONS = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2,
} as const;
const CAMERA_EPSILON = 1e-9;

/**
 * Camera control modes
 */
type ControlMode = 'orbit' | 'pan' | 'none';

/**
 * Hook return type
 */
interface UseCameraControlsReturn {
  onMouseDown: (e: ReactMouseEvent) => void;
  onMouseMove: (e: ReactMouseEvent) => void;
  onMouseUp: () => void;
  onWheel: (e: WheelLikeEvent) => void;
  resetCamera: () => void;
}

/**
 * Custom hook for camera controls
 * Provides mouse event handlers for orbit, pan, and zoom
 */
export function useCameraControls(): UseCameraControlsReturn {
  const camera = useLabStore((state) => state.camera);
  const updateCamera = useLabStore((state) => state.updateCamera);
  const storeResetCamera = useLabStore((state) => state.resetCamera);

  // Track interaction state
  const controlModeRef = useRef<ControlMode>('none');
  const lastMousePos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const cameraRef = useRef<CameraState>(camera);

  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  const publishCamera = useCallback(
    (nextCamera: Partial<CameraState>) => {
      const currentCamera = cameraRef.current;
      const mergedCamera = { ...currentCamera, ...nextCamera };
      const nearlyEqual = (left: number, right: number) => Math.abs(left - right) <= CAMERA_EPSILON;

      const hasChanged =
        !nearlyEqual(mergedCamera.position.x, currentCamera.position.x) ||
        !nearlyEqual(mergedCamera.position.y, currentCamera.position.y) ||
        !nearlyEqual(mergedCamera.position.z, currentCamera.position.z) ||
        !nearlyEqual(mergedCamera.target.x, currentCamera.target.x) ||
        !nearlyEqual(mergedCamera.target.y, currentCamera.target.y) ||
        !nearlyEqual(mergedCamera.target.z, currentCamera.target.z) ||
        !nearlyEqual(mergedCamera.up.x, currentCamera.up.x) ||
        !nearlyEqual(mergedCamera.up.y, currentCamera.up.y) ||
        !nearlyEqual(mergedCamera.up.z, currentCamera.up.z) ||
        !nearlyEqual(mergedCamera.fov, currentCamera.fov) ||
        !nearlyEqual(mergedCamera.zoom, currentCamera.zoom) ||
        !nearlyEqual(mergedCamera.near, currentCamera.near) ||
        !nearlyEqual(mergedCamera.far, currentCamera.far);

      if (!hasChanged) {
        return;
      }

      updateCamera(nextCamera);
    },
    [updateCamera]
  );

  /**
   * Handle mouse down - start orbit or pan
   */
  const onMouseDown = useCallback((e: ReactMouseEvent) => {
    // Prevent default to avoid text selection
    e.preventDefault();
    
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    
    // Determine control mode based on button
    if (e.button === MOUSE_BUTTONS.LEFT) {
      controlModeRef.current = 'orbit';
    } else if (e.button === MOUSE_BUTTONS.RIGHT || e.button === MOUSE_BUTTONS.MIDDLE) {
      controlModeRef.current = 'pan';
    }
  }, []);

  /**
   * Handle mouse move - perform orbit or pan
   */
  const onMouseMove = useCallback((e: ReactMouseEvent) => {
    if (!isDragging.current || controlModeRef.current === 'none') {
      return;
    }

    e.preventDefault();

    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    // Sensitivity factors
    const orbitSensitivity = 0.005; // Radians per pixel
    const panSensitivity = 1.0; // Units per pixel

    if (controlModeRef.current === 'orbit') {
      // Orbit around target
      const result = calculateOrbit(
        cameraRef.current.position,
        cameraRef.current.target,
        -deltaX * orbitSensitivity,
        -deltaY * orbitSensitivity
      );

      publishCamera({ position: result.position });
    } else if (controlModeRef.current === 'pan') {
      // Pan camera and target together
      const distance = calculateDistance(cameraRef.current.position, cameraRef.current.target);
      const result = calculatePan(
        cameraRef.current.position,
        cameraRef.current.target,
        deltaX * panSensitivity,
        deltaY * panSensitivity,
        distance
      );

      publishCamera({
        position: result.position,
        target: result.target,
      });
    }
  }, [publishCamera]);

  /**
   * Handle mouse up - end interaction
   */
  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    controlModeRef.current = 'none';
  }, []);

  /**
   * Handle wheel - zoom in/out
   */
  const onWheel = useCallback((e: WheelLikeEvent) => {
    // Normalize wheel delta (different browsers use different scales)
    const delta = e.deltaY > 0 ? 1 : -1;

    const result = calculateZoom(
      cameraRef.current.position,
      cameraRef.current.target,
      delta,
      0.5,  // Min distance
      50    // Max distance
    );

    publishCamera({ position: result.position });
  }, [publishCamera]);

  /**
   * Reset camera to default position
   */
  const resetCamera = useCallback(() => {
    storeResetCamera();
  }, [storeResetCamera]);

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel,
    resetCamera,
  };
}
interface WheelLikeEvent {
  deltaY: number;
  preventDefault: () => void;
}
