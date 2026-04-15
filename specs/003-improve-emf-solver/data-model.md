# Data Model: Improve EMF Solver Fidelity

## Entities

### RFSource

Represents a single emitter in the scene.

**Fields**
- `id`: unique source identifier
- `position`: 3D location
- `frequency`: center frequency
- `bandwidthHz`: spectral width
- `power`: emitted strength
- `powerUnit`: unit for power value
- `phase`: phase offset
- `antennaType`: omnidirectional, directional, or phased array
- `orientation`: preferred emission direction
- `gain`: linear gain factor
- `active`: whether the source contributes to the scene
- `color`: display identity
- `label`: human-readable name
- `deviceType`: optional device hint

**Rules**
- Frequency, bandwidth, and power must stay within configured bounds.
- Phase must stay normalized.
- Inactive sources do not contribute to the field.

### FieldPoint

Represents the field result at one sampled position.

**Fields**
- `position`: sampled location
- `strength`: combined field magnitude
- `phase`: dominant phase
- `eField`: combined electric vector
- `bField`: combined magnetic vector
- `poynting`: net propagation direction
- `propagation`: optional normalized travel direction
- `timestamp`: sample time

**Rules**
- Field values must remain finite.
- Vector outputs must remain directionally consistent with source layout.

### SolverProfile

Represents the fidelity mode used to shape the scene.

**Fields**
- `mode`: simplified, balanced, or scientific approximation
- `spectralSamples`: how broadly each source is sampled
- `directionalityWeight`: emphasis on lobe shaping
- `flowWeight`: emphasis on field-driven motion
- `compression`: amount of visual tightness applied to the cloud

**Rules**
- Higher-fidelity profiles must preserve source identity while increasing field detail.

### ScenarioPreset

Represents a curated lab setup.

**Fields**
- `id`: preset key
- `name`: display name
- `description`: explanatory text
- `sources`: emitter templates
- `settings`: visualization settings
- `camera`: optional camera placement
- `environment`: optional scene modifiers

**Rules**
- Each preset must communicate a distinct field behavior.
- Presets must support 2–5 emitter arrangements for the interference studies.

### InteractionZone

Represents a region where multiple sources significantly overlap.

**Fields**
- `label`: zone name
- `center`: approximate location
- `intensity`: combined interaction strength
- `dominantSources`: source ids contributing most strongly
- `kind`: reinforcement, cancellation, contested, or unstable

**Rules**
- Zones should be derived from visible field overlap, not arbitrary decoration.

## Relationships

- One `ScenarioPreset` contains many `RFSource` entries.
- One `RFSource` contributes to many `FieldPoint` samples.
- Many `RFSource` entries may contribute to one `InteractionZone`.
- `SolverProfile` shapes how `RFSource` data is interpreted and displayed.
