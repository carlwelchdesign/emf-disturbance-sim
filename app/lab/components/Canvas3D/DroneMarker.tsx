'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useLabStore } from '../../hooks/useLabStore';
import { useFieldCalculator } from '../../hooks/useFieldCalculator';
import { computeFactionMetrics } from '../../lib/field-math';
import { DroneState, DroneStatus } from '../../types/drone.types';

const MODEL_PATH = '/models/Drone_RQ-180-optimized.glb';

// Model exported in cm; 162.5 units wide → scale to 0.5 world-units
const DRONE_SCALE = 0.02;
const DRONE_VISUAL_SPEED_MULTIPLIER = 1.6;
const POSITION_PUSH_INTERVAL_SEC = 0.1;
const METRICS_PUSH_INTERVAL_SEC = 0.5;

const STATUS_COLORS: Record<DroneStatus, string> = {
  nominal: '#00FF88',
  degraded: '#FFAA00',
  jammed: '#FF2200',
};

export interface DroneMarkerProps {
  drone: DroneState;
}

export function DroneMarker({ drone }: DroneMarkerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const animRef = useRef({ segment: drone.currentSegment, progress: drone.segmentProgress });
  const pushTimersRef = useRef({ position: 0, metrics: 0 });
  const forwardRef = useRef(new THREE.Vector3());

  const { scene } = useGLTF(MODEL_PATH);
  const sources = useLabStore((s) => s.sources);
  const updateDroneState = useLabStore((s) => s.updateDroneState);
  const { calculateFieldAtPoint } = useFieldCalculator();

  // Scale and tint the shared scene directly — it's the object drei renders.
  // Also strip out unwanted objects baked into the GLB (ground plane, extra drone, missiles).
  useEffect(() => {
    scene.scale.setScalar(DRONE_SCALE);
    scene.rotation.y = Math.PI / 2; // align model nose to flight direction

    // Names to remove (top-level objects from GLB that aren't the main drone)
    const REMOVE_NAMES = new Set([
      'Ground_Plane_mirror',
      'RQ-180_2',
      'AGM-154_JSOW',
      'AGM65_Maverick',
      'MBDA_Brimstone',
    ]);
    const toRemove = scene.children.filter((c: THREE.Object3D) => REMOVE_NAMES.has(c.name));
    toRemove.forEach((c: THREE.Object3D) => scene.remove(c));

    const emissiveColor = new THREE.Color(STATUS_COLORS[drone.status]);
    scene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat) => {
          if (mat instanceof THREE.MeshStandardMaterial) {
            mat.emissive = emissiveColor;
            mat.emissiveIntensity = 0.35;
          }
        });
      }
    });
  }, [scene, drone.status]);

  useEffect(() => {
    animRef.current.segment = drone.currentSegment;
    animRef.current.progress = drone.segmentProgress;
  }, [drone.currentSegment, drone.segmentProgress]);

  const animationSpeed = useLabStore((s) => s.settings.animationSpeed);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current || drone.waypoints.length < 2) return;

    const { waypoints, speed } = drone;
    const anim = animRef.current;
    const timers = pushTimersRef.current;
    const dt = Math.min(delta, 0.05);

    const segA = waypoints[anim.segment];
    const segB = waypoints[(anim.segment + 1) % waypoints.length];
    const dx = segB.position.x - segA.position.x;
    const dy = segB.position.y - segA.position.y;
    const dz = segB.position.z - segA.position.z;
    const segLen = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

    anim.progress += (speed * dt * animationSpeed * DRONE_VISUAL_SPEED_MULTIPLIER) / segLen;
    if (anim.progress >= 1) {
      anim.progress -= 1;
      anim.segment = (anim.segment + 1) % waypoints.length;
    }

    const t = anim.progress;
    const curA = waypoints[anim.segment];
    const curB = waypoints[(anim.segment + 1) % waypoints.length];
    const px = curA.position.x + (curB.position.x - curA.position.x) * t;
    const py = curA.position.y + (curB.position.y - curA.position.y) * t;
    const pz = curA.position.z + (curB.position.z - curA.position.z) * t;

    groupRef.current.position.set(px, py, pz);

    const fwd = forwardRef.current.set(curB.position.x - curA.position.x, 0, curB.position.z - curA.position.z);
    if (fwd.lengthSq() > 0.001) {
      groupRef.current.rotation.y = Math.atan2(fwd.x, fwd.z);
    }

    timers.position += dt;
    timers.metrics += dt;

    // Push position at ~10 Hz so derived emission sources track the drone smoothly
    if (timers.position >= POSITION_PUSH_INTERVAL_SEC) {
      timers.position = 0;
      const pos = { x: px, y: py, z: pz };
      updateDroneState(drone.id, { position: pos });
    }

    // Full metrics update at ~2 Hz (expensive field calculation)
    if (timers.metrics >= METRICS_PUSH_INTERVAL_SEC) {
      timers.metrics = 0;
      const pos = { x: px, y: py, z: pz };
      const time = clock.getElapsedTime();
      const metrics = computeFactionMetrics(pos, sources, time, calculateFieldAtPoint);
      const hostile = metrics.eFieldHostile;
      const status =
        hostile >= drone.disruptionThreshold * 2 ? 'jammed'
        : hostile >= drone.disruptionThreshold ? 'degraded'
        : 'nominal';
      updateDroneState(drone.id, { currentSegment: anim.segment, segmentProgress: anim.progress, fieldAtDrone: metrics, status });
    }
  });

  return (
    <group
      ref={groupRef}
      position={[
        drone.waypoints[0]?.position.x ?? 0,
        drone.waypoints[0]?.position.y ?? 1,
        drone.waypoints[0]?.position.z ?? 0,
      ]}
    >
      <primitive object={scene} />
      <pointLight color={STATUS_COLORS[drone.status]} intensity={0.6} distance={1.5} position={[0, -0.1, 0]} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
