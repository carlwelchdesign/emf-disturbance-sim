/**
 * Camera control hook for mouse-based 3D navigation
 * Handles orbit, pan, and zoom interactions
 */

import { useCallback, useRef, MouseEvent as ReactMouseEvent } from 'react';
import { useLabStore } from './useLabStore';
import { calculateOrbit, calculatePan, calculateZoom, calculateDistance } from '../lib/camera-helpers';

/**
 * Mouse button constants
 */
const MOUSE_BUTTONS = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2,
} as const;

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
  const { camera, updateCamera, resetCamera: storeResetCamera } = useLabStore();
  
  // Track interaction state
  const controlModeRef = useRef<ControlMode>('none');
  const lastMousePos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

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

    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    // Sensitivity factors
    const orbitSensitivity = 0.005; // Radians per pixel
    const panSensitivity = 1.0; // Units per pixel

    if (controlModeRef.current === 'orbit') {
      // Orbit around target
      const result = calculateOrbit(
        camera.position,
        camera.target,
        -deltaX * orbitSensitivity,
        -deltaY * orbitSensitivity
      );
      
      updateCamera({
        position: result.position,
      });
    } else if (controlModeRef.current === 'pan') {
      // Pan camera and target together
      const distance = calculateDistance(camera.position, camera.target);
      const result = calculatePan(
        camera.position,
        camera.target,
        deltaX * panSensitivity,
        deltaY * panSensitivity,
        distance
      );
      
      updateCamera({
        position: result.position,
        target: result.target,
      });
    }
  }, [camera, updateCamera]);

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
      camera.position,
      camera.target,
      delta,
      0.5,  // Min distance
      50    // Max distance
    );
    
    updateCamera({
      position: result.position,
    });
  }, [camera, updateCamera]);

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
