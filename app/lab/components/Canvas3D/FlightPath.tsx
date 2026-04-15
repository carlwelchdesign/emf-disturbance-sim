'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { DroneState } from '../../types/drone.types';

// Extend R3F's JSX catalogue so <primitive> renders our Line correctly.
// We construct the Line manually to avoid the SVG <line> type conflict.


export interface FlightPathProps {
  drone: DroneState;
}

/**
 * Renders a drone's patrol path as a dashed CatmullRom curve with waypoint markers.
 * Only visible when showFlightPaths is enabled.
 */
export function FlightPath({ drone }: FlightPathProps) {
  const { waypoints, faction } = drone;
  const color = faction === 'hostile' ? '#FF3320' : '#00AAFF';

  const { lineObject, waypointPositions } = useMemo(() => {
    if (waypoints.length < 2) {
      return { lineObject: new THREE.Line(), waypointPositions: [] };
    }

    // Close the loop by appending the first waypoint at the end
    const pts = [...waypoints, waypoints[0]].map(
      (w) => new THREE.Vector3(w.position.x, w.position.y, w.position.z)
    );
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const points = curve.getPoints(waypoints.length * 12);
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 });

    return {
      lineObject: new THREE.Line(geo, mat),
      waypointPositions: waypoints.map((w) => [w.position.x, w.position.y, w.position.z] as [number, number, number]),
    };
  }, [waypoints, color]);

  return (
    <group>
      {/* Path — use primitive to avoid SVG <line> type conflict */}
      <primitive object={lineObject} />

      {/* Waypoint markers */}
      {waypointPositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}
