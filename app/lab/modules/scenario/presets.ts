import { CameraState, DEFAULT_CAMERA } from '../../types/camera.types';
import { Vector3D } from '../../types/common.types';
import { DEFAULT_ENVIRONMENT, Environment } from '../../types/environment.types';
import { CreateSourceParams, DEFAULT_RF_SOURCE, RFSource } from '../../types/source.types';
import { DEFAULT_VISUALIZATION, VisualizationSettings } from '../../types/visualization.types';
import { getSourceColor } from '../../lib/visualization-helpers';

export type ScenarioPresetId =
  | 'clean-vacuum'
  | 'metal-barrier-reflection'
  | 'dense-wall-attenuation'
  | 'dual-source-interference'
  | 'noisy-electronics'
  | 'atmospheric-scatter'
  | 'medium-transition'
  | 'polarization-showcase';

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
    },
    camera: DEFAULT_CAMERA,
    environment: DEFAULT_ENVIRONMENT,
  },
  {
    id: 'metal-barrier-reflection',
    name: 'Metal Barrier Reflection',
    description: 'Conceptual reflective scenario with a strong return wave and source symmetry.',
    sources: [
      source('Emitter A', { x: -3, y: 1.5, z: 0 }, { power: 0.15 }),
      source('Reflection Cue', { x: 3, y: 1.5, z: 0 }, { power: 0.08, phase: Math.PI }),
    ],
    settings: {
      animateFields: true,
      animationSpeed: 0.9,
      showGrid: true,
      lod: 'medium',
    },
  },
  {
    id: 'dense-wall-attenuation',
    name: 'Dense Wall Attenuation',
    description: 'A higher-loss region concept where the visible field softens across the scene.',
    sources: [source('Emitter A', { x: -2.5, y: 1.5, z: 0 }, { power: 0.12 })],
    settings: {
      animateFields: true,
      animationSpeed: 0.85,
      showGrid: true,
      lod: 'medium',
      colorScheme: 'monochrome',
    },
  },
  {
    id: 'dual-source-interference',
    name: 'Dual Source Interference',
    description: 'Two emitters with phase offset to emphasize constructive and destructive overlap.',
    sources: [
      source('Emitter A', { x: -2.2, y: 1.5, z: 0 }, { power: 0.12, phase: 0 }),
      source('Emitter B', { x: 2.2, y: 1.5, z: 0 }, { power: 0.12, phase: Math.PI }),
    ],
    settings: {
      animateFields: true,
      animationSpeed: 1,
      showGrid: true,
      lod: 'high',
    },
  },
  {
    id: 'noisy-electronics',
    name: 'Noisy Electronics Environment',
    description: 'A cluttered, slightly unstable scene with small phase and amplitude variation.',
    sources: [
      source('Emitter A', { x: 0, y: 1.5, z: 0 }, { power: 0.1 }),
      source('Noise Source', { x: 1.5, y: 1.2, z: -1.5 }, { power: 0.04, phase: Math.PI / 3 }),
    ],
    settings: {
      animateFields: true,
      animationSpeed: 1.15,
      showGrid: true,
      lod: 'medium',
      colorScheme: 'rainbow',
    },
  },
  {
    id: 'atmospheric-scatter',
    name: 'Atmospheric Scatter',
    description: 'Multiple low-power sources create a diffuse, slightly scattered reading.',
    sources: [
      source('Emitter A', { x: -3, y: 1.5, z: -1.5 }, { power: 0.08 }),
      source('Scatter B', { x: 2.2, y: 1.4, z: 1.2 }, { power: 0.05, phase: 0.7 }),
      source('Scatter C', { x: 1, y: 1.8, z: -2.2 }, { power: 0.04, phase: 1.4 }),
    ],
    settings: {
      animateFields: true,
      animationSpeed: 0.95,
      showGrid: true,
      lod: 'medium',
    },
  },
  {
    id: 'medium-transition',
    name: 'Medium Transition',
    description: 'A simplified medium-change cue that shifts apparent propagation spacing.',
    sources: [
      source('Emitter A', { x: -2.5, y: 1.5, z: 0 }, { power: 0.1 }),
      source('Transition Cue', { x: 2.5, y: 1.5, z: 0 }, { power: 0.08, phase: 0.5 }),
    ],
    settings: {
      animateFields: true,
      animationSpeed: 0.9,
      showGrid: true,
      lod: 'medium',
    },
  },
  {
    id: 'polarization-showcase',
    name: 'Polarization Showcase',
    description: 'A comparison-oriented setup for visualizing polarization concepts in a disturbed scene.',
    sources: [
      source('Linear Cue', { x: -2.2, y: 1.5, z: 0 }, { power: 0.1 }),
      source('Orthogonal Cue', { x: 2.2, y: 1.5, z: 0 }, { power: 0.1, phase: Math.PI / 2 }),
    ],
    settings: {
      animateFields: true,
      animationSpeed: 1,
      showGrid: true,
      lod: 'high',
      colorScheme: 'rainbow',
    },
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
