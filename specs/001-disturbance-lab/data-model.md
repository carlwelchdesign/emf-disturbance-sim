# Data Model: EMF Disturbance and Interference Lab

## Entities

### Source
- `id`
- `label`
- `position`
- `frequency`
- `power`
- `powerUnit`
- `phase`
- `antennaType`
- `gain`
- `active`
- `color`
- `deviceType`

**Rules**
- Frequency and power must remain within configured limits.
- Source state is the primary driver for field intensity and particle cadence.

### DisturbanceRegion
- `id`
- `type` (`reflection`, `attenuation`, `scattering`, `noise`, `refraction`)
- `position`
- `size`
- `strength`
- `enabled`

**Rules**
- Each region modifies the local field visualization and/or derived field response.
- Disturbance strength must be clamped to safe visual limits.

### ScenarioPreset
- `id`
- `name`
- `description`
- `sources`
- `disturbances`
- `camera`
- `settings`

**Rules**
- Presets must be reproducible and safe to apply at runtime.
- A preset can reset the scene or partially mutate the current scene.

### MeasurementPoint
- `id`
- `position`
- `fieldStrength`
- `powerDensity`
- `region`
- `timestamp`

**Rules**
- Measurement data is derived from the current source and environment state.
- Region labels should distinguish near-field and far-field contexts.

### VisualizationState
- `fieldLineDensity`
- `animationSpeed`
- `animateFields`
- `colorScheme`
- `lod`
- `showGrid`
- `themeMode`

**Rules**
- Visualization state controls how the EMF math is translated into motion and lighting.
- Motion should stay readable before it becomes dramatic.

### FieldInteractionFrame
- `sourceId`
- `particleCount`
- `brightness`
- `cadence`
- `localJitter`
- `interactionWeight`

**Rules**
- Derived from the math layer, not stored as primary user state.
- Used to map source overlap into subtle particle response.

## Relationships

- One `ScenarioPreset` contains many `Source` and `DisturbanceRegion` entries.
- One `Source` can influence many `MeasurementPoint` records.
- `VisualizationState` affects all rendered field entities.
- `FieldInteractionFrame` is derived from `Source` plus disturbance state.

## State Transitions

- `Source`: active -> inactive -> active
- `DisturbanceRegion`: enabled -> disabled -> enabled
- `ScenarioPreset`: previewed -> applied -> modified
- `MeasurementPoint`: created -> updated as sources move -> removed

