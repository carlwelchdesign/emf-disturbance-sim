import { CameraState, DEFAULT_CAMERA } from '../../types/camera.types';
import { Vector3D } from '../../types/common.types';
import { DEFAULT_ENVIRONMENT, Environment } from '../../types/environment.types';
import { CreateSourceParams, DEFAULT_RF_SOURCE, RFSource } from '../../types/source.types';
import { DEFAULT_VISUALIZATION, VisualizationSettings } from '../../types/visualization.types';
import { CreateDroneParams } from '../../types/drone.types';
import { getSourceColor } from '../../lib/visualization-helpers';

export type ScenarioPresetId =
  | 'clean-vacuum'
  | 'metal-barrier-reflection'
  | 'dense-wall-attenuation'
  | 'dual-source-interference'
  | 'noisy-electronics'
  | 'atmospheric-scatter'
  | 'medium-transition'
  | 'polarization-showcase'
  | 'ew-drone-patrol'
  | 'engineering-multiband';

export interface ScenarioSourceTemplate extends Partial<CreateSourceParams> {
  label: string;
  position: Vector3D;
}

export interface ScenarioPreset {
  id: ScenarioPresetId;
  name: string;
  description: string;
  sources: ScenarioSourceTemplate[];
  environment?: Partial<Environment>;
  settings?: Partial<VisualizationSettings>;
  camera?: Partial<CameraState>;
  /** Optional drones to spawn when this preset is loaded */
  drones?: CreateDroneParams[];
}

function source(label: string, position: Vector3D, overrides: Partial<CreateSourceParams> = {}): ScenarioSourceTemplate {
  return {
    label,
    position,
    ...overrides,
  };
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'clean-vacuum',
    name: 'Clean Vacuum Propagation',
    description: 'Baseline single-source propagation with no deliberate disturbance.',
    sources: [source('Emitter A', { x: 0, y: 1.5, z: 0 })],
      settings: {
        ...DEFAULT_VISUALIZATION,
        animateFields: true,
        animationSpeed: 1,
        showGrid: true,
        lod: 'high',
        interferenceProfile: 'balanced',
      },
    camera: DEFAULT_CAMERA,
    environment: DEFAULT_ENVIRONMENT,
  },
  {
    id: 'metal-barrier-reflection',
    name: 'Metal Barrier Reflection',
    description: 'Two emitters frame a conceptual reflective return so the reversal and phase shift are easy to see.',
    sources: [
      source('Emitter A', { x: -3, y: 1.5, z: 0 }, { power: 0.15, bandwidthHz: 120e6 }),
      source('Reflection Cue', { x: 3, y: 1.5, z: 0 }, { power: 0.08, phase: Math.PI, bandwidthHz: 90e6 }),
    ],
    settings: {
      animateFields: true,
      animationSpeed: 0.9,
      showGrid: true,
      lod: 'medium',
      interferenceProfile: 'balanced',
    },
  },
  {
    id: 'dense-wall-attenuation',
    name: 'Dense Wall Attenuation',
    description: 'A single emitter passes through a higher-loss region so the field visibly softens across the scene.',
    sources: [source('Emitter A', { x: -2.5, y: 1.5, z: 0 }, { power: 0.12, bandwidthHz: 180e6 })],
    settings: {
      animateFields: true,
      animationSpeed: 0.85,
      showGrid: true,
      lod: 'medium',
      colorScheme: 'monochrome',
      interferenceProfile: 'balanced',
    },
  },
  {
    id: 'dual-source-interference',
    name: 'Dual Source Interference',
    description: 'Two emitters with phase offset emphasize constructive and destructive overlap in a compact study.',
    sources: [
      source('Emitter A', { x: -2.2, y: 1.5, z: 0 }, { power: 0.12, phase: 0 }),
      source('Emitter B', { x: 2.2, y: 1.5, z: 0 }, { power: 0.12, phase: Math.PI, bandwidthHz: 60e6 }),
    ],
    settings: {
      animateFields: true,
      animationSpeed: 1,
      showGrid: true,
      lod: 'high',
      interferenceProfile: 'balanced',
    },
  },
  {
    id: 'noisy-electronics',
    name: 'Noisy Electronics Environment',
    description: 'Three emitters add jitter, amplitude variation, and spectral clutter to show noisy field instability.',
    sources: [
      source('Emitter A', { x: 0, y: 1.5, z: 0 }, { power: 0.1, bandwidthHz: 160e6 }),
      source('Noise Source', { x: 1.5, y: 1.2, z: -1.5 }, { power: 0.04, phase: Math.PI / 3, bandwidthHz: 220e6 }),
      source('Jitter Node', { x: -1.6, y: 1.3, z: 1.4 }, { power: 0.03, phase: Math.PI / 2, bandwidthHz: 260e6 }),
    ],
    settings: {
      animateFields: true,
      animationSpeed: 1.15,
      showGrid: true,
      lod: 'medium',
      colorScheme: 'rainbow',
      interferenceProfile: 'balanced',
    },
  },
  {
    id: 'atmospheric-scatter',
    name: 'Atmospheric Scatter',
    description: 'Four low-power emitters create a diffuse, slightly scattered reading with reduced coherence.',
    sources: [
      source('Emitter A', { x: -3, y: 1.5, z: -1.5 }, { power: 0.08, bandwidthHz: 140e6 }),
      source('Scatter B', { x: 2.2, y: 1.4, z: 1.2 }, { power: 0.05, phase: 0.7, bandwidthHz: 180e6 }),
      source('Scatter C', { x: 1, y: 1.8, z: -2.2 }, { power: 0.04, phase: 1.4, bandwidthHz: 220e6 }),
      source('Scatter D', { x: -0.8, y: 1.6, z: 2.1 }, { power: 0.035, phase: 2.2, bandwidthHz: 260e6 }),
    ],
    settings: {
      animateFields: true,
      animationSpeed: 0.95,
      showGrid: true,
      lod: 'medium',
      interferenceProfile: 'balanced',
    },
  },
  {
    id: 'medium-transition',
    name: 'Medium Transition',
    description: 'Three emitters demonstrate how apparent propagation spacing changes across a medium transition.',
    sources: [
      source('Emitter A', { x: -2.5, y: 1.5, z: 0 }, { power: 0.1, bandwidthHz: 100e6 }),
      source('Transition Cue', { x: 2.5, y: 1.5, z: 0 }, { power: 0.08, phase: 0.5, bandwidthHz: 140e6 }),
      source('Transition Echo', { x: 0, y: 1.5, z: 2 }, { power: 0.04, phase: 1.2, bandwidthHz: 180e6 }),
    ],
    settings: {
      animateFields: true,
      animationSpeed: 0.9,
      showGrid: true,
      lod: 'medium',
      interferenceProfile: 'balanced',
    },
  },
  {
    id: 'polarization-showcase',
    name: 'Polarization Showcase',
    description: 'Five emitters compare polarization concepts in a disturbed scene with distinct directional cues.',
    sources: [
      source('Linear Cue', { x: -2.2, y: 1.5, z: 0 }, { power: 0.1, bandwidthHz: 70e6 }),
      source('Orthogonal Cue', { x: 2.2, y: 1.5, z: 0 }, { power: 0.1, phase: Math.PI / 2, bandwidthHz: 70e6 }),
      source('Cross Cue', { x: 0, y: 1.5, z: 2 }, { power: 0.08, phase: Math.PI / 4, bandwidthHz: 120e6 }),
      source('Diagonal Cue', { x: 0, y: 1.5, z: -2 }, { power: 0.08, phase: (3 * Math.PI) / 4, bandwidthHz: 120e6 }),
      source('Reference Cue', { x: 0, y: 2.3, z: 0 }, { power: 0.06, phase: Math.PI / 6, bandwidthHz: 160e6 }),
    ],
    settings: {
      animateFields: true,
      animationSpeed: 1,
      showGrid: true,
      lod: 'high',
      colorScheme: 'rainbow',
      interferenceProfile: 'balanced',
    },
  },
  {
    id: 'ew-drone-patrol',
    name: 'EW — Drone Patrol vs Jammer',
    description:
      'A friendly drone circles a hostile ground jammer. Watch signal degradation as the drone enters the disruption zone.',
    sources: [
      source('Ground Jammer', { x: 0, y: 0.5, z: 0 }, { power: 5, frequency: 5.8e9, bandwidthHz: 200e6, faction: 'hostile' }),
      source('Drone Comms Link', { x: 4, y: 1.5, z: 0 }, { power: 0.1, frequency: 2.4e9, bandwidthHz: 80e6, faction: 'friendly' }),
    ],
    settings: {
      animateFields: true,
      animationSpeed: 1.0,
      showGrid: true,
      lod: 'high',
      colorScheme: 'thermal',
      showThreatMetrics: true,
      showEmitterInteractions: true,
      showFieldChart: true,
      showFlightPaths: true,
      interferenceProfile: 'balanced',
    },
    camera: {
      position: { x: 0, y: 10, z: 8 },
      target: { x: 0, y: 0, z: 0 },
      up: { x: 0, y: 1, z: 0 },
      fov: 65,
      zoom: 1,
      near: 0.1,
      far: 1000,
    },
    drones: [
      {
        label: 'Recon Drone',
        faction: 'friendly',
        speed: 0.35,
        disruptionThreshold: 0.8,
        emission: {
          frequency: 2.4e9,
          power: 0.1,
          powerUnit: 'watts',
          bandwidthHz: 80e6,
          active: true,
        },
        waypoints: [
          { position: { x: 4, y: 1.5, z: 0 } },
          { position: { x: 2.83, y: 1.5, z: 2.83 } },
          { position: { x: 0, y: 1.5, z: 4 } },
          { position: { x: -2.83, y: 1.5, z: 2.83 } },
          { position: { x: -4, y: 1.5, z: 0 } },
          { position: { x: -2.83, y: 1.5, z: -2.83 } },
          { position: { x: 0, y: 1.5, z: -4 } },
          { position: { x: 2.83, y: 1.5, z: -2.83 } },
        ],
      },
    ],
  },
  {
    id: 'engineering-multiband',
    name: 'Engineering — Multi-Band RF Environment',
    description:
      'A drone sweeps through a cluttered spectrum: a friendly Wi-Fi AP competes with LTE and Bluetooth interference sources.',
    sources: [
      source('Wi-Fi AP', { x: -4, y: 1.5, z: 0 }, { power: 0.1, frequency: 5.0e9, bandwidthHz: 80e6, faction: 'friendly' }),
      source('LTE Interference', { x: 3, y: 1.5, z: 0 }, { power: 1.5, frequency: 1.8e9, bandwidthHz: 20e6, faction: 'hostile' }),
      source('BT Noise', { x: 0, y: 1.5, z: 3 }, { power: 0.02, frequency: 2.4e9, bandwidthHz: 1e6, faction: 'hostile' }),
    ],
    settings: {
      animateFields: true,
      animationSpeed: 1.0,
      showGrid: true,
      lod: 'high',
      colorScheme: 'rainbow',
      showThreatMetrics: true,
      showEmitterInteractions: true,
      showFieldChart: true,
      showFlightPaths: true,
      interferenceProfile: 'balanced',
    },
    camera: {
      position: { x: 0, y: 6, z: 10 },
      target: { x: 0, y: 1, z: 0 },
      up: { x: 0, y: 1, z: 0 },
      fov: 70,
      zoom: 1,
      near: 0.1,
      far: 1000,
    },
    drones: [
      {
        label: 'Survey Drone',
        faction: 'friendly',
        speed: 0.28,
        disruptionThreshold: 0.6,
        emission: {
          frequency: 5.8e9,
          power: 0.025,
          powerUnit: 'watts',
          bandwidthHz: 20e6,
          active: true,
        },
        waypoints: [
          { position: { x: -5, y: 1.5, z: 0 } },
          { position: { x: -2.5, y: 1.5, z: 0 } },
          { position: { x: 0, y: 1.5, z: 0 } },
          { position: { x: 2.5, y: 1.5, z: 0 } },
          { position: { x: 5, y: 1.5, z: 0 } },
          { position: { x: 2.5, y: 1.5, z: 0 } },
          { position: { x: 0, y: 1.5, z: 0 } },
          { position: { x: -2.5, y: 1.5, z: 0 } },
        ],
      },
    ],
  },
];

export function getScenarioPreset(id: ScenarioPresetId) {
  return SCENARIO_PRESETS.find((preset) => preset.id === id);
}

export function buildScenarioSources(preset: ScenarioPreset, nextId: () => string): RFSource[] {
  return preset.sources.map((template, index) => {
    const sourceColor = template.color ?? getSourceColor(index);

    return {
      id: nextId(),
      ...DEFAULT_RF_SOURCE,
      ...template,
      position: { ...template.position },
      color: sourceColor,
      label: template.label,
      active: template.active ?? true,
    };
  });
}
