import { Vector3D } from './common.types';
import { FactionMetrics } from './field.types';

/** A single point on a drone's patrol path */
export interface Waypoint {
  position: Vector3D;
}

/** Operational status of a drone based on hostile field exposure */
export type DroneStatus = 'nominal' | 'degraded' | 'jammed';

/** RF emissions produced by the drone's own electronics (control link, video, motors) */
export interface DroneEmission {
  /** Primary emission frequency in Hz (e.g. 2.4e9 for control link) */
  frequency: number;
  power: number;
  powerUnit: 'watts' | 'dBm';
  /** Spectral bandwidth in Hz */
  bandwidthHz: number;
  /** Whether the drone is actively emitting */
  active: boolean;
}

/**
 * A dynamic object (drone or vehicle) that follows a looping waypoint patrol path.
 * Position is animated in the useFrame loop inside DroneMarker.
 * `fieldAtDrone` and position are written to the store every ~30 frames for panels.
 */
export interface DroneState {
  id: string;
  label: string;
  /** Faction of the drone itself (typically friendly) */
  faction: 'friendly' | 'hostile';
  /** Ordered patrol waypoints — path loops back to index 0 */
  waypoints: Waypoint[];
  /** Index of the segment currently being traversed (between waypoints[i] and waypoints[i+1]) */
  currentSegment: number;
  /** 0–1 interpolation progress along the current segment */
  segmentProgress: number;
  /** Travel speed in world units per second */
  speed: number;
  /** Last reported world-space position (updated ~10 Hz for smooth field source tracking) */
  position: Vector3D;
  /** Derived status from hostile field exposure */
  status: DroneStatus;
  /** Hostile field strength (V/m) at which status transitions to 'degraded' */
  disruptionThreshold: number;
  /** Live faction metrics at the drone's position, or null before first frame */
  fieldAtDrone: FactionMetrics | null;
  /** Optional self-emission config — when set the drone acts as a moving RF source */
  emission?: DroneEmission;
}

/** Parameters for creating a new drone (id and derived fields are auto-generated) */
export type CreateDroneParams = Omit<
  DroneState,
  'id' | 'currentSegment' | 'segmentProgress' | 'position' | 'status' | 'fieldAtDrone'
>;
