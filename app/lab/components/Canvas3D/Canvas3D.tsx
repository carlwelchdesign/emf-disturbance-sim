'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { ReactNode, memo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CameraState } from '../../types/camera.types';
import { isSameCameraState } from '../../lib/camera-helpers';
import { CameraControls } from './CameraControls';

export interface Canvas3DProps {
  /**
   * Camera configuration
   */
  camera?: CameraState;

  /**
   * Child components to render in 3D scene
   */
  children: ReactNode;

  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * Canvas3D wrapper component
 * Sets up React Three Fiber with proper camera and rendering
 * Includes responsive resize handling and WebGL context recovery
 */
export const Canvas3D = memo(function Canvas3D({ camera, children, className }: Canvas3DProps) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  return (
    <div className={className} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <CameraControls />
      <Canvas
        camera={{
          position: camera ? [camera.position.x, camera.position.y, camera.position.z] : [5, 5, 5],
          fov: camera?.fov || 75,
          near: camera?.near || 0.1,
          far: camera?.far || 1000,
        }}
        style={{ background: '#020617' }}
        resize={{ scroll: false, debounce: { scroll: 50, resize: 100 } }}
        dpr={[1, 2]} // Device pixel ratio for sharp rendering
        onCreated={({ gl }) => {
          cleanupRef.current?.();

          const handleContextLost = (event: Event) => {
            event.preventDefault();
            console.warn('WebGL context lost, attempting recovery...');
          };

          gl.domElement.addEventListener('webglcontextlost', handleContextLost);

          cleanupRef.current = () => {
            gl.domElement.removeEventListener('webglcontextlost', handleContextLost);
          };
        }}
        >
        <color attach="background" args={['#020617']} />
        <fog attach="fog" args={['#020617', 10, 30]} />

        {/* Ambient light for visibility */}
        <ambientLight intensity={0.5} />
        
        {/* Directional light for depth */}
        <directionalLight position={[10, 10, 10]} intensity={0.8} />

        <CameraSync camera={camera} />
        {children}
      </Canvas>
    </div>
  );
});

const CameraSync = memo(function CameraSync({ camera }: { camera?: CameraState }) {
  const { camera: sceneCamera } = useThree();
  const perspectiveCamera = sceneCamera as THREE.PerspectiveCamera;
  const lastAppliedCameraRef = useRef<CameraState | null>(null);

  useEffect(() => {
    if (!camera) {
      return;
    }

    if (
      !sceneCamera ||
      typeof (sceneCamera as THREE.Camera).position?.set !== 'function' ||
      typeof (sceneCamera as THREE.Camera).up?.set !== 'function' ||
      typeof perspectiveCamera.updateProjectionMatrix !== 'function' ||
      typeof (sceneCamera as THREE.Camera).lookAt !== 'function'
    ) {
      return;
    }

    if (lastAppliedCameraRef.current && isSameCameraState(lastAppliedCameraRef.current, camera)) {
      return;
    }

    sceneCamera.position.set(camera.position.x, camera.position.y, camera.position.z);
    sceneCamera.up.set(camera.up.x, camera.up.y, camera.up.z);
    perspectiveCamera.fov = camera.fov;
    perspectiveCamera.zoom = camera.zoom;
    perspectiveCamera.near = camera.near;
    perspectiveCamera.far = camera.far;
    sceneCamera.lookAt(camera.target.x, camera.target.y, camera.target.z);
    sceneCamera.updateProjectionMatrix();

    lastAppliedCameraRef.current = {
      position: { ...camera.position },
      target: { ...camera.target },
      up: { ...camera.up },
      fov: camera.fov,
      zoom: camera.zoom,
      near: camera.near,
      far: camera.far,
    };
  }, [camera, perspectiveCamera, sceneCamera]);

  return null;
});
