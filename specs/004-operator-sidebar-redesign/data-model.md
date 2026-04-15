# Data Model

## Entities

| Entity | Fields | Notes |
|---|---|---|
| SidebarSection | id, title, intent, priorityTier, order, defaultExpanded, isCollapsible | Top-level semantic grouping in control panel |
| SectionPanelState | sectionId, expanded, hasUnreadChanges, focusIndex | UI state for section disclosure and keyboard traversal |
| SourceEntity | id, label, active, frequency, bandwidthHz, power, phase, position, deviceType, color | Existing source domain object edited through selected-entity workflow |
| SelectionContext | mode (`none` / `single` / `multi`), selectedSourceIds, primarySourceId | Governs which controls are visible and editable |
| ControlGroup | id, sectionId, title, tier (`primary` / `secondary` / `tertiary`), defaultVisible, controls[] | Groups related controls to reduce scan cost |
| ControlValueState | controlId, inputMode (`slider` / `numeric` / `dual`), value, mixedValue, dirty | Supports dual-mode and mixed-state behavior |
| MeasurementPanelState | measurementCount, activeTools, readoutVisibility | Encapsulates analysis panel visibility and readout behavior |

## Relationships

- One `SidebarSection` has many `ControlGroup` entries.
- One `SelectionContext` determines which `ControlGroup` set is rendered in Selected Entity.
- One or more `SourceEntity` records map to `SelectionContext.selectedSourceIds`.
- `ControlValueState` resolves against selected source(s) and renders either concrete value or mixed-value representation.
- `SectionPanelState` tracks disclosure independently from simulation state.

## Validation Rules

- Global controls MUST NOT mutate source-specific fields.
- Selected Entity controls MUST NOT render editable fields when `SelectionContext.mode = none`.
- Advanced (`tier = tertiary`) groups default to collapsed and require explicit expansion.
- Dual-mode controls MUST keep slider and numeric values synchronized.
- In multi-select mode, only fields shared by all selected entities are editable; mixed values must be surfaced clearly.

## State Transitions

- `none -> single`: user selects one source in Active Entities; Selected Entity loads critical controls expanded.
- `single -> none`: selected source deselected or removed; Selected Entity reverts to instructional empty state.
- `single -> multi`: user applies additive selection (if supported); shared controls switch to bulk mode.
- `multi -> single`: selection reduced to one source; mixed values resolve to concrete source values.
- `any -> none`: clear sources, load preset without sources, or remove selected set.
