# Data Model

## Entities

| Entity | Fields | Notes |
|---|---|---|
| RFSource | id, position, frequency, bandwidthHz, power, powerUnit, phase, antennaType, orientation, gain, active, color, label, deviceType | Existing source model rendered in the scene |
| VisualizationSettings | fieldLineDensity, colorScheme, animationSpeed, animateFields, showFPS, showLabels, showGrid, lod, solverProfile, themeMode | Drives fidelity and presentation |
| PerformanceMetrics | currentFPS, averageFPS, isLowPerformance | Already used for adaptive quality and warnings |
| ScenarioPreset | id, name, description, sources, environment, settings, camera | Curated scene configuration |
| FieldVisualizationBand | sourceId, layerId, particleCount, geometry, config, lastRebuildKey | Internal render cache candidate for optimization |

## Relationships

- One `ScenarioPreset` creates many `RFSource` records plus optional camera/environment/settings overrides.
- One active `RFSource` can render into multiple `FieldVisualizationBand` layers.
- `PerformanceMetrics` influences `VisualizationSettings.lod` through the FPS monitor.

## Validation Rules

- Source count stays within the existing limit of 5 for the current lab mode.
- Field values and display cues must stay bounded so the scene remains readable.
- Empty active-source sets should render as stable no-field state instead of erroring.
- LOD and solver profile changes must not break the existing meaning of phase, overlap, or cancellation cues.

## State Transitions

- `ScenarioPreset` applied -> sources, camera, environment, and settings reset together.
- FPS drop -> performance metrics update -> LOD can step down automatically.
- Source toggle or update -> scenario becomes dirty.

