'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLabStore } from '../../hooks/useLabStore';
import { useFieldCalculator } from '../../hooks/useFieldCalculator';
import { computeFactionMetrics } from '../../lib/field-math';
import { DroneState, DroneStatus } from '../../types/drone.types';

const STATUS_COLORS: Record<DroneStatus, string> = {
  nominal: '#00FF88',
  degraded: '#FFAA00',
  jammed: '#FF2200',
};

/** Procedural drone geometry: flat body + 4 diagonal arms + 4 disc rotors */
function DroneMesh({ color }: { color: string }) {
  const rotorRefs = useRef<THREE.Mesh[]>([]);

  useFrame((_, delta) => {
    rotorRefs.current.forEach((rotor, i) => {
      if (rotor) rotor.rotation.y += delta * (i % 2 === 0 ? 18 : -18);
    });
  });

  const armPositions: [number, number, number][] = [
    [0.28, 0, 0.28],
    [-0.28, 0, 0.28],
    [-0.28, 0, -0.28],
    [0.28, 0, -0.28],
  ];

  return (
    <group>
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.28, 0.08, 0.28]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      {/* Arms + rotors */}
      {armPositions.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          {/* Arm */}
          <mesh rotation={[0, (Math.PI / 4) * (i % 2 === 0 ? 1 : -1) + Math.PI / 4, 0]}>
            <boxGeometry args={[0.38, 0.025, 0.04]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
          </mesh>
          {/* Rotor disc */}
          <mesh
            ref={(el) => { if (el) rotorRefs.current[i] = el; }}
            position={[0, 0.04, 0]}
          >
            <cylinderGeometry args={[0.14, 0.14, 0.01, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.6}
              transparent
              opacity={0.55}
            />
          </mesh>
        </group>
      ))}
      {/* Downward status light */}
      <pointLight color={color} intensity={0.6} distance={1.5} position={[0, -0.1, 0]} />
    </group>
  );
}

export interface DroneMarkerProps {
  drone: DroneState;
}

/**
 * Animates a drone along its waypoint patrol path inside the R3F canvas.
 * Position is tracked via refs for smooth 60 fps motion; Zustand is updated
 * every ~30 frames so analysis panels stay current without thrashing renders.
 */
export function DroneMarker({ drone }: DroneMarkerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const animRef = useRef({
    segment: drone.currentSegment,
    progress: drone.segmentProgress,
  });
  const frameCount = useRef(0);

  const sources = useLabStore((state) => state.sources);
  const updateDroneState = useLabStore((state) => state.updateDroneState);
  const { calculateFieldAtPoint } = useFieldCalculator();

  // Keep animRef in sync if the store resets (e.g. preset reload)
  useEffect(() => {
    animRef.current.segment = drone.currentSegment;
    animRef.current.progress = drone.segmentProgress;
  }, [drone.currentSegment, drone.segmentProgress]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current || drone.waypoints.length < 2) return;

    const { waypoints, speed } = drone;
    const anim = animRef.current;

    // Compute the world-space length of the current segment so speed is consistent
    const segA = waypoints[anim.segment];
    const segB = waypoints[(anim.segment + 1) % waypoints.length];
    const dx = segB.position.x - segA.position.x;
    const dy = segB.position.y - segA.position.y;
    const dz = segB.position.z - segA.position.z;
    const segLen = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

    anim.progress += (speed * delta) / segLen;

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

    // Face the direction of travel
    const fwd = new THREE.Vector3(
      curB.position.x - curA.position.x,
      0,
      curB.position.z - curA.position.z
    );
    if (fwd.lengthSq() > 0.001) {
      groupRef.current.rotation.y = Math.atan2(fwd.x, fwd.z);
    }

    // Update store every 30 frames (~2 Hz) for analysis panels
    frameCount.current++;
    if (frameCount.current >= 30) {
      frameCount.current = 0;
      const pos = { x: px, y: py, z: pz };
      const time = clock.getElapsedTime();
      const metrics = computeFactionMetrics(pos, sources, time, calculateFieldAtPoint);
      const hostile = metrics.eFieldHostile;
      const status =
        hostile >= drone.disruptionThreshold * 2
          ? 'jammed'
          : hostile >= drone.disruptionThreshold
          ? 'degraded'
          : 'nominal';

      updateDroneState(drone.id, {
        position: pos,
        currentSegment: anim.segment,
        segmentProgress: anim.progress,
        fieldAtDrone: metrics,
        status,
      });
    }
  });

  const color = STATUS_COLORS[drone.status];

  return (
    <group ref={groupRef} position={[drone.waypoints[0]?.position.x ?? 0, drone.waypoints[0]?.position.y ?? 1, drone.waypoints[0]?.position.z ?? 0]}>
      <DroneMesh color={color} />
    </group>
  );
}
